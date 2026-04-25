import { describe, it, expect } from "vitest";

// ── Stage progress (inlined from TodayClient to keep tests self-contained) ──

const STAGE_MAP = [
  { name: "Seed", min: 0 },
  { name: "Sprout", min: 3 },
  { name: "Small Plant", min: 10 },
  { name: "Flowering", min: 25 },
  { name: "Fruiting", min: 50 },
] as const;

function getStageProgress(pts: number) {
  const idx = pts >= 50 ? 4 : pts >= 25 ? 3 : pts >= 10 ? 2 : pts >= 3 ? 1 : 0;
  const current = STAGE_MAP[idx];
  const next = STAGE_MAP[Math.min(idx + 1, 4)];
  if (idx === 4)
    return {
      currentStageName: "Fruiting",
      nextStageName: "Complete ✓",
      progressPct: 1,
      nextThreshold: 50,
    };
  const pct = (pts - current.min) / (next.min - current.min);
  return {
    currentStageName: current.name,
    nextStageName: next.name,
    progressPct: Math.min(1, Math.max(0, pct)),
    nextThreshold: next.min,
  };
}

// ── Garden points formula (from judge.ts logic) ──────────────────

function calcPoints(depthScore: number, currentStreak: number): number {
  const streakBonus = currentStreak > 1 ? 1 : 0;
  return depthScore + streakBonus;
}

// ── Calendar grouping (inlined from history page) ─────────────────

function buildDateRange(
  days: number,
  fromDate = new Date("2025-01-14")
): string[] {
  const result: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(fromDate);
    d.setDate(d.getDate() - i);
    result.push(d.toISOString().slice(0, 10));
  }
  return result;
}

function groupIntoWeeks(
  dates: string[],
  completedSet: Set<string>,
  today: string
) {
  if (!dates.length) return [];
  const firstDate = new Date(dates[0] + "T00:00:00");
  const startDow = firstDate.getDay();
  const padded: (null | string)[] = Array(startDow)
    .fill(null)
    .concat(dates as string[]);
  const weeks: {
    date: string | null;
    completed: boolean;
    isToday: boolean;
  }[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(
      padded.slice(i, i + 7).map((d) => ({
        date: d,
        completed: d !== null && completedSet.has(d),
        isToday: d === today,
      }))
    );
  }
  return weeks;
}

// ── Tests ─────────────────────────────────────────────────────────

describe("getStageProgress", () => {
  it("0 pts → Seed stage, 0% progress", () => {
    const { currentStageName, progressPct } = getStageProgress(0);
    expect(currentStageName).toBe("Seed");
    expect(progressPct).toBe(0);
  });

  it("3 pts → Sprout, 0% toward Small Plant", () => {
    const { currentStageName, progressPct, nextStageName } =
      getStageProgress(3);
    expect(currentStageName).toBe("Sprout");
    expect(nextStageName).toBe("Small Plant");
    expect(progressPct).toBeCloseTo(0);
  });

  it("17 pts → Small Plant, ~46.7% toward Flowering", () => {
    const { currentStageName, progressPct } = getStageProgress(17);
    expect(currentStageName).toBe("Small Plant");
    expect(progressPct).toBeCloseTo((17 - 10) / (25 - 10));
  });

  it("50 pts → Fruiting, 100%", () => {
    const { currentStageName, progressPct } = getStageProgress(50);
    expect(currentStageName).toBe("Fruiting");
    expect(progressPct).toBe(1);
  });

  it("clamps at 1 even beyond 50 pts", () => {
    const { progressPct } = getStageProgress(99);
    expect(progressPct).toBe(1);
  });
});

describe("garden points formula", () => {
  it("first completion (streak=1): depth only", () => {
    expect(calcPoints(3, 1)).toBe(3);
    expect(calcPoints(5, 1)).toBe(5);
  });

  it("ongoing streak (streak>1): depth + 1 bonus", () => {
    expect(calcPoints(3, 2)).toBe(4);
    expect(calcPoints(5, 7)).toBe(6);
  });

  it("streak bonus caps at 1 regardless of streak length", () => {
    expect(calcPoints(5, 100)).toBe(6);
  });
});

describe("calendar groupIntoWeeks", () => {
  it("groups 7 dates into one week", () => {
    const monday = new Date("2025-01-13");
    const dates = buildDateRange(7, new Date("2025-01-19"));
    const weeks = groupIntoWeeks(dates, new Set(), "2025-01-20");
    const flatDates = weeks.flat().filter((d) => d.date !== null);
    expect(flatDates).toHaveLength(7);
  });

  it("marks completed dates correctly", () => {
    const dates = buildDateRange(7, new Date("2025-01-14"));
    const completed = new Set(["2025-01-12", "2025-01-13"]);
    const weeks = groupIntoWeeks(dates, completed, "2025-01-14");
    const flat = weeks.flat().filter((d) => d.date !== null);
    const completedCells = flat.filter((d) => d.completed);
    expect(completedCells).toHaveLength(2);
  });

  it("marks today correctly", () => {
    const dates = buildDateRange(7, new Date("2025-01-14"));
    const weeks = groupIntoWeeks(dates, new Set(), "2025-01-14");
    const flat = weeks.flat().filter((d) => d.date !== null);
    const todayCells = flat.filter((d) => d.isToday);
    expect(todayCells).toHaveLength(1);
    expect(todayCells[0].date).toBe("2025-01-14");
  });

  it("pads week to start on Sunday", () => {
    // 2025-01-14 is a Tuesday → 2 padding nulls
    const dates = buildDateRange(1, new Date("2025-01-14"));
    const weeks = groupIntoWeeks(dates, new Set(), "2025-01-14");
    const firstWeek = weeks[0];
    const nullCells = firstWeek.filter((d) => d.date === null);
    expect(nullCells.length).toBe(2); // Mon=1, Tue=2 → pad 2
  });
});
