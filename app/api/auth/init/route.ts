import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { buildAuthUrl, generatePKCE, generateState } from "@/lib/auth/qf-oauth";

export async function GET() {
  const { verifier, challenge } = generatePKCE();
  const state = generateState();

  const cookieStore = await cookies();
  cookieStore.set("pkce_verifier", verifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });
  cookieStore.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });

  const authUrl = buildAuthUrl(challenge, state);
  if (process.env.DEBUG_AUTH === "1") {
    return NextResponse.json({
      authUrl,
      redirect_uri: `${process.env.APP_URL}/callback`,
    });
  }
  return NextResponse.redirect(authUrl);
}
