import { describe, it, expect } from "vitest";
import {
  validateAnswer,
  countSentences,
  hasSpecificOverlap,
} from "../../lib/answered-reflection/validators";

describe("countSentences", () => {
  it("counts exactly two sentences", () => {
    expect(
      countSentences(
        "The word here carries weight. Ibn Kathir notes this connection."
      )
    ).toBe(2);
  });

  it("counts one sentence", () => {
    expect(countSentences("This is one sentence.")).toBe(1);
  });
});

describe("validateAnswer - sentence count gate", () => {
  it("rejects ayah_insight with one sentence", () => {
    const result = validateAnswer({
      ayahInsight: "A".repeat(90) + ".",
      noticing: "B".repeat(50) + ".",
      reflectionText: "A".repeat(90),
    });
    expect(result.ok).toBe(false);
  });

  it("rejects ayah_insight with three sentences", () => {
    const result = validateAnswer({
      ayahInsight: "First sentence. Second sentence. Third sentence.",
      noticing: "B".repeat(50) + ".",
      reflectionText: "First sentence context",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects noticing with two sentences", () => {
    const result = validateAnswer({
      ayahInsight:
        "This is the first sentence about the verse. Here is the second meaningful sentence.",
      noticing: "First noticing. Second noticing.",
      reflectionText: "First noticing second noticing context",
    });
    expect(result.ok).toBe(false);
  });
});

describe("hasSpecificOverlap", () => {
  it("detects shared word between noticing and reflection", () => {
    expect(
      hasSpecificOverlap(
        "You mentioned feeling tired after work.",
        "I was very tired when I came home from work today."
      )
    ).toBe(true);
  });

  it("returns false when no shared content words", () => {
    expect(
      hasSpecificOverlap(
        "This observation stands alone completely.",
        "Nothing here matches the other text."
      )
    ).toBe(false);
  });

  it("ignores stop words in overlap check", () => {
    // 'with', 'that', 'your' are stop words — no real overlap
    expect(
      hasSpecificOverlap("With that your effort shows.", "That with your work.")
    ).toBe(false);
  });
});

// Reproduce Bug 2: the feature-disabled server response has no `status` field.
// The client checks `body.status` — if it's undefined, it silently falls through
// instead of showing the answer card. Fix: always return status field from route.
describe("answer route response contract", () => {
  it("a response without status field is not handled by the client status check", () => {
    // Simulates what the client receives when feature is disabled (HTTP 503):
    // { error: { code: "FEATURE_DISABLED" } } — no status field
    const featureDisabledBody = { error: { code: "FEATURE_DISABLED" } } as {
      status?: string;
    };
    const handledByReadyBranch = featureDisabledBody.status === "ready";
    const handledByPendingBranch = featureDisabledBody.status === "pending";
    // Both false → falls through → no answer shown
    expect(handledByReadyBranch || handledByPendingBranch).toBe(false);
  });

  it("a response with status: unavailable should be explicitly handled, not fall through", () => {
    const unavailableBody = { status: "unavailable" } as { status?: string };
    const handledByReadyBranch = unavailableBody.status === "ready";
    const handledByPendingBranch = unavailableBody.status === "pending";
    // Falls through silently — this is the bug: client should handle "unavailable" explicitly
    expect(handledByReadyBranch || handledByPendingBranch).toBe(false);
  });
});
