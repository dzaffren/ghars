import { Ollama } from "ollama";
import type {
  LLMProvider,
  Marker,
  MarkerBundle,
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
    // Ollama tool-use is less reliable than Anthropic's; the API handler's
    // substring integrity check (Task 3) catches any hallucinated
    // triggering_phrase values, so we accept degraded quality here.
    const prompt = `${JUDGE_REFLECTION_SYSTEM}

${buildJudgeReflectionPrompt(input.mission, input.verseTranslation, input.reflection)}

Respond with ONLY valid JSON in this exact format:
{
  "markers": {
    "specific_moment": {"present": true|false, "triggering_phrase": "verbatim substring of reflection", "coaching_prompt": "Next time, ..."},
    "behavioral_change": {"present": true|false, "triggering_phrase": "...", "coaching_prompt": "..."},
    "temporal_anchor": {"present": true|false, "triggering_phrase": "...", "coaching_prompt": "..."},
    "honest_friction": {"present": true|false, "triggering_phrase": "...", "coaching_prompt": "..."},
    "next_step": {"present": true|false, "triggering_phrase": "...", "coaching_prompt": "..."}
  }
}
Include "triggering_phrase" only when present=true; include "coaching_prompt" only when present=false.`;

    const response = await ollama.generate({
      model: MODEL,
      prompt,
      stream: false,
    });
    const parsed = extractJSON(response.response) as {
      markers: {
        specific_moment: Marker;
        behavioral_change: Marker;
        temporal_anchor: Marker;
        honest_friction: Marker;
        next_step: Marker;
      };
    };
    const markers: MarkerBundle = {
      specific_moment: parsed.markers.specific_moment,
      behavioral_change: parsed.markers.behavioral_change,
      temporal_anchor: parsed.markers.temporal_anchor,
      honest_friction: parsed.markers.honest_friction,
      next_step: parsed.markers.next_step,
    };
    const markerCount = Object.values(markers).filter((m) => m.present).length;
    return { markers, markerCount };
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
