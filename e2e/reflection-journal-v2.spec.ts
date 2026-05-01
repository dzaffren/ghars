import { test, expect } from "@playwright/test";

// Task 5 — journal list + detail render under the v2 marker rubric.
//
// These tests exercise authenticated flows. The existing test harness
// does NOT provide a mocked QF OAuth session (see e2e/landing.spec.ts
// for the constraint: "authenticated flows require a real QF OAuth
// session which cannot be faked in CI without QF test credentials").
//
// The tests below gracefully detect the redirect-to-landing case and
// mark themselves skipped rather than failing, so they remain green in
// CI but meaningfully assert when run locally against a seeded dev
// build. The spec test scenarios they correspond to are:
//   9.  Historical reflections are re-scored against the new rubric
//   13. Journal entry detail shows per-marker breakdown with my own words

async function requireAuthedSession(
  page: import("@playwright/test").Page
): Promise<boolean> {
  // Authed users see /reflections; unauthed sessions are server-redirected
  // to the landing page (confirmed by the auth redirects suite). Probe
  // the URL after navigation to decide whether to run the assertions.
  await page.goto("/reflections");
  const url = page.url();
  return !/\/(\?.*)?$/.test(url) || url.endsWith("/reflections");
}

test.describe("Reflection journal v2 — historical marker count", () => {
  test("every entry shows a marker count badge; no stars anywhere", async ({
    page,
  }) => {
    const authed = await requireAuthedSession(page);
    test.skip(!authed, "no authed session available in CI");

    // At least one journal-entry- element rendering a marker-count-badge
    const firstEntry = page.locator("[data-testid^='journal-entry-']").first();
    await expect(firstEntry).toBeVisible();

    const badge = firstEntry.locator("[data-testid='marker-count-badge']");
    await expect(badge).toHaveText(/\d of 5/);

    // No star glyphs should appear on the page — depth-star UI is retired.
    const pageText = await page.locator("body").innerText();
    expect(pageText).not.toContain("★");
  });
});

test.describe("Reflection journal v2 — detail breakdown", () => {
  test("detail page shows five marker rows with present flags", async ({
    page,
  }) => {
    const authed = await requireAuthedSession(page);
    test.skip(!authed, "no authed session available in CI");

    // Click the first journal entry to enter the detail view.
    const firstEntry = page.locator("[data-testid^='journal-entry-']").first();
    await firstEntry.click();

    // The detail view renders MarkerReveal (authored by Task 4). Its
    // rows carry data-testid="marker-row-*" and a data-marker-present
    // attribute on each row, plus a marker-summary element reading
    // "N of 5 markers present".
    const rows = page.locator("[data-testid^='marker-row-']");
    await expect(rows).toHaveCount(5);

    for (let i = 0; i < 5; i++) {
      const attr = await rows.nth(i).getAttribute("data-marker-present");
      expect(attr === "true" || attr === "false").toBeTruthy();
    }

    const summary = page.locator("[data-testid='marker-summary']");
    await expect(summary).toHaveText(/\d of 5 markers present/);
  });
});
