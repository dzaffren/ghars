import { NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  const session = await getRequiredSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createServerClient();
  const userId = session.userId!;

  const { data, error } = await db
    .from("user_words")
    .select("status, due_at")
    .eq("user_id", userId);

  if (error) {
    console.error("[words/stats GET] query error:", error);
    return NextResponse.json(
      { error: "Could not fetch stats" },
      { status: 500 }
    );
  }

  const rows = data ?? [];
  const now = new Date().toISOString();

  let learning = 0;
  let known = 0;
  let mature = 0;
  let dueToday = 0;

  for (const row of rows) {
    if (row.status === "learning") learning++;
    else if (row.status === "known") known++;
    else if (row.status === "mature") mature++;

    if (row.due_at <= now) dueToday++;
  }

  return NextResponse.json({
    total: rows.length,
    learning,
    known,
    mature,
    dueToday,
  });
}
