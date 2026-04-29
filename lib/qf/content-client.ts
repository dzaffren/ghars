// Quran Foundation Content API client with client-credentials token caching

const BASE_URL = process.env.QF_BASE_URL!;
// Content API uses its own credentials + production OAuth (separate from user auth)
const CLIENT_ID = process.env.QF_CONTENT_CLIENT_ID ?? process.env.QF_CLIENT_ID!;
const CLIENT_SECRET =
  process.env.QF_CONTENT_CLIENT_SECRET ?? process.env.QF_CLIENT_SECRET!;
// Content API always uses production OAuth — never fall back to QF_OAUTH_URL
// which may be set to prelive for user auth
const CONTENT_OAUTH_URL =
  process.env.QF_CONTENT_OAUTH_URL ?? "https://oauth2.quran.foundation";

// In-memory token cache (per serverless function instance)
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getContentToken(): Promise<string> {
  if (!BASE_URL) throw new Error("QF content: QF_BASE_URL env not set");
  if (!CLIENT_ID || !CLIENT_SECRET)
    throw new Error("QF content: client credentials missing");

  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 30_000) {
    return cachedToken.token;
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: "content",
  });
  // Fallback: if QF granted fewer scopes than we asked for, log what we got
  // so we can see if the client lacks content access.

  const res = await fetch(`${CONTENT_OAUTH_URL}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Content token fetch failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  console.log(
    "[QF content token] granted scopes:",
    data.scope,
    "expires_in:",
    data.expires_in
  );

  cachedToken = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };
  return cachedToken.token;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function qfFetch(
  path: string,
  params?: Record<string, string>,
  isRetry = false
): Promise<any> {
  const token = await getContentToken();
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    headers: {
      "x-auth-token": token,
      "x-client-id": CLIENT_ID,
    },
    next: { revalidate: 3600 },
  });
  if (res.status === 401 && !isRetry) {
    cachedToken = null;
    return qfFetch(path, params, true);
  }
  if (!res.ok) {
    const text = await res.text();
    console.error(`[QF API ${res.status}] ${url.toString()} → ${text}`);
    throw new Error(`QF API error ${res.status} for ${path}`);
  }
  return res.json();
}

export const SAHEEH_TRANSLATION_ID = "20";
export const IBN_KATHIR_TAFSIR_ID = "169";

export interface VerseData {
  verseKey: string;
  arabic: string;
  translation: string;
  tafsirSnippet: string | null;
  audioUrl: string | null;
}

export async function fetchVerse(
  verseKey: string,
  recitationId = "7"
): Promise<VerseData> {
  const data = await qfFetch(`/verses/by_key/${verseKey}`, {
    translations: SAHEEH_TRANSLATION_ID,
    tafsirs: IBN_KATHIR_TAFSIR_ID,
    fields: "text_uthmani",
  });

  const arabic = data.verse?.text_uthmani ?? "";
  const translation =
    data.verse?.translations?.[0]?.text?.replace(/<[^>]+>/g, "") ?? "";
  const rawTafsir = data.verse?.tafsirs?.[0]?.text ?? null;
  const tafsirSnippet = rawTafsir
    ? rawTafsir.replace(/<[^>]+>/g, "").slice(0, 400) + "…"
    : null;

  // Fetch audio URL for this verse + reciter
  let audioUrl: string | null = null;
  try {
    const audioData = await qfFetch(
      `/recitations/${recitationId}/by_ayah/${verseKey}`
    );
    const raw = audioData.audio_files?.[0]?.url ?? null;
    audioUrl = raw
      ? raw.startsWith("http")
        ? raw
        : `https://verses.quran.com/${raw}`
      : null;
    console.log("[QF audio] raw:", raw, "→ resolved:", audioUrl);
  } catch {
    // Non-critical; audio is optional
  }

  return { verseKey, arabic, translation, tafsirSnippet, audioUrl };
}

export interface VerseWord {
  text_uthmani: string;
  translation: string;
  transliteration: string;
  root_id?: string | null;
  lemma_id?: string | null;
}

// Fetches the word list for a verse. QF includes words when word_fields is set.
// Returns only word-type tokens (filters out punctuation / sajda markers).
export async function fetchVerseWords(verseKey: string): Promise<VerseWord[]> {
  try {
    const data = await qfFetch(`/verses/by_key/${verseKey}`, {
      words: "true",
      word_fields: "text_uthmani,translation,transliteration,root_id,lemma_id",
      fields: "text_uthmani",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const words: any[] = data.verse?.words ?? [];
    return words
      .filter((w) => w.char_type_name === "word" || !w.char_type_name)
      .map((w) => ({
        text_uthmani: w.text_uthmani ?? w.text ?? "",
        translation: w.translation?.text ?? "",
        transliteration: w.transliteration?.text ?? "",
        root_id: w.root_id ?? null,
        lemma_id: w.lemma_id ?? null,
      }))
      .filter((w) => w.text_uthmani && w.translation);
  } catch {
    return [];
  }
}

export async function fetchRandomVerse(): Promise<{
  verseKey: string;
  arabic: string;
}> {
  const data = await qfFetch("/verses/random", {
    fields: "text_uthmani",
  });
  return {
    verseKey: data.verse?.verse_key ?? "",
    arabic: data.verse?.text_uthmani ?? "",
  };
}

export async function listRecitations() {
  return qfFetch("/resources/recitations");
}

export async function fetchChapters() {
  return qfFetch("/chapters");
}

// Fetches the full-chapter recitation URL for the given reciter.
// Returns null on any failure (non-critical; audio is optional).
export async function fetchChapterAudioUrl(
  chapterId: number | string,
  recitationId = 7
): Promise<string | null> {
  try {
    const data = await qfFetch(
      `/chapter_recitations/${recitationId}/${chapterId}`
    );
    const file = data?.audio_file ?? null;
    const raw: string | null = file?.audio_url ?? file?.url ?? null;
    if (!raw) return null;
    return raw.startsWith("http") ? raw : `https://verses.quran.com/${raw}`;
  } catch {
    return null;
  }
}

export interface ChapterVerse {
  verse_key: string;
  verse_number: number;
  text_uthmani: string;
  translation: string;
}

// Fetches all verses of a chapter with Saheeh translation.
// QF paginates at 50 per page by default; we request 300 to cover the longest
// chapter (Al-Baqarah, 286 verses) in a single round-trip.
export async function fetchChapterVerses(
  chapterId: number | string
): Promise<ChapterVerse[]> {
  const data = await qfFetch(`/chapters/${chapterId}/verses`, {
    translations: SAHEEH_TRANSLATION_ID,
    fields: "text_uthmani",
    per_page: "300",
    page: "1",
  });

  const verses: ChapterVerse[] = (data.verses ?? []).map(
    (v: {
      verse_key: string;
      verse_number: number;
      text_uthmani: string;
      translations?: { text: string }[];
    }) => ({
      verse_key: v.verse_key,
      verse_number: v.verse_number,
      text_uthmani: v.text_uthmani ?? "",
      translation: v.translations?.[0]?.text?.replace(/<[^>]+>/g, "") ?? "",
    })
  );
  return verses;
}
