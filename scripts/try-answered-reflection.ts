/**
 * Prompt-gate experiment runner for the "answered reflection" feature.
 *
 * See docs/discovery/answered-reflection/brief.md (the experiment section)
 * and docs/specs/TBD-answered-reflection/spec.md (Success Metrics — the
 * prompt-experiment gate).
 *
 * Pulls up to 5 real reflections from Supabase, builds the prompt, calls
 * Claude, and prints the outputs in a scorable format. Score each on:
 *   - Ayah insight: did it teach you something?
 *   - Noticing:      did it feel seen, or flattered / paraphrased / generic?
 *
 * DECISION RULE (per discovery brief):
 *   3+/5 noticings feel seen → ship behind a feature flag.
 *   0–1/5                    → the prompt is wrong; iterate, do not ship.
 *   2/5                      → ambiguous; run 5 more with a revised prompt.
 *
 * Prereqs (in .env.local):
 *   ANTHROPIC_API_KEY=sk-ant-...
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...
 *
 * Optional:
 *   ANSWERED_REFLECTION_MODEL=claude-haiku-4-5-20251001   (default)
 *   ANSWERED_REFLECTION_LIMIT=5                           (default 5)
 *   ANSWERED_REFLECTION_USER_ID=<uuid>                    (scope to one user)
 *
 * Run: npm run answered-reflection:experiment
 */

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { buildPrompt, PROMPT_VERSION } from "../lib/answered-reflection/prompt";

const MODEL =
  process.env.ANSWERED_REFLECTION_MODEL ?? "claude-haiku-4-5-20251001";
const LIMIT = Number(process.env.ANSWERED_REFLECTION_LIMIT ?? "5");
const USER_ID = process.env.ANSWERED_REFLECTION_USER_ID;
const PRINT_ONLY = process.argv.includes("--print-only");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const QF_CONTENT_BASE =
  process.env.QF_CONTENT_BASE ?? "https://api.quran.com/api/v4";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env."
  );
  process.exit(1);
}
if (!PRINT_ONLY && !ANTHROPIC_KEY) {
  console.error(
    "Missing ANTHROPIC_API_KEY in env (or pass --print-only to skip the API call)."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const anthropic = PRINT_ONLY ? null : new Anthropic({ apiKey: ANTHROPIC_KEY });

interface ReflectionRow {
  id: string;
  did_apply: "yes_fully" | "partly" | "not_today";
  text: string;
  submitted_at: string;
  mission_id: string;
  missions?: {
    daily_assignments?: {
      verse_key: string;
      user_id: string;
    } | null;
  } | null;
}

async function loadReflections(): Promise<ReflectionRow[]> {
  let q = supabase
    .from("reflections")
    .select(
      "id, did_apply, text, submitted_at, mission_id, missions!inner(daily_assignments!inner(verse_key, user_id))"
    )
    .order("submitted_at", { ascending: false })
    .limit(LIMIT);

  if (USER_ID) {
    q = q.eq("missions.daily_assignments.user_id", USER_ID);
  }

  const { data, error } = await q;
  if (error) {
    console.error("Supabase query failed:", error);
    process.exit(1);
  }
  return (data ?? []) as unknown as ReflectionRow[];
}

async function fetchAyahContext(verseKey: string): Promise<{
  ayahArabic: string;
  ayahTranslation: string;
  tafsirSnippet: string;
}> {
  // Arabic + translation (Saheeh International = id 20)
  const verseRes = await fetch(
    `${QF_CONTENT_BASE}/verses/by_key/${verseKey}?translations=20&fields=text_uthmani`
  );
  const verseJson = (await verseRes.json()) as {
    verse?: {
      text_uthmani?: string;
      translations?: { text?: string }[];
    };
  };
  const ayahArabic = verseJson.verse?.text_uthmani ?? "";
  const ayahTranslation = stripHtml(
    verseJson.verse?.translations?.[0]?.text ?? ""
  );

  // Tafsir Ibn Kathir = id 169
  let tafsirSnippet = "";
  try {
    const tRes = await fetch(
      `${QF_CONTENT_BASE}/tafsirs/169/by_ayah/${verseKey}`
    );
    const tJson = (await tRes.json()) as {
      tafsir?: { text?: string };
    };
    const full = stripHtml(tJson.tafsir?.text ?? "");
    tafsirSnippet = full.slice(0, 600);
  } catch {
    /* snippet is best-effort */
  }

  return { ayahArabic, ayahTranslation, tafsirSnippet };
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function generateAnswer(input: {
  ayahArabic: string;
  ayahTranslation: string;
  verseKey: string;
  tafsirSnippet: string;
  reflectionText: string;
  didApply: "yes_fully" | "partly" | "not_today";
}): Promise<{
  ayahInsight: string;
  noticing: string;
  raw: string;
}> {
  const { system, user } = buildPrompt(input);
  if (!anthropic) {
    throw new Error("generateAnswer called in --print-only mode");
  }
  const res = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 400,
    system,
    messages: [{ role: "user", content: user }],
  });
  const textBlock = res.content.find((b) => b.type === "text");
  const raw = textBlock?.type === "text" ? textBlock.text : "";
  const parsed = parseJsonLoose(raw);
  return {
    ayahInsight: parsed.ayah_insight ?? "",
    noticing: parsed.noticing ?? "",
    raw,
  };
}

function parseJsonLoose(s: string): {
  ayah_insight?: string;
  noticing?: string;
} {
  // Model may wrap JSON in ```json``` fences or prose; extract the first {...}.
  const match = s.match(/\{[\s\S]*\}/);
  if (!match) return {};
  try {
    return JSON.parse(match[0]);
  } catch {
    return {};
  }
}

function checkSpecificity(
  noticing: string,
  reflection: string
): { overlap: boolean; matched: string | null } {
  const stop = new Set([
    "the",
    "and",
    "that",
    "with",
    "your",
    "this",
    "have",
    "was",
    "were",
    "for",
    "but",
    "not",
    "you",
    "about",
    "what",
    "which",
    "when",
    "where",
    "there",
    "their",
    "then",
    "from",
    "into",
    "they",
    "them",
    "been",
    "being",
    "just",
    "today",
    "just",
    "also",
    "more",
    "only",
    "even",
    "some",
    "like",
  ]);
  const norm = (x: string) =>
    x
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !stop.has(w));
  const rWords = new Set(norm(reflection));
  for (const w of norm(noticing)) {
    if (rWords.has(w)) return { overlap: true, matched: w };
  }
  return { overlap: false, matched: null };
}

