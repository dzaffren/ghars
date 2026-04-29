import { redirect } from "next/navigation";
import { getRequiredSession } from "@/lib/auth/session";
import { getOrCreateTodaysMission, getLocalDate } from "@/lib/mission/generate";
import { createServerClient } from "@/lib/supabase/server";
import { fetchVerseWords, type VerseWord } from "@/lib/qf/content-client";
import { getWeeklyTheme, getISOWeek } from "@/lib/mission/weekly-theme";
import type { CirclePreview } from "@/components/dashboard/CirclesWidget";
import type { JournalEntryPreview } from "@/components/dashboard/JournalWidget";
import TodayClient from "./TodayClient";

function pickDailyWord(words: VerseWord[], dateStr: string): VerseWord | null {
  if (!words.length) return null;
  const seed = dateStr.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return words[seed % words.length];
}

export default async function TodayPage() {
  const session = await getRequiredSession();
  if (!session) redirect("/");

  const db = createServerClient();
  const uid = session.userId!;

  const { data: user } = await db
    .from("users")
    .select("focus_areas, timezone, display_name")
    .eq("id", uid)
    .single();

  if (!user?.focus_areas?.length) redirect("/onboarding");

  let mission: Awaited<ReturnType<typeof getOrCreateTodaysMission>> | null =
    null;
  try {
    mission = await getOrCreateTodaysMission(uid);
  } catch (err) {
    console.error("[today/page] getOrCreateTodaysMission failed", { uid, err });
  }

  const localDate = getLocalDate(user.timezone ?? "UTC");
  const today14Start = new Date();
  today14Start.setDate(today14Start.getDate() - 13);
  const from14 = today14Start.toISOString().slice(0, 10);

  const [
    { data: garden },
    reflectionResult,
    verseWords,
    { data: dhikrRow },
    { data: circleMemberships },
    { data: latestReflection },
    { data: heatmapMissions },
    { data: dueWords },
    { data: gardenPlants },
  ] = await Promise.all([
    db
      .from("gardens")
      .select(
        "growth_points, current_streak, longest_streak, wilting, known_word_count, next_unlock_threshold"
      )
      .eq("user_id", uid)
      .single(),
    mission
      ? db
          .from("reflections")
          .select("llm_verdict")
          .eq("mission_id", mission.id)
          .single()
      : Promise.resolve({ data: null }),
    mission
      ? fetchVerseWords(mission.verse_key)
      : Promise.resolve([] as VerseWord[]),
    db
      .from("dhikr_log")
      .select("subhan, alhamd, akbar, completed")
      .eq("user_id", uid)
      .eq("local_date", localDate)
      .single(),
    db
      .from("circle_members")
      .select("circle_id, circles(id, name)")
      .eq("user_id", uid)
      .limit(1),
    db
      .from("reflections")
      .select(
        "id, missions:mission_id(id, local_date, mission_text), depth_score"
      )
      .eq("user_id", uid)
      .eq("llm_verdict", "accepted")
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    db
      .from("daily_missions")
      .select("local_date, reflections(llm_verdict)")
      .eq("user_id", uid)
      .gte("local_date", from14),
    db
      .from("user_words")
      .select(
        "id, arabic, transliteration, meaning, root, interval_days, ease_factor, repetitions, due_at, status, audio_url"
      )
      .eq("user_id", uid)
      .lte("due_at", new Date().toISOString())
      .order("due_at", { ascending: true })
      .limit(5),
    db
      .from("garden_plants")
      .select("species, stage, words_toward_next_stage, unlocked_at")
      .eq("user_id", uid),
  ]);

  const reflection = reflectionResult.data;

  // Build circles preview (up to 3 members of first circle)
  let circlePreview: CirclePreview[] = [];
  const firstCircle = circleMemberships?.[0];
  if (firstCircle) {
    const circ = Array.isArray(firstCircle.circles)
      ? firstCircle.circles[0]
      : firstCircle.circles;
    if (circ) {
      const { data: memberRows } = await db
        .from("circle_members")
        .select(
          "user_id, users(display_name), gardens(growth_points, current_streak, wilting)"
        )
        .eq("circle_id", circ.id)
        .limit(3);

      circlePreview = [
        {
          id: circ.id,
          name: (circ as { id: string; name: string }).name,
          members: (memberRows ?? []).map((m) => {
            const u = Array.isArray(m.users) ? m.users[0] : m.users;
            const g = Array.isArray(m.gardens) ? m.gardens[0] : m.gardens;
            return {
              displayName:
                (u as { display_name: string | null } | null)?.display_name ??
                "Member",
              growthPoints:
                (g as { growth_points: number } | null)?.growth_points ?? 0,
              currentStreak:
                (g as { current_streak: number } | null)?.current_streak ?? 0,
              wilting: (g as { wilting: boolean } | null)?.wilting ?? false,
            };
          }),
        },
      ];
    }
  }

  // Build journal entry preview
  let journalEntry: JournalEntryPreview | null = null;
  if (latestReflection) {
    const m = Array.isArray(latestReflection.missions)
      ? latestReflection.missions[0]
      : latestReflection.missions;
    if (m) {
      journalEntry = {
        id: (m as { id: string }).id,
        local_date: (m as { local_date: string }).local_date,
        mission_text: (m as { mission_text: string }).mission_text,
        depth_score: latestReflection.depth_score,
      };
    }
  }

  // Build 14-day heatmap completed dates
  const completedDates = (heatmapMissions ?? [])
    .filter((m) => {
      const ref = Array.isArray(m.reflections)
        ? m.reflections[0]
        : m.reflections;
      return ref?.llm_verdict === "accepted";
    })
    .map((m) => m.local_date as string);

  const alreadyCompleted = reflection?.llm_verdict === "accepted";
  const wordOfDay = pickDailyWord(verseWords, localDate);
  const weeklyTheme = getWeeklyTheme(
    user.focus_areas ?? [],
    getISOWeek(new Date())
  );

  return (
    <TodayClient
      mission={mission}
      garden={
        garden ?? {
          growth_points: 0,
          current_streak: 0,
          longest_streak: 0,
          wilting: false,
        }
      }
      alreadyCompleted={alreadyCompleted}
      displayName={user.display_name ?? ""}
      wordOfDay={wordOfDay}
      weeklyTheme={weeklyTheme}
      tasbihToday={
        dhikrRow ?? { subhan: 0, alhamd: 0, akbar: 0, completed: false }
      }
      circlePreview={circlePreview}
      journalEntry={journalEntry}
      completedDates14={completedDates}
      localDate={localDate}
      dueWords={dueWords ?? []}
      gardenPlants={gardenPlants ?? []}
      knownWordCount={garden?.known_word_count ?? 0}
      nextUnlockThreshold={garden?.next_unlock_threshold ?? 10}
    />
  );
}
