---
name: corporate-proxy-anthropic
description: api.anthropic.com is blocked by the user's corporate egress — LLM experiment scripts need a --print-only fallback
type: blocker
captured: 2026-05-02
source: /learn (captured after the answered-reflection prompt experiment hit a 403 block)
---

The user's corporate network (Skyhigh Security proxy) blocks egress to
`api.anthropic.com` with a 403 and an HTML block page. Any server-side
code path that calls the Anthropic SDK will fail when run on this
machine, even with a valid `ANTHROPIC_API_KEY` set. The blocker is
network-level, not auth-level.

**Why:** The prompt experiment runner for the answered-reflection feature
(`scripts/try-answered-reflection.ts`) crashed mid-run with
`PermissionDeniedError: 403 <!DOCTYPE html>...Skyhigh Security...`.
Supabase queries worked fine; only Anthropic-bound traffic was blocked.
Requesting an IT allowlist entry was the long-term fix but would take
days — we needed to unblock the experiment the same day.

**How to apply:** Any experiment script or CLI tool in `scripts/` that
calls the Anthropic SDK should support a `--print-only` flag that:

1. Performs all the local work (data fetches from Supabase, prompt
   construction, etc.).
2. Prints the rendered system + user prompts to stdout in a format the
   user can paste into `claude.ai` or any other Claude client with
   browser access.
3. Skips the actual API call. The script exits successfully with
   instructions to paste responses back for scoring.

Implementation pattern in `scripts/try-answered-reflection.ts`:

- Parse `process.argv.includes("--print-only")` into a `PRINT_ONLY` flag.
- Guard the Anthropic client construction so it's `null` in print-only
  mode (avoids eager API-key validation).
- Branch the main loop on `PRINT_ONLY`: print the prompt blocks with a
  clear separator and skip `generateAnswer()`.

Server-side runtime code (API routes in `app/api/**`) does NOT need this
workaround — it will run in production where egress is unrestricted. The
workaround is for local developer scripts only.

**What was tried:**

- Running `npm run answered-reflection:experiment` without the flag →
  Skyhigh 403 block page returned as a stack trace from the Anthropic
  SDK.
- Considered running off-network (personal device, phone tether) — works
  but breaks the convenience loop.
- Considered requesting IT allowlist for `api.anthropic.com` — proper
  long-term fix, but takes days.
- Settled on `--print-only` — cheapest unblock, zero infra change, user
  can paste into `claude.ai` for manual scoring.
