import type {
  LLMProvider,
  PickMissionInput,
  PickMissionResult,
  JudgeReflectionInput,
  JudgeReflectionResult,
  SuggestWordsInput,
  SuggestWordsResult,
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

  async judgeReflection(
    _input: JudgeReflectionInput
  ): Promise<JudgeReflectionResult> {
    return {
      verdict: "accepted",
      feedback:
        "JazakAllah khayran for your reflection. Keep building this habit.",
      depthScore: 3,
    };
  }

  async suggestWords(_input: SuggestWordsInput): Promise<SuggestWordsResult> {
    return {
      suggestions: [
        { position: 1, reason: "A key word in this verse worth learning." },
      ],
    };
  }
}
