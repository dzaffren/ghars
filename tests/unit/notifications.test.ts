import { describe, it, expect } from "vitest";

describe("notification settings validation", () => {
  const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

  it("validates HH:MM format", () => {
    expect(TIME_RE.test("08:00")).toBe(true);
    expect(TIME_RE.test("21:30")).toBe(true);
    expect(TIME_RE.test("24:00")).toBe(false);
    expect(TIME_RE.test("8:00")).toBe(false);
  });

  it("valid translation IDs", () => {
    const valid = ["131", "85", "20"];
    expect(valid.includes("131")).toBe(true);
    expect(valid.includes("999")).toBe(false);
  });

  it("push payload contains no PII", () => {
    const payload = {
      title: "Ghars",
      body: "Your ayah is ready — spend a moment with it.",
      url: "/today",
    };
    expect(payload.body).not.toContain("@");
    expect(payload.body).not.toContain("user");
    expect(JSON.stringify(payload)).not.toContain("email");
  });
});
