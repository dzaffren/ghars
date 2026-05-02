@AGENTS.md

## Learnings

- **Admin Supabase for all routes** — All `app/api/` and `lib/db/` code must use `createAdminSupabaseClient()`, never `createServerSupabaseClient()`. See `docs/learnings/convention-admin-supabase-for-all-routes.md`.
- **QF Content base URL** — Content APIs (verses, translations, tafsir, audio) use `https://api.quran.com/api/v4`, not `apis.quran.foundation`. See `docs/learnings/blocker-qf-content-base-url.md`.
- **QF token auth method** — All QF token requests must use `Authorization: Basic` header (`client_secret_basic`), never body params. See `docs/learnings/blocker-qf-token-auth-basic.md`.
- **QF authorize path** — QF OAuth2 authorize endpoint is `/oauth2/auth`, not `/oauth2/authorize`. See `docs/learnings/blocker-qf-authorize-path.md`.
- **QF translation endpoint** — Fetch single-verse translations via `/verses/by_key/{key}?translations={id}`, not `/quran/translations/{id}?verse_key={key}`. See `docs/learnings/blocker-qf-translation-endpoint.md`.
- **QF User API base** — User APIs (bookmarks, notes, streaks etc.) base path is `{host}/auth/v1`. See `docs/learnings/blocker-qf-user-api-base.md`.
- **Playwright demo auth** — E2E tests must use `page.request.post()` for demo login, not the `request` fixture. See `docs/learnings/pattern-playwright-demo-auth.md`.
- **App route proxy** — Pages under `app/(app)/` rely on `proxy.ts` (Next.js 16 replacement for middleware.ts) for auth; do not add session checks to page components, and never create `middleware.ts`. See `docs/learnings/convention-app-route-middleware.md`.
- **QF tafsir endpoint** — Fetch per-ayah tafsir via `/tafsirs/{id}/by_ayah/{key}`; the `/quran/tafsirs/{id}?verse_key={key}` form returns an empty array with 200. See `docs/learnings/blocker-qf-tafsir-endpoint.md`.
- **QF translation id 131** — Legacy id `131` does not exist on `api.quran.com/api/v4`; map it to `20` (Saheeh International) in `getTranslation`. See `docs/learnings/blocker-qf-translation-id-131.md`.
- **Tafsir HTML sanitized** — Tafsir responses contain HTML; sanitize server-side with `isomorphic-dompurify` before returning, and render via `dangerouslySetInnerHTML` with the `.tafsir-prose` styles. See `docs/learnings/convention-tafsir-html-sanitized.md`.
- **One reflection per mission** — `POST /api/reflections` must 409 if one exists; `/api/today` returns the existing reflection so `ReflectView` renders read-only. See `docs/learnings/convention-reflection-single-submit.md`.
- **Supabase joined scalars** — Nested `.select()` on one-to-one joins returns scalar objects, not arrays. Always normalise with a `first()` helper before access. See `docs/learnings/convention-supabase-joined-scalars.md`.
- **SVG animation: opacity or pathLength** — Do NOT apply framer-motion `scale`/`translate` transforms directly to `motion.ellipse`/`path`/`circle`/`g` — they shift position in the viewBox. Prefer `opacity`, native `pathLength`, or CSS transforms on a wrapping HTML `<div>`. See `docs/learnings/blocker-framer-motion-svg-transforms.md`.
- **QF Reflect gateway** — Community posts and scholar answers use `qfReflectFetch` (host `apis.quran.foundation`, scopes `post.read comment.read`), not `qfContentFetch`. Use the wrappers in `lib/qf/reflect.ts`. See `docs/learnings/blocker-qf-reflect-gateway.md`.
- **TypeScript test fixture shapes** — Test fixtures for typed interfaces must include ALL required fields, not just the ones under assertion — partial shapes fail `tsc --noEmit`. See `docs/learnings/convention-ts-fixture-complete-shapes.md`.
