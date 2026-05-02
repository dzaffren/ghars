import Anthropic from "@anthropic-ai/sdk";
import { buildPrompt, type PromptInput } from "./prompt";
import { validateAnswer } from "./validators";

const MODEL =
  process.env.ANSWERED_REFLECTION_MODEL ?? "claude-haiku-4-5-20251001";
const TIMEOUT_MS = 7000;

export type GenerationErrorCode =
  | "LLM_UNAVAILABLE"
  | "LLM_TIMEOUT"
  | "LLM_POLICY_REFUSED"
  | "VALIDATION_FAILED"
  | "PARSE_FAILED";

export type GenerationResult =
  | {
      ok: true;
      ayahInsight: string;
      noticing: string;
      model: string;
    }
  | { ok: false; errorCode: GenerationErrorCode };

function parseJsonLoose(s: string): {
  ayah_insight?: string;
  noticing?: string;
} {
  const match = s.match(/\{[\s\S]*\}/);
  if (!match) return {};
  try {
    return JSON.parse(match[0]);
  } catch {
    return {};
  }
}

async function callOnce(
  client: Anthropic,
  input: PromptInput
): Promise<GenerationResult> {
  const { system, user } = buildPrompt(input);
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);

  let raw = "";
  try {
    const res = await client.messages.create(
      {
        model: MODEL,
        max_tokens: 400,
        system,
        messages: [{ role: "user", content: user }],
      },
      { signal: ac.signal }
    );
    const textBlock = res.content.find((b) => b.type === "text");
    raw = textBlock?.type === "text" ? textBlock.text : "";
  } catch (err) {
    const name = (err as { name?: string })?.name;
    if (name === "AbortError" || name === "APIConnectionTimeoutError") {
      return { ok: false, errorCode: "LLM_TIMEOUT" };
    }
    const status = (err as { status?: number })?.status;
    if (status === 400 || status === 403) {
      return { ok: false, errorCode: "LLM_POLICY_REFUSED" };
    }
    return { ok: false, errorCode: "LLM_UNAVAILABLE" };
  } finally {
    clearTimeout(timer);
  }

  const parsed = parseJsonLoose(raw);
  const ayahInsight = parsed.ayah_insight ?? "";
  const noticing = parsed.noticing ?? "";

  if (!ayahInsight || !noticing) {
    return { ok: false, errorCode: "PARSE_FAILED" };
  }

  const check = validateAnswer({
    ayahInsight,
    noticing,
    reflectionText: input.reflectionText,
  });
  if (!check.ok) {
    return { ok: false, errorCode: "VALIDATION_FAILED" };
  }
  return { ok: true, ayahInsight, noticing, model: MODEL };
}

export async function generateAnswer(
  input: PromptInput,
  opts?: { client?: Anthropic }
): Promise<GenerationResult> {
  const client =
    opts?.client ??
    new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    });

  // One attempt, one retry on validation failure (per spec business rules).
  const first = await callOnce(client, input);
  if (first.ok) return first;
  if (
    first.errorCode !== "VALIDATION_FAILED" &&
    first.errorCode !== "PARSE_FAILED"
  ) {
    return first;
  }
  return callOnce(client, input);
}
