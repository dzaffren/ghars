// Structured logger — outputs JSON lines captured by Vercel Functions log.
// Each line is independently parseable for filtering in the Vercel dashboard.
export function logEvent(event: string, payload?: Record<string, unknown>) {
  console.log(
    JSON.stringify({ ts: new Date().toISOString(), event, ...payload })
  );
}
