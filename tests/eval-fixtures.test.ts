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

describe("reflections fixture — coverage bands", () => {
  it("has at least 2 samples with all five markers present", () => {
    const fives = SAMPLES.filter(
      (s) => markerCount(s.ground_truth.markers) === 5
    );
    expect(fives.length).toBeGreaterThanOrEqual(2);
  });

  it("has at least 2 samples in the 3-to-4 marker band", () => {
    const mid = SAMPLES.filter((s) => {
      const c = markerCount(s.ground_truth.markers);
      return c === 3 || c === 4;
    });
    expect(mid.length).toBeGreaterThanOrEqual(2);
  });

  it("has at least 2 samples with 0-or-1 markers AND applied_but_inelegant=false", () => {
    const shallow = SAMPLES.filter((s) => {
      const c = markerCount(s.ground_truth.markers);
      return (
        (c === 0 || c === 1) && s.ground_truth.applied_but_inelegant === false
      );
    });
    expect(shallow.length).toBeGreaterThanOrEqual(2);
  });

  it("has at least 3 applied_but_inelegant=true samples", () => {
    const applied = SAMPLES.filter(
      (s) => s.ground_truth.applied_but_inelegant === true
    );
    expect(applied.length).toBeGreaterThanOrEqual(3);
  });

  it("has at least one sample that is a verbatim verse echo (reflection_text === verse_translation after normalisation)", () => {
    const norm = (t: string) => t.trim().replace(/\.$/, "").toLowerCase();
    const echoes = SAMPLES.filter(
      (s) => norm(s.reflection_text) === norm(s.verse_translation)
    );
    expect(echoes.length).toBeGreaterThanOrEqual(1);
    // verse-echo must earn zero markers in ground truth
    for (const e of echoes) {
      expect(markerCount(e.ground_truth.markers), `echo ${e.id}`).toBe(0);
    }
  });

  it("has at least one sample that paraphrases/praises the verse with zero markers", () => {
    // We can't perfectly detect paraphrase automatically, but we can assert
    // that at least one zero-marker sample is NOT a verbatim verse echo —
    // i.e. it's a written-out paraphrase/praise.
    const norm = (t: string) => t.trim().replace(/\.$/, "").toLowerCase();
    const zeros = SAMPLES.filter(
      (s) => markerCount(s.ground_truth.markers) === 0
    );
    const paraphrases = zeros.filter(
      (s) => norm(s.reflection_text) !== norm(s.verse_translation)
    );
    expect(paraphrases.length).toBeGreaterThanOrEqual(1);
  });

  it("has at least one one-sentence fully-applied sample with exactly 3 markers", () => {
    // "One sentence" = reflection_text contains no sentence-ending punctuation
    // other than a single terminal period, and has ≤ 1 sentence-separator.
    const isOneSentence = (t: string) => {
      const terminators = (t.match(/[.!?]/g) ?? []).length;
      return terminators <= 1;
    };
    const candidates = SAMPLES.filter(
      (s) =>
        isOneSentence(s.reflection_text) &&
        markerCount(s.ground_truth.markers) === 3 &&
        s.ground_truth.markers.specific_moment &&
        s.ground_truth.markers.behavioral_change &&
        s.ground_truth.markers.temporal_anchor
    );
    expect(candidates.length).toBeGreaterThanOrEqual(1);
  });

  it("has at least one 'tried but failed' sample with honest_friction=true and next_step=false", () => {
    const triedFailed = SAMPLES.filter(
      (s) =>
        s.ground_truth.markers.honest_friction === true &&
        s.ground_truth.markers.next_step === false
    );
    expect(triedFailed.length).toBeGreaterThanOrEqual(1);
  });

  it("has at least one emotional-only sample with 0-or-1 markers", () => {
    // Emotional-only samples have 0 or 1 markers, applied_but_inelegant=false,
    // and a behavioral_change=false (because they only report feeling).
    const emotional = SAMPLES.filter((s) => {
      const c = markerCount(s.ground_truth.markers);
      return (
        (c === 0 || c === 1) &&
        s.ground_truth.applied_but_inelegant === false &&
        s.ground_truth.markers.behavioral_change === false
      );
    });
    expect(emotional.length).toBeGreaterThanOrEqual(1);
  });

  it("has at least one next-step-only sample (next_step=true, 4 others false)", () => {
    const nextStepOnly = SAMPLES.filter((s) => {
      const m = s.ground_truth.markers;
      return (
        m.next_step === true &&
        m.specific_moment === false &&
        m.behavioral_change === false &&
        m.temporal_anchor === false &&
        m.honest_friction === false
      );
    });
    expect(nextStepOnly.length).toBeGreaterThanOrEqual(1);
  });
});
