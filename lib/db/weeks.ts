import { createAdminSupabaseClient } from "../supabase/server";

export interface WeekSummary {
  id: number;
  week_number: number;
  completed_at: string;
  reflection_count: number;
}

export interface WeekDetail {
  week_id: number;
  reflections: {
    verse_key: string;
    surah_name: string;
    ayah_number: number;
    mission_text: string;
    reflection_text: string;
    did_apply: string;
    date: string;
  }[];
  closing_line: string;
}

export async function listWeeks(userId: string): Promise<WeekSummary[]> {
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from("weekly_reviews")
    .select("id, week_number, completed_at")
    .eq("user_id", userId)
    .order("week_number", { ascending: false });
  return (data ?? []).map((w) => ({ ...w, reflection_count: 7 }));
}

export async function getWeekDetail(
  userId: string,
  weekId: number
): Promise<WeekDetail | null> {
  const supabase = createAdminSupabaseClient();

  const { data: review } = await supabase
    .from("weekly_reviews")
    .select("id, week_number, seventh_reflection_id, completed_at")
    .eq("id", weekId)
    .eq("user_id", userId)
    .single();

  if (!review) return null;

  // Get the 7 reflections ending at seventh_reflection_id
  // Fetch all user reflections ordered by submitted_at, take the 7 ending at this review
  const { data: allRefs } = await supabase
    .from("reflections")
    .select(
      `
      id, did_apply, text, submitted_at,
      missions!inner (
        selected_prompt,
        daily_assignments!inner (
          user_id, local_date, verse_key,
          corpus_entries (action_prompt_1, action_prompt_2)
        )
      )
    `
    )
    .lte("submitted_at", review.completed_at)
    .order("submitted_at", { ascending: false })
    .limit(50);

  const userRefs = (allRefs ?? [])
    .filter((r) => {
      const m = r.missions as unknown as {
        daily_assignments: { user_id: string };
      };
      return m?.daily_assignments?.user_id === userId;
    })
    .slice(0, 7)
    .reverse();

  const reflections = userRefs.map((r) => {
    const m = r.missions as unknown as {
      selected_prompt: string;
      daily_assignments: { local_date: string; verse_key: string };
    };
    const [chapter] = m.daily_assignments.verse_key.split(":");
    return {
      verse_key: m.daily_assignments.verse_key,
      surah_name: `Surah ${chapter}`,
      ayah_number: parseInt(m.daily_assignments.verse_key.split(":")[1]),
      mission_text: m.selected_prompt,
      reflection_text: r.text,
      did_apply: r.did_apply,
      date: m.daily_assignments.local_date,
    };
  });

  return {
    week_id: review.id,
    reflections,
    closing_line: `You reflected on ${reflections.length} ayat this week. May Allah accept your effort.`,
  };
}
