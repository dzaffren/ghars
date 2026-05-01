import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import MarkerReveal from "@/components/MarkerReveal";
import type { MarkerBundle } from "@/lib/llm/types";

// MarkerReveal is a presentational component shared between TodayClient
// (animated mode, post-submission reveal) and the journal detail page
// (static mode, historical display). These tests exercise the static
// output — motion.div effects aren't asserted here, just the DOM shape
// and the content the user reads.
//
// We use renderToStaticMarkup rather than @testing-library/react so the
// tests stay zero-dep: the repo's only devDeps are already vitest +
// @vitejs/plugin-react (implicit via vitest/Vite tooling).

function allFiveTrue(phrase: string): MarkerBundle {
  return {
    specific_moment: { present: true, triggering_phrase: phrase },
    behavioral_change: { present: true, triggering_phrase: phrase },
    temporal_anchor: { present: true, triggering_phrase: phrase },
    honest_friction: { present: true, triggering_phrase: phrase },
    next_step: { present: true, triggering_phrase: phrase },
  };
}

function allFiveFalse(prompt: string): MarkerBundle {
  return {
    specific_moment: { present: false, coaching_prompt: prompt },
    behavioral_change: { present: false, coaching_prompt: prompt },
    temporal_anchor: { present: false, coaching_prompt: prompt },
    honest_friction: { present: false, coaching_prompt: prompt },
    next_step: { present: false, coaching_prompt: prompt },
  };
}

describe("MarkerReveal — row ordering", () => {
  it("renders five rows in the fixed spec order", () => {
    const markers = allFiveTrue("at Maghrib");
    const html = renderToStaticMarkup(
      <MarkerReveal markers={markers} markerCount={5} animate={false} />
    );

    const orderedKeys = [
      "specific-moment",
      "behavioral-change",
      "temporal-anchor",
      "honest-friction",
      "next-step",
    ];
    const indices = orderedKeys.map((key) =>
      html.indexOf(`data-testid="marker-row-${key}"`)
    );
    // No row missing
    expect(indices.every((i) => i >= 0)).toBe(true);
    // Strictly ascending — order in DOM matches the spec order
    for (let i = 1; i < indices.length; i++) {
      expect(indices[i]).toBeGreaterThan(indices[i - 1]);
    }
  });
});
