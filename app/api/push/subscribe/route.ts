import { NextRequest, NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const session = await getRequiredSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subscription = await req.json();
  if (!subscription?.endpoint) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  const db = createServerClient();
  await db
    .from("users")
    .update({ push_subscription: subscription })
    .eq("id", session.userId);

  return NextResponse.json({ ok: true });
}
