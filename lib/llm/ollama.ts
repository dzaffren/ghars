import { Ollama } from "ollama";
import type {
  LLMProvider,
  PickMissionInput,
  PickMissionResult,
  JudgeReflectionInput,
  JudgeReflectionResult,
  SuggestWordsInput,
  SuggestWordsResult,
} from "./types";
import {
  PICK_MISSION_SYSTEM,
  buildPickMissionPrompt,
  JUDGE_REFLECTION_SYSTEM,
  buildJudgeReflectionPrompt,
  SUGGEST_WORDS_SYSTEM,
  buildSuggestWordsPrompt,
} from "./prompts";

const ollama = new Ollama({
  host: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
});
const MODEL = process.env.OLLAMA_MODEL ?? "llama3.1:8b";

function extractJSON(text: string): unknown {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in LLM response");
  return JSON.parse(match[0]);
}

export class OllamaLLM implements LLMProvider {
  async pickMission(input: PickMissionInput): Promise<PickMissionResult> {
    const prompt = `${PICK_MISSION_SYSTEM}

${buildPickMissionPrompt(input.focusAreas, input.recentVerseKeys, input.actionablePool)}

Respond with ONLY valid JSON in this exact format:
{"verse_key": "X:Y", "mission_text": "...", "focus_area": "..."}`;

    const response = await ollama.generate({
      model: MODEL,
      prompt,
      stream: false,
    });
    const parsed = extractJSON(response.response) as {
      verse_key: string;
      mission_text: string;
      focus_area: string;
    };
    return {
      verseKey: parsed.verse_key,
      missionText: parsed.mission_text,
      focusArea: parsed.focus_area,
    };
  }

  async judgeReflection(
    input: JudgeReflectionInput
  ): Promise<JudgeReflectionResult> {
    const prompt = `${JUDGE_REFLECTION_SYSTEM}

${buildJudgeReflectionPrompt(input.mission, input.verseTranslation, input.reflection)}

Respond with ONLY valid JSON in this exact format:
{"verdict": "accepted" or "soft_nudge", "feedback": "...", "depth_score": 1-5}`;

    const response = await ollama.generate({
      model: MODEL,
      prompt,
      stream: false,
    });
    const parsed = extractJSON(response.response) as {
      verdict: "accepted" | "soft_nudge";
      feedback: string;
      depth_score: number;
    };
    return {
      verdict: parsed.verdict,
      feedback: parsed.feedback,
      depthScore: Math.min(5, Math.max(1, Math.round(parsed.depth_score))),
    };
  }

  async suggestWords(input: SuggestWordsInput): Promise<SuggestWordsResult> {
    const prompt = `${SUGGEST_WORDS_SYSTEM}

${buildSuggestWordsPrompt(input.verseArabic, input.verseTranslation, input.knownWords)}

Respond with ONLY valid JSON in this exact format:
{"suggestions": [{"position": 1, "reason": "..."}, {"position": 3, "reason": "..."}]}
Return 1-2 items only.`;

    const response = await ollama.generate({
      model: MODEL,
      prompt,
      stream: false,
    });
    const parsed = extractJSON(response.response) as {
      suggestions: Array<{ position: number; reason: string }>;
    };
    return {
      suggestions: (parsed.suggestions ?? []).slice(0, 2),
    };
  }
}
