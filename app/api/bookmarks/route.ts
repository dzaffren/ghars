import { NextRequest, NextResponse } from "next/server";
import { logEvent } from "@/lib/log";
import { getRequiredSession } from "@/lib/auth/session";
import { addBookmark, getBookmarks } from "@/lib/qf/user-client";
import { getValidQfAccessToken } from "@/lib/auth/qf-oauth";

export async function GET() {
  const session = await getRequiredSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = await getValidQfAccessToken(session.userId!);
  if (!token) return NextResponse.json({ bookmarks: [] });

  try {
    const data = await getBookmarks(token);
    return NextResponse.json({ bookmarks: data });
  } catch {
    return NextResponse.json({ bookmarks: [] });
  }
}

export async function POST(req: NextRequest) {
  const session = await getRequiredSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { verseKey } = await req.json();
  if (!verseKey)
    return NextResponse.json({ error: "verseKey required" }, { status: 400 });

  const token = await getValidQfAccessToken(session.userId!);
  if (!token)
    return NextResponse.json(
      { error: "Not authenticated with QF" },
      { status: 400 }
    );

  try {
    const result = await addBookmark(token, verseKey);
    logEvent("bookmark_added", { userId: session.userId, verseKey, ok: true });
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error("[bookmarks POST]", String(err));
    return NextResponse.json({ ok: false, qfSyncPending: true });
  }
}
