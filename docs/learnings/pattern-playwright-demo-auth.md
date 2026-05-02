---
name: playwright-demo-auth
description: E2E tests must use page.request.post for demo login, not the fixture request object
type: pattern
captured: 2026-05-02
source: /learn, live debugging session
---

In Playwright E2E tests, demo authentication must use `page.request.post("/api/demo/start")`, not the `request` fixture from the test function arguments. After the POST, navigate with `page.goto()` to pick up the session cookie.

**Why:** The Playwright `request` fixture has a separate cookie jar from the `page` browser context. A session cookie set via `request.post()` is not visible to `page.goto()`, so the app sees no session and routes render unauthenticated. `page.request` shares cookies with the page's browser context.

**How to apply:** Pattern for all authenticated E2E tests:

```typescript
async function loginAsDemo(page: Page, destination = "/grove") {
  const res = await page.request.post("/api/demo/start");
  expect(res.status()).toBe(200);
  await page.goto(destination);
}
```

Always import `Page` from `@playwright/test`, not `APIRequestContext`.
