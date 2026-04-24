import Anthropic from "@anthropic-ai/sdk";
import type {
  LLMProvider,
  PickMissionInput,
  PickMissionResult,
  JudgeReflectionInput,
  JudgeReflectionResult,
} from "./types";
import {
  PICK_MISSION_SYSTEM,
  buildPickMissionPrompt,
  JUDGE_REFLECTION_SYSTEM,
  buildJudgeReflectionPrompt,
} from "./prompts";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PICK_TOOL: Anthropic.Tool = {
  name: "pick_mission",
  description: "Return the selected verse key and mission text",
  input_schema: {
    type: "object" as const,
    properties: {
      verse_key: { type: "string", description: "e.g. '2:83'" },
      mission_text: { type: "string", description: "One-sentence actionable mission" },
      focus_area: { type: "string", description: "Which focus area this targets" },
    },
    required: ["verse_key", "mission_text", "focus_area"],
  },
};

const JUDGE_TOOL: Anthropic.Tool = {
  name: "judge_reflection",
  description: "Return verdict, feedback, and depth score",
  input_schema: {
    type: "object" as const,
    properties: {
      verdict: { type: "string", enum: ["accepted", "soft_nudge"] },
      feedback: { type: "string", description: "Encouraging feedback or gentle hint" },
      depth_score: { type: "number", description: "1-5 depth score" },
    },
    required: ["verdict", "feedback", "depth_score"],
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

  async judgeReflection(
    input: JudgeReflectionInput
  ): Promise<JudgeReflectionResult> {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
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
    const inp = toolUse.input as {
      verdict: "accepted" | "soft_nudge";
      feedback: string;
      depth_score: number;
    };
    return {
      verdict: inp.verdict,
      feedback: inp.feedback,
      depthScore: Math.min(5, Math.max(1, Math.round(inp.depth_score))),
    };
  }
}
