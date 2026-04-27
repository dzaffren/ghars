# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: explore.spec.ts >> Surah page chapter validation >> non-numeric chapter id returns 404
- Location: e2e/explore.spec.ts:23:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 404
Received: 200
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - img "Ghars logo" [ref=e6]
        - heading "Ghars" [level=1] [ref=e7]
        - paragraph [ref=e8]: غَرْس
        - paragraph [ref=e9]: One verse. One mission. Every day.
      - generic [ref=e10]:
        - link "Sign in with Quran Foundation" [ref=e11] [cursor=pointer]:
          - /url: /api/auth/init
        - paragraph [ref=e12]: Uses your Quran.com account · No new password needed
      - paragraph [ref=e13]: “A good word is like a good tree — its roots are firm and its branches reach the sky.” — 14:24
      - paragraph [ref=e14]:
        - link "Privacy" [ref=e15] [cursor=pointer]:
          - /url: /privacy
        - link "Terms" [ref=e16] [cursor=pointer]:
          - /url: /terms
  - button "Open Next.js Dev Tools" [ref=e22] [cursor=pointer]:
    - img [ref=e23]
  - alert [ref=e26]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | // These tests cover unauthenticated redirects for /explore and
  4  | // the chapter-id validation logic on /surah/[chapterId].
  5  | 
  6  | test.describe("Explore page auth", () => {
  7  |   test("unauthenticated /explore redirects to landing", async ({ page }) => {
  8  |     await page.goto("/explore");
  9  |     // Unauth users land on "/" (landing); confirm by a landing-only element.
  10 |     await expect(page).toHaveURL(/\/(\?.*)?$/);
  11 |     await expect(
  12 |       page.getByRole("link", { name: /Sign in with Quran Foundation/i })
  13 |     ).toBeVisible();
  14 |   });
  15 | });
  16 | 
  17 | test.describe("Surah page chapter validation", () => {
  18 |   test("chapter id > 114 returns 404", async ({ page }) => {
  19 |     const res = await page.goto("/surah/999");
  20 |     expect(res?.status()).toBe(404);
  21 |   });
  22 | 
  23 |   test("non-numeric chapter id returns 404", async ({ page }) => {
  24 |     const res = await page.goto("/surah/abc");
> 25 |     expect(res?.status()).toBe(404);
     |                           ^ Error: expect(received).toBe(expected) // Object.is equality
  26 |   });
  27 | 
  28 |   test("literal 'NaN' chapter id returns 404", async ({ page }) => {
  29 |     const res = await page.goto("/surah/NaN");
  30 |     expect(res?.status()).toBe(404);
  31 |   });
  32 | 
  33 |   test("chapter id 0 returns 404", async ({ page }) => {
  34 |     const res = await page.goto("/surah/0");
  35 |     expect(res?.status()).toBe(404);
  36 |   });
  37 | });
  38 | 
```