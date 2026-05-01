/*
 * Story 1 Task 2 — historical-reflections backfill.
 *
 * Re-scores every reflection with `marker_count IS NULL` against the new
 * five-marker rubric. Apply migration 0010_application_rubric.sql first, then
 * run:
 *
 *   source .env.local && pnpm dlx tsx scripts/backfill-markers.ts
 *
 * Design notes:
 *   - Env loading is explicit (the user sources .env.local); the script does
 *     not pull in dotenv.
 *   - Uses the same service-role Supabase client as the app (lib/supabase/
 *     server.ts) — there is no per-user scoping on backfill, so service-role
 *     is the right tier.
 *   - Per-row error isolation: one failing judge call leaves that reflection
 *     at status='pending' and the loop moves on. The journal page's lazy
 *     rescore path (Task 5) will pick pending rows up later.
 *   - Idempotent: only selects rows with marker_count IS NULL, so a second
 *     run after a successful one processes zero rows.
 *   - Substring integrity: shares lib/mission/markers.ts#applySubstringIntegrity
 *     with Task 3's submission orchestrator so both paths sanitise hallucinated
 *     triggering_phrases identically.
 */

import { AnthropicLLM } from "@/lib/llm/anthropic";
import { applySubstringIntegrity } from "@/lib/mission/markers";
import { createServerClient } from "@/lib/supabase/server";

interface PendingRow {
  id: string;
  text: string;
  daily_missions: {
    mission_text: string;
    verse_translation: string;
  } | null;
}

interface BackfillSummary {
  total: number;
  scored: number;
  failed: number;
  pending: number;
}

async function fetchPendingRows(
  db: ReturnType<typeof createServerClient>
): Promise<PendingRow[]> {
  // Supabase typescript client returns the joined mission as either a single
  // object or an array depending on relationship shape. `mission_id` is
  // UNIQUE and non-null on reflections, so the join is 1:1 — we cast.
  const { data, error } = await db
    .from("reflections")
    .select("id, text, daily_missions!inner(mission_text, verse_translation)")
    .is("marker_count", null);

  if (error) {
    throw new Error(`failed to select pending reflections: ${error.message}`);
  }

  const rows = (data ?? []) as unknown as Array<{
    id: string;
    text: string;
    daily_missions:
      | { mission_text: string; verse_translation: string }
      | Array<{ mission_text: string; verse_translation: string }>
      | null;
  }>;

  return rows.map((row) => ({
    id: row.id,
    text: row.text,
    daily_missions: Array.isArray(row.daily_missions)
      ? (row.daily_missions[0] ?? null)
      : row.daily_missions,
  }));
}

async function scoreOne(
  llm: AnthropicLLM,
  row: PendingRow
): Promise<{ markerCount: number; markersJson: unknown }> {
  if (!row.daily_missions) {
    throw new Error(`reflection ${row.id} has no mission context`);
  }
  const raw = await llm.judgeReflection({
    mission: row.daily_missions.mission_text,
    verseTranslation: row.daily_missions.verse_translation,
    reflection: row.text,
  });
  // Guard against hallucinated phrases — identical path to the submission
  // orchestrator so the journal reads consistently.
  const cleaned = applySubstringIntegrity(raw.markers, row.text);
  return {
    markerCount: cleaned.markerCount,
    markersJson: cleaned.markers,
  };
}

async function main(): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      "ANTHROPIC_API_KEY is not set. Source your .env.local before running:"
    );
    console.error(
      "  source .env.local && pnpm dlx tsx scripts/backfill-markers.ts"
    );
    process.exit(1);
  }
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error(
      "Supabase credentials missing. Source your .env.local before running."
    );
    process.exit(1);
  }

  const db = createServerClient();
  const llm = new AnthropicLLM();

  const rows = await fetchPendingRows(db);
  const summary: BackfillSummary = {
    total: rows.length,
    scored: 0,
    failed: 0,
    pending: 0,
  };

  if (rows.length === 0) {
    console.log(
      "No reflections to backfill — marker_count is populated on every row."
    );
    return;
  }

  console.log(`Found ${rows.length} reflection(s) with marker_count IS NULL.`);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const idx = `[${i + 1}/${rows.length}]`;
    try {
      const { markerCount, markersJson } = await scoreOne(llm, row);
      const { error: updateError } = await db
        .from("reflections")
        .update({
          marker_count: markerCount,
          markers_json: markersJson,
          status: "scored",
        })
        .eq("id", row.id);
      if (updateError) {
        throw new Error(`db update failed: ${updateError.message}`);
      }
      summary.scored += 1;
      console.log(`${idx} reflection ${row.id} scored: ${markerCount}/5`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      summary.failed += 1;
      summary.pending += 1;
      console.error(
        `${idx} reflection ${row.id} failed — left at status=pending: ${msg}`
      );
    }
  }

  console.log(
    `Backfilled ${summary.scored} reflections, ${summary.failed} failed, ${summary.pending} left pending for lazy rescore.`
  );
}

main().catch((err) => {
  console.error("backfill crashed:", err);
  process.exit(1);
});
