import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  buildAuthorizeUrl,
} from "@/lib/qf/oauth";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function GET() {
  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);
  const state = generateState();
  const redirectUri = `${APP_URL}/api/auth/callback`;

  const authorizeUrl = buildAuthorizeUrl({
    redirectUri,
    state,
    codeChallenge: challenge,
  });

  const cookieStore = await cookies();
  cookieStore.set("pkce_verifier", verifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });
  cookieStore.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return NextResponse.redirect(authorizeUrl);
}
