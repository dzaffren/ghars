import { createAdminSupabaseClient } from "../supabase/server";

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export interface Assignment {
  id: string;
  verse_key: string;
  corpus_entry_id: number | null;
  action_prompt_1: string | null;
  action_prompt_2: string | null;
  tafsir_extract: string | null;
  exploration_prompt: string | null;
}

export async function resolveOrCreateAssignment(
  userId: string,
  localDate: string
): Promise<Assignment | null> {
  const supabase = createAdminSupabaseClient();

  const { data: existing } = await supabase
    .from("daily_assignments")
    .select(
      `
      id, verse_key, exploration_prompt,
      corpus_entries ( id, action_prompt_1, action_prompt_2, tafsir_extract )
    `
    )
    .eq("user_id", userId)
    .eq("local_date", localDate)
    .single();

  if (existing) {
    const ce = existing.corpus_entries as unknown as {
      id: number;
      action_prompt_1: string;
      action_prompt_2: string;
      tafsir_extract: string;
    } | null;

    if (ce) {
      return {
        id: existing.id,
        verse_key: existing.verse_key,
        corpus_entry_id: ce.id,
        action_prompt_1: ce.action_prompt_1,
        action_prompt_2: ce.action_prompt_2,
        tafsir_extract: ce.tafsir_extract,
        exploration_prompt: null,
      };
    }

    if (existing.exploration_prompt) {
      return {
        id: existing.id,
        verse_key: existing.verse_key,
        corpus_entry_id: null,
        action_prompt_1: null,
        action_prompt_2: null,
        tafsir_extract: null,
        exploration_prompt: existing.exploration_prompt,
      };
    }

    return null;
  }

  // Get user seed
  const { data: user } = await supabase
    .from("users")
    .select("seed")
    .eq("id", userId)
    .single();
  const seed = user?.seed ?? 0;

  // Get corpus count
  const { count } = await supabase
    .from("corpus_entries")
    .select("id", { count: "exact", head: true })
    .not("human_reviewed_at", "is", null);

  if (!count || count === 0) return null;

  const date = parseLocalDate(localDate);
  const doy = dayOfYear(date);
  const idx = ((doy + seed) % count) + 1;

  const { data: entry } = await supabase
    .from("corpus_entries")
    .select("id, verse_key, action_prompt_1, action_prompt_2, tafsir_extract")
    .not("human_reviewed_at", "is", null)
    .order("id", { ascending: true })
    .range(idx - 1, idx - 1)
    .single();

  if (!entry) return null;

  const { data: newAssignment, error } = await supabase
    .from("daily_assignments")
    .upsert(
      {
        user_id: userId,
        local_date: localDate,
        corpus_entry_id: entry.id,
        verse_key: entry.verse_key,
      },
      { onConflict: "user_id,local_date", ignoreDuplicates: false }
    )
    .select("id")
    .single();

  if (error || !newAssignment) return null;

  return {
    id: newAssignment.id,
    verse_key: entry.verse_key,
    corpus_entry_id: entry.id,
    action_prompt_1: entry.action_prompt_1,
    action_prompt_2: entry.action_prompt_2,
    tafsir_extract: entry.tafsir_extract,
    exploration_prompt: null,
  };
}
