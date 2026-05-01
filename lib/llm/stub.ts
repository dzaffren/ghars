import type {
  LLMProvider,
  PickMissionInput,
  PickMissionResult,
  JudgeReflectionInput,
  JudgeReflectionResult,
  SuggestWordsInput,
  SuggestWordsResult,
  SuggestIntentionInput,
  SuggestIntentionResult,
} from "./types";

// Deterministic fallback used when no LLM API key is configured.
// Picks a verse from the pool by hashing today's date so the result
// rotates daily without any external calls.
export class StubLLM implements LLMProvider {
  async pickMission(input: PickMissionInput): Promise<PickMissionResult> {
    const pool = input.actionablePool.filter(
      (v) => !input.recentVerseKeys.includes(v.verse_key)
    );
    const candidates = pool.length > 0 ? pool : input.actionablePool;

    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    const seed = today.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const verse = candidates[seed % candidates.length];

    const focusArea =
      input.focusAreas.length > 0
        ? input.focusAreas[seed % input.focusAreas.length]
        : (verse.themes[0] ?? "general");

    return {
      verseKey: verse.verse_key,
      missionText: `Reflect on this verse today: ${verse.brief_context}`,
      focusArea,
    };
  }

  // Returns a deterministic 3-of-5 marker payload regardless of input, so
  // integration tests can assert against a fixed shape without mocking.
  // The three "present" markers use the word "today" as their triggering
  // phrase — it is near-universal in test reflection fixtures, which keeps
  // the API-handler substring-integrity check from flipping them back to
  // absent during tests. The two "absent" markers carry a canned coaching
  // prompt beginning with "Next time" to match the v2 contract.
  async judgeReflection(
    _input: JudgeReflectionInput
  ): Promise<JudgeReflectionResult> {
    return {
      markers: {
        specific_moment: {
          present: true,
          triggering_phrase: "today",
        },
        behavioral_change: {
          present: true,
          triggering_phrase: "today",
        },
        temporal_anchor: {
          present: true,
          triggering_phrase: "today",
        },
        honest_friction: {
          present: false,
          coaching_prompt: "Next time, try naming what made it hard",
        },
        next_step: {
          present: false,
          coaching_prompt: "Next time, try one small thing for tomorrow",
        },
      },
      markerCount: 3,
    };
  }

  async suggestWords(_input: SuggestWordsInput): Promise<SuggestWordsResult> {
    return {
      suggestions: [
        { position: 1, reason: "A key word in this verse worth learning." },
      ],
    };
  }

  async suggestIntention(
    _input: SuggestIntentionInput
  ): Promise<SuggestIntentionResult> {
    return {
      suggestion: "At lunch, try today's mission with the next person you meet",
    };
  }
}
