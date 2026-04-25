import crypto from "crypto";
import { createServerClient } from "@/lib/supabase/server";

const QF_OAUTH_URL = process.env.QF_OAUTH_URL!;
const CLIENT_ID = process.env.QF_CLIENT_ID!;
const CLIENT_SECRET = process.env.QF_CLIENT_SECRET!;
const REDIRECT_URI = `${process.env.APP_URL}/callback`;

export const SCOPES = "openid offline_access";

// PKCE helpers
export function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64url");
  return { verifier, challenge };
}

export function generateState() {
  return crypto.randomBytes(16).toString("hex");
}

export function buildAuthUrl(challenge: string, state: string) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    nonce: crypto.randomBytes(16).toString("hex"),
  });
  return `${QF_OAUTH_URL}/oauth2/auth?${params}`;
}

const basicAuthHeader = () =>
  `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`;

export async function exchangeCodeForTokens(code: string, verifier: string) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier,
  });

  const res = await fetch(`${QF_OAUTH_URL}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: basicAuthHeader(),
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<QFTokenResponse>;
}

export async function refreshAccessToken(refreshToken: string) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch(`${QF_OAUTH_URL}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: basicAuthHeader(),
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<QFTokenResponse>;
}

// Returns a valid QF access token for a user, refreshing it first if it
// expires within 60 seconds. Call this instead of reading qf_access_token directly.
export async function getValidQfAccessToken(
  userId: string
): Promise<string | null> {
  const db = createServerClient();
  const { data: user } = await db
    .from("users")
    .select("qf_access_token, qf_refresh_token, qf_token_expires_at")
    .eq("id", userId)
    .single();

  if (!user?.qf_access_token) return null;

  const expiresAt = user.qf_token_expires_at
    ? new Date(user.qf_token_expires_at).getTime()
    : 0;
  const needsRefresh = expiresAt === 0 || Date.now() >= expiresAt - 60_000;

  if (!needsRefresh) return user.qf_access_token;
  if (!user.qf_refresh_token) return user.qf_access_token; // no refresh token, best-effort

  try {
    const tokens = await refreshAccessToken(user.qf_refresh_token);
    const newExpiresAt = new Date(
      Date.now() + tokens.expires_in * 1000
    ).toISOString();
    await db
      .from("users")
      .update({
        qf_access_token: tokens.access_token,
        qf_refresh_token: tokens.refresh_token,
        qf_token_expires_at: newExpiresAt,
      })
      .eq("id", userId);
    return tokens.access_token;
  } catch (err) {
    console.error("[getValidQfAccessToken] refresh failed:", err);
    return user.qf_access_token; // fall back to existing token on error
  }
}

export function decodeIdToken(idToken: string): QFIdTokenClaims {
  const [, payload] = idToken.split(".");
  const decoded = Buffer.from(payload, "base64url").toString("utf-8");
  return JSON.parse(decoded);
}

export interface QFTokenResponse {
  access_token: string;
  refresh_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  expires_at: string;
  scope: string;
}

export interface QFIdTokenClaims {
  sub: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  iss: string;
  aud: string | string[];
  exp: number;
  iat: number;
}
