// Semantic verse search using Claude's Quranic knowledge to suggest verse keys,
// then fetching canonical text from the QF Content API.
// Falls back gracefully if any step fails.

import Anthropic from "@anthropic-ai/sdk";
import { fetchVerse } from "./content-client";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SUGGEST_TOOL: Anthropic.Tool = {
  name: "suggest_verses",
  description: "Return Quran verse keys most relevant to the user's query",
  input_schema: {
    type: "object" as const,
    properties: {
      verse_keys: {
        type: "array",
        items: { type: "string" },
        description:
          "5–8 verse keys (e.g. '2:255', '13:28') ordered by relevance",
      },
      themes: {
        type: "array",
        items: { type: "string" },
        description: "2–3 thematic labels describing what the query is about",
      },
    },
    required: ["verse_keys", "themes"],
  },
};

export interface SearchResult {
  verseKey: string;
  arabic: string;
  translation: string;
  tafsirSnippet: string | null;
}

export async function searchVersesByQuery(
  query: string
): Promise<SearchResult[]> {
  // Step 1: ask Claude Haiku to suggest verse keys
  let verseKeys: string[] = [];
  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 256,
      system: [
        {
          type: "text",
          text: "You are a Quranic scholar assistant. Given a topic or theme, return the most relevant Quran verse keys. Be accurate — only suggest verses you are confident contain that theme.",
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        { role: "user", content: `Find Quran verses relevant to: "${query}"` },
      ],
      tools: [SUGGEST_TOOL],
      tool_choice: { type: "tool", name: "suggest_verses" },
    });

    const tool = response.content.find((b) => b.type === "tool_use");
    if (tool && tool.type === "tool_use") {
      const inp = tool.input as { verse_keys: string[] };
      verseKeys = inp.verse_keys.slice(0, 8);
    }
  } catch {
    return [];
  }

  if (!verseKeys.length) return [];

  // Step 2: fetch canonical verse data from QF for each key
  const results = await Promise.allSettled(
    verseKeys.map((key) => fetchVerse(key))
  );

  return results
    .filter((r) => r.status === "fulfilled")
    .map((r) => {
      const v = (
        r as PromiseFulfilledResult<Awaited<ReturnType<typeof fetchVerse>>>
      ).value;
      return {
        verseKey: v.verseKey,
        arabic: v.arabic,
        translation: v.translation,
        tafsirSnippet: v.tafsirSnippet,
      };
    });
}
