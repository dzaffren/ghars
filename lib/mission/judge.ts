import { getLLMProvider } from "@/lib/llm";
import { createServerClient } from "@/lib/supabase/server";
import { logEvent } from "@/lib/log";
import { logGoalActivity } from "@/lib/qf/user-client";
import { computePoints } from "@/lib/llm/scoring";
// Task 2 ships `lib/mission/markers.ts` with the canonical
// `applySubstringIntegrity(markers, reflectionText)` helper. The import below
// will fail to resolve in this worktree until Task 2 merges; that is expected
// per the spec's sibling-task protocol.
import { applySubstringIntegrity } from "@/lib/mission/markers";
import type { MarkerBundle } from "@/lib/llm/types";

export interface ReflectionSubmission {
  userId: string;
  missionId: string;
  missionText: string;
  verseKey: string;
  verseTranslation: string;
  reflectionText: string;
  photoPath?: string;
  qfAccessToken?: string;
  qfGoalId?: string;
}

// New ReflectionResult contract: every reflection is accepted — markers are
// coaching, not a gate. On judge outage `status='pending'` and marker fields
// are undefined; on success `status='scored'` with the cleaned marker bundle.
// The pre-v2 `verdict / feedback / depthScore / nextStep` triplet is gone.
export interface ReflectionResult {
  status: "scored" | "pending";
  reflectionId: string;
  markerCount?: number;
  markers?: MarkerBundle;
  pendingMessage?: string;
  growthPoints: number;
  pointsEarned: number;
  currentStreak: number;
}

// Fixed banner copy consumed by the client when the judge is temporarily
// unavailable. Must match verbatim per the v2 spec acceptance criteria.
const PENDING_MESSAGE =
  "5 markers pending — we'll score this when we're back online";

// Floor growth awarded when the judge is unavailable. Matches `computePoints(0)`
// — a reflection saved but unscored still grows the plant by 2. The lazy
// rescore endpoint never tops this up later.
const PENDING_POINTS = 2;

export async function submitReflection(
  sub: ReflectionSubmission
): Promise<ReflectionResult> {
  const llm = await getLLMProvider();

  // ── 1. Call the judge (may throw → fall back to pending) ───────────
  let scored: { markers: MarkerBundle; markerCount: number } | null = null;
  try {
    const judgment = await llm.judgeReflection({
      mission: sub.missionText,
      verseTranslation: sub.verseTranslation,
      reflection: sub.reflectionText,
    });
    scored = { markers: judgment.markers, markerCount: judgment.markerCount };
  } catch {
    // Single attempt — recovery lives at POST /api/reflection/:id/rescore.
    scored = null;
  }

  const db = createServerClient();
  const reflectionId = crypto.randomUUID();

  // ── 2. Persist the reflection row FIRST (atomicity spec) ───────────
  //
  // If the judge succeeded, apply the substring-integrity check before the
  // write so the persisted bundle matches what the user will see. Markers
  // that flipped from true→false are logged once via `judge_phrase_mismatch`
  // so hallucinations are auditable without polluting the user-facing row.
  let persistedMarkerCount: number | null = null;
  let persistedMarkers: MarkerBundle | null = null;
  let persistedStatus: "scored" | "pending" = "pending";

  if (scored) {
    const integrity = applySubstringIntegrity(
      scored.markers,
      sub.reflectionText
    ) as { markers: MarkerBundle; flippedMarkers: string[] };
    if (integrity.flippedMarkers.length > 0) {
      logEvent("judge_phrase_mismatch", {
        reflectionId,
        flippedMarkers: integrity.flippedMarkers,
      });
    }
    persistedMarkers = integrity.markers;
    persistedMarkerCount = Object.values(integrity.markers).filter(
      (m) => m.present
    ).length;
    persistedStatus = "scored";
  }

  await db.from("reflections").insert({
    id: reflectionId,
    mission_id: sub.missionId,
    user_id: sub.userId,
    text: sub.reflectionText,
    photo_path: sub.photoPath ?? null,
    marker_count: persistedMarkerCount,
    markers_json: persistedMarkers,
    status: persistedStatus,
  });

  // ── 3. Compute points & streak, then upsert the garden ─────────────
  //
  // Every reflection — scored or pending — grows the plant by at least 2.
  // For scored reflections, use the CLEANED marker count so flipped-out
  // hallucinations don't earn points. The streak bonus is independent and
  // preserved from v1 (newStreak > 1 ? +1 : 0).
  const pointsFromMarkers =
    persistedMarkerCount === null
      ? PENDING_POINTS
      : computePoints(persistedMarkerCount);

  type GardenRow = {
    last_completed_date?: string | null;
    current_streak?: number;
    longest_streak?: number;
    growth_points?: number;
  };
  const { data: garden } = await db
    .from("gardens")
    .select("*")
    .eq("user_id", sub.userId)
    .single();
  const g = (garden ?? null) as GardenRow | null;

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000)
    .toISOString()
    .slice(0, 10);
  const lastDate = g?.last_completed_date ?? null;
  const previousStreak = g?.current_streak ?? 0;
  const previousLongest = g?.longest_streak ?? 0;
  const previousPoints = g?.growth_points ?? 0;

  const newStreak = lastDate === yesterday ? previousStreak + 1 : 1;
  const newLongest = Math.max(newStreak, previousLongest);
  const streakBonus = newStreak > 1 ? 1 : 0;
  const pointsEarned = pointsFromMarkers + streakBonus;
  const newPoints = previousPoints + pointsEarned;

  await db.from("gardens").upsert({
    user_id: sub.userId,
    growth_points: newPoints,
    current_streak: newStreak,
    longest_streak: newLongest,
    last_completed_date: today,
    wilting: false,
    updated_at: new Date().toISOString(),
  });

  // ── 4. Best-effort integrations: activity_log + QF goal ────────────
  await db.from("activity_log").insert({
    user_id: sub.userId,
    event: "reflection_submitted",
    payload: {
      status: persistedStatus,
      marker_count: persistedMarkerCount,
    },
  });

  if (sub.qfAccessToken && sub.qfGoalId) {
    logGoalActivity(sub.qfAccessToken, sub.qfGoalId).catch(() => {});
  }

  // ── 5. Return the v2 shape ─────────────────────────────────────────
  if (persistedStatus === "pending") {
    return {
      status: "pending",
      reflectionId,
      pendingMessage: PENDING_MESSAGE,
      growthPoints: newPoints,
      pointsEarned,
      currentStreak: newStreak,
    };
  }

  return {
    status: "scored",
    reflectionId,
    markerCount: persistedMarkerCount!,
    markers: persistedMarkers!,
    growthPoints: newPoints,
    pointsEarned,
    currentStreak: newStreak,
  };
}
