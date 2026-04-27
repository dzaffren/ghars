import { test, expect } from "@playwright/test";

// These tests cover unauthenticated redirects for /explore and
// the chapter-id validation logic on /surah/[chapterId].

test.describe("Explore page auth", () => {
  test("unauthenticated /explore redirects to landing", async ({ page }) => {
    await page.goto("/explore");
    // Unauth users land on "/" (landing); confirm by a landing-only element.
    await expect(page).toHaveURL(/\/(\?.*)?$/);
    await expect(
      page.getByRole("link", { name: /Sign in with Quran Foundation/i })
    ).toBeVisible();
  });
});

test.describe("Surah page chapter validation", () => {
  test("chapter id > 114 returns 404", async ({ page }) => {
    const res = await page.goto("/surah/999");
    expect(res?.status()).toBe(404);
  });

  test("non-numeric chapter id returns 404", async ({ page }) => {
    const res = await page.goto("/surah/abc");
    expect(res?.status()).toBe(404);
  });

  test("literal 'NaN' chapter id returns 404", async ({ page }) => {
    const res = await page.goto("/surah/NaN");
    expect(res?.status()).toBe(404);
  });

  test("chapter id 0 returns 404", async ({ page }) => {
    const res = await page.goto("/surah/0");
    expect(res?.status()).toBe(404);
  });
});
