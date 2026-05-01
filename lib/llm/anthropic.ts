import Anthropic from "@anthropic-ai/sdk";
import type {
  LLMProvider,
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

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PICK_TOOL: Anthropic.Tool = {
  name: "pick_mission",
  description: "Return the selected verse key and mission text",
  input_schema: {
    type: "object" as const,
    properties: {
      verse_key: { type: "string", description: "e.g. '2:83'" },
      mission_text: {
        type: "string",
        description: "One-sentence actionable mission",
      },
      focus_area: {
        type: "string",
        description: "Which focus area this targets",
      },
    },
    required: ["verse_key", "mission_text", "focus_area"],
  },
};

const SUGGEST_TOOL: Anthropic.Tool = {
  name: "suggest_words",
  description:
    "Return 1-2 Arabic word positions from the verse that the learner should add to their deck",
  input_schema: {
    type: "object" as const,
    properties: {
      suggestions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            position: {
              type: "number",
              description: "1-based word position in the verse",
            },
            reason: {
              type: "string",
              description:
                "Brief reason this word is worth learning (1 sentence)",
            },
          },
          required: ["position", "reason"],
        },
        minItems: 1,
        maxItems: 2,
      },
    },
    required: ["suggestions"],
  },
};

// Per-marker JSON schema fragment reused for each of the five markers. A
// verbatim `triggering_phrase` is required when present=true; an encouraging
// ≤12-word `coaching_prompt` is required when present=false. The schema is
// enforced server-side by Anthropic's tool-use mode.
const MARKER_SCHEMA = {
  type: "object" as const,
  properties: {
    present: {
      type: "boolean",
      description: "Whether the marker is present in the reflection",
    },
    triggering_phrase: {
      type: "string",
      description:
        "Verbatim substring copied from the user's reflection (required when present=true).",
    },
    coaching_prompt: {
      type: "string",
      description:
        "≤12 words, encouraging, starts with 'Next time' or 'For tomorrow' (required when present=false).",
    },
  },
  required: ["present"],
};

const JUDGE_TOOL: Anthropic.Tool = {
  name: "judge_reflection",
  description:
    "Return the five application-rubric markers for the user's reflection. Each marker has a `present` boolean; present=true needs a verbatim `triggering_phrase`, present=false needs an encouraging `coaching_prompt`.",
  input_schema: {
    type: "object" as const,
    properties: {
      markers: {
        type: "object",
        properties: {
          specific_moment: MARKER_SCHEMA,
          behavioral_change: MARKER_SCHEMA,
          temporal_anchor: MARKER_SCHEMA,
          honest_friction: MARKER_SCHEMA,
          next_step: MARKER_SCHEMA,
        },
        required: [
          "specific_moment",
          "behavioral_change",
          "temporal_anchor",
          "honest_friction",
          "next_step",
        ],
      },
    },
    required: ["markers"],
  },
};

export class AnthropicLLM implements LLMProvider {
  async pickMission(input: PickMissionInput): Promise<PickMissionResult> {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      system: [
        {
          type: "text",
          text: PICK_MISSION_SYSTEM,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: buildPickMissionPrompt(
            input.focusAreas,
            input.recentVerseKeys,
            input.actionablePool
          ),
        },
      ],
      tools: [PICK_TOOL],
      tool_choice: { type: "tool", name: "pick_mission" },
    });

    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new Error("LLM did not return tool use");
    }
    const inp = toolUse.input as {
      verse_key: string;
      mission_text: string;
      focus_area: string;
    };
    return {
      verseKey: inp.verse_key,
      missionText: inp.mission_text,
      focusArea: inp.focus_area,
    };
  }

  async suggestWords(input: SuggestWordsInput): Promise<SuggestWordsResult> {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 256,
      system: [
        {
          type: "text",
          text: SUGGEST_WORDS_SYSTEM,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: buildSuggestWordsPrompt(
            input.verseArabic,
            input.verseTranslation,
            input.knownWords
          ),
        },
      ],
      tools: [SUGGEST_TOOL],
      tool_choice: { type: "tool", name: "suggest_words" },
    });

    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new Error("LLM did not return tool use");
    }
    const inp = toolUse.input as {
      suggestions: Array<{ position: number; reason: string }>;
    };
    return {
      suggestions: inp.suggestions.slice(0, 2),
    };
  }

  async judgeReflection(
    input: JudgeReflectionInput
  ): Promise<JudgeReflectionResult> {
    // max_tokens bumped from 512 → 768: the nested markers payload carries
    // five `triggering_phrase` / `coaching_prompt` strings and can clip mid-
    // object on long reflections at the old ceiling.
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 768,
      system: [
        {
          type: "text",
          text: JUDGE_REFLECTION_SYSTEM,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: buildJudgeReflectionPrompt(
            input.mission,
            input.verseTranslation,
            input.reflection
          ),
        },
      ],
      tools: [JUDGE_TOOL],
      tool_choice: { type: "tool", name: "judge_reflection" },
    });

    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new Error("LLM did not return tool use");
    }
    const { markers } = toolUse.input as { markers: MarkerBundle };
    // Count in code rather than trust the model — the handler's substring
    // integrity check (Task 3) may also flip markers from true→false, so
    // upstream callers should always rely on this derived value.
    const markerCount = Object.values(markers).filter((m) => m.present).length;
    return { markers, markerCount };
  }
}
