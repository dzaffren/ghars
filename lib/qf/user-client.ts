// Quran Foundation User API client (uses user's OAuth access token)

const BASE_URL = process.env.QF_USER_BASE_URL ?? process.env.QF_BASE_URL!;
const CLIENT_ID = process.env.QF_CLIENT_ID!;

function userFetch(
  path: string,
  accessToken: string,
  options: RequestInit = {}
) {
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "x-auth-token": accessToken,
      "x-client-id": CLIENT_ID,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
}

// Bookmarks
export async function addBookmark(accessToken: string, verseKey: string) {
  const [surah, ayah] = verseKey.split(":").map(Number);
  const res = await userFetch("/bookmarks", accessToken, {
    method: "POST",
    body: JSON.stringify({
      type: "ayah",
      surah_number: surah,
      ayah_number: ayah,
      collection_id: "__default__",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bookmark failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function getBookmarks(accessToken: string) {
  const res = await userFetch("/bookmarks?first=20", accessToken);
  if (!res.ok) throw new Error(`Get bookmarks failed: ${res.status}`);
  return res.json();
}

// Streaks (read-only; QF computes it from their platform activity)
export async function getStreaks(accessToken: string) {
  try {
    const res = await userFetch("/streaks", accessToken);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// Goals — create a daily reflection goal on onboarding
export async function createDailyReflectionGoal(
  accessToken: string
): Promise<string | null> {
  try {
    const res = await userFetch("/goals", accessToken, {
      method: "POST",
      body: JSON.stringify({
        type: "daily_reflection",
        title: "Daily Quran Mission",
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.id ?? null;
  } catch {
    return null;
  }
}

// Log activity against the goal (endpoint may not be documented; best-effort)
export async function logGoalActivity(
  accessToken: string,
  goalId: string
): Promise<void> {
  try {
    await userFetch(`/goals/${goalId}/activities`, accessToken, {
      method: "POST",
      body: JSON.stringify({ completed: true }),
    });
  } catch {
    // Silently fail; we have our own activity_log table as fallback
  }
}
