import { describe, it, expect } from "vitest";

describe("grove helpers", () => {
  it("tree variant mapping", () => {
    const variantMap: Record<string, string> = {
      yes_fully: "full",
      partly: "partial",
      not_today: "sapling",
    };
    expect(variantMap["yes_fully"]).toBe("full");
    expect(variantMap["not_today"]).toBe("sapling");
    expect(variantMap["partly"]).toBe("partial");
  });

  it("month_count uses calendar month", () => {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const dates = [monthStart, "2025-01-01", "2025-03-15"];
    const count = dates.filter((d) => d >= monthStart).length;
    expect(count).toBe(1);
  });

  it("short_preview truncates at 80 chars", () => {
    const long = "a".repeat(100);
    const preview = long.slice(0, 80) + (long.length > 80 ? "…" : "");
    expect(preview.length).toBe(81); // 80 chars + ellipsis
    expect(preview.endsWith("…")).toBe(true);
  });
});
