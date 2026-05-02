import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getCalendarMarks } from "@/lib/db/journal";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Session required" } },
      { status: 401 }
    );
  }

  const sp = request.nextUrl.searchParams;
  const from = sp.get("from");
  const to = sp.get("to");
  if (!from || !to) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_RANGE",
          message: "from and to are required (YYYY-MM-DD)",
        },
      },
      { status: 400 }
    );
  }

  const marks = await getCalendarMarks({
    userId: session.userId,
    fromDate: from,
    toDate: to,
  });
  return NextResponse.json({ marks });
}
