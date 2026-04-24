import { NextRequest, NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { submitReflection } from "@/lib/mission/judge";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const session = await getRequiredSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { missionId, reflectionText, photoPath } = body;

  if (!missionId || !reflectionText?.trim()) {
    return NextResponse.json({ error: "missionId and reflectionText required" }, { status: 400 });
  }

  const db = createServerClient();

  // Fetch mission to verify ownership + get context
  const { data: mission } = await db
    .from("daily_missions")
    .select("*")
    .eq("id", missionId)
    .eq("user_id", session.userId)
    .single();

  if (!mission) {
    return NextResponse.json({ error: "Mission not found" }, { status: 404 });
  }

  // Check no duplicate reflection
  const { data: existing } = await db
    .from("reflections")
    .select("id, llm_verdict")
    .eq("mission_id", missionId)
    .single();

  if (existing?.llm_verdict === "accepted") {
    return NextResponse.json({ error: "Already completed" }, { status: 409 });
  }

  // Fetch user tokens for QF API calls
  const { data: user } = await db
    .from("users")
    .select("qf_access_token, qf_goal_id")
    .eq("id", session.userId)
    .single();

  try {
    const result = await submitReflection({
      userId: session.userId!,
      missionId,
      missionText: mission.mission_text,
      verseKey: mission.verse_key,
      verseTranslation: mission.verse_translation,
      reflectionText,
      photoPath,
      qfAccessToken: user?.qf_access_token ?? undefined,
      qfGoalId: user?.qf_goal_id ?? undefined,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Reflection submission error:", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
