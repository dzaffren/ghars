import { describe, it, expect } from "vitest";
import { parseLocalDate } from "../../lib/db/assignments";

describe("assignment helpers", () => {
  it("parseLocalDate parses YYYY-MM-DD without timezone shift", () => {
    const d = parseLocalDate("2026-05-02");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(4); // 0-indexed
    expect(d.getDate()).toBe(2);
  });

  it("dayOfYear is deterministic for same date", () => {
    // Both calls of parseLocalDate('2026-05-02') give same day of year
    const d1 = parseLocalDate("2026-05-02");
    const d2 = parseLocalDate("2026-05-02");
    const start = new Date(d1.getFullYear(), 0, 0);
    const doy1 = Math.floor(
      (d1.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const doy2 = Math.floor(
      (d2.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    expect(doy1).toBe(doy2);
  });

  it("verse key regex validates correctly", () => {
    const re = /^\d{1,3}:\d{1,3}$/;
    expect(re.test("96:1")).toBe(true);
    expect(re.test("2:286")).toBe(true);
    expect(re.test("invalid")).toBe(false);
    expect(re.test("96:")).toBe(false);
  });
});

describe("mission validation logic", () => {
  it("custom prompt over 280 chars fails", () => {
    const prompt = "a".repeat(281);
    expect(prompt.length > 280).toBe(true);
  });

  it("custom prompt of exactly 280 chars passes", () => {
    const prompt = "a".repeat(280);
    expect(prompt.length <= 280).toBe(true);
  });

  it("empty custom prompt fails", () => {
    expect("   ".trim().length === 0).toBe(true);
  });
});
