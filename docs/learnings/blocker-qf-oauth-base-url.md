---
name: qf-oauth-base-url
description: Production QF OAuth2 base URL is https://auth.quran.com, not https://oauth2.quran.foundation
type: blocker
captured: 2026-05-18
source: live debugging session
---

The production QF OAuth2 server base URL is `https://auth.quran.com`. The URL `https://oauth2.quran.foundation` does not host the OAuth2 endpoints for production clients — using it returns `invalid_client` / "The requested OAuth 2.0 Client does not exist" even with a valid client ID.

**Why:** Confirmed by inspecting the error redirect URL from QF: `https://auth.quran.com/oauth-error?error=invalid_client&...`. The auth server is at `auth.quran.com`.

**How to apply:** Set `QF_OAUTH_BASE=https://auth.quran.com` in Vercel (production). The default in `lib/qf/oauth.ts` is now `https://auth.quran.com`. Do not use `https://oauth2.quran.foundation`.

**What was tried:** `https://oauth2.quran.foundation` — returns `invalid_client` for all production client IDs.
