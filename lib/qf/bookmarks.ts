import { qfUserFetch } from "./client";

export async function addQFBookmark(
  accessToken: string,
  verseKey: string
): Promise<string | null> {
  // POST /bookmarks
  try {
    const data = await qfUserFetch("/bookmarks", accessToken, {
      method: "POST",
      body: JSON.stringify({ verse_key: verseKey }),
    });
    return data.id ?? data.bookmark_id ?? null;
  } catch {
    return null;
  }
}

export async function removeQFBookmark(
  accessToken: string,
  qfBookmarkId: string
): Promise<void> {
  // DELETE /bookmarks/{id}
  try {
    await qfUserFetch(`/bookmarks/${qfBookmarkId}`, accessToken, {
      method: "DELETE",
    });
  } catch {
    // Ignore — local mirror is canonical for display
  }
}

export async function listQFBookmarks(
  accessToken: string
): Promise<{ verse_key: string; id: string }[]> {
  // GET /bookmarks
  try {
    const data = await qfUserFetch("/bookmarks", accessToken);
    return (data.bookmarks ?? data ?? []).map((b: Record<string, string>) => ({
      verse_key: b.verse_key ?? b.key,
      id: b.id,
    }));
  } catch {
    return [];
  }
}
