import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { getReflectionById } from "@/lib/db/reflections";
import {
  getAnswerByReflectionId,
  insertAnswer,
  insertAttempt,
  countTodaysAttemptsForUser,
} from "@/lib/db/reflection-answers";
import { generateAnswer } from "@/lib/answered-reflection/generate";
import { getTranslation, getFullTafsir, getVerseByKey } from "@/lib/qf/content";

const DAILY_RATE_LIMIT = 10;

function isEnabled(): boolean {
  return process.env.ENABLE_ANSWERED_REFLECTION === "true";
}

async function loadVerseContext(verseKey: string): Promise<{
  ayahArabic: string;
  ayahTranslation: string;
  tafsirSnippet: string;
}> {
  const verse = await getVerseByKey(verseKey).catch(() => null);
  const translation = await getTranslation(verseKey).catch(() => ({
    text: "",
  }));
  const tafsir = await getFullTafsir(verseKey).catch(() => ({ text: "" }));
  const ayahArabic = verse?.arabic ?? "";
  const ayahTranslation = translation?.text ?? "";
  const tafsirSnippet = (tafsir?.text ?? "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 600);
  return { ayahArabic, ayahTranslation, tafsirSnippet };
}

async function loadReflectionForUser(
  reflectionId: string,
  sessionUserId: string
): Promise<
  | {
      ok: true;
      verseKey: string;
      reflection: Awaited<ReturnType<typeof getReflectionById>>;
    }
  | { ok: false; status: number; code: string; message: string }
> {
  const reflection = await getReflectionById(reflectionId);
  if (!reflection) {
    return {
      ok: false,
      status: 404,
      code: "REFLECTION_NOT_FOUND",
      message: "Reflection not found",
    };
  }
  const supabase = createAdminSupabaseClient();
  const { data: mission } = await supabase
    .from("missions")
    .select("id, daily_assignments(verse_key, user_id)")
    .eq("id", reflection.mission_id)
    .single();
  const da = mission?.daily_assignments as unknown as {
    verse_key: string;
    user_id: string;
  } | null;
  if (!da) {
    return {
      ok: false,
      status: 404,
      code: "REFLECTION_NOT_FOUND",
      message: "Reflection not found",
    };
  }
  if (da.user_id !== sessionUserId) {
    return {
      ok: false,
      status: 403,
      code: "NOT_OWNER",
      message: "Reflection does not belong to the current user",
    };
  }
  return { ok: true, verseKey: da.verse_key, reflection };
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Session required" } },
      { status: 401 }
    );
  }

  if (!isEnabled()) {
    return NextResponse.json(
      {
        error: {
          code: "FEATURE_DISABLED",
          message: "Answered reflection is disabled",
        },
      },
      { status: 503 }
    );
  }

  const loaded = await loadReflectionForUser(id, session.userId);
  if (!loaded.ok) {
    return NextResponse.json(
      { error: { code: loaded.code, message: loaded.message } },
      { status: loaded.status }
    );
  }
  const { verseKey, reflection } = loaded;
  if (!reflection) {
    return NextResponse.json(
      {
        error: {
          code: "REFLECTION_NOT_FOUND",
          message: "Reflection not found",
        },
      },
      { status: 404 }
    );
  }

  // Idempotent — if an answer already exists return it.
  const existing = await getAnswerByReflectionId(id);
  if (existing) {
    return NextResponse.json({
      status: "ready",
      answer: {
        ayah_insight: existing.ayah_insight,
        noticing: existing.noticing,
        model: existing.model,
        generated_at: existing.generated_at,
      },
    });
  }

  const todaysAttempts = await countTodaysAttemptsForUser(session.userId);
  if (todaysAttempts >= DAILY_RATE_LIMIT) {
    return NextResponse.json(
      {
        error: {
          code: "ANSWER_RATE_LIMITED",
          message: `Too many generation attempts today (${DAILY_RATE_LIMIT} max)`,
        },
      },
      { status: 429 }
    );
  }

  const ctx = await loadVerseContext(verseKey);

  const result = await generateAnswer({
    ayahArabic: ctx.ayahArabic,
    ayahTranslation: ctx.ayahTranslation,
    verseKey,
    tafsirSnippet: ctx.tafsirSnippet,
    reflectionText: reflection.text,
    didApply: reflection.did_apply,
  });

  if (!result.ok) {
    await insertAttempt({
      reflectionId: id,
      userId: session.userId,
      status: result.errorCode === "LLM_TIMEOUT" ? "given_up" : "failed",
      errorCode: result.errorCode,
    });
    console.error("[answered-reflection] generation failed", {
      reflection_id: id,
      user_id: session.userId,
      error_code: result.errorCode,
    });
    return NextResponse.json({ status: "unavailable" });
  }

  try {
    const row = await insertAnswer({
      reflectionId: id,
      userId: session.userId,
      ayahInsight: result.ayahInsight,
      noticing: result.noticing,
      model: result.model,
    });
    return NextResponse.json({
      status: "ready",
      answer: {
        ayah_insight: row.ayah_insight,
        noticing: row.noticing,
        model: row.model,
        generated_at: row.generated_at,
      },
    });
  } catch (err) {
    // Unique-constraint race — someone else just inserted; return theirs.
    const raced = await getAnswerByReflectionId(id);
    if (raced) {
      return NextResponse.json({
        status: "ready",
        answer: {
          ayah_insight: raced.ayah_insight,
          noticing: raced.noticing,
          model: raced.model,
          generated_at: raced.generated_at,
        },
      });
    }
    console.error("[answered-reflection] insert failed", {
      reflection_id: id,
      user_id: session.userId,
      err,
    });
    return NextResponse.json({ status: "unavailable" });
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Session required" } },
      { status: 401 }
    );
  }

  const loaded = await loadReflectionForUser(id, session.userId);
  if (!loaded.ok) {
    return NextResponse.json(
      { error: { code: loaded.code, message: loaded.message } },
      { status: loaded.status }
    );
  }

  const existing = await getAnswerByReflectionId(id);
  if (!existing) {
    return NextResponse.json({ status: "unavailable" });
  }
  return NextResponse.json({
    status: "ready",
    answer: {
      ayah_insight: existing.ayah_insight,
      noticing: existing.noticing,
      model: existing.model,
      generated_at: existing.generated_at,
    },
  });
}
