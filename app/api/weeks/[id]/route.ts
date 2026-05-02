import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getWeekDetail } from "@/lib/db/weeks";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session)
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED" } },
      { status: 401 }
    );
  const { id } = await params;
  const detail = await getWeekDetail(session.userId, parseInt(id));
  if (!detail)
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Week not found" } },
      { status: 404 }
    );
  return NextResponse.json(detail);
}
