import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { listWeeks } from "@/lib/db/weeks";

export async function GET() {
  const session = await getSession();
  if (!session)
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED" } },
      { status: 401 }
    );
  const weeks = await listWeeks(session.userId);
  return NextResponse.json({ weeks });
}
