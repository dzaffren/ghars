import { describe, it, expect } from "vitest";
import { applySubstringIntegrity } from "@/lib/mission/markers";
import type { MarkerBundle } from "@/lib/llm/types";

// Helper to build a full five-marker bundle from a sparse override so each test
// only spells out the marker under test.
function makeBundle(overrides: Partial<MarkerBundle> = {}): MarkerBundle {
  const absent = {
    present: false as const,
    coaching_prompt: "Next time, try something concrete",
  };
  return {
    specific_moment: absent,
    behavioral_change: absent,
    temporal_anchor: absent,
    honest_friction: absent,
    next_step: absent,
    ...overrides,
  };
}

describe("applySubstringIntegrity", () => {
  it("leaves a present marker whose triggering phrase is a substring unchanged", () => {
    const reflection =
      "At Maghrib my sister snapped at me and I paused before replying.";
    const bundle = makeBundle({
      specific_moment: {
        present: true,
        triggering_phrase: "At Maghrib my sister snapped at me",
      },
    });

    const { markers, markerCount } = applySubstringIntegrity(
      bundle,
      reflection
    );

    expect(markers.specific_moment.present).toBe(true);
    expect(markers.specific_moment.triggering_phrase).toBe(
      "At Maghrib my sister snapped at me"
    );
    expect(markerCount).toBe(1);
  });

  it("flips a present marker whose phrase is not a substring to absent with a coaching prompt", () => {
    const reflection = "I paused before snapping back.";
    const bundle = makeBundle({
      specific_moment: {
        present: true,
        // Not a substring of the reflection — a hallucinated quote.
        triggering_phrase: "yesterday morning at the coffee shop",
      },
    });

    const { markers, markerCount } = applySubstringIntegrity(
      bundle,
      reflection
    );

    expect(markers.specific_moment.present).toBe(false);
    expect(markers.specific_moment.triggering_phrase).toBeUndefined();
    expect(markers.specific_moment.coaching_prompt).toBeTruthy();
    expect(
      markers.specific_moment.coaching_prompt?.startsWith("Next time")
    ).toBe(true);
    expect(markerCount).toBe(0);
  });

  it("treats the substring match as case-insensitive", () => {
    const reflection =
      "at maghrib my sister snapped and I paused before replying.";
    const bundle = makeBundle({
      temporal_anchor: {
        present: true,
        // Different case from the reflection — should still match.
        triggering_phrase: "At Maghrib",
      },
    });

    const { markers, markerCount } = applySubstringIntegrity(
      bundle,
      reflection
    );

    expect(markers.temporal_anchor.present).toBe(true);
    expect(markers.temporal_anchor.triggering_phrase).toBe("At Maghrib");
    expect(markerCount).toBe(1);
  });

  it("recomputes markerCount to reflect the cleaned bundle", () => {
    const reflection = "Tonight I paused before replying to my sister.";
    // Three markers claimed present; only one has a real substring phrase.
    const bundle = makeBundle({
      specific_moment: {
        present: true,
        triggering_phrase: "my sister",
      },
      behavioral_change: {
        present: true,
        // Not in the reflection — will flip.
        triggering_phrase: "went for a run",
      },
      temporal_anchor: {
        present: true,
        // Not in the reflection — will flip.
        triggering_phrase: "at Fajr",
      },
    });

    const { markerCount, markers } = applySubstringIntegrity(
      bundle,
      reflection
    );

    expect(markers.specific_moment.present).toBe(true);
    expect(markers.behavioral_change.present).toBe(false);
    expect(markers.temporal_anchor.present).toBe(false);
    expect(markerCount).toBe(1);
  });

  it("leaves an absent marker untouched", () => {
    const reflection = "Tonight I paused before replying to my sister.";
    const bundle = makeBundle({
      honest_friction: {
        present: false,
        coaching_prompt: "Next time, try naming what made it hard",
      },
    });

    const { markers } = applySubstringIntegrity(bundle, reflection);

    expect(markers.honest_friction.present).toBe(false);
    expect(markers.honest_friction.coaching_prompt).toBe(
      "Next time, try naming what made it hard"
    );
  });
});
