/**
 * QF API smoke test.
 *
 * Exercises every QF endpoint listed in docs/qf-api-reference.md against the
 * prelive environment. Prints PASS / FAIL per endpoint. Exits 0 on all pass,
 * 1 on any fail.
 *
 * Prerequisites (in .env.local):
 *   QF_OAUTH_BASE=https://prelive-oauth2.quran.foundation
 *   QF_CONTENT_BASE=https://api.quran.com/api/v4
 *   QF_USER_BASE=https://apis-prelive.quran.foundation/auth/v1
 *   QF_CLIENT_ID=<prelive client id>
 *   QF_CLIENT_SECRET=<prelive client secret>
 *   QF_SMOKE_ACCESS_TOKEN=<prelive user access token with full scope set>
 *
 * To get QF_SMOKE_ACCESS_TOKEN: run `npm run dev`, sign in via QF prelive,
 * then copy the access_token from the qf_sessions row in Supabase.
 *
 * Run: npm run qf:smoke
 */

const OAUTH_BASE = process.env.QF_OAUTH_BASE ?? "";
const CONTENT_BASE =
  process.env.QF_CONTENT_BASE ?? "https://api.quran.com/api/v4";
const USER_BASE = process.env.QF_USER_BASE ?? "";
const CLIENT_ID = process.env.QF_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.QF_CLIENT_SECRET ?? "";
const USER_TOKEN = process.env.QF_SMOKE_ACCESS_TOKEN ?? "";

const TEST_VERSE_KEY = "103:1";
const TEST_TRANSLATION_ID = "131";
const TEST_TAFSIR_ID = "169";
const TEST_RECITER_ID = "7";

const FAILURES: string[] = [];
const PASSES: string[] = [];

function pass(name: string, detail?: string) {
  PASSES.push(name);
  console.log(`\x1b[32mPASS\x1b[0m ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name: string, detail: string) {
  FAILURES.push(`${name} — ${detail}`);
  console.log(`\x1b[31mFAIL\x1b[0m ${name} — ${detail}`);
}

function assertEnv() {
  const missing: string[] = [];
  if (!OAUTH_BASE) missing.push("QF_OAUTH_BASE");
  if (!USER_BASE) missing.push("QF_USER_BASE");
  if (!CLIENT_ID) missing.push("QF_CLIENT_ID");
  if (!CLIENT_SECRET) missing.push("QF_CLIENT_SECRET");
  if (!USER_TOKEN) missing.push("QF_SMOKE_ACCESS_TOKEN");
  if (missing.length) {
    console.error(`Missing env vars: ${missing.join(", ")}`);
    console.error(
      "See scripts/qf-smoke-test.ts header for how to populate them."
    );
    process.exit(2);
  }
  if (
    OAUTH_BASE === "https://oauth2.quran.foundation" ||
    USER_BASE.includes("apis.quran.foundation/auth/v1")
  ) {
    console.error(
      "Refusing to run against production. Set QF_OAUTH_BASE and QF_USER_BASE to prelive."
    );
    process.exit(2);
  }
}

function basicAuth(): string {
  return (
    "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")
  );
}

async function bodyPreview(res: Response): Promise<string> {
  try {
    const text = await res.text();
    return text.length > 300 ? text.slice(0, 300) + "…" : text;
  } catch {
    return "<no body>";
  }
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 10_000
): Promise<Response> {
  return fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
}

// ── OAuth2 endpoints ──────────────────────────────────────────────────────

async function testAuthorizeUrlShape() {
  const name = "#1 authorize URL shape";
  const url = new URL(`${OAUTH_BASE}/oauth2/auth`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", CLIENT_ID);
  url.searchParams.set(
    "redirect_uri",
    "http://localhost:3000/api/auth/callback"
  );
  url.searchParams.set("state", "smoke-test");
  url.searchParams.set("code_challenge", "a".repeat(43));
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set(
    "scope",
    "openid offline_access user bookmark collection streak preference goal activity_day note"
  );
  try {
    const res = await fetchWithTimeout(url.toString(), { redirect: "manual" });
    // A 200 (consent page) or 302 (to registered redirect_uri) is fine.
    // A 404 means the path is wrong.
    if (res.status === 404) {
      fail(name, `404 — authorize path /oauth2/auth not found`);
    } else {
      pass(name, `status ${res.status}`);
    }
  } catch (e) {
    fail(name, `fetch error: ${String(e)}`);
  }
}

async function testClientCredentialsToken(): Promise<string | null> {
  const name = "#4 client_credentials token (scope=content)";
  try {
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      scope: "content",
    });
    const res = await fetchWithTimeout(`${OAUTH_BASE}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: basicAuth(),
      },
      body: body.toString(),
    });
    if (!res.ok) {
      fail(name, `status ${res.status}: ${await bodyPreview(res)}`);
      return null;
    }
    const json = (await res.json()) as { access_token?: string };
    if (!json.access_token) {
      fail(name, "no access_token in response");
      return null;
    }
    pass(name, "got access_token");
    return json.access_token;
  } catch (e) {
    fail(name, `fetch error: ${String(e)}`);
    return null;
  }
}

