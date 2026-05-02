import { createAdminSupabaseClient } from "../supabase/server";

export interface JournalEntry {
  reflection_id: string;
  verse_key: string;
  local_date: string;
  did_apply: string;
  preview: string;
  is_bookmarked: boolean;
}

export async function listJournal(params: {
  userId: string;
  page: number;
  pageSize: number;
  filterBookmarked: boolean;
  query?: string;
}): Promise<{ entries: JournalEntry[]; total: number }> {
  const supabase = createAdminSupabaseClient();
  const { userId, page, pageSize, filterBookmarked, query } = params;

  const offset = (page - 1) * pageSize;

  // Get bookmarked verse_keys for this user
  const { data: bookmarks } = await supabase
    .from("bookmarks_mirror")
    .select("verse_key")
    .eq("user_id", userId);
  const bookmarkedKeys = new Set((bookmarks ?? []).map((b) => b.verse_key));

  let q = supabase
    .from("reflections")
    .select(
      `
      id, did_apply, text, submitted_at,
      missions!inner (
        daily_assignments!inner (
          user_id, local_date, verse_key
        )
      )
    `,
      { count: "exact" }
    )
    .order("submitted_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (query) {
    q = q.ilike("text", "%" + query + "%");
  }

  const { data, count } = await q;

  const allEntries = (data ?? [])
    .map((r) => {
      const m = r.missions as unknown as {
        daily_assignments: {
          user_id: string;
          local_date: string;
          verse_key: string;
        };
      };
      return {
        reflection_id: r.id,
        verse_key: m.daily_assignments.verse_key,
        local_date: m.daily_assignments.local_date,
        did_apply: r.did_apply,
        preview: r.text.slice(0, 160) + (r.text.length > 160 ? "…" : ""),
        user_id: m.daily_assignments.user_id,
        is_bookmarked: bookmarkedKeys.has(m.daily_assignments.verse_key),
      };
    })
    .filter((e) => e.user_id === userId);

  const entries = filterBookmarked
    ? allEntries.filter((e) => e.is_bookmarked)
    : allEntries;

  return { entries, total: count ?? 0 };
}

export async function addBookmark(
  userId: string,
  verseKey: string,
  reflectionId?: string
): Promise<void> {
  const supabase = createAdminSupabaseClient();
  await supabase.from("bookmarks_mirror").upsert(
    {
      user_id: userId,
      verse_key: verseKey,
      ...(reflectionId ? { reflection_id: reflectionId } : {}),
    },
    { onConflict: "user_id,verse_key" }
  );
}

export async function removeBookmark(
  userId: string,
  verseKey: string
): Promise<void> {
  const supabase = createAdminSupabaseClient();
  await supabase
    .from("bookmarks_mirror")
    .delete()
    .eq("user_id", userId)
    .eq("verse_key", verseKey);
}

export async function isBookmarked(
  userId: string,
  verseKey: string
): Promise<boolean> {
  const supabase = createAdminSupabaseClient();
  const { count } = await supabase
    .from("bookmarks_mirror")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("verse_key", verseKey);
  return (count ?? 0) > 0;
}
