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

export interface LLMProvider {
  pickMission(input: PickMissionInput): Promise<PickMissionResult>;
  judgeReflection(input: JudgeReflectionInput): Promise<JudgeReflectionResult>;
}
