import { test, expect } from "@playwright/test";

// Circles routes: /circles requires auth (server redirect),
// /circles/join is a client page reachable without a session
// (the join API itself still requires auth, which we don't test here).

test.describe("Circles auth redirects", () => {
  test("unauthenticated /circles redirects to landing", async ({ page }) => {
    await page.goto("/circles");
    await expect(page).toHaveURL(/\/(\?.*)?$/);
    await expect(
      page.getByRole("link", { name: /Sign in with Quran Foundation/i })
    ).toBeVisible();
  });
});

test.describe("Circles join page", () => {
  test("renders the 6-character invite code form", async ({ page }) => {
    await page.goto("/circles/join");
    await expect(
      page.getByRole("heading", { name: "Join a circle" })
    ).toBeVisible();
    // Input has placeholder "ABCDE6" and maxlength 6
    const input = page.getByPlaceholder("ABCDE6");
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute("maxlength", "6");

    // The join button is disabled until the code is 6 characters
    const button = page.getByRole("button", { name: /Join circle/i });
    await expect(button).toBeDisabled();
  });

  test("uppercases input and clamps to 6 characters", async ({ page }) => {
    await page.goto("/circles/join");
    const input = page.getByPlaceholder("ABCDE6");
    // Typing more than 6 chars should be truncated; lowercase → uppercase
    await input.fill("abcdefghij");
    await expect(input).toHaveValue("ABCDEF");

    const button = page.getByRole("button", { name: /Join circle/i });
    await expect(button).toBeEnabled();
  });

  test("button stays disabled for codes shorter than 6", async ({ page }) => {
    await page.goto("/circles/join");
    const input = page.getByPlaceholder("ABCDE6");
    await input.fill("ABC");

    const button = page.getByRole("button", { name: /Join circle/i });
    await expect(button).toBeDisabled();
  });
});
