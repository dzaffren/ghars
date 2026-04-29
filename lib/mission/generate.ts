import { getLLMProvider } from "@/lib/llm";
import { fetchVerse } from "@/lib/qf/content-client";
import { createServerClient } from "@/lib/supabase/server";
import actionablePool from "@/data/actionable-verses.json";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export async function getOrCreateTodaysMission(userId: string) {
  const db = createServerClient();

  // Fetch user to get timezone + focus areas
  const { data: user, error } = await db
    .from("users")
    .select("timezone, focus_areas")
    .eq("id", userId)
    .single();

  if (error || !user) throw new Error("User not found");

  const localDate = getLocalDate(user.timezone);

  // Check if today's mission already exists
  const { data: existing } = await db
    .from("daily_missions")
    .select("*")
    .eq("user_id", userId)
    .eq("local_date", localDate)
    .single();

  if (existing) {
    await applyWiltingCheck(userId, db);
    return existing;
  }

  // Fetch recent verse keys to avoid repetition (last 7 days)
  const { data: recent } = await db
    .from("daily_missions")
    .select("verse_key")
    .eq("user_id", userId)
    .order("local_date", { ascending: false })
    .limit(7);

  const recentKeys = (recent ?? []).map(
    (r: { verse_key: string }) => r.verse_key
  );

  // LLM picks verse + mission
  let picked;
  try {
    const llm = await getLLMProvider();
    picked = await llm.pickMission({
      focusAreas: user.focus_areas ?? [],
      recentVerseKeys: recentKeys,
      actionablePool,
    });
  } catch (err) {
    console.error("[mission/generate] LLM pickMission failed", { userId, err });
    throw new Error("mission_llm_failed", { cause: err });
  }

  // Fetch full verse data (Arabic + translation + tafsir + audio)
  let verseData;
  try {
    verseData = await fetchVerse(picked.verseKey);
  } catch (err) {
    console.error("[mission/generate] QF fetchVerse failed", {
      userId,
      verseKey: picked.verseKey,
      err,
    });
    throw new Error("mission_verse_fetch_failed", { cause: err });
  }

  // Store mission
  const { data: mission, error: insertErr } = await db
    .from("daily_missions")
    .insert({
      user_id: userId,
      local_date: localDate,
      verse_key: picked.verseKey,
      verse_arabic: verseData.arabic,
      verse_translation: verseData.translation,
      tafsir_snippet: verseData.tafsirSnippet,
      audio_url: verseData.audioUrl,
      mission_text: picked.missionText,
      focus_area: picked.focusArea,
    })
    .select()
    .single();

  if (insertErr) {
    console.error("[mission/generate] insert failed", { userId, insertErr });
    throw new Error("mission_insert_failed", { cause: insertErr });
  }
  await applyWiltingCheck(userId, db);
  return mission;
}

export function getLocalDate(timezone: string): string {
  try {
    const zoned = toZonedTime(new Date(), timezone);
    return format(zoned, "yyyy-MM-dd");
  } catch {
    return format(new Date(), "yyyy-MM-dd");
  }
}

async function applyWiltingCheck(
  userId: string,
  db: ReturnType<typeof createServerClient>
) {
  const { data: garden } = await db
    .from("gardens")
    .select("last_completed_date, wilting")
    .eq("user_id", userId)
    .single();

  if (!garden?.last_completed_date) return;

  const yesterday = new Date(Date.now() - 86_400_000)
    .toISOString()
    .slice(0, 10);
  if (garden.last_completed_date < yesterday && !garden.wilting) {
    await db
      .from("gardens")
      .update({ wilting: true, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
  }
}
