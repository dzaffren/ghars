import { createAdminSupabaseClient } from "../supabase/server";

const MAX_BODY_LEN = 1024;

// Keys in request payloads that carry secrets and must be redacted before logging
const REDACT_KEYS = new Set([
  "access_token",
  "refresh_token",
  "id_token",
  "client_secret",
  "authorization",
  "x-auth-token",
  "x-client-id",
]);

function truncate(s: string, max = MAX_BODY_LEN): string {
  if (s.length <= max) return s;
  return s.slice(0, max) + "…[truncated]";
}

function scrub(value: unknown): unknown {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(scrub);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (REDACT_KEYS.has(k.toLowerCase())) {
      out[k] = "[REDACTED]";
    } else {
      out[k] = scrub(v);
    }
  }
  return out;
}

export interface LogQfErrorParams {
  userId?: string | null;
  endpoint: string;
  status?: number;
  body?: string;
  payload?: unknown;
  retryCount?: number;
}

/**
 * Persist a QF API failure to the qf_api_errors table so downstream retry workers
 * and post-mortems can see what went wrong. Never logs secrets. Never throws —
 * logging failures are swallowed (there is nowhere useful to send them).
 */
export async function logQfError(params: LogQfErrorParams): Promise<void> {
  try {
    const supabase = createAdminSupabaseClient();
    await supabase.from("qf_api_errors").insert({
      user_id: params.userId ?? null,
      endpoint: params.endpoint,
      status_code: params.status ?? null,
      error_message: params.body ? truncate(params.body) : null,
      payload: params.payload ? scrub(params.payload) : null,
      retry_count: params.retryCount ?? 0,
    });
  } catch {
    // Logger must never throw.
  }
}

/**
 * True when a QF HTTP status is safe to retry (transient).
 * Callers can use this to decide whether to re-attempt vs. fail out.
 */
export function isRetryable(status: number | undefined): boolean {
  if (status === undefined) return true; // network/timeout
  if (status === 429) return true;
  if (status >= 500 && status < 600) return true;
  return false;
}

/**
 * Shape of a QF HTTP failure extracted from a fetch Response.
 * Use `captureResponseError` to build one before passing to `logQfError`.
 */
export interface QfFailure {
  status: number;
  body: string;
}

export async function captureResponseError(res: Response): Promise<QfFailure> {
  let body = "";
  try {
    body = await res.text();
  } catch {
    body = "";
  }
  return { status: res.status, body };
}
