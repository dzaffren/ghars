import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { listJournal } from "@/lib/db/journal";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const sp = request.nextUrl.searchParams;
  const page = parseInt(sp.get("page") ?? "1");
  const pageSize = parseInt(sp.get("page_size") ?? "25");
  const filterBookmarked = sp.get("filter") === "bookmarked";
  const query = sp.get("q") ?? undefined;

  const result = await listJournal({
    userId: session.userId,
    page,
    pageSize,
    filterBookmarked,
    query,
  });
  return NextResponse.json(result);
}
