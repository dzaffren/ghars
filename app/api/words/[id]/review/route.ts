import { NextRequest, NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { applyReview, type Rating, type SM2State } from "@/lib/words/sm2";

const MILESTONES: Record<number, string> = {
  10: "olive",
  25: "palm",
  50: "fig",
  100: "pomegranate",
};

const NEXT_THRESHOLD: Record<number, number> = {
  10: 25,
  25: 50,
  50: 100,
  100: 999,
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getRequiredSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { rating } = (await req.json()) as { rating: Rating };

  if (!["again", "hard", "good", "easy"].includes(rating)) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
  }

  const db = createServerClient();
  const userId = session.userId!;

  // Fetch the user_words row and verify ownership
  const { data: word, error: wordError } = await db
    .from("user_words")
    .select("*")
    .eq("id", id)
    .single();

  if (wordError || !word) {
    return NextResponse.json({ error: "Word not found" }, { status: 404 });
  }

  if (word.user_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Apply SM-2 algorithm
  const state: SM2State = {
    intervalDays: word.interval_days ?? 0,
    easeFactor: word.ease_factor ?? 2.5,
    repetitions: word.repetitions ?? 0,
  };

  const previousStatus: "learning" | "known" | "mature" =
    word.status ?? "learning";

  const result = applyReview(state, rating, previousStatus);

  const now = new Date().toISOString();

  // Update user_words with new SM-2 fields
  const { data: updatedWord, error: updateError } = await db
    .from("user_words")
    .update({
      interval_days: result.intervalDays,
      ease_factor: result.easeFactor,
      repetitions: result.repetitions,
      due_at: result.dueAt.toISOString(),
      last_reviewed_at: now,
      status: result.status,
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError || !updatedWord) {
    console.error("[words/review POST] update error:", updateError);
    return NextResponse.json(
      { error: "Could not update word" },
      { status: 500 }
    );
  }

  // Insert review record
  await db.from("word_reviews").insert({
    user_id: userId,
    user_word_id: id,
    rating,
  });

  let plantUnlocked: string | null = null;

  if (result.becameMature) {
    // Increment known_word_count on the garden
    const { data: garden } = await db
      .from("gardens")
      .select("known_word_count, next_unlock_threshold")
      .eq("user_id", userId)
      .single();

    const newCount = (garden?.known_word_count ?? 0) + 1;
    const threshold = garden?.next_unlock_threshold ?? 10;

    await db
      .from("gardens")
      .update({ known_word_count: newCount })
      .eq("user_id", userId);

    // Check if we crossed a milestone
    if (newCount >= threshold) {
      const species = MILESTONES[threshold];

      if (species) {
        await db.from("garden_plants").upsert(
          {
            user_id: userId,
            species,
            unlocked_at: now,
          },
          { onConflict: "user_id,species", ignoreDuplicates: false }
        );

        const nextThreshold = NEXT_THRESHOLD[threshold] ?? 999;
        await db
          .from("gardens")
          .update({ next_unlock_threshold: nextThreshold })
          .eq("user_id", userId);

        plantUnlocked = species;
      }
    }
  }

  return NextResponse.json({
    word: updatedWord,
    becameMature: result.becameMature,
    plantUnlocked,
  });
}
