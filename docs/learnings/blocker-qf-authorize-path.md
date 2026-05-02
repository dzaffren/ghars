---
name: qf-authorize-path
description: QF OAuth2 authorize path is /oauth2/auth, not /oauth2/authorize
type: blocker
captured: 2026-05-02
source: /learn, live debugging session
---

The QF OAuth2 authorization endpoint is `/oauth2/auth` (not `/oauth2/authorize`). Using `/oauth2/authorize` returns a 404 page from the QF auth server.

**Why:** Confirmed from the QF OAuth2 API documentation quickstart example URL. The path segment is `auth`, not `authorize`.

**How to apply:** In `lib/qf/oauth.ts` `buildAuthorizeUrl`, the URL must be `${QF_OAUTH_BASE}/oauth2/auth`. Do not use `/authorize`.

**What was tried:** `/oauth2/authorize` — 404 from the QF auth server on every sign-in attempt.
