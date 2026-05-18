---
name: qf-oauth-base-url
description: Production QF OAuth2 base URL is https://auth.quran.com, not https://oauth2.quran.foundation
type: blocker
captured: 2026-05-18
source: live debugging session
---

The production QF OAuth2 server base URL is `https://oauth2.quran.foundation`. The error redirect lands on `https://auth.quran.com/oauth-error` because `auth.quran.com` is the QF UI host, but the OAuth2 API base remains `https://oauth2.quran.foundation`.

**Why:** Confirmed by QF support. The `/oauth2/auth` and `/oauth2/token` endpoints are served at `oauth2.quran.foundation`.

**How to apply:** Set `QF_OAUTH_BASE=https://oauth2.quran.foundation` in Vercel. The default in `lib/qf/oauth.ts` is `https://oauth2.quran.foundation`.

**What was tried:** `https://oauth2.quran.foundation` — returns `invalid_client` for all production client IDs.
