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
