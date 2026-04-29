import type { SupabaseClient } from "@supabase/supabase-js";

// Five high-frequency Quranic words drawn from Al-Fatiha, the most-recited
// surah. Seeded on onboarding so a new user sees their first review card
// on day one instead of waiting for reflection → suggestion → accept.
//
// Arabic forms are Uthmani script. Roots use Quran Foundation's convention.
export const STARTER_WORDS = [
  {
    verse_key: "1:1",
    word_position: 3,
    arabic: "ٱللَّهِ",
    transliteration: "Allahi",
    meaning: "Allah",
    root: null,
  },
  {
    verse_key: "1:2",
    word_position: 3,
    arabic: "رَبِّ",
    transliteration: "rabbi",
    meaning: "Lord",
    root: "ر ب ب",
  },
  {
    verse_key: "1:3",
    word_position: 1,
    arabic: "ٱلرَّحْمَٰنِ",
    transliteration: "ar-rahmani",
    meaning: "The Most Merciful",
    root: "ر ح م",
  },
  {
    verse_key: "1:4",
    word_position: 2,
    arabic: "يَوْمِ",
    transliteration: "yawmi",
    meaning: "Day",
    root: "ي و م",
  },
  {
    verse_key: "1:6",
    word_position: 2,
    arabic: "ٱلصِّرَٰطَ",
    transliteration: "as-sirata",
    meaning: "Path",
    root: "ص ر ط",
  },
] as const;

export async function seedStarterWords(
  db: SupabaseClient,
  userId: string
): Promise<number> {
  const now = new Date().toISOString();

  const rows = STARTER_WORDS.map((w) => ({
    user_id: userId,
    verse_key: w.verse_key,
    word_position: w.word_position,
    arabic: w.arabic,
    transliteration: w.transliteration,
    meaning: w.meaning,
    root: w.root,
    audio_url: null,
    status: "learning",
    interval_days: 1,
    ease_factor: 2.5,
    repetitions: 0,
    due_at: now,
    last_reviewed_at: null,
    created_at: now,
  }));

  // onConflict: the partial unique indexes in migration 0008 dedupe by
  // (user_id, arabic, root) when root is set and (user_id, arabic) when null.
  // Supabase's upsert accepts a single constraint target, so we attempt each
  // row individually and swallow 23505 duplicates.
  let inserted = 0;
  for (const row of rows) {
    const { error } = await db.from("user_words").insert(row);
    if (!error) {
      inserted++;
    } else if (error.code !== "23505") {
      console.error("[seedStarterWords] insert error", { userId, row, error });
    }
  }
  return inserted;
}
