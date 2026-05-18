@AGENTS.md

## Learnings

- **Admin Supabase for all routes** — All `app/api/` and `lib/db/` code must use `createAdminSupabaseClient()`, never `createServerSupabaseClient()`. See `docs/learnings/convention-admin-supabase-for-all-routes.md`.
- **QF Content base URL** — Content APIs (verses, translations, tafsir, audio) use `https://api.quran.com/api/v4`, not `apis.quran.foundation`. See `docs/learnings/blocker-qf-content-base-url.md`.
- **QF token auth method** — All QF token requests must use `Authorization: Basic` header (`client_secret_basic`), never body params. See `docs/learnings/blocker-qf-token-auth-basic.md`.
- **QF authorize path** — QF OAuth2 authorize endpoint is `/oauth2/auth`, not `/oauth2/authorize`. See `docs/learnings/blocker-qf-authorize-path.md`.
- **QF translation endpoint** — Fetch single-verse translations via `/verses/by_key/{key}?translations={id}`, not `/quran/translations/{id}?verse_key={key}`. See `docs/learnings/blocker-qf-translation-endpoint.md`.
- **QF User API base** — User APIs (bookmarks, notes, streaks etc.) base path is `{host}/auth/v1`. See `docs/learnings/blocker-qf-user-api-base.md`.
- **Playwright demo auth** — E2E tests must use `page.request.post()` for demo login, not the `request` fixture. See `docs/learnings/pattern-playwright-demo-auth.md`.
- **App route middleware** — Pages under `app/(app)/` rely on `middleware.ts` for auth; do not add session checks to page components. See `docs/learnings/convention-app-route-middleware.md`.
- **QF OAuth base URL** — Production QF OAuth2 base URL is `https://auth.quran.com`, not `https://oauth2.quran.foundation`. See `docs/learnings/blocker-qf-oauth-base-url.md`.
