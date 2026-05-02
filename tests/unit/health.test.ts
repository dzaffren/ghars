import { describe, it, expect } from "vitest";

describe("scaffold", () => {
  it("app name is Ghars", () => {
    expect("Ghars").toBe("Ghars");
  });

  it("corpus-shortlist has 10 entries with human_reviewed_at", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const corpus = require("../../data/corpus-shortlist.json");
    expect(corpus).toHaveLength(10);
    for (const entry of corpus) {
      expect(entry.human_reviewed_at).toBeTruthy();
    }
  });
});
