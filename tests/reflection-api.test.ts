import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type {
  JudgeReflectionInput,
  JudgeReflectionResult,
  MarkerBundle,
} from "@/lib/llm/types";

// ── In-memory Supabase stub ─────────────────────────────────────────
//
// A narrow recorder that captures `.from(table).insert/update/upsert/select`
// calls. Each invocation is pushed onto `calls` as a typed entry so tests
// assert against the full sequence. Canned `select` responses can be primed
// per-table via `primedSelects`; anything unprimed returns `{ data: null }`.
//
// The real Supabase client's builder is fluent and terminal methods vary
// (`.single()`, awaited builder, etc.). This stub returns a thenable that
// also exposes `.eq`, `.single`, and `.select` for the chains the orchestrator
// uses. It is deliberately NOT a general Supabase mock — it only covers the
// call shapes in `submitReflection`.

type DbCall =
  | { op: "insert"; table: string; payload: Record<string, unknown> }
  | { op: "update"; table: string; payload: Record<string, unknown> }
  | { op: "upsert"; table: string; payload: Record<string, unknown> }
  | {
      op: "select";
      table: string;
      filters: Array<[string, unknown]>;
    };

interface StubState {
  calls: DbCall[];
  primedSelects: Map<string, { data: unknown | null; error: null }>;
}

function makeStubState(): StubState {
  return { calls: [], primedSelects: new Map() };
}

function makeStubDb(state: StubState) {
  return {
    from(table: string) {
      return {
        insert(payload: Record<string, unknown>) {
          state.calls.push({ op: "insert", table, payload });
          return Promise.resolve({ data: null, error: null });
        },
        update(payload: Record<string, unknown>) {
          state.calls.push({ op: "update", table, payload });
          return Promise.resolve({ data: null, error: null });
        },
        upsert(payload: Record<string, unknown>) {
          state.calls.push({ op: "upsert", table, payload });
          return Promise.resolve({ data: null, error: null });
        },
        select(_cols?: string) {
          const filters: Array<[string, unknown]> = [];
          const chain = {
            eq(col: string, val: unknown) {
              filters.push([col, val]);
              return chain;
            },
            single() {
              state.calls.push({ op: "select", table, filters });
              const key = `${table}:single`;
              return Promise.resolve(
                state.primedSelects.get(key) ?? { data: null, error: null }
              );
            },
            then(resolve: (v: { data: unknown; error: null }) => void) {
              state.calls.push({ op: "select", table, filters });
              const key = `${table}:list`;
              return Promise.resolve(
                state.primedSelects.get(key) ?? { data: null, error: null }
              ).then(resolve);
            },
          };
          return chain;
        },
      };
    },
  };
}

// ── Module mocks ────────────────────────────────────────────────────

const state = makeStubState();
let judgeImpl: (
  input: JudgeReflectionInput
) => Promise<JudgeReflectionResult> = async () => {
  throw new Error("judgeImpl not initialised");
};

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => makeStubDb(state),
}));

vi.mock("@/lib/llm", () => ({
  getLLMProvider: async () => ({
    judgeReflection: (input: JudgeReflectionInput) => judgeImpl(input),
    pickMission: async () => {
      throw new Error("not used in this suite");
    },
    suggestWords: async () => {
      throw new Error("not used in this suite");
    },
  }),
}));

vi.mock("@/lib/qf/user-client", () => ({
  logGoalActivity: vi.fn(async () => undefined),
}));

