import { redirect } from "next/navigation";
import { getRequiredSession } from "@/lib/auth/session";
import { getOrCreateTodaysMission, getLocalDate } from "@/lib/mission/generate";
import { createServerClient } from "@/lib/supabase/server";
import { fetchVerseWords, type VerseWord } from "@/lib/qf/content-client";
import { getWeeklyTheme, getISOWeek } from "@/lib/mission/weekly-theme";
import { seedStarterWords } from "@/lib/words/seed";
import type { CirclePreview } from "@/components/dashboard/CirclesWidget";
import type { JournalEntryPreview } from "@/components/dashboard/JournalWidget";
import type { MarkerBundle } from "@/lib/llm/types";
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

  // Backfill: users onboarded before the starter-word seed shipped start
  // with an empty deck and never see a review card until they accept a
  // suggestion post-reflection. Seed once if their deck is empty.
  const { count: existingWordCount } = await db
    .from("user_words")
    .select("id", { count: "exact", head: true })
    .eq("user_id", uid);
  if ((existingWordCount ?? 0) === 0) {
    await seedStarterWords(db, uid);
  }

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
          .select("marker_count, markers_json, status")
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
        "id, missions:mission_id(id, local_date, mission_text), marker_count, status"
      )
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    db
      .from("daily_missions")
      .select("local_date, reflections(status)")
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
        marker_count:
          (latestReflection as { marker_count: number | null }).marker_count ??
          null,
        status:
          ((latestReflection as { status: "scored" | "pending" }).status as
            | "scored"
            | "pending") ?? "scored",
      };
    }
  }

  // Build 14-day heatmap completed dates. Under the v2 rubric, any
  // reflection row at all (scored or pending) counts as completed — a
  // pending reflection means the user submitted something; the judge
  // just hasn't caught up yet. So the presence of a reflection with
  // any status is sufficient.
  const completedDates = (heatmapMissions ?? [])
    .filter((m) => {
      const ref = Array.isArray(m.reflections)
        ? m.reflections[0]
        : m.reflections;
      return ref != null;
    })
    .map((m) => m.local_date as string);

  // Same completion semantics for today's mission — if a reflection
  // exists (scored or pending), hide the reflection form.
  const alreadyCompleted = reflection != null;

  // Marker bundle snapshot of today's submitted reflection, if any.
  // Task 4's TodayClient consumes this to re-render the marker reveal
  // on hydration instead of leaving the user looking at a blank screen
  // after a refresh.
  const todaysReflection = reflection as {
    marker_count: number | null;
    markers_json: MarkerBundle | null;
    status: "scored" | "pending";
  } | null;
  const todaysMarkerBundle:
    | null
    | { status: "scored"; markers: MarkerBundle; markerCount: number }
    | { status: "pending"; pendingMessage: string } = todaysReflection
    ? todaysReflection.status === "scored" &&
      todaysReflection.marker_count !== null &&
      todaysReflection.markers_json
      ? {
          status: "scored",
          markers: todaysReflection.markers_json,
          markerCount: todaysReflection.marker_count,
        }
      : {
          status: "pending",
          pendingMessage:
            "5 markers pending — we'll score this when we're back online",
        }
    : null;
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
      // Task 4's TodayClient accepts todaysMarkerBundle to drive the
      // marker-reveal hydration path. Passing it now so the parallel
      // agent's merge doesn't require a follow-up here.
      // @ts-ignore — Task 4 adds this prop to TodayClient.
      todaysMarkerBundle={todaysMarkerBundle}
    />
  );
}
