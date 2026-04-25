import { NextRequest, NextResponse } from "next/server";
import { logEvent } from "@/lib/log";
import { getRequiredSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const session = await getRequiredSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await req.json();
  const cleaned = (code ?? "").trim().toUpperCase();
  if (cleaned.length !== 6) {
    return NextResponse.json(
      { error: "Enter the 6-character invite code" },
      { status: 400 }
    );
  }

  const db = createServerClient();

  // Look up the invite
  const { data: invite } = await db
    .from("circle_invites")
    .select("circle_id, expires_at, used")
    .eq("code", cleaned)
    .single();

  if (!invite)
    return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
  if (invite.used)
    return NextResponse.json(
      { error: "This invite has already been used" },
      { status: 400 }
    );
  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json(
      { error: "This invite code has expired" },
      { status: 400 }
    );
  }

  const circleId = invite.circle_id;

  // Check circle size
  const { count } = await db
    .from("circle_members")
    .select("*", { count: "exact", head: true })
    .eq("circle_id", circleId);

  if ((count ?? 0) >= 5) {
    return NextResponse.json(
      { error: "This circle is already full (max 5 members)" },
      { status: 400 }
    );
  }

  // Already a member?
  const { data: existing } = await db
    .from("circle_members")
    .select("circle_id")
    .eq("circle_id", circleId)
    .eq("user_id", session.userId)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "You are already in this circle", circleId },
      { status: 400 }
    );
  }

  // Check user circle limit
  const { count: userCircles } = await db
    .from("circle_members")
    .select("*", { count: "exact", head: true })
    .eq("user_id", session.userId);

  if ((userCircles ?? 0) >= 3) {
    return NextResponse.json(
      { error: "You can belong to at most 3 circles" },
      { status: 400 }
    );
  }

  await db
    .from("circle_members")
    .insert({ circle_id: circleId, user_id: session.userId });
  await db.from("circle_invites").update({ used: true }).eq("code", cleaned);

  logEvent("circle_joined", { userId: session.userId, circleId });
  return NextResponse.json({ ok: true, circleId });
}
