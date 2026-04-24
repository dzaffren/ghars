import crypto from "crypto";

const QF_OAUTH_URL = process.env.QF_OAUTH_URL!;
const CLIENT_ID = process.env.QF_CLIENT_ID!;
const CLIENT_SECRET = process.env.QF_CLIENT_SECRET!;
const REDIRECT_URI = `${process.env.APP_URL}/api/auth/callback`;

export const SCOPES = "openid offline_access user collection";

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

export async function exchangeCodeForTokens(code: string, verifier: string) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const res = await fetch(`${QF_OAUTH_URL}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
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
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const res = await fetch(`${QF_OAUTH_URL}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<QFTokenResponse>;
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
