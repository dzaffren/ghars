import { createAdminSupabaseClient } from "../supabase/server";

export type TreeVariant = "full" | "partial" | "sapling" | "withered";

export interface TreeData {
  reflection_id: string;
  verse_key: string;
  local_date: string;
  did_apply: "yes_fully" | "partly" | "not_today";
  short_preview: string;
  variant: TreeVariant;
}

export interface GroveData {
  today_status: "awaiting_morning" | "awaiting_evening" | "complete";
  trees: TreeData[];
  month_count: number;
  streak_days: number;
  free_pass_available: boolean;
}

function treeVariant(didApply: string): TreeVariant {
  if (didApply === "yes_fully") return "full";
  if (didApply === "partly") return "partial";
  if (didApply === "not_today") return "sapling";
  return "withered";
}

export async function getGroveData(userId: string): Promise<GroveData> {
  const supabase = createAdminSupabaseClient();

  // Get today's date (UTC approximation — client sends local_date separately for precision)
  const today = new Date().toISOString().slice(0, 10);

  // Get today's assignment (if any)
  const { data: todayAssignment } = await supabase
    .from("daily_assignments")
    .select("id, missions(id, committed_at)")
    .eq("user_id", userId)
    .eq("local_date", today)
    .single();

  // Get all reflections for the last 60 days
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const { data: reflections } = await supabase
    .from("reflections")
    .select(
      `
      id, did_apply, text, submitted_at,
      missions!inner (
        assignment_id,
        daily_assignments!inner (
          user_id, local_date, verse_key
        )
      )
    `
    )
    .gte("submitted_at", `${sixtyDaysAgo}T00:00:00Z`)
    .order("submitted_at", { ascending: false });

  // Filter to this user's reflections
  const userReflections = (reflections ?? []).filter((r) => {
    const m = r.missions as unknown as {
      daily_assignments: {
        user_id: string;
        local_date: string;
        verse_key: string;
      };
    };
    return m?.daily_assignments?.user_id === userId;
  });

  // Build trees
  const trees: TreeData[] = userReflections.map((r) => {
    const m = r.missions as unknown as {
      daily_assignments: { local_date: string; verse_key: string };
    };
    return {
      reflection_id: r.id,
      verse_key: m.daily_assignments.verse_key,
      local_date: m.daily_assignments.local_date,
      did_apply: r.did_apply as "yes_fully" | "partly" | "not_today",
      short_preview: r.text.slice(0, 80) + (r.text.length > 80 ? "…" : ""),
      variant: treeVariant(r.did_apply),
    };
  });

  // Month count (current calendar month)
  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  )
    .toISOString()
    .slice(0, 10);
  const month_count = trees.filter((t) => t.local_date >= monthStart).length;

  // Streak (simple local calculation — QF streak is the canonical value; this is a fallback)
  let streak_days = 0;
  const sortedDates = trees
    .map((t) => t.local_date)
    .sort()
    .reverse();
  const todayStr = today;
  const checkDate = new Date(todayStr);
  for (const date of sortedDates) {
    const d = date;
    const check = checkDate.toISOString().slice(0, 10);
    if (d === check) {
      streak_days++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Today's status
  let today_status: GroveData["today_status"] = "awaiting_morning";
  if (todayAssignment) {
    const mission = todayAssignment.missions as unknown as {
      id: string;
    } | null;
    if (mission) {
      // Check if reflection exists
      const hasTodayReflection = trees.some((t) => t.local_date === today);
      today_status = hasTodayReflection ? "complete" : "awaiting_evening";
    }
  }

  return {
    today_status,
    trees,
    month_count,
    streak_days,
    free_pass_available: true, // simplified; full logic in streak story
  };
}

export async function getDayView(userId: string, localDate: string) {
  const supabase = createAdminSupabaseClient();

  const { data } = await supabase
    .from("daily_assignments")
    .select(
      `
      id, verse_key,
      corpus_entries (tafsir_extract, action_prompt_1, action_prompt_2),
      missions (
        id, selected_prompt, committed_at,
        reflections (
          id, did_apply, text, submitted_at, window_closes_at,
          reflection_answers (ayah_insight, noticing, model, generated_at)
        )
      )
    `
    )
    .eq("user_id", userId)
    .eq("local_date", localDate)
    .single();

  return data;
}
