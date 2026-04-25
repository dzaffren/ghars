import { NextRequest, NextResponse } from "next/server";
import { logEvent } from "@/lib/log";
import { getRequiredSession } from "@/lib/auth/session";
import { submitReflection } from "@/lib/mission/judge";
import { createServerClient } from "@/lib/supabase/server";
import { getValidQfAccessToken } from "@/lib/auth/qf-oauth";

export async function POST(req: NextRequest) {
  const session = await getRequiredSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { missionId, reflectionText, photoPath } = body;

  if (!missionId || !reflectionText?.trim()) {
    return NextResponse.json(
      { error: "missionId and reflectionText required" },
      { status: 400 }
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
    return NextResponse.json({ error: "Mission not found" }, { status: 404 });
  }

  const { data: existing } = await db
    .from("reflections")
    .select("id, llm_verdict")
    .eq("mission_id", missionId)
    .single();

  if (existing?.llm_verdict === "accepted") {
    return NextResponse.json({ error: "Already completed" }, { status: 409 });
  }

  try {
    const result = await submitReflection({
      userId: session.userId!,
      missionId,
      missionText: mission.mission_text,
      verseKey: mission.verse_key,
      verseTranslation: mission.verse_translation,
      reflectionText,
      photoPath,
      qfAccessToken: qfToken ?? undefined,
      qfGoalId: user?.qf_goal_id ?? undefined,
    });

    logEvent("reflection_submitted", {
      userId: session.userId,
      missionId,
      verdict: result.verdict,
      depthScore: result.depthScore,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Reflection submission error:", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
