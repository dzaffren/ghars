import crypto from "crypto";

const QF_OAUTH_BASE =
  process.env.QF_OAUTH_BASE ?? "https://oauth2.quran.foundation";
const QF_CLIENT_ID = process.env.QF_CLIENT_ID ?? "";
const QF_CLIENT_SECRET = process.env.QF_CLIENT_SECRET ?? "";

// Generate PKCE code verifier (43-128 random chars)
export function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url");
}

// Generate PKCE code challenge (S256)
export function generateCodeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

// Generate secure state parameter
export function generateState(): string {
  return crypto.randomBytes(16).toString("hex");
}

// Build QF authorize URL
export function buildAuthorizeUrl(params: {
  redirectUri: string;
  state: string;
  codeChallenge: string;
  scope?: string;
}): string {
  const url = new URL(`${QF_OAUTH_BASE}/oauth2/authorize`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", QF_CLIENT_ID);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("state", params.state);
  url.searchParams.set("code_challenge", params.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("scope", params.scope ?? "openid profile email");
  return url.toString();
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(params: {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  id_token?: string;
}> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: QF_CLIENT_ID,
    client_secret: QF_CLIENT_SECRET,
    code: params.code,
    redirect_uri: params.redirectUri,
    code_verifier: params.codeVerifier,
  });
  const res = await fetch(`${QF_OAUTH_BASE}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${text}`);
  }
  return res.json();
}

// Refresh access token
export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: QF_CLIENT_ID,
    client_secret: QF_CLIENT_SECRET,
    refresh_token: refreshToken,
  });
  const res = await fetch(`${QF_OAUTH_BASE}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`);
  return res.json();
}

// Get content API token via client_credentials
export async function getClientCredentialsToken(scope = "content"): Promise<{
  access_token: string;
  expires_in: number;
}> {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: QF_CLIENT_ID,
    client_secret: QF_CLIENT_SECRET,
    scope,
  });
  const res = await fetch(`${QF_OAUTH_BASE}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Client credentials failed: ${res.status}`);
  return res.json();
}
