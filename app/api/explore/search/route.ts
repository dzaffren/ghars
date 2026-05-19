import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSession } from "@/lib/session";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { getVerseByKey, getTranslation, getAudioUrl } from "@/lib/qf/content";

const VERSE_KEY_RE = /^\d{1,3}:\d{1,3}$/;
const SEARCH_TIMEOUT_MS = 8000;
const MODEL = "claude-haiku-4-5-20251001";

const DAILY_SEARCH_LIMIT = Number(process.env.DAILY_SEARCH_LIMIT ?? "20");
const GLOBAL_DAILY_CAP = Number(process.env.GLOBAL_DAILY_SEARCH_CAP ?? "500");

const SYSTEM_PROMPT = `You are a Quran scholar. Given a user's theme, feeling, or situation, return the 5 most relevant Quran verses. Respond with valid JSON only — an array of exactly 5 objects:
[{"verse_key":"<surah>:<ayah>","reason":"<one sentence, max 15 words, lowercase>","action_prompt":"<one specific actionable sentence derived from the verse and the user's query, max 20 words>"}]
Use only canonical verse keys (e.g. "2:255"). Do not explain. Do not add prose.`;

function parseVerseResults(raw: string): Array<{
  verse_key: string;
  reason: string;
  action_prompt: string;
}> | null {
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) return null;
  try {
    const arr = JSON.parse(match[0]);
    if (!Array.isArray(arr)) return null;
    return arr.filter(
      (item) =>
        typeof item.verse_key === "string" &&
        VERSE_KEY_RE.test(item.verse_key) &&
        typeof item.reason === "string" &&
        typeof item.action_prompt === "string"
    );
  } catch {
    return null;
  }
}

async function callClaude(
  client: Anthropic,
  query: string
): Promise<Array<{
  verse_key: string;
  reason: string;
  action_prompt: string;
}> | null> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), SEARCH_TIMEOUT_MS);
  try {
    const res = await client.messages.create(
      {
        model: MODEL,
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: query }],
      },
      { signal: ac.signal }
    );
    const textBlock = res.content.find((b) => b.type === "text");
    const raw = textBlock?.type === "text" ? textBlock.text : "";
    return parseVerseResults(raw);
  } catch (err) {
    const name = (err as { name?: string })?.name;
    if (name === "AbortError" || name === "APIConnectionTimeoutError")
      return null;
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Session required" } },
      { status: 401 }
    );
  }

  let query: string;
  try {
    const body = await request.json();
    query = typeof body?.query === "string" ? body.query.trim() : "";
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_BODY", message: "JSON body required" } },
      { status: 400 }
    );
  }

  if (!query || query.length > 200) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_QUERY",
          message: "query must be 1–200 characters",
        },
      },
      { status: 400 }
    );
  }

  // ── Rate limiting ─────────────────────────────────────────────────────────
  const supabase = createAdminSupabaseClient();
  const now = new Date();

  const { data: userRow } = await supabase
    .from("users")
    .select("id, search_count_today, search_quota_reset_at")
    .eq("id", session.userId)
    .single();

  if (userRow) {
    const resetAt = new Date(userRow.search_quota_reset_at);
    const isNewDay = now.getTime() - resetAt.getTime() >= 24 * 60 * 60 * 1000;
    const count = isNewDay ? 0 : (userRow.search_count_today ?? 0);

    if (count >= DAILY_SEARCH_LIMIT) {
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMITED",
            message: "Daily search limit reached — come back tomorrow",
          },
        },
        { status: 429 }
      );
    }

    // Check global daily cap via total searches across all users today
    const { count: globalCount } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte(
        "search_quota_reset_at",
        new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
      )
      .gt("search_count_today", 0);

    // Rough global guard: sum is not perfect but good enough for hackathon
    if ((globalCount ?? 0) > 0) {
      const { data: globalRows } = await supabase
        .from("users")
        .select("search_count_today")
        .gte(
          "search_quota_reset_at",
          new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
        );
      const totalToday = (globalRows ?? []).reduce(
        (s, r) => s + (r.search_count_today ?? 0),
        0
      );
      if (totalToday >= GLOBAL_DAILY_CAP) {
        return NextResponse.json(
          {
            error: {
              code: "GLOBAL_LIMIT",
              message: "Search is temporarily unavailable — try again tomorrow",
            },
          },
          { status: 429 }
        );
      }
    }

    // Increment — reset window if new day
    await supabase
      .from("users")
      .update(
        isNewDay
          ? { search_count_today: 1, search_quota_reset_at: now.toISOString() }
          : { search_count_today: count + 1 }
      )
      .eq("id", session.userId);
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? "" });

  // First attempt
  let claudeResults = await callClaude(client, query).catch((err) => {
    console.error("[explore/search] Claude call failed:", err);
    return null;
  });

  // Retry once on null (malformed JSON or timeout)
  if (!claudeResults) {
    claudeResults = await callClaude(client, query).catch((err) => {
      console.error("[explore/search] Claude retry failed:", err);
      return null;
    });
  }

  if (!claudeResults) {
    return NextResponse.json(
      {
        error: {
          code: "UPSTREAM_UNAVAILABLE",
          message: "Could not generate results — please try again",
        },
      },
      { status: 503 }
    );
  }

  // Fetch QF content for all verses in parallel; drop failures silently
  const settled = await Promise.allSettled(
    claudeResults.map(async (item) => {
      const [verse, translation, audio] = await Promise.all([
        getVerseByKey(item.verse_key),
        getTranslation(item.verse_key, "131"),
        getAudioUrl(item.verse_key),
      ]);
      return {
        verse_key: item.verse_key,
        reason: item.reason,
        action_prompt: item.action_prompt,
        arabic: verse.arabic,
        translation: translation.text,
        audio_url: audio.audio_url,
      };
    })
  );

  const results: Array<{
    verse_key: string;
    reason: string;
    action_prompt: string;
    arabic: string;
    translation: string;
    audio_url: string;
  }> = [];
  for (const r of settled) {
    if (r.status === "fulfilled") results.push(r.value);
  }

  if (results.length === 0) {
    return NextResponse.json(
      {
        error: {
          code: "NO_VALID_VERSES",
          message: "No valid verses found — try rephrasing",
        },
      },
      { status: 422 }
    );
  }

  return NextResponse.json({ results });
}
