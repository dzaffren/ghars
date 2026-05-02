---
name: qf-token-auth-basic
description: QF OAuth2 token endpoint requires client_secret_basic (Authorization header), not client_secret_post
type: blocker
captured: 2026-05-02
source: /learn, live debugging session
---

The QF OAuth2 token endpoint (`/oauth2/token`) requires `client_secret_basic` authentication — credentials must be sent in the `Authorization: Basic base64(client_id:client_secret)` header. Sending `client_id` and `client_secret` in the POST body (`client_secret_post`) returns `401 invalid_client`.

**Why:** The QF OAuth2 server is configured to only accept `client_secret_basic`. This is confirmed by the error message: "The OAuth 2.0 Client supports client authentication method 'client_secret_basic', but method 'client_secret_post' was requested."

**How to apply:** In `lib/qf/oauth.ts`, all three token functions (`exchangeCodeForTokens`, `refreshAccessToken`, `getClientCredentialsToken`) must set `Authorization: Basic ${Buffer.from(client_id + ':' + client_secret).toString('base64')}` and must NOT include `client_id` or `client_secret` in the POST body.

**What was tried:** Passing `client_id` and `client_secret` as URLSearchParams body fields — returned 401 on every token exchange attempt.
