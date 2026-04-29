import { NextRequest, NextResponse } from "next/server";
import { logEvent } from "@/lib/log";
import { getRequiredSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { createDailyReflectionGoal } from "@/lib/qf/user-client";
import { getValidQfAccessToken } from "@/lib/auth/qf-oauth";
import { seedStarterWords } from "@/lib/words/seed";

export async function POST(req: NextRequest) {
  const session = await getRequiredSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { focusAreas, timezone, reminderHour } = await req.json();

  const validAreas = [
    "patience",
    "gratitude",
    "charity",
    "dhikr",
    "kindness",
    "honesty",
  ];
  const sanitizedAreas = (focusAreas ?? [])
    .filter((a: string) => validAreas.includes(a))
    .slice(0, 3);

  if (!sanitizedAreas.length) {
    return NextResponse.json(
      { error: "Select at least one focus area" },
      { status: 400 }
    );
  }

  const db = createServerClient();

  // Use refreshed token for QF goal creation (best-effort)
  const token = await getValidQfAccessToken(session.userId!);
  let goalId: string | null = null;
  if (token) {
    goalId = await createDailyReflectionGoal(token);
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

  await seedStarterWords(db, session.userId!);

  logEvent("onboarding_completed", { userId: session.userId });
  return NextResponse.json({ ok: true });
}
