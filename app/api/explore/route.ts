import { NextRequest, NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { searchVersesByQuery } from "@/lib/qf/semantic-search";

export async function GET(req: NextRequest) {
  const session = await getRequiredSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q || q.length < 2) return NextResponse.json({ results: [] });
  if (q.length > 200)
    return NextResponse.json({ error: "Query too long" }, { status: 400 });

  try {
    const results = await searchVersesByQuery(q);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
