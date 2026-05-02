import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getGroveData } from "@/lib/db/grove";

export async function GET(_request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Session required" } },
      { status: 401 }
    );
  }
  const grove = await getGroveData(session.userId);
  return NextResponse.json(grove);
}
