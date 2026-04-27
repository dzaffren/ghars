# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing.spec.ts >> Auth redirects >> unauthenticated /reflections redirects to /
- Location: e2e/landing.spec.ts:64:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /^\//
Received string:  "http://localhost:3000/"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    2 × unexpected value "http://localhost:3000/reflections"
    7 × unexpected value "http://localhost:3000/"

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
  3  | // These tests run against the live dev server (pnpm dev).
  4  | // They test unauthenticated and publicly accessible flows only —
  5  | // authenticated flows require a real QF OAuth session which cannot
  6  | // be faked in CI without QF test credentials.
  7  | 
  8  | test.describe("Landing page", () => {
  9  |   test("renders video background and sign-in CTA", async ({ page }) => {
  10 |     await page.goto("/");
  11 | 
  12 |     // Has a video element
  13 |     const video = page.locator("video");
  14 |     await expect(video).toBeVisible();
  15 | 
  16 |     // Has the Ghars heading
  17 |     await expect(page.getByRole("heading", { name: "Ghars" })).toBeVisible();
  18 | 
  19 |     // Has the sign-in button
  20 |     await expect(
  21 |       page.getByRole("link", { name: /Sign in with Quran Foundation/i })
  22 |     ).toBeVisible();
  23 | 
  24 |     // Has the Quranic quote
  25 |     await expect(page.getByText("14:24")).toBeVisible();
  26 |   });
  27 | 
  28 |   test("privacy and terms links are present", async ({ page }) => {
  29 |     await page.goto("/");
  30 |     await expect(page.getByRole("link", { name: "Privacy" })).toBeVisible();
  31 |     await expect(page.getByRole("link", { name: "Terms" })).toBeVisible();
  32 |   });
  33 | 
  34 |   test("privacy page renders", async ({ page }) => {
  35 |     await page.goto("/privacy");
  36 |     await expect(
  37 |       page.getByRole("heading", { name: "Privacy Policy" })
  38 |     ).toBeVisible();
  39 |     await expect(page.getByText("What we collect")).toBeVisible();
  40 |   });
  41 | 
  42 |   test("terms page renders", async ({ page }) => {
  43 |     await page.goto("/terms");
  44 |     await expect(
  45 |       page.getByRole("heading", { name: "Terms of Service" })
  46 |     ).toBeVisible();
  47 |     await expect(page.getByText("1. Acceptance")).toBeVisible();
  48 |   });
  49 | });
  50 | 
  51 | test.describe("Auth redirects", () => {
  52 |   test("unauthenticated /today redirects to /", async ({ page }) => {
  53 |     await page.goto("/today");
  54 |     // Should end up on landing (either "/" or "/onboarding" if session exists)
  55 |     await expect(page).toHaveURL(/^\//);
  56 |     // The page should show the sign-in button (landing) or another auth-required page
  57 |   });
  58 | 
  59 |   test("unauthenticated /history redirects to /", async ({ page }) => {
  60 |     await page.goto("/history");
  61 |     await expect(page).toHaveURL(/^\//);
  62 |   });
  63 | 
  64 |   test("unauthenticated /reflections redirects to /", async ({ page }) => {
  65 |     await page.goto("/reflections");
> 66 |     await expect(page).toHaveURL(/^\//);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  67 |   });
  68 | 
  69 |   test("unauthenticated /dhikr redirects to /", async ({ page }) => {
  70 |     await page.goto("/dhikr");
  71 |     await expect(page).toHaveURL(/^\//);
  72 |   });
  73 | });
  74 | 
  75 | test.describe("Surah page", () => {
  76 |   test("invalid chapter id returns not-found", async ({ page }) => {
  77 |     const res = await page.goto("/surah/999");
  78 |     // Next.js returns 404 for notFound()
  79 |     expect(res?.status()).toBe(404);
  80 |   });
  81 | });
  82 | 
```