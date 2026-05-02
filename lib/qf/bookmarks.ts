import { qfUserFetch } from "./client";

// POST /bookmarks — body: { verse_key }; returns { id } or { bookmark_id }
// Scope: bookmark.create
export async function addQFBookmark(
  accessToken: string,
  verseKey: string,
  userId?: string
): Promise<string | null> {
  const payload = { verse_key: verseKey };
  try {
    const data = await qfUserFetch("/bookmarks", accessToken, {
      method: "POST",
      body: JSON.stringify(payload),
      userId,
      payload,
    });
    return data.id ?? data.bookmark_id ?? null;
  } catch {
    // qfUserFetch logged the failure.
    return null;
  }
}

// DELETE /bookmarks/{id}
// Scope: bookmark.delete
export async function removeQFBookmark(
  accessToken: string,
  qfBookmarkId: string,
  userId?: string
): Promise<void> {
  try {
    await qfUserFetch(`/bookmarks/${qfBookmarkId}`, accessToken, {
      method: "DELETE",
      userId,
    });
  } catch {
    // qfUserFetch logged the failure. Local mirror remains canonical for display.
  }
}

// GET /bookmarks — returns { bookmarks: [...] } or a bare array
// Scope: bookmark.read
export async function listQFBookmarks(
  accessToken: string,
  userId?: string
): Promise<{ verse_key: string; id: string }[]> {
  try {
    const data = await qfUserFetch("/bookmarks", accessToken, { userId });
    return (data.bookmarks ?? data ?? []).map((b: Record<string, string>) => ({
      verse_key: b.verse_key ?? b.key,
      id: b.id,
    }));
  } catch {
    return [];
  }
}
