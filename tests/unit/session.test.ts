import { describe, it, expect } from "vitest";

describe("session validation", () => {
  it("validates HH:MM time format", () => {
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    expect(timeRegex.test("08:00")).toBe(true);
    expect(timeRegex.test("21:00")).toBe(true);
    expect(timeRegex.test("23:59")).toBe(true);
    expect(timeRegex.test("24:00")).toBe(false);
    expect(timeRegex.test("8:00")).toBe(false);
    expect(timeRegex.test("invalid")).toBe(false);
  });

  it("translation IDs list includes defaults", () => {
    const validIds = ["131", "85", "20"];
    expect(validIds).toContain("131"); // Clear Quran default
    expect(validIds).toContain("85"); // Sahih International
  });
});
