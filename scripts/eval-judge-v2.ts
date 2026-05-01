/*
 * Experiment A — paired-reflections prompt-evaluation harness.
 *
 * Runs the 15-sample `tests/fixtures/reflections.json` set through both
 *   - judgeReflectionV1 (pre-change, preserved by Task 1 at lib/llm/judge-v1.ts)
 *   - new AnthropicLLM().judgeReflection() (five-marker v2)
 *
 * and prints:
 *   - Spearman ρ between v2 markerCount and ground-truth markerCount
 *   - Marker-attribution accuracy (correct/75, full-match samples/15)
 *   - Applied-but-inelegant delta (mean v2.markerCount - v1.depthScore
 *     across the applied_but_inelegant=true subset)
 *
 * Exit codes:
 *   0 — all three success criteria pass
 *   1 — any criterion fails
 *
 * Usage:
 *   # (1) source env vars yourself — the script does not load .env.local
 *   source .env.local
 *   # (2) run via pnpm dlx (no tsx dependency added to the repo)
 *   pnpm dlx tsx scripts/eval-judge-v2.ts
 *
 * This is a one-shot experiment tool. It prints to stdout; it does not
 * write any result file. Each run issues ~30 real Anthropic calls (15 v1
 * + 15 v2). Do not run on free-tier credentials.
 */

import fs from "node:fs";
import path from "node:path";

import { AnthropicLLM } from "@/lib/llm/anthropic";
import { judgeReflectionV1 } from "@/lib/llm/judge-v1";
import type { MarkerBundle } from "@/lib/llm/types";

// ── Fixture types ──────────────────────────────────────────────────

interface FixtureGroundTruthMarkers {
  specific_moment: boolean;
  behavioral_change: boolean;
  temporal_anchor: boolean;
  honest_friction: boolean;
  next_step: boolean;
}

interface FixtureGroundTruth {
  markers: FixtureGroundTruthMarkers;
  applied_but_inelegant: boolean;
  notes: string;
}

interface FixtureSample {
  id: string;
  mission: string;
  verse_translation: string;
  reflection_text: string;
  ground_truth: FixtureGroundTruth;
}

const MARKER_KEYS: Array<keyof FixtureGroundTruthMarkers> = [
  "specific_moment",
  "behavioral_change",
  "temporal_anchor",
  "honest_friction",
  "next_step",
];

function countTrue(m: FixtureGroundTruthMarkers): number {
  return MARKER_KEYS.reduce((n, k) => n + (m[k] ? 1 : 0), 0);
}

function markerBundlePresence(b: MarkerBundle): FixtureGroundTruthMarkers {
  return {
    specific_moment: b.specific_moment.present,
    behavioral_change: b.behavioral_change.present,
    temporal_anchor: b.temporal_anchor.present,
    honest_friction: b.honest_friction.present,
    next_step: b.next_step.present,
  };
}

// ── Spearman rank correlation (no new dep) ─────────────────────────
//
// Rank an array of numbers, using the standard "average rank on ties"
// (fractional-rank) convention. Then compute Pearson correlation on the
// ranks. Standard equivalence for Spearman.

function rankAverageTies(xs: number[]): number[] {
  const n = xs.length;
  const indexed = xs.map((v, i) => ({ v, i }));
  indexed.sort((a, b) => a.v - b.v);

  const ranks = new Array<number>(n);
  let i = 0;
  while (i < n) {
    let j = i;
    while (j + 1 < n && indexed[j + 1].v === indexed[i].v) j++;
    // Positions i..j are tied; their 1-based ranks are i+1..j+1.
    // Fractional rank = simple average of the endpoints.
    const avg = (i + 1 + (j + 1)) / 2;
    for (let k = i; k <= j; k++) ranks[indexed[k].i] = avg;
    i = j + 1;
  }
  return ranks;
}

function pearson(xs: number[], ys: number[]): number {
  if (xs.length !== ys.length) {
    throw new Error("pearson: arrays must be same length");
  }
  const n = xs.length;
  if (n === 0) return 0;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const den = Math.sqrt(denX * denY);
  if (den === 0) return 0;
  return num / den;
}

export function spearman(xs: number[], ys: number[]): number {
  return pearson(rankAverageTies(xs), rankAverageTies(ys));
}

// ── Harness ────────────────────────────────────────────────────────

interface SampleOutcome {
  id: string;
  appliedButInelegant: boolean;
  groundTruthCount: number;
  v1DepthScore: number | null;
  v2MarkerCount: number | null;
  v2Presence: FixtureGroundTruthMarkers | null;
  error?: string;
}

async function runSample(
  llm: AnthropicLLM,
  sample: FixtureSample
): Promise<SampleOutcome> {
  const base: SampleOutcome = {
    id: sample.id,
    appliedButInelegant: sample.ground_truth.applied_but_inelegant,
    groundTruthCount: countTrue(sample.ground_truth.markers),
    v1DepthScore: null,
    v2MarkerCount: null,
    v2Presence: null,
  };

  const input = {
    mission: sample.mission,
    verseTranslation: sample.verse_translation,
    reflection: sample.reflection_text,
  };

  try {
    const v1 = await judgeReflectionV1(input);
    base.v1DepthScore = v1.depthScore;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[${sample.id}] v1 judge threw: ${msg}`);
    base.error = `v1: ${msg}`;
  }

  try {
    const v2 = await llm.judgeReflection(input);
    base.v2MarkerCount = v2.markerCount;
    base.v2Presence = markerBundlePresence(v2.markers);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[${sample.id}] v2 judge threw: ${msg}`);
    base.error = [base.error, `v2: ${msg}`].filter(Boolean).join("; ");
  }

  return base;
}

