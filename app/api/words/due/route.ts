import { NextRequest, NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const session = await getRequiredSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limitParam = req.nextUrl.searchParams.get("limit");
  const limit = Math.min(parseInt(limitParam ?? "10", 10) || 10, 20);

  const db = createServerClient();

  const { data, error } = await db
    .from("user_words")
    .select("*")
    .eq("user_id", session.userId!)
    .lte("due_at", new Date().toISOString())
    .order("due_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[words/due GET] query error:", error);
    return NextResponse.json(
      { error: "Could not fetch due words" },
      { status: 500 }
    );
  }

  return NextResponse.json({ words: data ?? [] });
}
