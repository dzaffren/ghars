import { describe, it, expect } from "vitest";
import { computePoints } from "@/lib/llm/scoring";
import { StubLLM } from "@/lib/llm/stub";

describe("computePoints", () => {
  it("0 markers → 2 points (floor)", () => {
    expect(computePoints(0)).toBe(2);
  });

  it("1 marker → 2 points (floor)", () => {
    expect(computePoints(1)).toBe(2);
  });

  it("2 markers → 2 points (floor)", () => {
    expect(computePoints(2)).toBe(2);
  });

  it("3 markers → 3 points", () => {
    expect(computePoints(3)).toBe(3);
  });

  it("4 markers → 4 points", () => {
    expect(computePoints(4)).toBe(4);
  });

  it("5 markers → 5 points (cap)", () => {
    expect(computePoints(5)).toBe(5);
  });
});

describe("StubLLM.judgeReflection", () => {
  it("returns a deterministic 3-of-5 marker payload", async () => {
    const result = await new StubLLM().judgeReflection({
      mission: "Practice patience with a family member today",
      verseTranslation: "And be patient — Allah is with those who are patient",
      reflection: "I did something today that tested my patience",
    });

    expect(result.markerCount).toBe(3);
    expect(result.markers.specific_moment.present).toBe(true);
    expect(result.markers.behavioral_change.present).toBe(true);
    expect(result.markers.temporal_anchor.present).toBe(true);
    expect(result.markers.honest_friction.present).toBe(false);
    expect(result.markers.next_step.present).toBe(false);
  });

  it("every present marker has a non-empty triggering phrase drawn from the reflection", async () => {
    const reflectionText = "I did something today that tested my patience";
    const result = await new StubLLM().judgeReflection({
      mission: "Practice patience with a family member today",
      verseTranslation: "And be patient — Allah is with those who are patient",
      reflection: reflectionText,
    });

    for (const marker of Object.values(result.markers)) {
      if (marker.present) {
        expect(marker.triggering_phrase).toBeTruthy();
        expect(
          reflectionText
            .toLowerCase()
            .includes((marker.triggering_phrase ?? "").toLowerCase())
        ).toBe(true);
      }
    }
  });

  it("every absent marker has a coaching prompt starting with 'Next time' or 'For tomorrow'", async () => {
    const result = await new StubLLM().judgeReflection({
      mission: "Practice patience with a family member today",
      verseTranslation: "And be patient — Allah is with those who are patient",
      reflection: "I did something today that tested my patience",
    });

    for (const marker of Object.values(result.markers)) {
      if (!marker.present) {
        expect(marker.coaching_prompt).toBeTruthy();
        const prompt = marker.coaching_prompt ?? "";
        expect(
          prompt.startsWith("Next time") || prompt.startsWith("For tomorrow")
        ).toBe(true);
      }
    }
  });
});
