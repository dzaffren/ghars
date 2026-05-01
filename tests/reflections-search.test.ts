import { describe, it, expect } from "vitest";
import {
  filterReflections,
  type ReflectionEntry,
} from "@/lib/reflections/filter";

// ── Fixtures ──────────────────────────────────────────────────────

function entry(overrides: Partial<ReflectionEntry>): ReflectionEntry {
  return {
    id: "e-default",
    local_date: "2026-01-01",
    verse_key: "1:1",
    verse_translation: "",
    mission_text: "",
    focus_area: null,
    reflections: null,
    ...overrides,
  };
}

const ENTRIES: ReflectionEntry[] = [
  entry({
    id: "e1",
    mission_text: "Give a sincere smile to someone today",
    verse_translation: "Indeed, with hardship comes ease",
    focus_area: "kindness",
    reflections: [
      {
        id: "r1",
        text: "I smiled at the barista this morning and she smiled back",
        marker_count: 3,
        markers_json: null,
        status: "scored",
      },
    ],
  }),
  entry({
    id: "e2",
    mission_text: "Pause before reacting when frustrated",
    verse_translation: "And be patient, surely Allah is with the patient",
    focus_area: "patience",
    reflections: {
      id: "r2",
      text: "Traffic today tested me; I remembered to breathe",
      marker_count: null,
      markers_json: null,
      status: "pending",
    },
  }),
  entry({
    id: "e3",
    mission_text: "Say Alhamdulillah five times with intention",
    verse_translation: "If you are grateful, I will surely give you more",
    focus_area: "gratitude",
    reflections: [
      {
        id: "r3",
        text: "Counted three blessings before bed",
        marker_count: 2,
        markers_json: null,
        status: "scored",
      },
    ],
  }),
  entry({
    id: "e4",
    mission_text: "Donate whatever you can spare",
    verse_translation: "Who spends in charity...",
    focus_area: "charity",
    reflections: null,
  }),
];

// ── Tests ─────────────────────────────────────────────────────────

describe("filterReflections", () => {
  it("returns all entries when search is empty and no filter", () => {
    const out = filterReflections(ENTRIES, {
      activeFilter: null,
      search: "",
    });
    expect(out).toHaveLength(ENTRIES.length);
    expect(out.map((e) => e.id)).toEqual(["e1", "e2", "e3", "e4"]);
  });

  it("returns all entries when search is only whitespace", () => {
    const out = filterReflections(ENTRIES, {
      activeFilter: null,
      search: "   ",
    });
    expect(out).toHaveLength(ENTRIES.length);
  });

  it("matches text in mission_text", () => {
    const out = filterReflections(ENTRIES, {
      activeFilter: null,
      search: "smile",
    });
    expect(out.map((e) => e.id)).toEqual(["e1"]);
  });

  it("matches text in verse_translation", () => {
    const out = filterReflections(ENTRIES, {
      activeFilter: null,
      search: "hardship",
    });
    expect(out.map((e) => e.id)).toEqual(["e1"]);
  });

  it("matches text in reflection text (array form)", () => {
    const out = filterReflections(ENTRIES, {
      activeFilter: null,
      search: "barista",
    });
    expect(out.map((e) => e.id)).toEqual(["e1"]);
  });

  it("matches text in reflection text (single object form)", () => {
    const out = filterReflections(ENTRIES, {
      activeFilter: null,
      search: "traffic",
    });
    expect(out.map((e) => e.id)).toEqual(["e2"]);
  });

  it("is case-insensitive across all searchable fields", () => {
    expect(
      filterReflections(ENTRIES, {
        activeFilter: null,
        search: "SMILE",
      }).map((e) => e.id)
    ).toEqual(["e1"]);
    expect(
      filterReflections(ENTRIES, {
        activeFilter: null,
        search: "GraTefuL",
      }).map((e) => e.id)
    ).toEqual(["e3"]);
    expect(
      filterReflections(ENTRIES, {
        activeFilter: null,
        search: "BARISTA",
      }).map((e) => e.id)
    ).toEqual(["e1"]);
  });

  it("focus area filter narrows results", () => {
    const out = filterReflections(ENTRIES, {
      activeFilter: "patience",
      search: "",
    });
    expect(out.map((e) => e.id)).toEqual(["e2"]);
  });

  it("focus area filter with no matching entries returns empty", () => {
    const out = filterReflections(ENTRIES, {
      activeFilter: "honesty",
      search: "",
    });
    expect(out).toEqual([]);
  });

  it("combines focus filter + search with AND semantics", () => {
    // Search matches e1 and e3 via mission_text "a", but only e3 is gratitude
    const out = filterReflections(ENTRIES, {
      activeFilter: "gratitude",
      search: "alhamdulillah",
    });
    expect(out.map((e) => e.id)).toEqual(["e3"]);
  });

  it("combined filter yields empty when search excludes all filter matches", () => {
    // focus=patience limits to e2, but "smile" only matches e1 → empty
    const out = filterReflections(ENTRIES, {
      activeFilter: "patience",
      search: "smile",
    });
    expect(out).toEqual([]);
  });

  it("returns empty when search matches nothing", () => {
    const out = filterReflections(ENTRIES, {
      activeFilter: null,
      search: "xyzneverexists",
    });
    expect(out).toEqual([]);
  });

  it("handles entries with null reflections without crashing", () => {
    // e4 has null reflections; searching for its mission_text should still find it
    const out = filterReflections(ENTRIES, {
      activeFilter: null,
      search: "donate",
    });
    expect(out.map((e) => e.id)).toEqual(["e4"]);
  });

  it("returns empty array when given empty input", () => {
    expect(filterReflections([], { activeFilter: null, search: "" })).toEqual(
      []
    );
    expect(
      filterReflections([], { activeFilter: "patience", search: "foo" })
    ).toEqual([]);
  });
});
