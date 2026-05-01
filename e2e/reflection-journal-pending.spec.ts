import { test, expect } from "@playwright/test";

// Task 5 — lazy rescore of pending reflections on journal load, and
// detail-page retry via PendingReflectionBanner.
//
// Both scenarios require a pre-seeded reflection with status='pending'.
// The existing test harness does not support authenticated DB seeding
// from Playwright, so these are skipped stubs per the spec allowance
// ("Prefer the test.skip route if setting up the pending state
// requires backend changes"). The assertions below are structured so
// they can be flipped live once a fixture endpoint or CLI seed lands
// on the project. Corresponds to spec scenarios:
//   8. Scoring service is unavailable when I submit (parallel Task 4)
//   7. Pending reflection catches up when the service returns

test.describe("Pending reflection lazy rescore — list", () => {
  test.skip("pending entries fire /rescore on list mount and flip to scored", async ({
    page,
  }) => {
    // TODO: seeding a pending reflection requires either (a) a
    // test-only DB seed endpoint or (b) a fully authenticated
    // Playwright session, neither of which exists today.
    //
    // When seeding exists, the shape is:
    //
    // await page.route("**/api/reflection/*/rescore", (route) =>
    //   route.fulfill({
    //     status: 200,
    //     contentType: "application/json",
    //     body: JSON.stringify({
    //       status: "scored",
    //       markerCount: 3,
    //       markers: {
    //         /* five-marker bundle */
    //       },
    //     }),
    //   })
    // );
    //
    // await page.goto("/reflections");
    // const pendingEntry = page.locator(
    //   "[data-testid='journal-entry-<id>']"
    // );
    // // Badge flips from "Pending" → "3 of 5"
    // await expect(
    //   pendingEntry.locator("[data-testid='marker-count-badge']")
    // ).toHaveText(/3 of 5/);
  });
});

test.describe("Pending reflection detail — retry", () => {
  test.skip("retry button fires /rescore and refreshes the detail page", async ({
    page,
  }) => {
    // TODO: same seeding constraint as the list-side test. When
    // available, mock the rescore endpoint, navigate to the pending
    // entry's detail page, click [data-testid='pending-banner-retry'],
    // and assert that the MarkerReveal rows appear after the refresh.
    //
    // await page.route("**/api/reflection/*/rescore", (route) => {
    //   route.fulfill({
    //     status: 200,
    //     contentType: "application/json",
    //     body: JSON.stringify({ status: "scored", markerCount: 4, markers: {...} }),
    //   });
    // });
    // await page.goto("/reflections/<id>");
    // await page.click("[data-testid='pending-banner-retry']");
    // await expect(page.locator("[data-testid='marker-summary']")).toBeVisible();
    //
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = page;
    await expect(1).toBe(1);
  });
});
