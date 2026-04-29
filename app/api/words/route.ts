import { NextRequest, NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const session = await getRequiredSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    verse_key: string;
    word_position: number;
    arabic: string;
    transliteration: string;
    meaning: string;
    root?: string | null;
    audio_url?: string | null;
  };

  const {
    verse_key,
    word_position,
    arabic,
    transliteration,
    meaning,
    root = null,
    audio_url = null,
  } = body;

  if (
    !verse_key ||
    word_position == null ||
    !arabic ||
    !transliteration ||
    !meaning
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const db = createServerClient();
  const userId = session.userId;

  const now = new Date().toISOString();

  // Try inserting; if unique violation (23505), fetch and return existing row
  const { data, error } = await db
    .from("user_words")
    .insert({
      user_id: userId,
      verse_key,
      word_position,
      arabic,
      transliteration,
      meaning,
      root: root ?? null,
      audio_url: audio_url ?? null,
      status: "learning",
      interval_days: 1,
      ease_factor: 2.5,
      repetitions: 0,
      due_at: now,
      last_reviewed_at: null,
      created_at: now,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      // Duplicate — fetch existing row, matching on the same dedup key
      const query = db
        .from("user_words")
        .select("*")
        .eq("user_id", userId!)
        .eq("arabic", arabic);

      if (root) {
        query.eq("root", root);
      } else {
        query.is("root", null);
      }

      const { data: existing, error: fetchError } = await query.single();

      if (fetchError || !existing) {
        return NextResponse.json(
          { error: "Could not fetch existing word" },
          { status: 500 }
        );
      }
      return NextResponse.json({ word: existing, created: false });
    }
    console.error("[words POST] insert error:", error);
    return NextResponse.json({ error: "Could not add word" }, { status: 500 });
  }

  return NextResponse.json({ word: data, created: true }, { status: 201 });
}