async function testClientSecretPostRejected() {
  const name = "#2b client_secret_post is rejected (negative test)";
  try {
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      scope: "content",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });
    const res = await fetchWithTimeout(`${OAUTH_BASE}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    if (res.status === 401) {
      pass(name, "QF correctly rejects client_secret_post with 401");
    } else {
      fail(
        name,
        `expected 401, got ${res.status} — QF may now accept client_secret_post`
      );
    }
  } catch (e) {
    fail(name, `fetch error: ${String(e)}`);
  }
}

// ── Content endpoints ─────────────────────────────────────────────────────

async function testGetVerse(contentToken: string) {
  const name = "#5 GET /verses/by_key/103:1";
  try {
    const res = await fetchWithTimeout(
      `${CONTENT_BASE}/verses/by_key/${TEST_VERSE_KEY}?fields=text_uthmani,verse_key,verse_number`,
      {
        headers: {
          "x-auth-token": contentToken,
          "x-client-id": CLIENT_ID,
        },
      }
    );
    if (!res.ok) {
      fail(name, `status ${res.status}: ${await bodyPreview(res)}`);
      return;
    }
    const json = (await res.json()) as {
      verse?: { text_uthmani?: string };
    };
    const arabic = json.verse?.text_uthmani?.trim();
    if (!arabic) {
      fail(name, "response has no text_uthmani");
      return;
    }
    pass(name, `got arabic (${arabic.length} chars)`);
  } catch (e) {
    fail(name, `fetch error: ${String(e)}`);
  }
}

async function testGetTranslation(contentToken: string) {
  const name = "#6 GET /verses/by_key/103:1?translations=131";
  try {
    const res = await fetchWithTimeout(
      `${CONTENT_BASE}/verses/by_key/${TEST_VERSE_KEY}?translations=${TEST_TRANSLATION_ID}&fields=text_uthmani`,
      {
        headers: {
          "x-auth-token": contentToken,
          "x-client-id": CLIENT_ID,
        },
      }
    );
    if (!res.ok) {
      fail(name, `status ${res.status}: ${await bodyPreview(res)}`);
      return;
    }
    const json = (await res.json()) as {
      verse?: { translations?: { text?: string }[] };
    };
    const text = json.verse?.translations?.[0]?.text;
    if (!text) {
      fail(name, "response has no translation text");
      return;
    }
    pass(name, `got translation "${text.slice(0, 40)}..."`);
  } catch (e) {
    fail(name, `fetch error: ${String(e)}`);
  }
}

async function testGetAudio(contentToken: string) {
  const name = "#7 GET /recitations/7/by_ayah/103:1";
  try {
    const res = await fetchWithTimeout(
      `${CONTENT_BASE}/recitations/${TEST_RECITER_ID}/by_ayah/${TEST_VERSE_KEY}`,
      {
        headers: {
          "x-auth-token": contentToken,
          "x-client-id": CLIENT_ID,
        },
      }
    );
    if (!res.ok) {
      fail(name, `status ${res.status}: ${await bodyPreview(res)}`);
      return;
    }
    const json = (await res.json()) as {
      audio_files?: { url?: string }[];
    };
    const url = json.audio_files?.[0]?.url;
    if (!url) {
      fail(name, "response has no audio_files[0].url");
      return;
    }
    pass(name, `got audio URL ${url.slice(0, 40)}...`);
  } catch (e) {
    fail(name, `fetch error: ${String(e)}`);
  }
}

async function testGetTafsir(contentToken: string) {
  const name = "#8 GET /quran/tafsirs/169?verse_key=103:1";
  try {
    const res = await fetchWithTimeout(
      `${CONTENT_BASE}/quran/tafsirs/${TEST_TAFSIR_ID}?verse_key=${TEST_VERSE_KEY}`,
      {
        headers: {
          "x-auth-token": contentToken,
          "x-client-id": CLIENT_ID,
        },
      }
    );
    if (!res.ok) {
      fail(name, `status ${res.status}: ${await bodyPreview(res)}`);
      return;
    }
    const json = (await res.json()) as {
      tafsirs?: { text?: string }[];
    };
    const text = json.tafsirs?.[0]?.text;
    if (!text) {
      fail(name, "response has no tafsirs[0].text");
      return;
    }
    pass(name, `got tafsir (${text.length} chars)`);
  } catch (e) {
    fail(name, `fetch error: ${String(e)}`);
  }
}

// ── User endpoints ────────────────────────────────────────────────────────

async function userFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetchWithTimeout(`${USER_BASE}${path}`, {
    ...init,
    headers: {
      "x-auth-token": USER_TOKEN,
      "x-client-id": CLIENT_ID,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

async function testBookmarkRoundTrip() {
  const addName = "#12 POST /bookmarks";
  const listName = "#13 GET /bookmarks";
  const deleteName = "#14 DELETE /bookmarks/{id}";

  let bookmarkId: string | null = null;

  // Add
  try {
    const res = await userFetch("/bookmarks", {
      method: "POST",
      body: JSON.stringify({ verse_key: TEST_VERSE_KEY }),
    });
    if (!res.ok) {
      fail(addName, `status ${res.status}: ${await bodyPreview(res)}`);
    } else {
      const json = (await res.json()) as { id?: string; bookmark_id?: string };
      bookmarkId = json.id ?? json.bookmark_id ?? null;
      if (!bookmarkId) {
        fail(
          addName,
          `no id in response: ${JSON.stringify(json).slice(0, 200)}`
        );
      } else {
        pass(addName, `created ${bookmarkId}`);
      }
    }
  } catch (e) {
    fail(addName, `fetch error: ${String(e)}`);
  }

  // List
  try {
    const res = await userFetch("/bookmarks");
    if (!res.ok) {
      fail(listName, `status ${res.status}: ${await bodyPreview(res)}`);
    } else {
      const json = await res.json();
      const list = Array.isArray(json) ? json : (json.bookmarks ?? []);
      const found = bookmarkId
        ? list.some((b: { id?: string }) => b.id === bookmarkId)
        : list.length > 0;
      if (bookmarkId && !found) {
        fail(listName, `created ${bookmarkId} not found in list`);
      } else {
        pass(listName, `listed ${list.length} entries`);
      }
    }
  } catch (e) {
    fail(listName, `fetch error: ${String(e)}`);
  }

  // Delete (cleanup)
  if (bookmarkId) {
    try {
      const res = await userFetch(`/bookmarks/${bookmarkId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        fail(deleteName, `status ${res.status}: ${await bodyPreview(res)}`);
      } else {
        pass(deleteName, `deleted ${bookmarkId}`);
      }
    } catch (e) {
      fail(deleteName, `fetch error: ${String(e)}`);
    }
  } else {
    fail(deleteName, "skipped — add failed");
  }
}

