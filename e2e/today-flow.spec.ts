import { test, expect, type Page } from "@playwright/test";

// Use page.request so the session cookie is shared with the page's browser context
async function loginAsDemo(page: Page, destination = "/today") {
  const res = await page.request.post("/api/demo/start");
  expect(res.status()).toBe(200);
  await page.goto(destination);
}

test("user can read today's ayah and commit to a mission", async ({ page }) => {
  await loginAsDemo(page);

  // Ayah card is visible with Arabic text and translation
  await expect(page.getByTestId("ayah-arabic")).toBeVisible();
  await expect(page.getByTestId("ayah-translation")).toBeVisible();

  // At least one mission option is rendered
  await expect(page.getByTestId("mission-option-1")).toBeVisible();

  // Select first mission and commit
  await page.getByTestId("mission-option-1").click();
  await page.getByTestId("commit-button").click();

  // After commit the button disappears and "Committed ✓" appears
  await expect(page.getByText("Committed ✓")).toBeVisible();
  await expect(page.getByTestId("commit-button")).not.toBeVisible();
});

test("user can submit an evening reflection after committing", async ({
  page,
}) => {
  await loginAsDemo(page);

  // Commit mission first
  await expect(page.getByTestId("mission-option-1")).toBeVisible();
  await page.getByTestId("mission-option-1").click();
  await page.getByTestId("commit-button").click();
  await expect(page.getByText("Committed ✓")).toBeVisible();

  // Reflection form appears
  await expect(page.getByTestId("did-apply-yes_fully")).toBeVisible();

  // Fill in reflection
  await page.getByTestId("did-apply-yes_fully").click();
  await page
    .getByTestId("reflection-textarea")
    .fill(
      "Today I took time to read and reflect on the meaning of this ayah. " +
        "It reminded me to stay consistent in my efforts and trust in Allah."
    );

  // Submit
  await page.getByTestId("submit-reflection-btn").click();

  // Tree growth animation confirms submission
  await expect(page.getByTestId("tree-growth-animation")).toBeVisible();
});
