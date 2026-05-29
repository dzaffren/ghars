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

describe("journal bookmarked ayahs section", () => {
  // Reproduces bug: ayahs bookmarked from the Explore page ("Saved to Journal")
  // are invisible on the Journal page because the page has no section for standalone
  // bookmarks — only reflection entries whose verse_key matches a bookmark appear.

  it("bookmarking an ayah without a reflection still surfaces it in the journal", () => {
    // The journal currently drives visibility from reflections joined with bookmarks_mirror.
    // A standalone bookmark (no reflection) returns nothing from that join.

    function bookmarkedAyahsFromReflections(
      reflections: { verse_key: string; text: string }[],
      bookmarkedKeys: Set<string>
    ) {
      // Current (buggy) approach: filter reflections by bookmarked verse_key.
      // Standalone bookmarks with no reflection are invisible.
      return reflections.filter((r) => bookmarkedKeys.has(r.verse_key));
    }

    const bookmarkedKeys = new Set(["94:5"]); // bookmarked from Explore, no reflection
    const reflections: { verse_key: string; text: string }[] = []; // user has no reflection on 94:5

    const visible = bookmarkedAyahsFromReflections(reflections, bookmarkedKeys);

    // BUG: returns 0 — the bookmarked ayah is not surfaced anywhere on the journal page.
    // FIX: a separate "Bookmarked Ayahs" section must fetch bookmarks_mirror directly
    // and display them even when there is no associated reflection.
    expect(visible).toHaveLength(1); // FAILS: currently 0
  });
});
