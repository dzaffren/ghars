// TEMPORARY: This file preserves the pre-v2 reflection judge for Experiment A
// (paired-reflections prompt-eval harness in Task 6). It exposes an Anthropic-
// only `judgeReflectionV1` function returning the old `{verdict, feedback,
// depthScore, nextStep}` contract so Task 6 can compare v1 vs v2 output side
// by side. DELETE THIS FILE once Experiment A passes and the v2 rubric ships.

import Anthropic from "@anthropic-ai/sdk";

export interface JudgeReflectionInputV1 {
  mission: string;
  verseTranslation: string;
  reflection: string;
}

export interface JudgeReflectionResultV1 {
  verdict: "accepted" | "soft_nudge";
  feedback: string;
  depthScore: number; // 1-5
  nextStep?: string;
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const JUDGE_REFLECTION_SYSTEM_V1 = `You are a gentle, encouraging Islamic reflection guide.
Your role is to evaluate whether a user's written reflection plausibly demonstrates they attempted
today's Quranic mission. Be generous and compassionate — people express their spiritual experiences differently.
Accept the reflection if it shows any genuine engagement with the mission's theme, even partially.
Only suggest a nudge if the reflection seems completely unrelated to the mission or is too vague to confirm any attempt.
When you accept a reflection, provide one concrete next_step: a specific, actionable suggestion for how the user
could deepen this practice tomorrow — grounded in their reflection, not generic.`;

function buildJudgeReflectionPromptV1(
  mission: string,
  verseTranslation: string,
  reflection: string
): string {
  return `Today's verse: "${verseTranslation}"
Today's mission: "${mission}"
User's reflection: "${reflection}"

Evaluate the reflection. Score depth 1-5 (1=single word, 5=rich specific story).
If the reflection shows genuine engagement with the mission theme, verdict=accepted.
If completely unrelated or too vague, verdict=soft_nudge with a gentle one-sentence hint.
If accepted, next_step should be one concrete suggestion drawn from what they wrote — e.g. "Tomorrow, notice how
this same quality appears when you interact with [person/situation they mentioned]." Keep it under 2 sentences.`;
}

const JUDGE_TOOL_V1: Anthropic.Tool = {
  name: "judge_reflection",
  description: "Return verdict, feedback, depth score, and optional next step",
  input_schema: {
    type: "object" as const,
    properties: {
      verdict: { type: "string", enum: ["accepted", "soft_nudge"] },
      feedback: {
        type: "string",
        description: "Encouraging feedback or gentle nudge",
      },
      depth_score: { type: "number", description: "1-5 depth score" },
      next_step: {
        type: "string",
        description:
          "One concrete suggestion for tomorrow (accepted only, ≤2 sentences)",
      },
    },
    required: ["verdict", "feedback", "depth_score"],
  },
};

export async function judgeReflectionV1(
  input: JudgeReflectionInputV1
): Promise<JudgeReflectionResultV1> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    system: [
      {
        type: "text",
        text: JUDGE_REFLECTION_SYSTEM_V1,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: buildJudgeReflectionPromptV1(
          input.mission,
          input.verseTranslation,
          input.reflection
        ),
      },
    ],
    tools: [JUDGE_TOOL_V1],
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
    next_step?: string;
  };
  return {
    verdict: inp.verdict,
    feedback: inp.feedback,
    depthScore: Math.min(5, Math.max(1, Math.round(inp.depth_score))),
    nextStep:
      inp.verdict === "accepted" ? (inp.next_step ?? undefined) : undefined,
  };
}
