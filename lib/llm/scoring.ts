// Growth-point scoring for reflection judge v2.
//
// Rewards reflections that show more application markers, with a hard floor
// (2) and cap (5) so a single-sentence honest reflection still feels worthwhile
// and an epic essay cannot be gamed for extra growth. Shared between the
// submission orchestrator (lib/mission/judge.ts) and the prompt-eval harness
// (scripts/eval-judge-v2.ts).
//
//   0 markers → 2 points
//   1 marker  → 2 points
//   2 markers → 2 points
//   3 markers → 3 points
//   4 markers → 4 points
//   5 markers → 5 points

export function computePoints(markerCount: number): number {
  return Math.max(2, Math.min(5, 2 + Math.max(0, markerCount - 2)));
}
