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

export interface JudgeReflectionResult {
  verdict: "accepted" | "soft_nudge";
  feedback: string;
  depthScore: number; // 1-5
  nextStep?: string; // one concrete suggestion for tomorrow (only on accepted)
}

export interface SuggestWordsInput {
  verseKey: string;
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

export interface LLMProvider {
  pickMission(input: PickMissionInput): Promise<PickMissionResult>;
  judgeReflection(input: JudgeReflectionInput): Promise<JudgeReflectionResult>;
  suggestWords(input: SuggestWordsInput): Promise<SuggestWordsResult>;
}
