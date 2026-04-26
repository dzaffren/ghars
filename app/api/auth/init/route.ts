import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { buildAuthUrl, generatePKCE, generateState } from "@/lib/auth/qf-oauth";

export async function GET() {
  const { verifier, challenge } = generatePKCE();
  const state = generateState();
  const nonce = generateState();

  const cookieStore = await cookies();
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 10,
    path: "/",
  };
  cookieStore.set("pkce_verifier", verifier, cookieOpts);
  cookieStore.set("oauth_state", state, cookieOpts);
  cookieStore.set("oidc_nonce", nonce, cookieOpts);

  const authUrl = buildAuthUrl(challenge, state, nonce);
  if (process.env.DEBUG_AUTH === "1") {
    return NextResponse.json({
      authUrl,
      redirect_uri: `${process.env.APP_URL}/callback`,
    });
  }
  return NextResponse.redirect(authUrl);
}
