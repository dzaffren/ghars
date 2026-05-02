---
name: nextjs-16-middleware-deprecated
description: Next.js 16 deprecated middleware.ts in favour of proxy.ts; having both files crashes the dev server
type: blocker
captured: 2026-05-02
source: /learn, live debugging session
---

In Next.js 16, the `middleware.ts` file convention is deprecated and replaced by `proxy.ts`. The API is nearly identical — export a function named `proxy` instead of the default export or a function named `middleware`, keep the same `config.matcher` shape.

**Why:** Next.js 16 refuses to start when both `middleware.ts` and `proxy.ts` exist in the project root — it throws `Error: Both middleware file "./middleware.ts" and proxy file "./proxy.ts" are detected. Please use "./proxy.ts" only.` This is a hard failure, not a warning.

**How to apply:**

- Never create `middleware.ts`. Always use `proxy.ts` at the project root.
- Export function must be named `proxy` (not `middleware`).
- Function signature and `NextRequest`/`NextResponse` imports are unchanged.
- `export const config = { matcher: [...] }` works the same as before.
- When reviewing an existing project for a Next.js 16 upgrade, delete any `middleware.ts` and rename its content into `proxy.ts`.

**What was tried:** Creating `middleware.ts` without realising `proxy.ts` already existed. The dev server started but threw an unhandled rejection on first request, and every authenticated route 500'd until the duplicate file was deleted.
