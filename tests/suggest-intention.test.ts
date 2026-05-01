import { describe, it, expect, vi } from "vitest";
import { StubLLM } from "@/lib/llm/stub";
import {
  SUGGEST_INTENTION_SYSTEM,
  buildSuggestIntentionPrompt,
} from "@/lib/llm/prompts";

describe("StubLLM.suggestIntention", () => {
  it("returns a non-empty suggestion string of ≤240 chars", async () => {
    const stub = new StubLLM();
    const result = await stub.suggestIntention({
      missionText: "Practice patience with someone who frustrates you today",
      verseTranslation: "And be patient — Allah is with those who are patient.",
    });
    expect(typeof result.suggestion).toBe("string");
    expect(result.suggestion.length).toBeGreaterThan(0);
    expect(result.suggestion.length).toBeLessThanOrEqual(240);
  });
});

describe("SUGGEST_INTENTION_SYSTEM prompt", () => {
  it("contains the few-shot example name 'Rahim'", () => {
    expect(SUGGEST_INTENTION_SYSTEM).toContain("Rahim");
  });

  it("contains the few-shot example 'night-shift guard'", () => {
    expect(SUGGEST_INTENTION_SYSTEM).toContain("night-shift guard");
  });
});

describe("buildSuggestIntentionPrompt", () => {
  it("includes the mission text verbatim in the returned string", () => {
    const mission = "Offer kindness to someone who wouldn't expect it";
    const verse = "And do good, as Allah has been good to you.";
    const prompt = buildSuggestIntentionPrompt(mission, verse);
    expect(prompt).toContain(mission);
  });
});

describe("AnthropicLLM.suggestIntention", () => {
  it("throws on a >240-char suggestion", async () => {
    // Dynamically import to avoid module-level Anthropic client init side-effects
    const { AnthropicLLM } = await import("@/lib/llm/anthropic");

    const longSuggestion = "A".repeat(241);

    // Mock the Anthropic client messages.create to return a tool_use block
    // with a 241-char suggestion string.
    const mockCreate = vi.fn().mockResolvedValue({
      content: [
        {
          type: "tool_use",
          name: "suggest_intention",
          input: { suggestion: longSuggestion },
        },
      ],
    });

    // Patch the private client on the instance
    const llm = new AnthropicLLM();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (llm as any).client = { messages: { create: mockCreate } };

    await expect(
      llm.suggestIntention({
        missionText: "Test mission",
        verseTranslation: "Test verse",
      })
    ).rejects.toThrow("Suggestion too long");
  });
});
