import { NextRequest, NextResponse } from "next/server";
import { logEvent } from "@/lib/log";
import { getRequiredSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";

const TARGETS = { subhan: 33, alhamd: 33, akbar: 34 } as const;
type DhikrType = keyof typeof TARGETS;

export async function GET(req: NextRequest) {
  const session = await getRequiredSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const localDate =
    req.nextUrl.searchParams.get("date") ??
    new Date().toISOString().slice(0, 10);
  const db = createServerClient();

  const { data } = await db
    .from("dhikr_log")
    .select("subhan, alhamd, akbar, completed")
    .eq("user_id", session.userId)
    .eq("local_date", localDate)
    .single();

  return NextResponse.json(
    data ?? { subhan: 0, alhamd: 0, akbar: 0, completed: false }
  );
}

export async function POST(req: NextRequest) {
  const session = await getRequiredSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, localDate } = (await req.json()) as {
    type: DhikrType;
    localDate: string;
  };
  if (!type || !TARGETS[type]) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const db = createServerClient();

  // Upsert the dhikr row for today, incrementing the chosen counter
  const { data: existing } = await db
    .from("dhikr_log")
    .select("subhan, alhamd, akbar, completed")
    .eq("user_id", session.userId)
    .eq("local_date", localDate)
    .single();

  // Don't exceed the target for any counter
  const current = existing ?? {
    subhan: 0,
    alhamd: 0,
    akbar: 0,
    completed: false,
  };
  if (current.completed || current[type] >= TARGETS[type]) {
    return NextResponse.json({ ...current, targets: TARGETS });
  }

  const updated = {
    ...current,
    [type]: current[type] + 1,
  };

  // Check if all three now reach their targets
  const nowComplete =
    updated.subhan >= TARGETS.subhan &&
    updated.alhamd >= TARGETS.alhamd &&
    updated.akbar >= TARGETS.akbar;

  if (nowComplete && !current.completed) {
    updated.completed = true;

    // Award +3 growth points to the garden (best-effort — don't fail the request)
    const { data: garden } = await db
      .from("gardens")
      .select("growth_points")
      .eq("user_id", session.userId)
      .single();

    if (garden) {
      await db
        .from("gardens")
        .update({
          growth_points: garden.growth_points + 3,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", session.userId);
    }
  }

  await db.from("dhikr_log").upsert({
    user_id: session.userId,
    local_date: localDate,
    subhan: updated.subhan,
    alhamd: updated.alhamd,
    akbar: updated.akbar,
    completed: updated.completed,
    updated_at: new Date().toISOString(),
  });

  logEvent("dhikr_increment", {
    userId: session.userId,
    type,
    count: updated[type],
    justCompleted: nowComplete,
  });
  return NextResponse.json({
    ...updated,
    targets: TARGETS,
    justCompleted: nowComplete,
  });
}
