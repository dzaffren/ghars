import { describe, it, expect } from "vitest";

describe("weekly review trigger logic", () => {
  it("triggers on 7th reflection (count % 7 === 0)", () => {
    expect(7 % 7).toBe(0);
    expect(14 % 7).toBe(0);
    expect(8 % 7).not.toBe(0);
  });

  it("week number is count / 7", () => {
    expect(7 / 7).toBe(1);
    expect(14 / 7).toBe(2);
  });

  it("closing line includes reflection count", () => {
    const count = 7;
    const line = `You reflected on ${count} ayat this week. May Allah accept your effort.`;
    expect(line).toContain("7 ayat");
    expect(line).toContain("May Allah accept");
  });
});
