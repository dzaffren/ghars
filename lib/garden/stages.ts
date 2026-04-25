export const STAGE_MAP = [
  { name: "Seed", min: 0 },
  { name: "Sprout", min: 3 },
  { name: "Small Plant", min: 10 },
  { name: "Flowering", min: 25 },
  { name: "Fruiting", min: 50 },
] as const;

export type StageName = (typeof STAGE_MAP)[number]["name"];

export function getStageProgress(pts: number) {
  const idx = pts >= 50 ? 4 : pts >= 25 ? 3 : pts >= 10 ? 2 : pts >= 3 ? 1 : 0;
  const current = STAGE_MAP[idx];
  const next = STAGE_MAP[Math.min(idx + 1, 4)];
  if (idx === 4) {
    return {
      currentStageName: "Fruiting" as StageName,
      nextStageName: "Complete ✓",
      progressPct: 1,
      nextThreshold: 50,
    };
  }
  const pct = (pts - current.min) / (next.min - current.min);
  return {
    currentStageName: current.name as StageName,
    nextStageName: next.name as StageName,
    progressPct: Math.min(1, Math.max(0, pct)),
    nextThreshold: next.min,
  };
}

export function stageName(pts: number): StageName {
  return getStageProgress(pts).currentStageName;
}
