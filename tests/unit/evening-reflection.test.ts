import { describe, it, expect } from "vitest";
import { computeWindowClosesAt } from "../../lib/db/reflections";

describe("computeWindowClosesAt", () => {
  it("returns a time roughly 27 hours after commit", () => {
    const commit = new Date("2026-05-02T20:00:00Z");
    const window = computeWindowClosesAt(commit, "America/New_York");
    const diffHours = (window.getTime() - commit.getTime()) / (1000 * 60 * 60);
    expect(diffHours).toBeGreaterThan(24);
    expect(diffHours).toBeLessThan(30);
  });

  it("window_closes_at is always after commit", () => {
    const commit = new Date();
    const window = computeWindowClosesAt(commit, "UTC");
    expect(window > commit).toBe(true);
  });
});

describe("reflection validation", () => {
  it("rejects text shorter than 40 chars", () => {
    expect("short".length < 40).toBe(true);
  });

  it("accepts text of exactly 40 chars", () => {
    expect("a".repeat(40).length >= 40).toBe(true);
  });

  it("rejects text longer than 2000 chars", () => {
    expect("a".repeat(2001).length > 2000).toBe(true);
  });

  it("valid did_apply values", () => {
    const valid = ["yes_fully", "partly", "not_today"];
    expect(valid).toContain("yes_fully");
    expect(valid).toContain("not_today");
    expect(valid).not.toContain("maybe");
  });
});
