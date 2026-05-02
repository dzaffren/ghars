import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ ok: true, app: "ghars", version: "0.1.0" });
}
