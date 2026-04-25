import { NextRequest, NextResponse } from "next/server";
import { logEvent } from "@/lib/log";
import { getRequiredSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";

// GET — list circles the current user belongs to
export async function GET() {
  const session = await getRequiredSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createServerClient();

  const { data: memberships } = await db
    .from("circle_members")
    .select("circle_id, circles(id, name, owner_id, created_at)")
    .eq("user_id", session.userId);

  if (!memberships?.length) return NextResponse.json({ circles: [] });

  const circleIds = memberships.map((m) => m.circle_id);

  // Count members per circle
  const { data: counts } = await db
    .from("circle_members")
    .select("circle_id")
    .in("circle_id", circleIds);

  const memberCount: Record<string, number> = {};
  for (const row of counts ?? []) {
    memberCount[row.circle_id] = (memberCount[row.circle_id] ?? 0) + 1;
  }

  const circles = memberships.map((m) => {
    const c = Array.isArray(m.circles) ? m.circles[0] : m.circles;
    return { ...c, memberCount: memberCount[m.circle_id] ?? 1 };
  });

  return NextResponse.json({ circles });
}

// POST — create a circle (creator becomes first member)
export async function POST(req: NextRequest) {
  const session = await getRequiredSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();
  const trimmed = (name ?? "").trim();
  if (!trimmed || trimmed.length > 40) {
    return NextResponse.json(
      { error: "Name must be 1–40 characters" },
      { status: 400 }
    );
  }

  const db = createServerClient();

  // Limit: 3 circles per user
  const { count } = await db
    .from("circle_members")
    .select("*", { count: "exact", head: true })
    .eq("user_id", session.userId);

  if ((count ?? 0) >= 3) {
    return NextResponse.json(
      { error: "You can belong to at most 3 circles" },
      { status: 400 }
    );
  }

  const { data: circle, error } = await db
    .from("circles")
    .insert({ name: trimmed, owner_id: session.userId })
    .select()
    .single();

  if (error || !circle) {
    return NextResponse.json(
      { error: "Failed to create circle" },
      { status: 500 }
    );
  }

  await db
    .from("circle_members")
    .insert({ circle_id: circle.id, user_id: session.userId });

  logEvent("circle_created", { userId: session.userId, circleId: circle.id });
  return NextResponse.json({ circle });
}
