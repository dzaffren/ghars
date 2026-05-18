# Learnings Index

Per-repo learnings captured by the `/learn` skill. Each entry points to a
file in this directory. The active ruleset is synced into the repo's
`CLAUDE.md` under `## Learnings`.

- [admin-supabase-for-all-routes](convention-admin-supabase-for-all-routes.md) — All route handlers must use `createAdminSupabaseClient`, not `createServerSupabaseClient`
- [qf-content-base-url](blocker-qf-content-base-url.md) — QF Content APIs are served by `api.quran.com/api/v4`, not `apis.quran.foundation`
- [qf-token-auth-basic](blocker-qf-token-auth-basic.md) — QF OAuth2 token endpoint requires `client_secret_basic` (Authorization header), not `client_secret_post`
- [qf-authorize-path](blocker-qf-authorize-path.md) — QF OAuth2 authorize path is `/oauth2/auth`, not `/oauth2/authorize`
- [qf-translation-endpoint](blocker-qf-translation-endpoint.md) — Fetch translations via `/verses/by_key/{key}?translations={id}`, not `/quran/translations/{id}?verse_key={key}`
- [qf-user-api-base](blocker-qf-user-api-base.md) — QF User APIs base path is `{host}/auth/v1`, confirmed from user-apis-quickstart docs
- [playwright-demo-auth](pattern-playwright-demo-auth.md) — E2E tests must use `page.request.post` for demo login, not the fixture `request` object
- [app-route-middleware](convention-app-route-middleware.md) — All `(app)` routes require middleware auth guard; pages do not self-check sessions
- [qf-oauth-base-url](blocker-qf-oauth-base-url.md) — Production QF OAuth2 base URL is `https://auth.quran.com`, not `https://oauth2.quran.foundation`
