import { qfUserFetch } from "./client";

export interface NoteResult {
  note_id: string;
}

export interface ActivityResult {
  ok: boolean;
}

export interface StreakResult {
  current_streak_days: number;
}

export async function addNote(params: {
  accessToken: string;
  verseKey: string;
  body: string;
}): Promise<NoteResult> {
  // POST /notes — body: { verse_key, body }; returns { id }
  const data = await qfUserFetch("/notes", params.accessToken, {
    method: "POST",
    body: JSON.stringify({ verse_key: params.verseKey, body: params.body }),
  });
  return { note_id: data.id ?? data.note_id ?? data.data?.id ?? "" };
}

export async function addActivityDay(params: {
  accessToken: string;
  date: string; // YYYY-MM-DD
}): Promise<ActivityResult> {
  // POST /activity/day — body: { date: "YYYY-MM-DD", seconds_read: 60 }
  try {
    await qfUserFetch("/activity/day", params.accessToken, {
      method: "POST",
      body: JSON.stringify({ date: params.date, seconds_read: 60 }),
    });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function getCurrentStreak(
  accessToken: string
): Promise<StreakResult> {
  // GET /streaks/current
  try {
    const data = await qfUserFetch("/streaks/current", accessToken);
    return {
      current_streak_days:
        data.streak_count ?? data.current_streak ?? data.streak ?? 0,
    };
  } catch {
    return { current_streak_days: 0 };
  }
}
