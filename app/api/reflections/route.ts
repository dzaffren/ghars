import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  getReflectionByMissionId,
  upsertReflection,
  computeWindowClosesAt,
  enqueueQfRetry,
} from "@/lib/db/reflections";
import { addNote, addActivityDay, getCurrentStreak } from "@/lib/qf/user";

const VALID_DID_APPLY = ["yes_fully", "partly", "not_today"];

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Session required" } },
      { status: 401 }
    );
  }

  let body: { mission_id?: string; did_apply?: string; text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_JSON", message: "Body must be JSON" } },
      { status: 400 }
    );
  }

  const { mission_id, did_apply, text } = body;

  if (!mission_id)
    return NextResponse.json(
      { error: { code: "MISSION_NOT_FOUND", message: "mission_id required" } },
      { status: 404 }
    );
  if (!did_apply || !VALID_DID_APPLY.includes(did_apply)) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_DID_APPLY",
          message: "did_apply must be yes_fully, partly, or not_today",
        },
      },
      { status: 400 }
    );
  }
  if (!text || text.length < 40) {
    return NextResponse.json(
      {
        error: {
          code: "REFLECTION_TOO_SHORT",
          message: "Reflection must be at least 40 characters",
        },
      },
      { status: 400 }
    );
  }
  if (text.length > 2000) {
    return NextResponse.json(
      {
        error: {
          code: "REFLECTION_TOO_LONG",
          message: "Reflection must be 2000 characters or fewer",
        },
      },
      { status: 400 }
    );
  }

  // Verify mission belongs to this user
  const supabase = await createServerSupabaseClient();
  const { data: mission } = await supabase
    .from("missions")
    .select(
      "id, committed_at, assignment_id, daily_assignments(verse_key, user_id)"
    )
    .eq("id", mission_id)
    .single();

  if (!mission)
    return NextResponse.json(
      {
        error: {
          code: "MISSION_NOT_FOUND",
          message: "Mission not found or not owned by user",
        },
      },
      { status: 404 }
    );

  const da = mission.daily_assignments as unknown as {
    verse_key: string;
    user_id: string;
  } | null;
  if (!da || da.user_id !== session.userId) {
    return NextResponse.json(
      {
        error: {
          code: "MISSION_NOT_FOUND",
          message: "Mission not found or not owned by user",
        },
      },
      { status: 404 }
    );
  }

  // Check for existing reflection
  const existing = await getReflectionByMissionId(mission_id);
  if (existing) {
    if (new Date() >= new Date(existing.window_closes_at)) {
      return NextResponse.json(
        {
          error: {
            code: "CONFLICT_WINDOW_CLOSED",
            message: "Reflection window has closed for this day",
          },
        },
        { status: 409 }
      );
    }
  }

  // Compute window_closes_at for new reflections
  const { data: user } = await supabase
    .from("users")
    .select("tz")
    .eq("id", session.userId)
    .single();
  const windowClosesAt = computeWindowClosesAt(
    new Date(mission.committed_at),
    user?.tz ?? "UTC"
  );

  // Upsert reflection (local insert is canonical)
  let reflection;
  try {
    reflection = await upsertReflection({
      missionId: mission_id,
      didApply: did_apply,
      text,
      windowClosesAt: windowClosesAt.toISOString(),
      existingId: existing?.id,
    });
  } catch (e) {
    console.error("Reflection insert failed:", e);
    return NextResponse.json(
      {
        error: { code: "INSERT_FAILED", message: "Could not save reflection" },
      },
      { status: 500 }
    );
  }

  // QF sync (best-effort, non-blocking)
  let qfNoteId: string | null = null;
  let syncStatus: "synced" | "retry_queued" = "synced";
  let streakDays = 0;

  try {
    const noteResult = await addNote({
      accessToken: session.accessToken,
      verseKey: da.verse_key,
      body: text,
    });
    qfNoteId = noteResult.note_id || null;
    if (qfNoteId) {
      await supabase
        .from("reflections")
        .update({ qf_note_id: qfNoteId })
        .eq("id", reflection.id);
    }
  } catch {
    await enqueueQfRetry({
      userId: session.userId,
      endpoint: "POST /notes",
      payload: { verse_key: da.verse_key, body: text },
      relatedId: reflection.id,
    });
    syncStatus = "retry_queued";
  }

  try {
    const today = reflection.submitted_at.slice(0, 10);
    await addActivityDay({ accessToken: session.accessToken, date: today });
    const streakResult = await getCurrentStreak(session.accessToken);
    streakDays = streakResult.current_streak_days;
  } catch {
    syncStatus = "retry_queued";
  }

  const response: Record<string, unknown> = {
    reflection_id: reflection.id,
    mission_id: reflection.mission_id,
    did_apply: reflection.did_apply,
    qf_note_id: qfNoteId,
    submitted_at: reflection.submitted_at,
    window_closes_at: reflection.window_closes_at,
    tree_growth_complete: true,
    streak: {
      current_days: streakDays,
      source: syncStatus === "synced" ? "qf" : "local_estimate",
    },
  };
  if (syncStatus === "retry_queued") response.sync_status = "retry_queued";

  return NextResponse.json(response);
}
