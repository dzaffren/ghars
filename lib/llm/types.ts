export interface ActionableVerse {
  verse_key: string;
  themes: string[];
  brief_context: string;
}

export interface PickMissionInput {
  focusAreas: string[];
  recentVerseKeys: string[];
  actionablePool: ActionableVerse[];
}

export interface PickMissionResult {
  verseKey: string;
  missionText: string;
  focusArea: string;
}

export interface JudgeReflectionInput {
  mission: string;
  verseTranslation: string;
  reflection: string;
}

// ── Reflection judge v2 contract (five-marker application rubric) ────────────
//
// Every reflection is evaluated against five markers. Each marker is either
// present (with a `triggering_phrase` drawn verbatim from the user's text) or
// absent (with a short, encouraging `coaching_prompt` for next time). The
// rubric replaces the v1 single "depth" score; `verdict`, `depthScore`,
// `feedback`, and `nextStep` are gone — every reflection is accepted.
export interface Marker {
  present: boolean;
  // Verbatim substring of the user's reflection. Required when present=true.
  triggering_phrase?: string;
  // ≤12 words, encouraging, starts with "Next time" or "For tomorrow".
  // Required when present=false.
  coaching_prompt?: string;
}

export interface MarkerBundle {
  specific_moment: Marker;
  behavioral_change: Marker;
  temporal_anchor: Marker;
  honest_friction: Marker;
  next_step: Marker;
}

export interface JudgeReflectionResult {
  markers: MarkerBundle;
  // Count of present=true markers in [0, 5]. Computed in code, not trusted
  // from the model output.
  markerCount: number;
}

export interface SuggestWordsInput {
  verseArabic: string;
  verseTranslation: string;
  knownWords: Array<{ arabic: string; root: string | null }>;
}

export interface SuggestWordItem {
  position: number; // 1-based word position in the verse
  reason: string; // brief explanation of why this word is useful to learn
}

export interface SuggestWordsResult {
  suggestions: SuggestWordItem[]; // 1-2 items
}

export interface SuggestIntentionInput {
  missionText: string; // the day's one-sentence mission
  verseTranslation: string; // translation of the day's verse (for context)
}

export interface SuggestIntentionResult {
  suggestion: string; // ≤240 chars; concrete, names a time/place/person
}

export interface LLMProvider {
  pickMission(input: PickMissionInput): Promise<PickMissionResult>;
  judgeReflection(input: JudgeReflectionInput): Promise<JudgeReflectionResult>;
  suggestWords(input: SuggestWordsInput): Promise<SuggestWordsResult>;
  suggestIntention(
    input: SuggestIntentionInput
  ): Promise<SuggestIntentionResult>;
}
