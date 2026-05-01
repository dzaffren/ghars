import { NextRequest, NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { getLLMProvider } from "@/lib/llm";
import { logEvent } from "@/lib/log";
// Task 2 ships this helper. Import fails to resolve locally until merge.
import { applySubstringIntegrity } from "@/lib/mission/markers";
import type { MarkerBundle } from "@/lib/llm/types";

// Lazy rescore endpoint for `status='pending'` reflections. The journal page
// fires this once when a pending entry renders. It never re-applies growth
// points — the floor of 2 was awarded at submission time — so this handler
// only populates the marker fields.
//
// Next.js 16 exposes `params` as a Promise on route handlers; access is
// `await params`. See node_modules/next/dist/docs/01-app/03-api-reference/
// 03-file-conventions/dynamic-routes.md.
function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ error: message, code }, { status });
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getRequiredSession();
  if (!session) {
    return errorResponse(401, "UNAUTHORIZED", "Unauthorized");
  }

  const { id } = await params;
  const db = createServerClient();

  // ── Load the reflection + its mission (ownership-scoped) ───────────
  //
  // Supabase-js's join via foreign-key relation name lets us pull the
  // mission's verse_translation and mission_text in one round-trip.
  // Ownership is enforced by the `user_id` equality filter; a mismatch
  // returns no row → 404 REFLECTION_NOT_FOUND.
  const { data: reflection } = await db
    .from("reflections")
    .select(
      "id, text, status, mission_id, daily_missions!inner(mission_text, verse_translation)"
    )
    .eq("id", id)
    .eq("user_id", session.userId)
    .single();

  if (!reflection) {
    return errorResponse(404, "REFLECTION_NOT_FOUND", "Reflection not found");
  }

  const row = reflection as unknown as {
    id: string;
    text: string;
    status: "scored" | "pending";
    mission_id: string;
    daily_missions: {
      mission_text: string;
      verse_translation: string;
    };
  };

  if (row.status !== "pending") {
    return errorResponse(409, "ALREADY_SCORED", "Already scored");
  }

  // ── Call the judge; if it still fails, return 503 untouched ───────
  const llm = await getLLMProvider();
  let result: { markers: MarkerBundle; markerCount: number };
  try {
    result = await llm.judgeReflection({
      mission: row.daily_missions.mission_text,
      verseTranslation: row.daily_missions.verse_translation,
      reflection: row.text,
    });
  } catch (err) {
    console.error("[reflection/rescore] judge failure:", err);
    return errorResponse(
      503,
      "JUDGE_UNAVAILABLE",
      "Scoring service is temporarily unavailable"
    );
  }

  // Apply the same substring-integrity pass as the submission path so the
  // stored bundle cannot contain hallucinated quotes. Flipped markers are
  // logged for audit; no user-facing coaching-prompt difference from the
  // submission path.
  const integrity = applySubstringIntegrity(result.markers, row.text) as {
    markers: MarkerBundle;
    flippedMarkers: string[];
  };
  if (integrity.flippedMarkers.length > 0) {
    logEvent("judge_phrase_mismatch", {
      reflectionId: row.id,
      flippedMarkers: integrity.flippedMarkers,
    });
  }
  const markerCount = Object.values(integrity.markers).filter(
    (m) => m.present
  ).length;

  await db
    .from("reflections")
    .update({
      marker_count: markerCount,
      markers_json: integrity.markers,
      status: "scored",
    })
    .eq("id", row.id);

  return NextResponse.json({
    status: "scored" as const,
    markerCount,
    markers: integrity.markers,
  });
}
