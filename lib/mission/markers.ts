import type { Marker, MarkerBundle } from "@/lib/llm/types";

// ── Substring-integrity check for the five application markers ────────────
//
// The v2 judge returns a `triggering_phrase` for every `present=true` marker,
// claimed to be a verbatim phrase from the user's reflection. We never trust
// the model on that claim: the phrase might have been lightly paraphrased or
// outright hallucinated. This helper walks each marker, verifies the phrase
// is a case-insensitive substring of the reflection text, and flips any
// marker whose phrase fails the check to `present=false` with a generic
// coaching prompt — keeping the marker count honest and the journal UI safe
// from putting fabricated quotes on camera.
//
// Shared by `scripts/backfill-markers.ts` (re-scoring the history) and by
// Task 3's submission orchestrator (`lib/mission/judge.ts`) so both paths
// sanitise identically.

// Generic coaching prompts used when the judge claims a marker is present but
// the triggering phrase fails the substring check. One per marker so the user
// sees something actionable rather than a generic nudge.
const GENERIC_COACHING_PROMPTS: Record<keyof MarkerBundle, string> = {
  specific_moment: "Next time, try naming a specific moment",
  behavioral_change: "Next time, try describing something you did",
  temporal_anchor: "Next time, try grounding your reflection in today",
  honest_friction: "Next time, try naming what made it hard",
  next_step: "Next time, try one small thing for tomorrow",
};

function isVerbatimSubstring(phrase: string, reflection: string): boolean {
  return reflection.toLowerCase().includes(phrase.toLowerCase());
}

function cleanMarker(
  marker: Marker,
  reflection: string,
  key: keyof MarkerBundle
): Marker {
  if (!marker.present) return marker;
  const phrase = marker.triggering_phrase ?? "";
  if (phrase.length > 0 && isVerbatimSubstring(phrase, reflection)) {
    return marker;
  }
  return {
    present: false,
    coaching_prompt: GENERIC_COACHING_PROMPTS[key],
  };
}

export function applySubstringIntegrity(
  markers: MarkerBundle,
  reflectionText: string
): { markers: MarkerBundle; markerCount: number; flippedMarkers: string[] } {
  const flippedMarkers: string[] = [];
  const keys: Array<keyof MarkerBundle> = [
    "specific_moment",
    "behavioral_change",
    "temporal_anchor",
    "honest_friction",
    "next_step",
  ];

  const cleaned = {} as MarkerBundle;
  for (const key of keys) {
    const original = markers[key];
    const next = cleanMarker(original, reflectionText, key);
    cleaned[key] = next;
    if (original.present && !next.present) {
      flippedMarkers.push(key);
    }
  }

  const markerCount = Object.values(cleaned).filter((m) => m.present).length;
  return { markers: cleaned, markerCount, flippedMarkers };
}
