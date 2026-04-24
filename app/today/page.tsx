import { redirect } from "next/navigation";
import { getRequiredSession } from "@/lib/auth/session";
import { getOrCreateTodaysMission, getLocalDate } from "@/lib/mission/generate";
import { createServerClient } from "@/lib/supabase/server";
import { checkWilting } from "@/lib/mission/judge";
import TodayClient from "./TodayClient";

export default async function TodayPage() {
  const session = await getRequiredSession();
  if (!session) redirect("/");

  const db = createServerClient();

  // Check user has completed onboarding
  const { data: user } = await db
    .from("users")
    .select("focus_areas, timezone, display_name")
    .eq("id", session.userId)
    .single();

  if (!user?.focus_areas?.length) redirect("/onboarding");

  // Apply wilting check (idempotent)
  await checkWilting(session.userId!);

  // Get or generate today's mission
  const mission = await getOrCreateTodaysMission(session.userId!);

  // Fetch garden state
  const { data: garden } = await db
    .from("gardens")
    .select("growth_points, current_streak, longest_streak, wilting")
    .eq("user_id", session.userId)
    .single();

  // Check if today's reflection already accepted
  const { data: reflection } = await db
    .from("reflections")
    .select("llm_verdict, llm_feedback, depth_score")
    .eq("mission_id", mission.id)
    .single();

  const alreadyCompleted = reflection?.llm_verdict === "accepted";

  return (
    <TodayClient
      mission={mission}
      garden={garden ?? { growth_points: 0, current_streak: 0, longest_streak: 0, wilting: false }}
      alreadyCompleted={alreadyCompleted}
      displayName={user.display_name ?? ""}
    />
  );
}
