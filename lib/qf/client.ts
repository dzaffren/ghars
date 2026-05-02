const QF_CONTENT_BASE =
  process.env.QF_CONTENT_BASE ?? "https://api.quran.com/api/v4";
const QF_USER_BASE = process.env.QF_USER_BASE ?? "";
const QF_CLIENT_ID = process.env.QF_CLIENT_ID ?? "";

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

export async function qfContentFetch(path: string, revalidate = 86400) {
  const token = getContentTokenCached() ?? "";
  const res = await fetch(`${QF_CONTENT_BASE}${path}`, {
    headers: { "x-auth-token": token, "x-client-id": QF_CLIENT_ID },
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`QF content ${res.status}: ${path}`);
  return res.json();
}

export async function qfUserFetch(
  path: string,
  accessToken: string,
  options?: RequestInit
) {
  const res = await fetch(`${QF_USER_BASE}${path}`, {
    ...options,
    headers: {
      "x-auth-token": accessToken,
      "x-client-id": QF_CLIENT_ID,
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`QF user ${res.status}: ${path}`);
  return res.json();
}
