import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { resolveOrCreateAssignment } from "@/lib/db/assignments";
import { getVerseByKey, getTranslation, getAudioUrl } from "@/lib/qf/content";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

const LOCAL_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Session required" } },
      { status: 401 }
    );
  }

  const localDate = request.nextUrl.searchParams.get("local_date");
  if (!localDate || !LOCAL_DATE_RE.test(localDate)) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_LOCAL_DATE",
          message: "local_date must be YYYY-MM-DD",
        },
      },
      { status: 400 }
    );
  }

  // Resolve or create today's assignment
  let assignment;
  try {
    assignment = await resolveOrCreateAssignment(session.userId, localDate);
  } catch (e) {
    console.error("Assignment error:", e);
    return NextResponse.json(
      {
        error: {
          code: "QF_CONTENT_UNAVAILABLE",
          message: "Quran content service is temporarily unreachable",
        },
      },
      { status: 503 }
    );
  }

  if (!assignment) {
    return NextResponse.json(
      {
        error: {
          code: "CORPUS_EMPTY",
          message: "No reviewed corpus entries available",
        },
      },
      { status: 404 }
    );
  }

  // Fetch content from QF APIs
  let verse, translation, audio;
  try {
    [verse, translation, audio] = await Promise.all([
      getVerseByKey(assignment.verse_key),
      (async () => {
        const supabase = createAdminSupabaseClient();
        const { data: user } = await supabase
          .from("users")
          .select("translation_id")
          .eq("id", session.userId)
          .single();
        return getTranslation(
          assignment.verse_key,
          user?.translation_id ?? "131"
        );
      })(),
      getAudioUrl(assignment.verse_key),
    ]);
  } catch (e) {
    console.error("QF content fetch error:", e);
    return NextResponse.json(
      {
        error: {
          code: "QF_CONTENT_UNAVAILABLE",
          message: "Quran content service is temporarily unreachable",
        },
      },
      { status: 503 }
    );
  }

  // Get mission if committed
  const supabase = createAdminSupabaseClient();
  const { data: mission } = await supabase
    .from("missions")
    .select("id, selected_prompt, is_custom, committed_at")
    .eq("assignment_id", assignment.id)
    .single();

  // If mission exists, also fetch its reflection (may be null)
  let reflection: {
    id: string;
    did_apply: string;
    text: string;
    submitted_at: string;
    window_closes_at: string;
  } | null = null;
  if (mission) {
    const { data: r } = await supabase
      .from("reflections")
      .select("id, did_apply, text, submitted_at, window_closes_at")
      .eq("mission_id", mission.id)
      .single();
    reflection = r ?? null;
  }

  const prompts: string[] = assignment.exploration_prompt
    ? [assignment.exploration_prompt]
    : [assignment.action_prompt_1!, assignment.action_prompt_2!];

  return NextResponse.json({
    assignment_id: assignment.id,
    verse_key: assignment.verse_key,
    surah_name: verse.surah_name,
    ayah_number: verse.ayah_number,
    arabic: verse.arabic,
    translation: translation.text,
    translation_id: "131",
    tafsir_extract: assignment.tafsir_extract,
    audio_url: audio.audio_url,
    prompts,
    theme_label: assignment.exploration_prompt ? "Your choice" : undefined,
    mission: mission
      ? {
          mission_id: mission.id,
          selected_prompt: mission.selected_prompt,
          is_custom: mission.is_custom,
          committed_at: mission.committed_at,
        }
      : null,
    reflection: reflection
      ? {
          reflection_id: reflection.id,
          did_apply: reflection.did_apply,
          text: reflection.text,
          submitted_at: reflection.submitted_at,
          window_closes_at: reflection.window_closes_at,
        }
      : null,
  });
}
