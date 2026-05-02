import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import {
  getDisclosureSeen,
  markDisclosureSeen,
} from "@/lib/db/reflection-answers";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Session required" } },
      { status: 401 }
    );
  }
  const supabase = createAdminSupabaseClient();
  const [seen, { data: user }] = await Promise.all([
    getDisclosureSeen(session.userId),
    supabase
      .from("users")
      .select("display_name")
      .eq("id", session.userId)
      .single(),
  ]);
  return NextResponse.json({
    answered_reflection_disclosure_seen: seen,
    display_name: user?.display_name ?? null,
  });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Session required" } },
      { status: 401 }
    );
  }

  let body: {
    answered_reflection_disclosure_seen?: boolean;
    display_name?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_JSON", message: "Body must be JSON" } },
      { status: 400 }
    );
  }

  if (body.answered_reflection_disclosure_seen === true) {
    await markDisclosureSeen(session.userId);
  }

  if (typeof body.display_name === "string") {
    const name = body.display_name.trim().slice(0, 80);
    const supabase = createAdminSupabaseClient();
    await supabase
      .from("users")
      .update({ display_name: name || null })
      .eq("id", session.userId);
  }

  return NextResponse.json({ ok: true });
}
