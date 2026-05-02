// Quran Foundation Reflect API — community posts and Q&A for a given ayah.
// Both functions return empty results on any error and never throw,
// so callers can treat failures as "no content available".

const REFLECT_BASE = process.env.QF_REFLECT_BASE ?? "https://reflect.quran.com";
const CLIENT_ID = process.env.QF_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.QF_CLIENT_SECRET ?? "";

// In-memory token cache (per process instance)
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getReflectToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 30_000) {
    return cachedToken.token;
  }

  const oauthBase =
    process.env.QF_OAUTH_URL ?? "https://oauth2.quran.foundation";
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: "post.read",
  });

  const res = await fetch(`${oauthBase}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Reflect token fetch failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };
  return cachedToken.token;
}

export interface ReflectPost {
  id: number | string;
  body: string;
  [key: string]: unknown;
}

export interface ReflectPostsResult {
  total: number;
  posts: ReflectPost[];
}

export async function listReflectPostsForAyah(
  verseKey: string,
  opts: { limit?: number } = {}
): Promise<ReflectPostsResult> {
  try {
    const token = await getReflectToken();
    const url = new URL(`${REFLECT_BASE}/api/v1/posts`);
    url.searchParams.set("verse_key", verseKey);
    url.searchParams.set("limit", String(opts.limit ?? 10));

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-client-id": CLIENT_ID,
      },
    });

    if (!res.ok) {
      console.error(
        `[reflect-posts ${res.status}] ${verseKey} → ${await res.text()}`
      );
      return { total: 0, posts: [] };
    }

    const data = await res.json();
    const posts: ReflectPost[] = data.posts ?? data.data ?? [];
    return { total: data.total ?? posts.length, posts };
  } catch (err) {
    console.error(`[reflect-posts error] ${verseKey}:`, String(err));
    return { total: 0, posts: [] };
  }
}

export interface AyahAnswer {
  body: string;
  [key: string]: unknown;
}

export interface AyahQuestion {
  id: number | string;
  answers: AyahAnswer[];
  [key: string]: unknown;
}

export interface AyahAnswersResult {
  total: number;
  questions: AyahQuestion[];
}

export async function listAyahAnswers(
  verseKey: string,
  opts: { pageSize?: number } = {}
): Promise<AyahAnswersResult> {
  try {
    const token = await getReflectToken();
    const url = new URL(`${REFLECT_BASE}/api/v1/questions`);
    url.searchParams.set("verse_key", verseKey);
    url.searchParams.set("page_size", String(opts.pageSize ?? 10));

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-client-id": CLIENT_ID,
      },
    });

    if (!res.ok) {
      console.error(
        `[reflect-answers ${res.status}] ${verseKey} → ${await res.text()}`
      );
      return { total: 0, questions: [] };
    }

    const data = await res.json();
    const questions: AyahQuestion[] = data.questions ?? data.data ?? [];
    return { total: data.total ?? questions.length, questions };
  } catch (err) {
    console.error(`[reflect-answers error] ${verseKey}:`, String(err));
    return { total: 0, questions: [] };
  }
}
