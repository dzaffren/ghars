// Deterministic weekly theme: given a user's focus areas and an ISO week
// string (e.g. "2026-W18"), returns which focus area is this week's theme.
// Cycles through the user's focus areas so every area gets its own week.

export function getWeeklyTheme(
  focusAreas: string[],
  isoWeek: string
): string | null {
  if (!focusAreas.length) return null;
  // Hash the ISO week string to a stable index
  const seed = isoWeek.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return focusAreas[seed % focusAreas.length];
}

// Returns ISO week string for a given date, e.g. "2026-W18"
export function getISOWeek(date: Date): string {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7
  );
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}
