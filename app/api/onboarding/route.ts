import { NextRequest, NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { createDailyReflectionGoal } from "@/lib/qf/user-client";

export async function POST(req: NextRequest) {
  const session = await getRequiredSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { focusAreas, timezone, reminderHour } = await req.json();

  const validAreas = ["patience", "gratitude", "charity", "dhikr", "kindness", "honesty"];
  const sanitizedAreas = (focusAreas ?? []).filter((a: string) =>
    validAreas.includes(a)
  ).slice(0, 3);

  if (!sanitizedAreas.length) {
    return NextResponse.json({ error: "Select at least one focus area" }, { status: 400 });
  }

  const db = createServerClient();

  // Fetch user tokens for goal creation
  const { data: user } = await db
    .from("users")
    .select("qf_access_token")
    .eq("id", session.userId)
    .single();

  // Create QF goal (best-effort)
  let goalId: string | null = null;
  if (user?.qf_access_token) {
    goalId = await createDailyReflectionGoal(user.qf_access_token);
  }

  await db
    .from("users")
    .update({
      focus_areas: sanitizedAreas,
      timezone: timezone ?? "UTC",
      reminder_hour: Math.max(0, Math.min(23, reminderHour ?? 8)),
      ...(goalId ? { qf_goal_id: goalId } : {}),
    })
    .eq("id", session.userId);

  return NextResponse.json({ ok: true });
}
