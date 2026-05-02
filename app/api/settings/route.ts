import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const VALID_TRANSLATIONS = ["131", "85", "20"];

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  let body: {
    morning_time?: string;
    evening_time?: string;
    translation_id?: string;
    paused?: boolean;
    tz?: string;
    display_name?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const {
    morning_time,
    evening_time,
    translation_id,
    paused,
    tz,
    display_name,
  } = body;

  if (morning_time && !TIME_RE.test(morning_time)) {
    return NextResponse.json(
      { error: "INVALID_TIME", message: "morning_time must be HH:MM" },
      { status: 400 }
    );
  }
  if (evening_time && !TIME_RE.test(evening_time)) {
    return NextResponse.json(
      { error: "INVALID_TIME", message: "evening_time must be HH:MM" },
      { status: 400 }
    );
  }
  if (translation_id && !VALID_TRANSLATIONS.includes(translation_id)) {
    return NextResponse.json({ error: "INVALID_TRANSLATION" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (morning_time) updates.morning_time = morning_time;
  if (evening_time) updates.evening_time = evening_time;
  if (translation_id) updates.translation_id = translation_id;
  if (typeof paused === "boolean") updates.paused = paused;
  if (tz) updates.tz = tz;
  if (typeof display_name === "string")
    updates.display_name = display_name.trim().slice(0, 80) || null;

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", session.userId);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
