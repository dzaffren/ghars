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
- [app-route-middleware](convention-app-route-middleware.md) — All `(app)` routes require a `proxy.ts` auth guard; pages do not self-check sessions
- [nextjs-16-middleware-deprecated](blocker-nextjs-16-middleware-deprecated.md) — Next.js 16 replaced `middleware.ts` with `proxy.ts`; coexisting files crash the dev server
- [qf-tafsir-endpoint](blocker-qf-tafsir-endpoint.md) — Fetch per-ayah tafsir via `/tafsirs/{id}/by_ayah/{key}`, not `/quran/tafsirs/{id}?verse_key={key}`
- [qf-translation-id-131](blocker-qf-translation-id-131.md) — Translation id `131` does not exist on `api.quran.com/api/v4`; map legacy 131 to 20 (Saheeh International)
- [tafsir-html-sanitized](convention-tafsir-html-sanitized.md) — Tafsir text comes back as HTML and must be sanitized server-side with `isomorphic-dompurify` before rendering
- [reflection-single-submit](convention-reflection-single-submit.md) — One reflection per mission; POST must 409 if one exists and `/api/today` returns it for read-only render
- [qf-topics-public-api](blocker-qf-topics-public-api.md) — QF public content API does not expose `/topics`; endpoint exists only under OAuth-gated `apis.quran.foundation/content/api/v4` (shape unverified)
- [supabase-joined-scalars](convention-supabase-joined-scalars.md) — Supabase nested `.select` on one-to-one joins returns scalar objects, not arrays — normalise with a `first()` helper
- [framer-motion-svg-transforms](blocker-framer-motion-svg-transforms.md) — framer-motion scale/translate on SVG elements shifts position in viewBox — prefer opacity or native `pathLength`
- [corporate-proxy-anthropic](blocker-corporate-proxy-anthropic.md) — `api.anthropic.com` is blocked by user's corporate egress; LLM experiment scripts need a `--print-only` fallback
- [qf-reflect-gateway](blocker-qf-reflect-gateway.md) — QF community posts and scholar answers live on `apis.quran.foundation` with `post.read comment.read` scopes — use `qfReflectFetch`, not `qfContentFetch`
- [ts-fixture-complete-shapes](convention-ts-fixture-complete-shapes.md) — TypeScript test fixtures must include all required interface fields; partial shapes fail `tsc --noEmit`