const BLOCKLIST = [
  "beautiful reflection",
  "meaningful reflection",
  "wonderful that you",
  "what a",
  "your reflection is",
];

function checkBlocklist(noticing: string): string | null {
  const low = noticing.toLowerCase();
  for (const phrase of BLOCKLIST) {
    if (low.includes(phrase)) return phrase;
  }
  return null;
}

function countSentences(s: string): number {
  // Crude but honest — counts sentence-ending punctuation.
  return (s.match(/[.!?](\s|$)/g) ?? []).length;
}

async function main() {
  console.log(`\n──────────────────────────────────────────────────────`);
  console.log(
    `Answered-Reflection Prompt Experiment (prompt ${PROMPT_VERSION})`
  );
  console.log(`Model: ${MODEL}`);
  console.log(`Limit: ${LIMIT}`);
  if (USER_ID) console.log(`Scoped to user: ${USER_ID}`);
  console.log(`──────────────────────────────────────────────────────\n`);

  const reflections = await loadReflections();
  if (reflections.length === 0) {
    console.error(
      "No reflections found in the database. Submit at least one reflection via /today first, or use ANSWERED_REFLECTION_USER_ID to scope to a different user."
    );
    process.exit(1);
  }
  console.log(`Loaded ${reflections.length} reflection(s) from Supabase.\n\n`);

  let idx = 0;
  for (const r of reflections) {
    idx += 1;
    const verseKey = r.missions?.daily_assignments?.verse_key;
    if (!verseKey) {
      console.log(`[${idx}/${reflections.length}] SKIPPED — no verse key`);
      continue;
    }

    const ctx = await fetchAyahContext(verseKey);

    if (PRINT_ONLY) {
      const { system, user } = buildPrompt({
        ayahArabic: ctx.ayahArabic,
        ayahTranslation: ctx.ayahTranslation,
        verseKey,
        tafsirSnippet: ctx.tafsirSnippet,
        reflectionText: r.text,
        didApply: r.did_apply,
      });
      console.log(`\n════════════════════════════════════════════════════════`);
      console.log(
        `[${idx}/${reflections.length}] reflection_id=${r.id.slice(0, 8)}…`
      );
      console.log(
        `verse_key=${verseKey}   did_apply=${r.did_apply}   submitted_at=${r.submitted_at}`
      );
      console.log(`════════════════════════════════════════════════════════`);
      console.log(`\n── Reflection (verbatim) ──`);
      console.log(r.text);
      console.log(`\n─────────── SYSTEM PROMPT (paste once) ───────────`);
      console.log(system);
      console.log(
        `\n─────────── USER PROMPT (paste fresh per reflection) ───────────`
      );
      console.log(user);
      console.log(
        `\n── Paste the model's JSON response into scoring/run-${new Date().toISOString().slice(0, 10)}.md under reflection ${idx}.`
      );
      console.log(`────────────────────────────────────────────────────────\n`);
      continue;
    }

    const out = await generateAnswer({
      ayahArabic: ctx.ayahArabic,
      ayahTranslation: ctx.ayahTranslation,
      verseKey,
      tafsirSnippet: ctx.tafsirSnippet,
      reflectionText: r.text,
      didApply: r.did_apply,
    });

    const spec = checkSpecificity(out.noticing, r.text);
    const blocked = checkBlocklist(out.noticing);
    const insightSentences = countSentences(out.ayahInsight);
    const noticingSentences = countSentences(out.noticing);
    const insightLen = out.ayahInsight.length;
    const noticingLen = out.noticing.length;

    const insightLenOk = insightLen >= 80 && insightLen <= 360;
    const insightSentOk = insightSentences === 2;
    const noticingLenOk = noticingLen >= 30 && noticingLen <= 180;
    const noticingSentOk = noticingSentences === 1;
    const noticingInsuff = out.noticing.trim().toUpperCase() === "INSUFFICIENT";

    const autoPass =
      insightLenOk &&
      insightSentOk &&
      noticingLenOk &&
      noticingSentOk &&
      spec.overlap &&
      !blocked &&
      !noticingInsuff;

    console.log(`\n════════════════════════════════════════════════════════`);
    console.log(
      `[${idx}/${reflections.length}] reflection_id=${r.id.slice(0, 8)}…`
    );
    console.log(
      `verse_key=${verseKey}   did_apply=${r.did_apply}   submitted_at=${r.submitted_at}`
    );
    console.log(`════════════════════════════════════════════════════════`);
    console.log(`\n── Reflection (verbatim) ──`);
    console.log(r.text);
    console.log(
      `\n── Ayah insight (${insightLen} chars, ${insightSentences} sentences) ──`
    );
    console.log(out.ayahInsight || "(empty)");
    console.log(
      `\n── Noticing (${noticingLen} chars, ${noticingSentences} sentences) ──`
    );
    console.log(out.noticing || "(empty)");
    console.log(`\n── Automatic guards ──`);
    console.log(
      `  ayah_insight length 80–360:  ${insightLenOk ? "PASS" : "FAIL"} (${insightLen})`
    );
    console.log(
      `  ayah_insight 2 sentences:    ${insightSentOk ? "PASS" : "FAIL"} (${insightSentences})`
    );
    console.log(
      `  noticing length 30–180:      ${noticingLenOk ? "PASS" : "FAIL"} (${noticingLen})`
    );
    console.log(
      `  noticing 1 sentence:         ${noticingSentOk ? "PASS" : "FAIL"} (${noticingSentences})`
    );
    console.log(
      `  specificity (word overlap):  ${spec.overlap ? `PASS (matched "${spec.matched}")` : "FAIL"}`
    );
    console.log(
      `  blocklist clean:             ${blocked ? `FAIL (hit "${blocked}")` : "PASS"}`
    );
    console.log(
      `  not INSUFFICIENT:            ${noticingInsuff ? "FAIL (model gave up)" : "PASS"}`
    );
    console.log(`\n  → AUTO-GUARD RESULT: ${autoPass ? "PASS" : "FAIL"}`);
    console.log(`\n── Your score (do this yourself) ──`);
    console.log(`  Ayah insight  — did it teach you something new?    [Y / N]`);
    console.log(`  Noticing      — did it feel SEEN (not flattered,`);
    console.log(
      `                   paraphrased, or generic)?           [Y / N]`
    );
    console.log(`\n────────────────────────────────────────────────────────\n`);
  }

  console.log(`\n══════════════════════ DONE ══════════════════════`);
  if (PRINT_ONLY) {
    console.log(
      `Print-only mode: paste each USER PROMPT into Claude (claude.ai or`
    );
    console.log(
      `any Claude client) with the SYSTEM PROMPT set once as the system`
    );
    console.log(
      `message. Copy the JSON response for each reflection and score the`
    );
    console.log(`noticing Y/N on "felt seen":`);
  } else {
    console.log(`Score each noticing Y/N above on "felt seen".`);
  }
  console.log(`  3+ of ${reflections.length} → ship behind a feature flag.`);
  console.log(
    `  2 of ${reflections.length}   → ambiguous; revise prompt, run again.`
  );
  console.log(`  0–1   → prompt is wrong; rewrite before shipping any code.`);
  console.log(`══════════════════════════════════════════════════\n`);
}

main().catch((err) => {
  console.error("Experiment failed:", err);
  process.exit(1);
});
