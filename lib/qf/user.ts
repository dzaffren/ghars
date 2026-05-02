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

// POST /notes — body: { verse_key, body }; returns { id } (or { note_id } — shape TBD against prelive)
// Scope: note.create
export async function addNote(params: {
  accessToken: string;
  userId?: string;
  verseKey: string;
  body: string;
}): Promise<NoteResult> {
  const payload = { verse_key: params.verseKey, body: params.body };
  try {
    const data = await qfUserFetch("/notes", params.accessToken, {
      method: "POST",
      body: JSON.stringify(payload),
      userId: params.userId,
      payload,
    });
    return { note_id: data.id ?? data.note_id ?? data.data?.id ?? "" };
  } catch {
    // qfUserFetch already logged the failure to qf_api_errors.
    return { note_id: "" };
  }
}

// POST /activity_days — body: { date: "YYYY-MM-DD", seconds_read: N }
// Scope: activity_day.create
// NOTE: Path is empirical — verify against prelive. Current value: /activity/day.
export async function addActivityDay(params: {
  accessToken: string;
  userId?: string;
  date: string;
}): Promise<ActivityResult> {
  const payload = { date: params.date, seconds_read: 60 };
  try {
    await qfUserFetch("/activity/day", params.accessToken, {
      method: "POST",
      body: JSON.stringify(payload),
      userId: params.userId,
      payload,
    });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

// GET /streaks/current — returns current streak day count
// Scope: streak.read
export async function getCurrentStreak(
  accessToken: string,
  userId?: string
): Promise<StreakResult> {
  try {
    const data = await qfUserFetch("/streaks/current", accessToken, { userId });
    return {
      current_streak_days:
        data.streak_count ?? data.current_streak ?? data.streak ?? 0,
    };
  } catch {
    return { current_streak_days: 0 };
  }
}
