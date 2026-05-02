import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/session";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST() {
  await deleteSession();
  return NextResponse.redirect(`${APP_URL}/`);
}
