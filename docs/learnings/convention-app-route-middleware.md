---
name: app-route-middleware
description: All (app) routes require middleware auth guard; pages do not self-check sessions
type: convention
captured: 2026-05-02
source: /learn, live debugging session
---

All pages under `app/(app)/` rely on `middleware.ts` for authentication. Pages themselves do not call `getSession()` or redirect on 401 — that is the middleware's job.

**Why:** Client components cannot reliably check session state server-side. Centralising the auth guard in middleware ensures every `(app)` route is protected consistently, and avoids duplicated redirect logic across pages.

**How to apply:** When adding a new page under `app/(app)/`, do NOT add session checks to the page component. Instead, verify that `middleware.ts` includes the new path prefix in `PROTECTED_PREFIXES`. Public routes (marketing, auth, API) are listed in `AUTH_PATHS` and are never redirected.