// Task 2 owns `lib/mission/markers.ts`. Until it ships, mock the helper so
// the orchestrator's real import resolves in this test runner. The contract
// mirrors the spec: each `triggering_phrase` on a present marker must be a
// case-insensitive substring of `reflectionText`; anything else flips to
// absent with a generic `coaching_prompt`. Returns the cleaned bundle plus
// the names of markers that were flipped.
vi.mock("@/lib/mission/markers", () => ({
  applySubstringIntegrity: (markers: MarkerBundle, reflectionText: string) => {
    const lower = reflectionText.toLowerCase();
    const cleaned = {} as MarkerBundle;
    const flipped: string[] = [];
    for (const [name, marker] of Object.entries(markers)) {
      const key = name as keyof MarkerBundle;
      if (marker.present) {
        const phrase = (marker.triggering_phrase ?? "").toLowerCase();
        const inText = phrase.length > 0 && lower.includes(phrase);
        if (inText) {
          cleaned[key] = marker;
        } else {
          flipped.push(name);
          cleaned[key] = {
            present: false,
            coaching_prompt: "Next time, try pointing to a moment from today",
          };
        }
      } else {
        cleaned[key] = marker;
      }
    }
    return { markers: cleaned, flippedMarkers: flipped };
  },
}));

const logEventSpy = vi.fn();
vi.mock("@/lib/log", () => ({
  logEvent: (event: string, payload?: Record<string, unknown>) =>
    logEventSpy(event, payload),
}));

// ── Helpers ─────────────────────────────────────────────────────────

function threeOfFiveMarkers(phrase: string): MarkerBundle {
  return {
    specific_moment: { present: true, triggering_phrase: phrase },
    behavioral_change: { present: true, triggering_phrase: phrase },
    temporal_anchor: { present: true, triggering_phrase: phrase },
    honest_friction: {
      present: false,
      coaching_prompt: "Next time, try naming what made it hard",
    },
    next_step: {
      present: false,
      coaching_prompt: "Next time, try one small thing for tomorrow",
    },
  };
}

function baseSubmission() {
  return {
    userId: "u-test-01",
    missionId: "m-today-01",
    missionText: "Practice patience with a family member today",
    verseKey: "2:153",
    verseTranslation: "And be patient — Allah is with those who are patient",
    reflectionText:
      "Today at dinner my sister tested me. I paused before replying.",
    photoPath: undefined,
  };
}

