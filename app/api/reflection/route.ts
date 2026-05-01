import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { logEvent } from "@/lib/log";
import { getRequiredSession } from "@/lib/auth/session";
import { submitReflection } from "@/lib/mission/judge";
import { createServerClient } from "@/lib/supabase/server";
import { getValidQfAccessToken } from "@/lib/auth/qf-oauth";

// v2 reflection submission handler. Error responses carry a stable machine-
// readable `code` alongside the human `error` message so the client can
// branch on behaviour (invalid input vs. already reflected vs. outage)
// without string-matching. HTTP 200 + `status: 'pending'` is the judge-
// outage path — not a 500, because the reflection itself was saved.
const MAX_REFLECTION_LENGTH = 4000;

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ error: message, code }, { status });
}

export async function POST(req: NextRequest) {
  const session = await getRequiredSession();
  if (!session) {
    return errorResponse(401, "UNAUTHORIZED", "Unauthorized");
  }

  const body = await req.json();
  const { missionId, reflectionText, photoPath } = body as {
    missionId?: string;
    reflectionText?: string;
    photoPath?: string | null;
  };

  if (!missionId) {
    return errorResponse(400, "MISSION_ID_REQUIRED", "missionId is required");
  }

  const trimmed = reflectionText?.trim() ?? "";
  if (trimmed.length === 0) {
    return errorResponse(
      400,
      "EMPTY_REFLECTION",
      "Reflection text is required"
    );
  }
  if (trimmed.length > MAX_REFLECTION_LENGTH) {
    return errorResponse(
      400,
      "REFLECTION_TOO_LONG",
      "Reflection must be under 4000 characters"
    );
  }

  const db = createServerClient();

  const [{ data: mission }, { data: user }, qfToken] = await Promise.all([
    db
      .from("daily_missions")
      .select("*")
      .eq("id", missionId)
      .eq("user_id", session.userId)
      .single(),
    db.from("users").select("qf_goal_id").eq("id", session.userId).single(),
    getValidQfAccessToken(session.userId!),
  ]);

  if (!mission) {
    return errorResponse(404, "MISSION_NOT_FOUND", "Mission not found");
  }

  // Idempotency guard — the v2 rubric uses `status='scored'` in place of the
  // retired `llm_verdict='accepted'` flag. Pending reflections can be
  // retried via POST /api/reflection/:id/rescore (never via re-POST here).
  const { data: existing } = await db
    .from("reflections")
    .select("id, status")
    .eq("mission_id", missionId)
    .single();

  if ((existing as { status?: string } | null)?.status === "scored") {
    return errorResponse(409, "ALREADY_REFLECTED", "Already completed");
  }

  try {
    const result = await submitReflection({
      userId: session.userId!,
      missionId,
      missionText: mission.mission_text,
      verseKey: mission.verse_key,
      verseTranslation: mission.verse_translation,
      reflectionText: trimmed,
      photoPath: photoPath ?? undefined,
      qfAccessToken: qfToken ?? undefined,
      qfGoalId: user?.qf_goal_id ?? undefined,
    });

    logEvent("reflection_submitted", {
      userId: session.userId,
      missionId,
      status: result.status,
      markerCount: result.markerCount,
    });

    revalidatePath("/history");
    revalidatePath("/today");

    // Pending is a successful outcome — the reflection is saved and the
    // plant grew by the floor amount. The orchestrator already swallows
    // judge failures; a throw here is genuinely unexpected (DB down, etc.).
    return NextResponse.json(result);
  } catch (err) {
    console.error("Reflection submission error:", err);
    return errorResponse(500, "PROCESSING_FAILED", "Processing failed");
  }
}
