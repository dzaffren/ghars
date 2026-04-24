// Quran Foundation Content API client with client-credentials token caching

const BASE_URL = process.env.QF_BASE_URL!;
const CLIENT_ID = process.env.QF_CLIENT_ID!;
const CLIENT_SECRET = process.env.QF_CLIENT_SECRET!;
const QF_OAUTH_URL = process.env.QF_OAUTH_URL!;

// In-memory token cache (per serverless function instance)
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getContentToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 30_000) {
    return cachedToken.token;
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: "content search",
  });

  const res = await fetch(`${QF_OAUTH_URL}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) throw new Error(`Content token fetch failed: ${res.status}`);
  const data = await res.json();

  cachedToken = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };
  return cachedToken.token;
}

async function qfFetch(path: string, params?: Record<string, string>) {
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
  if (!res.ok) throw new Error(`QF API error ${res.status} for ${path}`);
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
  const data = await qfFetch(`/verses/${verseKey}`, {
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
      `/recitations/${recitationId}/audio-files`,
      { per_page: "1", page: "1" }
    );
    const match = audioData.audio_files?.find(
      (f: { verse_key: string; url: string }) => f.verse_key === verseKey
    );
    audioUrl = match?.url ?? null;
  } catch {
    // Non-critical; audio is optional
  }

  return { verseKey, arabic, translation, tafsirSnippet, audioUrl };
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
