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

  it("every entry has the required top-level fields as strings", () => {
    for (const s of SAMPLES) {
      expect(typeof s.id, `id on ${s.id}`).toBe("string");
      expect(typeof s.mission, `mission on ${s.id}`).toBe("string");
      expect(typeof s.verse_translation, `verse_translation on ${s.id}`).toBe(
        "string"
      );
      expect(typeof s.reflection_text, `reflection_text on ${s.id}`).toBe(
        "string"
      );
      expect(s.id.length, `id length on ${s.id}`).toBeGreaterThan(0);
      expect(s.mission.length, `mission length on ${s.id}`).toBeGreaterThan(0);
      expect(
        s.reflection_text.length,
        `reflection length on ${s.id}`
      ).toBeGreaterThan(0);
    }
  });

  it("every ground_truth.markers has all five keys as booleans", () => {
    for (const s of SAMPLES) {
      const m = s.ground_truth.markers;
      for (const k of MARKER_KEYS) {
        expect(typeof m[k], `${k} should be boolean on ${s.id}`).toBe(
          "boolean"
        );
      }
    }
  });

  it("every ground_truth has applied_but_inelegant boolean and notes string", () => {
    for (const s of SAMPLES) {
      expect(
        typeof s.ground_truth.applied_but_inelegant,
        `applied_but_inelegant on ${s.id}`
      ).toBe("boolean");
      expect(typeof s.ground_truth.notes, `notes on ${s.id}`).toBe("string");
      expect(
        s.ground_truth.notes.length,
        `notes length on ${s.id}`
      ).toBeGreaterThan(0);
    }
  });

  it("all sample ids are unique", () => {
    const ids = SAMPLES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
