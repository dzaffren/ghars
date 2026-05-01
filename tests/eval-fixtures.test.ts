import { describe, it, expect } from "vitest";
import fixtures from "./fixtures/reflections.json";

// ── Types mirror the fixture shape (and the ground-truth side of the harness) ─

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

function markerCount(m: FixtureGroundTruthMarkers): number {
  return MARKER_KEYS.reduce((n, k) => n + (m[k] ? 1 : 0), 0);
}

// The JSON import is typed as `any` without a type assertion.
const SAMPLES = fixtures as FixtureSample[];

// ── Tests ─────────────────────────────────────────────────────────

describe("reflections fixture — shape", () => {
  it("contains exactly 15 samples", () => {
    expect(SAMPLES).toHaveLength(15);
  });
});
