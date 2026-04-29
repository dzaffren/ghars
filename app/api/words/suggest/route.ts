import { NextRequest, NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { fetchVerseWords } from "@/lib/qf/content-client";

export async function POST(req: NextRequest) {
  const session = await getRequiredSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    verse_key: string;
    verse_arabic: string;
    verse_translation: string;
  };

  const { verse_key, verse_arabic, verse_translation } = body;

  if (!verse_key || !verse_arabic || !verse_translation) {
    return NextResponse.json(
      { error: "verse_key, verse_arabic, and verse_translation are required" },
      { status: 400 }
    );
  }

  const db = createServerClient();

  // Fetch user's existing known-word signatures (top 50 by repetitions)
  const { data: knownWordsData } = await db
    .from("user_words")
    .select("arabic, root")
    .eq("user_id", session.userId!)
    .order("repetitions", { ascending: false })
    .limit(50);

  const knownWords = (knownWordsData ?? []).map((w) => ({
    arabic: w.arabic as string,
    root: w.root as string | null,
  }));

  // Heuristic fallback: return first 2 non-empty words from the verse
  try {
    const words = await fetchVerseWords(verse_key);
    const suggestions = words.slice(0, 2).map((w, i) => ({
      position: i + 1,
      arabic: w.text_uthmani,
      transliteration: w.transliteration,
      meaning: w.translation,
      reason: "Suggested word from this verse",
    }));

    // knownWords is fetched above and would be passed to llm.suggestWords in Task 3
    void knownWords;

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
