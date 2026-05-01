import { describe, it, expect } from "vitest";
import { computePoints } from "@/lib/llm/scoring";

describe("computePoints", () => {
  it("0 markers → 2 points (floor)", () => {
    expect(computePoints(0)).toBe(2);
  });

  it("1 marker → 2 points (floor)", () => {
    expect(computePoints(1)).toBe(2);
  });

  it("2 markers → 2 points (floor)", () => {
    expect(computePoints(2)).toBe(2);
  });

  it("3 markers → 3 points", () => {
    expect(computePoints(3)).toBe(3);
  });

  it("4 markers → 4 points", () => {
    expect(computePoints(4)).toBe(4);
  });

  it("5 markers → 5 points (cap)", () => {
    expect(computePoints(5)).toBe(5);
  });
});
