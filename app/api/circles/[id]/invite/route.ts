import { NextRequest, NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import crypto from "crypto";

function makeCode(): string {
  // 6 uppercase alphanumeric chars, no ambiguous chars (0/O, 1/I/l)
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  return Array.from(crypto.randomBytes(6))
    .map((b) => chars[b % chars.length])
    .join("");
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: circleId } = await params;
  const session = await getRequiredSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createServerClient();

  // Only the circle owner can generate invites
  const { data: circle } = await db
    .from("circles")
    .select("owner_id")
    .eq("id", circleId)
    .single();

  if (!circle)
    return NextResponse.json({ error: "Circle not found" }, { status: 404 });
  if (circle.owner_id !== session.userId) {
    return NextResponse.json(
      { error: "Only the circle owner can invite members" },
      { status: 403 }
    );
  }

  // Check circle isn't full (max 5 members)
  const { count } = await db
    .from("circle_members")
    .select("*", { count: "exact", head: true })
    .eq("circle_id", circleId);

  if ((count ?? 0) >= 5) {
    return NextResponse.json(
      { error: "Circle is full (max 5 members)" },
      { status: 400 }
    );
  }

  // Expire old unused codes for this circle
  await db
    .from("circle_invites")
    .update({ used: true })
    .eq("circle_id", circleId)
    .eq("used", false);

  // Generate new code (retry on collision). Only return once the row is
  // actually persisted — otherwise the client would display a "code" that
  // doesn't exist in the DB and /join would reject it.
  let lastError: unknown = null;
  for (let i = 0; i < 5; i++) {
    const code = makeCode();
    const { error } = await db
      .from("circle_invites")
      .insert({ code, circle_id: circleId, created_by: session.userId });
    if (!error) {
      return NextResponse.json({ code });
    }
    lastError = error;
  }

  console.error("circle_invites insert failed", lastError);
  return NextResponse.json(
    { error: "Could not generate invite code. Please try again." },
    { status: 500 }
  );
}
