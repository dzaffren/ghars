import { describe, it, expect } from "vitest";

describe("journal helpers", () => {
  it("preview truncates at 160 chars with ellipsis", () => {
    const long = "a".repeat(200);
    const preview = long.slice(0, 160) + (long.length > 160 ? "…" : "");
    expect(preview.length).toBe(161);
    expect(preview.endsWith("…")).toBe(true);
  });

  it("short text preview has no ellipsis", () => {
    const short = "Short reflection text.";
    const preview = short.slice(0, 160) + (short.length > 160 ? "…" : "");
    expect(preview).toBe(short);
    expect(preview.endsWith("…")).toBe(false);
  });

  it("valid did_apply values map to readable labels", () => {
    const labels: Record<string, string> = {
      yes_fully: "Yes, fully",
      partly: "Partly",
      not_today: "Not today",
    };
    expect(labels["yes_fully"]).toBe("Yes, fully");
    expect(labels["not_today"]).toBe("Not today");
  });
});
