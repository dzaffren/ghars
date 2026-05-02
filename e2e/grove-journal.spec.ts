import { test, expect, type Page } from "@playwright/test";

async function loginAsDemo(page: Page, destination = "/today") {
  const res = await page.request.post("/api/demo/start");
  expect(res.status()).toBe(200);
  await page.goto(destination);
}

test("/grove redirects to /today", async ({ page }) => {
  await loginAsDemo(page, "/grove");
  await page.waitForURL(/\/today$/);
  expect(page.url()).toMatch(/\/today$/);
});

test("journal defaults to calendar view and can switch to list", async ({
  page,
}) => {
  await loginAsDemo(page, "/journal");

  // Calendar is the default
  await expect(page.getByTestId("calendar-view")).toBeVisible();
  await expect(page.getByTestId("calendar-month-label")).toBeVisible();
  await expect(page.getByTestId("calendar-legend")).toBeVisible();

  // Switch to list preserves search + filter
  await page.getByTestId("view-list").click();
  await expect(page.getByTestId("journal-search")).toBeVisible();
  await expect(page.getByTestId("filter-all")).toBeVisible();
  await expect(page.getByTestId("filter-bookmarked")).toBeVisible();
  await expect(
    page.getByTestId("journal-list").or(page.getByTestId("journal-empty"))
  ).toBeVisible();
});
