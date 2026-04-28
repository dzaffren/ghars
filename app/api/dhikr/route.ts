import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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

  const { data, error } = await db.rpc("dhikr_increment", {
    p_user_id: session.userId,
    p_local_date: localDate,
    p_type: type,
  });

  if (error || !data?.[0]) {
    console.error("[dhikr] rpc failed:", error);
    return NextResponse.json(
      { error: "Could not update dhikr" },
      { status: 500 }
    );
  }

  const row = data[0] as {
    subhan: number;
    alhamd: number;
    akbar: number;
    completed: boolean;
    just_completed: boolean;
  };

  if (row.just_completed) {
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

  logEvent("dhikr_increment", {
    userId: session.userId,
    type,
    count: row[type],
    justCompleted: row.just_completed,
  });

  revalidatePath("/today");

  return NextResponse.json({
    subhan: row.subhan,
    alhamd: row.alhamd,
    akbar: row.akbar,
    completed: row.completed,
    justCompleted: row.just_completed,
    targets: TARGETS,
  });
}
