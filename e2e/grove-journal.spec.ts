import { test, expect, type Page } from "@playwright/test";

async function loginAsDemo(page: Page, destination = "/grove") {
  const res = await page.request.post("/api/demo/start");
  expect(res.status()).toBe(200);
  await page.goto(destination);
}

test("user can see their grove home screen", async ({ page }) => {
  await loginAsDemo(page);

  // Month count and today-status are always rendered for authenticated users
  await expect(page.getByTestId("month-count")).toBeVisible();
  await expect(page.getByTestId("today-status")).toBeVisible();

  // Wait for async fetch — either grove canvas or empty state appears
  await expect(
    page.getByTestId("grove-canvas").or(page.getByTestId("empty-grove"))
  ).toBeVisible();
});

test("user can browse their reflection journal", async ({ page }) => {
  await loginAsDemo(page, "/journal");

  // Journal search is always rendered
  await expect(page.getByTestId("journal-search")).toBeVisible();

  // Filter buttons exist
  await expect(page.getByTestId("filter-all")).toBeVisible();
  await expect(page.getByTestId("filter-bookmarked")).toBeVisible();

  // Wait for async fetch to settle — either empty state or entry list appears
  await expect(
    page.getByTestId("journal-list").or(page.getByTestId("journal-empty"))
  ).toBeVisible();
});
