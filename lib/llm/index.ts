import type { LLMProvider } from "./types";

let _provider: LLMProvider | null = null;

export async function getLLMProvider(): Promise<LLMProvider> {
  if (_provider) return _provider;

  const which = process.env.LLM_PROVIDER ?? "anthropic";

  if (which === "ollama") {
    const { OllamaLLM } = await import("./ollama");
    _provider = new OllamaLLM();
  } else if (!process.env.ANTHROPIC_API_KEY) {
    const { StubLLM } = await import("./stub");
    _provider = new StubLLM();
  } else {
    const { AnthropicLLM } = await import("./anthropic");
    _provider = new AnthropicLLM();
  }

  return _provider;
}

export type {
  LLMProvider,
  PickMissionResult,
  JudgeReflectionResult,
} from "./types";