async function testAddNote() {
  const name = "#9 POST /notes";
  try {
    const res = await userFetch("/notes", {
      method: "POST",
      body: JSON.stringify({
        verse_key: TEST_VERSE_KEY,
        body: `QF smoke test ${new Date().toISOString()} — safe to delete.`,
      }),
    });
    if (!res.ok) {
      fail(name, `status ${res.status}: ${await bodyPreview(res)}`);
      return;
    }
    const json = (await res.json()) as {
      id?: string;
      note_id?: string;
      data?: { id?: string };
    };
    const noteId = json.id ?? json.note_id ?? json.data?.id;
    if (!noteId) {
      fail(name, `no id in response: ${JSON.stringify(json).slice(0, 200)}`);
      return;
    }
    pass(name, `created note ${noteId}`);
  } catch (e) {
    fail(name, `fetch error: ${String(e)}`);
  }
}

async function testActivityDay() {
  const name = "#10 POST /activity/day (path needs verification)";
  // Try each candidate path and record which one works
  const candidates = [
    "/activity/day",
    "/activity_days",
    "/activity-days",
    "/activity/add-update",
  ];
  const today = new Date().toISOString().slice(0, 10);
  for (const path of candidates) {
    try {
      const res = await userFetch(path, {
        method: "POST",
        body: JSON.stringify({ date: today, seconds_read: 60 }),
      });
      if (res.ok) {
        pass(name, `working path: ${path}`);
        return;
      }
    } catch {
      // Try next candidate
    }
  }
  fail(name, `no candidate path returned 2xx: tried ${candidates.join(", ")}`);
}

async function testGetStreak() {
  const name = "#11 GET /streaks/current (path needs verification)";
  const candidates = ["/streaks/current", "/streaks"];
  for (const path of candidates) {
    try {
      const res = await userFetch(path);
      if (res.ok) {
        pass(name, `working path: ${path}`);
        return;
      }
    } catch {
      // Try next
    }
  }
  fail(name, `no candidate path returned 2xx: tried ${candidates.join(", ")}`);
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("QF API smoke test — prelive environment");
  console.log(`  OAuth:   ${OAUTH_BASE}`);
  console.log(`  Content: ${CONTENT_BASE}`);
  console.log(`  User:    ${USER_BASE}`);
  console.log("");

  assertEnv();

  // OAuth2
  await testAuthorizeUrlShape();
  const contentToken = await testClientCredentialsToken();
  await testClientSecretPostRejected();

  // Content (require a content token)
  if (contentToken) {
    await testGetVerse(contentToken);
    await testGetTranslation(contentToken);
    await testGetAudio(contentToken);
    await testGetTafsir(contentToken);
  } else {
    fail("content suite", "skipped — no content token");
  }

  // User
  await testAddNote();
  await testActivityDay();
  await testGetStreak();
  await testBookmarkRoundTrip();

  console.log("");
  console.log(`Summary: ${PASSES.length} passed, ${FAILURES.length} failed`);
  if (FAILURES.length > 0) {
    console.log("");
    console.log("Failures:");
    for (const f of FAILURES) console.log(`  - ${f}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Smoke test crashed:", e);
  process.exit(1);
});
