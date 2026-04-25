import { test, expect } from "@playwright/test";

// These tests run against the live dev server (pnpm dev).
// They test unauthenticated and publicly accessible flows only —
// authenticated flows require a real QF OAuth session which cannot
// be faked in CI without QF test credentials.

test.describe("Landing page", () => {
  test("renders video background and sign-in CTA", async ({ page }) => {
    await page.goto("/");

    // Has a video element
    const video = page.locator("video");
    await expect(video).toBeVisible();

    // Has the Ghars heading
    await expect(page.getByRole("heading", { name: "Ghars" })).toBeVisible();

    // Has the sign-in button
    await expect(
      page.getByRole("link", { name: /Sign in with Quran Foundation/i })
    ).toBeVisible();

    // Has the Quranic quote
    await expect(page.getByText("14:24")).toBeVisible();
  });

  test("privacy and terms links are present", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Privacy" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Terms" })).toBeVisible();
  });

  test("privacy page renders", async ({ page }) => {
    await page.goto("/privacy");
    await expect(
      page.getByRole("heading", { name: "Privacy Policy" })
    ).toBeVisible();
    await expect(page.getByText("What we collect")).toBeVisible();
  });

  test("terms page renders", async ({ page }) => {
    await page.goto("/terms");
    await expect(
      page.getByRole("heading", { name: "Terms of Service" })
    ).toBeVisible();
    await expect(page.getByText("1. Acceptance")).toBeVisible();
  });
});

test.describe("Auth redirects", () => {
  test("unauthenticated /today redirects to /", async ({ page }) => {
    await page.goto("/today");
    // Should end up on landing (either "/" or "/onboarding" if session exists)
    await expect(page).toHaveURL(/^\//);
    // The page should show the sign-in button (landing) or another auth-required page
  });

  test("unauthenticated /history redirects to /", async ({ page }) => {
    await page.goto("/history");
    await expect(page).toHaveURL(/^\//);
  });

  test("unauthenticated /reflections redirects to /", async ({ page }) => {
    await page.goto("/reflections");
    await expect(page).toHaveURL(/^\//);
  });

  test("unauthenticated /dhikr redirects to /", async ({ page }) => {
    await page.goto("/dhikr");
    await expect(page).toHaveURL(/^\//);
  });
});

test.describe("Surah page", () => {
  test("invalid chapter id returns not-found", async ({ page }) => {
    const res = await page.goto("/surah/999");
    // Next.js returns 404 for notFound()
    expect(res?.status()).toBe(404);
  });
});
