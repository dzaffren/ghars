/*
 * QF content-coverage probe — Task 4
 *
 * Checks how many of the 20 shortlisted ayahs have usable Quran Foundation
 * Reflect content (posts or Q&A answers). Writes a CSV + Markdown report to
 * docs/discovery/expand-ayah-rotation/ and exits 0 if ≥15/20 are usable.
 *
 * Usage:
 *   source .env.local && pnpm dlx tsx scripts/qf-coverage-probe.ts
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { listReflectPostsForAyah, listAyahAnswers } from "@/lib/qf/reflect";

// ── Types ──────────────────────────────────────────────────────────────

interface ShortlistEntry {
  verse_key: string;
}

interface AyahCoverage {
  verse_key: string;
  posts_total: number;
  answers_total: number;
  usable: boolean;
  top_post_excerpt: string | null;
  top_answer_excerpt: string | null;
}

export interface ProbeResult {
  usableCount: number;
  verdict: "proceed" | "pause";
}

// ── Helpers ────────────────────────────────────────────────────────────

/** Strip all HTML tags using a regex (browser-safe alternative to DOMPurify). */
function stripHtml(raw: string): string {
  return raw.replace(/<[^>]+>/g, "");
}

/** Truncate a string to maxLen characters. */
function truncate(s: string, maxLen = 200): string {
  return s.length <= maxLen ? s : s.slice(0, maxLen);
}

/** Escape a CSV field: wrap in quotes if it contains commas, quotes, or newlines. */
function csvField(value: string | number | null | boolean): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// ── Core probe logic ───────────────────────────────────────────────────

/**
 * Run the coverage probe.
 *
 * @param opts.shortlistPath - path to probe-shortlist.json (20 entries)
 * @param opts.outputDir     - directory to write probe-report.csv / .md
 */
export async function runProbe(opts: {
  shortlistPath: string;
  outputDir: string;
}): Promise<ProbeResult> {
  const { shortlistPath, outputDir } = opts;

  // 1. Read and parse shortlist
  const raw = await fs.readFile(shortlistPath, "utf8");
  const shortlist: ShortlistEntry[] = JSON.parse(raw);

  // 2. Validate count
  if (shortlist.length !== 20) {
    throw new Error(
      `probe-shortlist.json must contain exactly 20 entries (got ${shortlist.length}). ` +
        `Expected 20 verse_key entries.`
    );
  }

  // 3. Probe each verse_key in sequential batches of 3
  const BATCH_SIZE = 3;
  const rows: AyahCoverage[] = [];

  for (let i = 0; i < shortlist.length; i += BATCH_SIZE) {
    const batch = shortlist.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async ({ verse_key }) => {
        const [postsResult, answersResult] = await Promise.all([
          listReflectPostsForAyah(verse_key, { limit: 3 }),
          listAyahAnswers(verse_key, { pageSize: 3 }),
        ]);

        const topPostRaw = postsResult.posts[0]?.body ?? null;
        const topPostExcerpt = topPostRaw
          ? truncate(stripHtml(topPostRaw))
          : null;

        const topAnswerRaw =
          answersResult.questions[0]?.answers[0]?.body ?? null;
        const topAnswerExcerpt = topAnswerRaw
          ? truncate(stripHtml(topAnswerRaw))
          : null;

        return {
          verse_key,
          posts_total: postsResult.posts.length,
          answers_total: answersResult.questions.length,
          usable:
            postsResult.posts.length > 0 || answersResult.questions.length > 0,
          top_post_excerpt: topPostExcerpt,
          top_answer_excerpt: topAnswerExcerpt,
        } satisfies AyahCoverage;
      })
    );
    rows.push(...batchResults);
  }

  // 4. Count usable
  const usableCount = rows.filter((r) => r.usable).length;
  const verdict: "proceed" | "pause" = usableCount >= 15 ? "proceed" : "pause";

  // 5. Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  // 6. Write CSV
  const csvHeader =
    "verse_key,posts_total,answers_total,usable,top_post_excerpt,top_answer_excerpt";
  const csvLines = rows.map((r) =>
    [
      csvField(r.verse_key),
      csvField(r.posts_total),
      csvField(r.answers_total),
      csvField(r.usable),
      csvField(r.top_post_excerpt),
      csvField(r.top_answer_excerpt),
    ].join(",")
  );
  const csvContent = [csvHeader, ...csvLines].join("\n") + "\n";
  await fs.writeFile(
    path.join(outputDir, "probe-report.csv"),
    csvContent,
    "utf8"
  );

  // 7. Write Markdown table
  const mdHeader =
    "| verse_key | posts_total | answers_total | usable | top_post_excerpt | top_answer_excerpt |";
  const mdSeparator =
    "|-----------|-------------|---------------|--------|------------------|-------------------|";
  const mdRows = rows.map(
    (r) =>
      `| ${r.verse_key} | ${r.posts_total} | ${r.answers_total} | ${r.usable} | ${r.top_post_excerpt ?? ""} | ${r.top_answer_excerpt ?? ""} |`
  );

  const verdictLine =
    verdict === "proceed"
      ? `**Verdict:** proceed (${usableCount}/20 usable)`
      : `**Verdict:** pause — reopen discovery (${usableCount}/20 usable)`;

  const mdContent = [
    "# QF Coverage Probe Report",
    "",
    mdHeader,
    mdSeparator,
    ...mdRows,
    "",
    verdictLine,
    "",
  ].join("\n");

  await fs.writeFile(
    path.join(outputDir, "probe-report.md"),
    mdContent,
    "utf8"
  );

  return { usableCount, verdict };
}

// ── Main entry point ───────────────────────────────────────────────────

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const shortlistPath = path.resolve(
    process.cwd(),
    "data",
    "probe-shortlist.json"
  );
  const outputDir = path.resolve(
    process.cwd(),
    "docs",
    "discovery",
    "expand-ayah-rotation"
  );

  runProbe({ shortlistPath, outputDir })
    .then(({ usableCount, verdict }) => {
      if (verdict === "proceed") {
        console.log(
          `✅ PROCEED: ${usableCount}/20 ayahs have usable QF content.`
        );
        process.exit(0);
      } else {
        console.log(
          `⚠️  PAUSE: Only ${usableCount}/20 ayahs have usable QF content. Reopen discovery.`
        );
        process.exit(1);
      }
    })
    .catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("invalid_scope") || msg.includes("400")) {
        console.log(
          "BLOCKED: awaiting content-partner access (post.read scope not provisioned)"
        );
      } else {
        console.error("probe failed:", msg);
      }
      process.exit(1);
    });
}
