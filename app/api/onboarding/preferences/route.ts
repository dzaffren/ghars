import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  let body: {
    translation_id?: string;
    morning_time?: string;
    evening_time?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const {
    translation_id = "131",
    morning_time = "08:00",
    evening_time = "21:00",
  } = body;

  // Validate time format HH:MM
  const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!timeRegex.test(morning_time) || !timeRegex.test(evening_time)) {
    return NextResponse.json(
      { error: "INVALID_TIME", message: "Times must be in HH:MM format" },
      { status: 400 }
    );
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("users")
    .update({ translation_id, morning_time, evening_time })
    .eq("id", session.userId);

  if (error) {
    return NextResponse.json(
      { error: "UPDATE_FAILED", message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
