import { getLLMProvider } from "@/lib/llm";
import { createServerClient } from "@/lib/supabase/server";
import { logGoalActivity } from "@/lib/qf/user-client";
import { getValidQfAccessToken } from "@/lib/auth/qf-oauth";

export interface ReflectionSubmission {
  userId: string;
  missionId: string;
  missionText: string;
  verseKey: string;
  verseTranslation: string;
  reflectionText: string;
  photoPath?: string;
  qfAccessToken?: string;
  qfGoalId?: string;
}

export interface ReflectionResult {
  verdict: "accepted" | "soft_nudge";
  feedback: string;
  depthScore: number;
  nextStep?: string;
  growthPoints?: number;
  currentStreak?: number;
}

export async function submitReflection(
  sub: ReflectionSubmission
): Promise<ReflectionResult> {
  const llm = await getLLMProvider();

  const judgment = await llm.judgeReflection({
    mission: sub.missionText,
    verseTranslation: sub.verseTranslation,
    reflection: sub.reflectionText,
  });

  const db = createServerClient();

  // Store reflection regardless of verdict
  await db.from("reflections").insert({
    mission_id: sub.missionId,
    user_id: sub.userId,
    text: sub.reflectionText,
    photo_path: sub.photoPath ?? null,
    llm_verdict: judgment.verdict,
    llm_feedback: judgment.feedback,
    depth_score: judgment.depthScore,
  });

  // Log to activity_log always
  await db.from("activity_log").insert({
    user_id: sub.userId,
    event: "reflection_submitted",
    payload: { verdict: judgment.verdict, depth_score: judgment.depthScore },
  });

  if (judgment.verdict === "soft_nudge") {
    return {
      verdict: "soft_nudge",
      feedback: judgment.feedback,
      depthScore: judgment.depthScore,
    };
  }

  // On accepted: update garden state
  const { data: garden } = await db
    .from("gardens")
    .select("*")
    .eq("user_id", sub.userId)
    .single();

  const today = new Date().toISOString().slice(0, 10);
  const lastDate = garden?.last_completed_date ?? null;
  const yesterday = new Date(Date.now() - 86_400_000)
    .toISOString()
    .slice(0, 10);

  const newStreak =
    lastDate === yesterday ? (garden?.current_streak ?? 0) + 1 : 1;
  const newLongest = Math.max(newStreak, garden?.longest_streak ?? 0);
  const pointsEarned = judgment.depthScore + (newStreak > 1 ? 1 : 0); // bonus for streak
  const newPoints = (garden?.growth_points ?? 0) + pointsEarned;

  await db.from("gardens").upsert({
    user_id: sub.userId,
    growth_points: newPoints,
    current_streak: newStreak,
    longest_streak: newLongest,
    last_completed_date: today,
    wilting: false,
    updated_at: new Date().toISOString(),
  });

  // Log QF Goal activity (best-effort)
  if (sub.qfAccessToken && sub.qfGoalId) {
    logGoalActivity(sub.qfAccessToken, sub.qfGoalId).catch(() => {});
  }

  return {
    verdict: "accepted",
    feedback: judgment.feedback,
    depthScore: judgment.depthScore,
    nextStep: judgment.nextStep,
    growthPoints: newPoints,
    currentStreak: newStreak,
  };
}
