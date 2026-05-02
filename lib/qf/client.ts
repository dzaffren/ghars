import { logQfError, captureResponseError } from "./errors";

const QF_CONTENT_BASE =
  process.env.QF_CONTENT_BASE ?? "https://api.quran.com/api/v4";
const QF_USER_BASE =
  process.env.QF_USER_BASE ?? "https://apis.quran.foundation/auth/v1";
// Quran Reflect gateway — community posts and scholar answers
const QF_REFLECT_BASE =
  process.env.QF_REFLECT_BASE ?? "https://apis.quran.foundation";
const QF_CLIENT_ID = process.env.QF_CLIENT_ID ?? "";
const QF_CLIENT_SECRET = process.env.QF_CLIENT_SECRET ?? "";
const QF_TIMEOUT_MS = 10_000;

let _contentToken: string | null = null;
let _contentTokenExpiry = 0;

export function setContentToken(token: string, expiresInSeconds: number) {
  _contentToken = token;
  _contentTokenExpiry = Date.now() + expiresInSeconds * 1000;
}

export function getContentTokenCached(): string | null {
  return _contentToken && Date.now() < _contentTokenExpiry - 60_000
    ? _contentToken
    : null;
}

async function ensureContentToken(): Promise<string> {
  const cached = getContentTokenCached();
  if (cached) return cached;
  const { getClientCredentialsToken } = await import("./oauth");
  const { access_token, expires_in } = await getClientCredentialsToken();
  setContentToken(access_token, expires_in);
  return access_token;
}

export async function qfContentFetch(path: string, revalidate = 86400) {
  const token = await ensureContentToken();
  const res = await fetch(`${QF_CONTENT_BASE}${path}`, {
    headers: { "x-auth-token": token, "x-client-id": QF_CLIENT_ID },
    next: { revalidate },
    signal: AbortSignal.timeout(QF_TIMEOUT_MS),
  });
  if (!res.ok) {
    const { status, body } = await captureResponseError(res);
    await logQfError({ endpoint: path, status, body });
    throw new Error(`QF content ${status}: ${path}`);
  }
  return res.json();
}

let _reflectToken: string | null = null;
let _reflectTokenExpiry = 0;

export function setReflectToken(token: string, expiresInSeconds: number) {
  _reflectToken = token;
  _reflectTokenExpiry = Date.now() + expiresInSeconds * 1000;
}

export function getReflectTokenCached(): string | null {
  return _reflectToken && Date.now() < _reflectTokenExpiry - 60_000
    ? _reflectToken
    : null;
}

async function ensureReflectToken(): Promise<string> {
  const cached = getReflectTokenCached();
  if (cached) return cached;
  const { getClientCredentialsToken } = await import("./oauth");
  const { access_token, expires_in } =
    await getClientCredentialsToken("post.read");
  setReflectToken(access_token, expires_in);
  return access_token;
}

export async function qfReflectFetch(path: string, revalidate = 3600) {
  const token = await ensureReflectToken();
  const res = await fetch(`${QF_REFLECT_BASE}${path}`, {
    headers: { "x-auth-token": token, "x-client-id": QF_CLIENT_ID },
    next: { revalidate },
    signal: AbortSignal.timeout(QF_TIMEOUT_MS),
  });
  if (!res.ok) {
    const { status, body } = await captureResponseError(res);
    await logQfError({ endpoint: path, status, body });
    throw new Error(`QF reflect ${status}: ${path}`);
  }
  return res.json();
}

export interface QfUserFetchOptions extends RequestInit {
  userId?: string | null;
  payload?: unknown;
}

export async function qfUserFetch(
  path: string,
  accessToken: string,
  options?: QfUserFetchOptions
) {
  const { userId, payload, ...init } = options ?? {};
  const res = await fetch(`${QF_USER_BASE}${path}`, {
    ...init,
    headers: {
      "x-auth-token": accessToken,
      "x-client-id": QF_CLIENT_ID,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    signal: AbortSignal.timeout(QF_TIMEOUT_MS),
  });
  if (!res.ok) {
    const { status, body } = await captureResponseError(res);
    await logQfError({ userId, endpoint: path, status, body, payload });
    throw new Error(`QF user ${status}: ${path}`);
  }
  return res.json();
}
