import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

const VERSE_KEY_RE = /^\d{1,3}:\d{1,3}$/;
const LOCAL_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function nextDay(localDate: string): string {
  const [y, m, d] = localDate.split("-").map(Number);
  const date = new Date(y, m - 1, d + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Session required" } },
      { status: 401 }
    );
  }

  let verse_key: string, action_prompt: string, local_date: string;
  try {
    const body = await request.json();
    verse_key = body?.verse_key ?? "";
    action_prompt = body?.action_prompt ?? "";
    local_date = body?.local_date ?? "";
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_BODY", message: "JSON body required" } },
      { status: 400 }
    );
  }

  if (!VERSE_KEY_RE.test(verse_key)) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_VERSE_KEY",
          message: "verse_key must match {chapter}:{verse}",
        },
      },
      { status: 400 }
    );
  }
  if (!action_prompt || action_prompt.length > 280) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_ACTION_PROMPT",
          message: "action_prompt must be 1–280 characters",
        },
      },
      { status: 400 }
    );
  }
  if (!LOCAL_DATE_RE.test(local_date)) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_LOCAL_DATE",
          message: "local_date must be YYYY-MM-DD",
        },
      },
      { status: 400 }
    );
  }

  const supabase = createAdminSupabaseClient();

  // Check if today's assignment has a committed mission
  const { data: todayAssignment } = await supabase
    .from("daily_assignments")
    .select("id")
    .eq("user_id", session.userId)
    .eq("local_date", local_date)
    .single();

  let missionExists = false;
  if (todayAssignment) {
    const { data: mission } = await supabase
      .from("missions")
      .select("id")
      .eq("assignment_id", todayAssignment.id)
      .single();
    missionExists = !!mission;
  }

  const targetDate = missionExists ? nextDay(local_date) : local_date;
  const assigned_for: "today" | "tomorrow" = missionExists
    ? "tomorrow"
    : "today";

  const { error } = await supabase.from("daily_assignments").upsert(
    {
      user_id: session.userId,
      local_date: targetDate,
      verse_key,
      corpus_entry_id: null,
      exploration_prompt: action_prompt,
    },
    { onConflict: "user_id,local_date", ignoreDuplicates: false }
  );

  if (error) {
    console.error("Explore assign error:", error);
    return NextResponse.json(
      {
        error: { code: "ASSIGN_FAILED", message: "Could not save assignment" },
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ assigned_for, date: targetDate });
}
