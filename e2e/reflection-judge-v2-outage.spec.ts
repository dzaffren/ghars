import { test, expect, type Page } from "@playwright/test";

// Reflection judge v2 — outage path.
//
// This suite covers the "scoring service unavailable" branch: the API
// responds with `{ status: 'pending', pendingMessage, growthPoints,
// pointsEarned: 2, currentStreak }` instead of a marker bundle. The UI
// must:
//   • Show the neutral pending banner with the fixed spec copy.
//   • NOT render any `marker-row-*` elements (markers are not yet scored).
//   • Still let the plant grow (the form disappears — meaning the garden
//     state was updated — and the success block renders).
//
// Like the sibling spec, this file assumes the dev server is running and
// the browser has a valid QF OAuth cookie. All /api/reflection traffic is
// mocked via page.route().
//
// Locator strategies:
//   • Pending banner: page.locator('[data-testid="pending-banner"]')
//   • Marker rows:    page.locator('[data-testid^="marker-row-"]') — should
//                     have count 0 during outage
//   • Textarea:       page.getByTestId('reflection-textarea')

const PENDING_MESSAGE =
  "5 markers pending — we'll score this when we're back online";

async function mockPendingReflection(page: Page): Promise<void> {
  await page.route("**/api/reflection", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "pending",
        reflectionId: "r-e2e-pending",
        pendingMessage: PENDING_MESSAGE,
        growthPoints: 12,
        pointsEarned: 2,
        currentStreak: 1,
      }),
    });
  });
}

test.describe("Reflection judge v2 — outage fallback", () => {
  test("pending response shows the neutral banner and no marker rows", async ({
    page,
  }) => {
    await mockPendingReflection(page);
    await page.goto("/today");

    const textarea = page.getByTestId("reflection-textarea");
    await expect(textarea).toBeVisible();
    await textarea.fill(
      "At Asr I snapped at my son for no reason and apologized ten minutes later. Tomorrow I'll try to breathe before I speak when I'm tired."
    );
    await page.getByTestId("reflection-submit").click();

    // The pending banner appears with the exact spec copy.
    const banner = page.locator('[data-testid="pending-banner"]');
    await expect(banner).toBeVisible();
    await expect(banner).toHaveText(PENDING_MESSAGE);

    // No marker rows render — there's nothing to score yet.
    await expect(page.locator('[data-testid^="marker-row-"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="marker-summary"]')).toHaveCount(0);

    // The form collapses — the user is not asked to rewrite or resubmit.
    await expect(page.getByTestId("reflection-textarea")).toHaveCount(0);
    await expect(page.getByTestId("reflection-submit")).toHaveCount(0);
  });
});
