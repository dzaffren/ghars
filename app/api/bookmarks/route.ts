import { NextRequest, NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { addBookmark, getBookmarks } from "@/lib/qf/user-client";

export async function GET() {
  const session = await getRequiredSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createServerClient();
  const { data: user } = await db
    .from("users")
    .select("qf_access_token")
    .eq("id", session.userId)
    .single();

  if (!user?.qf_access_token) {
    return NextResponse.json({ bookmarks: [] });
  }

  try {
    const data = await getBookmarks(user.qf_access_token);
    return NextResponse.json({ bookmarks: data });
  } catch {
    return NextResponse.json({ bookmarks: [] });
  }
}

export async function POST(req: NextRequest) {
  const session = await getRequiredSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { verseKey } = await req.json();
  if (!verseKey) return NextResponse.json({ error: "verseKey required" }, { status: 400 });

  const db = createServerClient();
  const { data: user } = await db
    .from("users")
    .select("qf_access_token")
    .eq("id", session.userId)
    .single();

  if (!user?.qf_access_token) {
    return NextResponse.json({ error: "Not authenticated with QF" }, { status: 400 });
  }

  try {
    const result = await addBookmark(user.qf_access_token, verseKey);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