function loadFixture(): FixtureSample[] {
  const abs = path.resolve(
    process.cwd(),
    "tests",
    "fixtures",
    "reflections.json"
  );
  const raw = fs.readFileSync(abs, "utf8");
  return JSON.parse(raw) as FixtureSample[];
}

interface Scores {
  spearmanRho: number;
  correctAttributions: number; // out of 5 * n
  totalAttributions: number; // 5 * n
  fullMatchSamples: number;
  fullMatchDenom: number;
  appliedDelta: number;
  appliedSamples: number;
}

function computeScores(
  outcomes: SampleOutcome[],
  truth: Map<string, FixtureGroundTruthMarkers>
): Scores {
  // Correlation: only over samples where v2 produced a markerCount.
  const xs: number[] = [];
  const ys: number[] = [];
  for (const o of outcomes) {
    if (o.v2MarkerCount === null) continue;
    xs.push(o.v2MarkerCount);
    ys.push(o.groundTruthCount);
  }
  const rho = xs.length > 0 ? spearman(xs, ys) : 0;

  // Attribution: a sample that threw counts as 0-attribution for all 5 markers.
  let correct = 0;
  let full = 0;
  for (const o of outcomes) {
    const gt = truth.get(o.id);
    if (!gt) throw new Error(`missing ground truth for ${o.id}`);
    if (!o.v2Presence) {
      // Judge threw → every marker is a mismatch against ground truth.
      continue;
    }
    let perSampleCorrect = 0;
    for (const k of MARKER_KEYS) {
      if (gt[k] === o.v2Presence[k]) {
        correct += 1;
        perSampleCorrect += 1;
      }
    }
    if (perSampleCorrect === 5) full += 1;
  }

  // Applied-but-inelegant delta.
  let sumDelta = 0;
  let nApplied = 0;
  for (const o of outcomes) {
    if (!o.appliedButInelegant) continue;
    if (o.v1DepthScore === null || o.v2MarkerCount === null) continue;
    sumDelta += o.v2MarkerCount - o.v1DepthScore;
    nApplied += 1;
  }
  const meanDelta = nApplied > 0 ? sumDelta / nApplied : 0;

  return {
    spearmanRho: rho,
    correctAttributions: correct,
    totalAttributions: 5 * outcomes.length,
    fullMatchSamples: full,
    fullMatchDenom: outcomes.length,
    appliedDelta: meanDelta,
    appliedSamples: nApplied,
  };
}

const SPEARMAN_THRESHOLD = 0.7;
const FULL_MATCH_THRESHOLD = 12;
const APPLIED_DELTA_THRESHOLD = 1.0;

function formatPct(num: number, den: number): string {
  if (den === 0) return "0%";
  return `${Math.round((num / den) * 100)}%`;
}

function printSummary(scores: Scores): boolean {
  const rhoPass = scores.spearmanRho >= SPEARMAN_THRESHOLD;
  const fullPass = scores.fullMatchSamples >= FULL_MATCH_THRESHOLD;
  const deltaPass = scores.appliedDelta >= APPLIED_DELTA_THRESHOLD;
  const overall = rhoPass && fullPass && deltaPass;

  const tag = (p: boolean, thresh: string) =>
    p ? `[PASS ${thresh}]` : `[FAIL ${thresh}]`;

  console.log("=== Experiment A — judge v2 prompt-evaluation ===");
  console.log(`Samples: ${scores.fullMatchDenom}`);
  console.log(
    `Spearman ρ (v2 markerCount vs ground truth): ${scores.spearmanRho.toFixed(2)}  ${tag(
      rhoPass,
      `≥${SPEARMAN_THRESHOLD.toFixed(2)}`
    )}`
  );
  console.log(
    `Correct marker attributions: ${scores.correctAttributions}/${scores.totalAttributions} (${formatPct(
      scores.correctAttributions,
      scores.totalAttributions
    )})`
  );
  console.log(
    `Samples with full 5/5 attribution match: ${scores.fullMatchSamples}/${scores.fullMatchDenom}  ${tag(
      fullPass,
      `≥${FULL_MATCH_THRESHOLD}`
    )}`
  );
  const deltaSign = scores.appliedDelta >= 0 ? "+" : "";
  console.log(
    `Applied-but-inelegant subset (n=${scores.appliedSamples}): mean Δ(v2 - v1) = ${deltaSign}${scores.appliedDelta.toFixed(
      2
    )}  ${tag(deltaPass, `≥+${APPLIED_DELTA_THRESHOLD.toFixed(2)}`)}`
  );
  console.log(`Overall: ${overall ? "PASS" : "FAIL"}`);

  return overall;
}

async function main(): Promise<void> {
  const samples = loadFixture();

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      "ANTHROPIC_API_KEY is not set. Source your .env.local before running:"
    );
    console.error(
      "  source .env.local && pnpm dlx tsx scripts/eval-judge-v2.ts"
    );
    process.exit(1);
  }

  const llm = new AnthropicLLM();
  const truth = new Map<string, FixtureGroundTruthMarkers>();
  for (const s of samples) truth.set(s.id, s.ground_truth.markers);

  const outcomes: SampleOutcome[] = [];
  for (const s of samples) {
    process.stderr.write(`running ${s.id}... `);
    const o = await runSample(llm, s);
    outcomes.push(o);
    if (o.error) {
      process.stderr.write(`ERR (${o.error})\n`);
    } else {
      process.stderr.write(
        `v1 depth=${o.v1DepthScore} v2 markers=${o.v2MarkerCount}\n`
      );
    }
  }

  const scores = computeScores(outcomes, truth);
  const ok = printSummary(scores);

  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error("harness crashed:", err);
  process.exit(1);
});
