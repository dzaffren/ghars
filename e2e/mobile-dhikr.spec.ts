import { test, expect } from "@playwright/test";

// These specs are meant to run only under the "Mobile Safari" (iPhone 13)
// Playwright project. Since Playwright runs every spec against every
// project by default, we guard with test.skip on other projects.
//
// To run only the mobile project explicitly:
//   npx playwright test e2e/mobile-dhikr.spec.ts --project="Mobile Safari"

test.describe("Mobile dhikr + landing", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      testInfo.project.name !== "Mobile Safari",
      "Mobile-only test suite"
    );
  });

  test("unauthenticated /dhikr redirects to landing on iPhone 13", async ({
    page,
  }) => {
    await page.goto("/dhikr");
    // Server redirect to "/" — landing's sign-in CTA should be visible
    await expect(page).toHaveURL(/\/(\?.*)?$/);
    await expect(
      page.getByRole("link", { name: /Sign in with Quran Foundation/i })
    ).toBeVisible();
  });

  test("landing page renders on iPhone 13 viewport", async ({ page }) => {
    await page.goto("/");

    // Core landing elements are present
    await expect(page.locator("video")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ghars" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Sign in with Quran Foundation/i })
    ).toBeVisible();
  });

  test("landing page is not horizontally scrollable on mobile", async ({
    page,
  }) => {
    await page.goto("/");
    // Wait for the page to settle
    await page.waitForLoadState("networkidle");

    // Verify body/document does not exceed the viewport width.
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return {
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
      };
    });
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
  });
});
