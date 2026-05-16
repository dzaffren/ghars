import { describe, it, expect } from "vitest";

// Pure logic extracted from resolveOrCreateAssignment
function assignmentSource(
  corpusEntry: {
    id: number;
    action_prompt_1: string;
    action_prompt_2: string;
    tafsir_extract: string;
  } | null,
  explorationPrompt: string | null
): "corpus" | "exploration" | "empty" {
  if (corpusEntry) return "corpus";
  if (explorationPrompt) return "exploration";
  return "empty";
}

describe("assignment source resolution", () => {
  it("corpus entry takes priority", () => {
    const ce = {
      id: 1,
      action_prompt_1: "a",
      action_prompt_2: "b",
      tafsir_extract: "t",
    };
    expect(assignmentSource(ce, null)).toBe("corpus");
  });

  it("exploration prompt used when no corpus entry", () => {
    expect(assignmentSource(null, "Notice one moment of ease today.")).toBe(
      "exploration"
    );
  });

  it("returns empty when neither", () => {
    expect(assignmentSource(null, null)).toBe("empty");
  });
});

describe("verse key validation", () => {
  const re = /^\d{1,3}:\d{1,3}$/;
  it("accepts valid keys", () => {
    expect(re.test("94:5")).toBe(true);
    expect(re.test("2:255")).toBe(true);
    expect(re.test("114:6")).toBe(true);
  });
  it("rejects invalid keys", () => {
    expect(re.test("")).toBe(false);
    expect(re.test("94")).toBe(false);
    expect(re.test("94:")).toBe(false);
    expect(re.test("abc:5")).toBe(false);
  });
});

// Pure JSON extraction helper — same logic as in the route
function parseVerseResults(raw: string): Array<{
  verse_key: string;
  reason: string;
  action_prompt: string;
}> | null {
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) return null;
  try {
    const arr = JSON.parse(match[0]);
    if (!Array.isArray(arr)) return null;
    return arr.filter(
      (item) =>
        typeof item.verse_key === "string" &&
        /^\d{1,3}:\d{1,3}$/.test(item.verse_key) &&
        typeof item.reason === "string" &&
        typeof item.action_prompt === "string"
    );
  } catch {
    return null;
  }
}

describe("parseVerseResults", () => {
  it("extracts valid JSON array from Claude response", () => {
    const raw = `Here are the verses:\n[{"verse_key":"94:5","reason":"ease after hardship","action_prompt":"Notice one ease today."}]`;
    const result = parseVerseResults(raw);
    expect(result).toHaveLength(1);
    expect(result![0].verse_key).toBe("94:5");
  });

  it("filters out items with invalid verse keys", () => {
    const raw = `[{"verse_key":"invalid","reason":"test","action_prompt":"do it"},{"verse_key":"2:255","reason":"ayat al-kursi","action_prompt":"recite it"}]`;
    const result = parseVerseResults(raw);
    expect(result).toHaveLength(1);
    expect(result![0].verse_key).toBe("2:255");
  });

  it("returns null when no JSON array found", () => {
    expect(parseVerseResults("No JSON here")).toBeNull();
  });

  it("returns null for malformed JSON", () => {
    expect(parseVerseResults("[{broken}]")).toBeNull();
  });
});

// Pure date helper — same logic used in the assign route
function nextDay(localDate: string): string {
  const [y, m, d] = localDate.split("-").map(Number);
  const date = new Date(y, m - 1, d + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

describe("nextDay", () => {
  it("advances a normal date", () => {
    expect(nextDay("2026-05-15")).toBe("2026-05-16");
  });

  it("rolls over month boundary", () => {
    expect(nextDay("2026-05-31")).toBe("2026-06-01");
  });

  it("rolls over year boundary", () => {
    expect(nextDay("2026-12-31")).toBe("2027-01-01");
  });
});
