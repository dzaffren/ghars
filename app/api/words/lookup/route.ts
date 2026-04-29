import { NextRequest, NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { fetchVerseWords } from "@/lib/qf/content-client";

export async function GET(req: NextRequest) {
  const session = await getRequiredSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const verseKey = req.nextUrl.searchParams.get("verse_key");
  const positionParam = req.nextUrl.searchParams.get("position");

  if (!verseKey || !positionParam) {
    return NextResponse.json(
      { error: "verse_key and position are required" },
      { status: 400 }
    );
  }

  const position = parseInt(positionParam, 10);
  if (isNaN(position) || position < 1) {
    return NextResponse.json(
      { error: "position must be a positive integer" },
      { status: 400 }
    );
  }

  // Fetch word from QF API
  const words = await fetchVerseWords(verseKey);
  const wordData = words[position - 1]; // 0-based index

  if (!wordData) {
    return NextResponse.json({ error: "Word not found" }, { status: 404 });
  }

  const arabic = wordData.text_uthmani;

  // Check if word is in user's deck
  const db = createServerClient();
  const { data: deckEntry } = await db
    .from("user_words")
    .select("*")
    .eq("user_id", session.userId!)
    .eq("arabic", arabic)
    .maybeSingle();

  return NextResponse.json({
    word: {
      arabic: wordData.text_uthmani,
      transliteration: wordData.transliteration,
      meaning: wordData.translation,
      root: wordData.root_id ?? null,
    },
    inDeck: deckEntry != null,
    deckEntry: deckEntry ?? null,
  });
}
