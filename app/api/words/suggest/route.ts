import { NextRequest, NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { fetchVerseWords } from "@/lib/qf/content-client";
import { getLLMProvider } from "@/lib/llm";
import { heuristicSuggest } from "@/lib/words/suggest";

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

  const words = await fetchVerseWords(verse_key);

  let suggestions: Array<{
    position: number;
    arabic: string;
    transliteration: string;
    meaning: string;
    reason: string;
  }>;

  try {
    const llm = await getLLMProvider();
    const llmResult = await llm.suggestWords({
      verseKey: verse_key,
      verseArabic: verse_arabic,
      verseTranslation: verse_translation,
      knownWords,
    });

    // Map LLM position suggestions to full word data
    suggestions = llmResult.suggestions
      .map((s) => {
        const word = words[s.position - 1];
        if (!word) return null;
        return {
          position: s.position,
          arabic: word.text_uthmani,
          transliteration: word.transliteration,
          meaning: word.translation,
          reason: s.reason,
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);

    if (suggestions.length === 0) throw new Error("no valid positions");
  } catch {
    suggestions = heuristicSuggest(words);
  }

  return NextResponse.json({ suggestions });
}