beforeEach(() => {
  state.calls = [];
  state.primedSelects.clear();
  logEventSpy.mockClear();
  // Default judge impl: deterministic 3-of-5 using the word "today" which
  // appears verbatim in `baseSubmission().reflectionText`.
  judgeImpl = async (input) => {
    const markers = threeOfFiveMarkers("today");
    // "today" must appear in the reflection — guard accidentally breaking
    // test authoring later.
    if (!input.reflection.toLowerCase().includes("today")) {
      throw new Error("test reflection must contain the word 'today'");
    }
    return { markers, markerCount: 3 };
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── Tests ───────────────────────────────────────────────────────────

describe("submitReflection — scored happy path", () => {
  it("returns status='scored' with the cleaned marker bundle and 3 points", async () => {
    const { submitReflection } = await import("@/lib/mission/judge");
    const result = await submitReflection(baseSubmission());

    expect(result.status).toBe("scored");
    expect(result.reflectionId).toBeTruthy();
    expect(result.markerCount).toBe(3);
    expect(result.pointsEarned).toBe(3);
    expect(result.markers?.specific_moment.present).toBe(true);
    expect(result.markers?.honest_friction.present).toBe(false);
    expect(result.pendingMessage).toBeUndefined();
  });

  it("inserts the reflection row with status='scored', marker_count, markers_json", async () => {
    const { submitReflection } = await import("@/lib/mission/judge");
    await submitReflection(baseSubmission());

    const insert = state.calls.find(
      (c) => c.op === "insert" && c.table === "reflections"
    );
    expect(insert).toBeDefined();
    if (insert && insert.op === "insert") {
      expect(insert.payload.status).toBe("scored");
      expect(insert.payload.marker_count).toBe(3);
      expect(insert.payload.markers_json).toBeDefined();
      expect(insert.payload.text).toBe(baseSubmission().reflectionText);
      expect(insert.payload.user_id).toBe("u-test-01");
      expect(insert.payload.mission_id).toBe("m-today-01");
    }
  });

  it("upserts the garden with growth_points incremented by pointsEarned", async () => {
    state.primedSelects.set("gardens:single", {
      data: {
        user_id: "u-test-01",
        growth_points: 10,
        current_streak: 0,
        longest_streak: 0,
        last_completed_date: null,
      },
      error: null,
    });

    const { submitReflection } = await import("@/lib/mission/judge");
    const result = await submitReflection(baseSubmission());

    const upsert = state.calls.find(
      (c) => c.op === "upsert" && c.table === "gardens"
    );
    expect(upsert).toBeDefined();
    if (upsert && upsert.op === "upsert") {
      expect(upsert.payload.growth_points).toBe(13); // 10 + 3 (no streak bonus since streak=1)
      expect(upsert.payload.current_streak).toBe(1);
      expect(upsert.payload.user_id).toBe("u-test-01");
      expect(upsert.payload.wilting).toBe(false);
    }
    expect(result.growthPoints).toBe(13);
    expect(result.currentStreak).toBe(1);
  });

  it("logs activity_log with event='reflection_submitted' and the new payload shape", async () => {
    const { submitReflection } = await import("@/lib/mission/judge");
    await submitReflection(baseSubmission());

    const log = state.calls.find(
      (c) => c.op === "insert" && c.table === "activity_log"
    );
    expect(log).toBeDefined();
    if (log && log.op === "insert") {
      expect(log.payload.event).toBe("reflection_submitted");
      const payload = log.payload.payload as Record<string, unknown>;
      expect(payload.status).toBe("scored");
      expect(payload.marker_count).toBe(3);
      expect(payload.verdict).toBeUndefined();
      expect(payload.depth_score).toBeUndefined();
    }
  });

  it("inserts the reflection BEFORE the garden upsert", async () => {
    const { submitReflection } = await import("@/lib/mission/judge");
    await submitReflection(baseSubmission());

    const reflectionIdx = state.calls.findIndex(
      (c) => c.op === "insert" && c.table === "reflections"
    );
    const gardenIdx = state.calls.findIndex(
      (c) => c.op === "upsert" && c.table === "gardens"
    );
    expect(reflectionIdx).toBeGreaterThanOrEqual(0);
    expect(gardenIdx).toBeGreaterThan(reflectionIdx);
  });
});

describe("submitReflection — judge outage fallback", () => {
  beforeEach(() => {
    judgeImpl = async () => {
      throw new Error("503 Service Unavailable");
    };
  });

  it("returns status='pending' with the fixed pending message and 2 points", async () => {
    const { submitReflection } = await import("@/lib/mission/judge");
    const result = await submitReflection(baseSubmission());

    expect(result.status).toBe("pending");
    expect(result.pointsEarned).toBe(2);
    expect(result.pendingMessage).toBe(
      "5 markers pending — we'll score this when we're back online"
    );
    expect(result.markerCount).toBeUndefined();
    expect(result.markers).toBeUndefined();
    expect(result.reflectionId).toBeTruthy();
  });

  it("persists the reflection with status='pending' and null marker fields", async () => {
    const { submitReflection } = await import("@/lib/mission/judge");
    await submitReflection(baseSubmission());

    const insert = state.calls.find(
      (c) => c.op === "insert" && c.table === "reflections"
    );
    expect(insert).toBeDefined();
    if (insert && insert.op === "insert") {
      expect(insert.payload.status).toBe("pending");
      expect(insert.payload.marker_count).toBeNull();
      expect(insert.payload.markers_json).toBeNull();
    }
  });

  it("still upserts the garden with the minimum 2 growth points", async () => {
    state.primedSelects.set("gardens:single", {
      data: {
        user_id: "u-test-01",
        growth_points: 10,
        current_streak: 0,
        longest_streak: 0,
        last_completed_date: null,
      },
      error: null,
    });

    const { submitReflection } = await import("@/lib/mission/judge");
    const result = await submitReflection(baseSubmission());

    const upsert = state.calls.find(
      (c) => c.op === "upsert" && c.table === "gardens"
    );
    expect(upsert).toBeDefined();
    if (upsert && upsert.op === "upsert") {
      expect(upsert.payload.growth_points).toBe(12); // 10 + 2
      expect(upsert.payload.current_streak).toBe(1);
    }
    expect(result.growthPoints).toBe(12);
  });
});

describe("submitReflection — substring-integrity flip", () => {
  it("flips markers whose triggering_phrase is not in the reflection and logs the mismatch once", async () => {
    const reflectionText =
      "Today at dinner my sister tested me. I paused before replying.";
    const bogusMarkers: MarkerBundle = {
      specific_moment: {
        present: true,
        triggering_phrase: "yesterday morning", // NOT in the reflection
      },
      behavioral_change: { present: true, triggering_phrase: "paused" },
      temporal_anchor: { present: true, triggering_phrase: "today" },
      honest_friction: {
        present: false,
        coaching_prompt: "Next time, try naming what made it hard",
      },
      next_step: {
        present: false,
        coaching_prompt: "Next time, try one small thing for tomorrow",
      },
    };
    judgeImpl = async () => ({ markers: bogusMarkers, markerCount: 3 });

    const { submitReflection } = await import("@/lib/mission/judge");
    const result = await submitReflection({
      ...baseSubmission(),
      reflectionText,
    });

    expect(result.status).toBe("scored");
    expect(result.markerCount).toBe(2); // hallucinated marker flipped
    expect(result.markers?.specific_moment.present).toBe(false);
    expect(result.markers?.specific_moment.coaching_prompt).toBeTruthy();
    expect(result.markers?.behavioral_change.present).toBe(true);
    expect(result.pointsEarned).toBe(2); // computePoints(2) = 2

    const mismatchCalls = logEventSpy.mock.calls.filter(
      ([event]) => event === "judge_phrase_mismatch"
    );
    expect(mismatchCalls).toHaveLength(1);
    const [, payload] = mismatchCalls[0] as [string, Record<string, unknown>];
    expect(payload.reflectionId).toBeTruthy();
    expect(payload.flippedMarkers).toEqual(["specific_moment"]);
  });

  it("does not log judge_phrase_mismatch when every phrase is in the reflection", async () => {
    const { submitReflection } = await import("@/lib/mission/judge");
    await submitReflection(baseSubmission());

    const mismatchCalls = logEventSpy.mock.calls.filter(
      ([event]) => event === "judge_phrase_mismatch"
    );
    expect(mismatchCalls).toHaveLength(0);
  });
});

describe("submitReflection — streak bonus", () => {
  it("increments the streak and adds +1 point when yesterday was the last completion", async () => {
    const yesterday = new Date(Date.now() - 86_400_000)
      .toISOString()
      .slice(0, 10);
    state.primedSelects.set("gardens:single", {
      data: {
        user_id: "u-test-01",
        growth_points: 20,
        current_streak: 4,
        longest_streak: 4,
        last_completed_date: yesterday,
      },
      error: null,
    });

    const { submitReflection } = await import("@/lib/mission/judge");
    const result = await submitReflection(baseSubmission());

    expect(result.currentStreak).toBe(5);
    expect(result.pointsEarned).toBe(4); // computePoints(3)=3 + streak bonus 1
    expect(result.growthPoints).toBe(24);

    const upsert = state.calls.find(
      (c) => c.op === "upsert" && c.table === "gardens"
    );
    if (upsert && upsert.op === "upsert") {
      expect(upsert.payload.current_streak).toBe(5);
      expect(upsert.payload.longest_streak).toBe(5); // bumped past previous 4
      expect(upsert.payload.growth_points).toBe(24);
    }
  });

  it("resets the streak to 1 when last_completed_date is older than yesterday", async () => {
    state.primedSelects.set("gardens:single", {
      data: {
        user_id: "u-test-01",
        growth_points: 20,
        current_streak: 4,
        longest_streak: 7,
        last_completed_date: "2020-01-01",
      },
      error: null,
    });

    const { submitReflection } = await import("@/lib/mission/judge");
    const result = await submitReflection(baseSubmission());

    expect(result.currentStreak).toBe(1);
    expect(result.pointsEarned).toBe(3); // computePoints(3)=3, no streak bonus
  });
});
