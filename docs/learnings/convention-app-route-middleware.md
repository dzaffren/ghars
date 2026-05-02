---
name: app-route-middleware
description: All (app) routes require a proxy.ts auth guard; pages do not self-check sessions
type: convention
captured: 2026-05-02
source: /learn, live debugging session
---

All pages under `app/(app)/` rely on `proxy.ts` (Next.js 16's successor to `middleware.ts`) for authentication. Pages themselves do not call `getSession()` or redirect on 401 — that is proxy.ts's job.

**Why:** Client components cannot reliably check session state server-side. Centralising the auth guard in proxy.ts ensures every `(app)` route is protected consistently, and avoids duplicated redirect logic across pages. Next.js 16 deprecated `middleware.ts` in favour of `proxy.ts` — having both causes a runtime error at dev-server startup.

**How to apply:** When adding a new page under `app/(app)/`, do NOT add session checks to the page component. Instead, verify the new path prefix is listed in `proxy.ts` `PROTECTED_PATHS` and in `config.matcher`. Never create `middleware.ts` — Next.js 16 rejects the coexistence of both files.
