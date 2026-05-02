import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getDayView } from "@/lib/db/grove";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Session required" } },
      { status: 401 }
    );
  }
  const { date } = await params;
  const data = await getDayView(session.userId, date);
  if (!data) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "No data for this date" } },
      { status: 404 }
    );
  }
  return NextResponse.json(data);
}
