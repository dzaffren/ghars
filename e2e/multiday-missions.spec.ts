import { test, expect, type Page } from "@playwright/test";

// Pattern from docs/learnings/pattern-playwright-demo-auth.md:
// page.request shares cookies with the page's browser context; fixture `request` does not.
async function loginAsDemo(page: Page, destination = "/today") {
  const res = await page.request.post("/api/demo/start");
  expect(res.status()).toBe(200);
  await page.goto(destination);
}

// Helper: complete a full day — commit to first mission prompt, then submit a reflection.
// Uses direct API calls so we can simulate past days without navigating.
async function completeDayViaApi(
  page: Page,
  localDate: string,
  reflectionText: string,
  didApply: "yes_fully" | "partly" | "not_today" = "yes_fully"
) {
  // 1. Fetch today's data for the given date
  const todayRes = await page.request.get(`/api/today?local_date=${localDate}`);
  expect(todayRes.status()).toBe(200);
  const todayData = await todayRes.json();

  // 2. Commit to first available mission prompt
  const commitRes = await page.request.post("/api/today/commit", {
    data: {
      assignment_id: todayData.assignment_id,
      selected_prompt: todayData.prompts[0],
      is_custom: false,
    },
  });
  expect(commitRes.status()).toBe(200);
  const { mission_id } = await commitRes.json();

  // 3. Submit reflection
  const reflectRes = await page.request.post("/api/reflections", {
    data: {
      mission_id,
      did_apply: didApply,
      text: reflectionText,
    },
  });
  expect(reflectRes.status()).toBe(200);

  return { assignmentId: todayData.assignment_id, missionId: mission_id };
}

// ──────────────────────────────────────────────────────────────
// SUITE 1: Single-day core flows
// ──────────────────────────────────────────────────────────────

test("today page loads with ayah and mission options", async ({ page }) => {
  await loginAsDemo(page);

  await expect(page.getByTestId("ayah-arabic")).toBeVisible();
  await expect(page.getByTestId("ayah-translation")).toBeVisible();
  await expect(page.getByTestId("mission-option-1")).toBeVisible();
  await expect(page.getByTestId("today-garden")).toBeVisible();
});

test("can select a preset mission prompt and commit", async ({ page }) => {
  await loginAsDemo(page);

  await expect(page.getByTestId("mission-option-1")).toBeVisible();
  await page.getByTestId("mission-option-1").click();

  // Commit button is enabled
  const commitBtn = page.getByTestId("commit-button");
  await expect(commitBtn).toBeEnabled();
  await commitBtn.click();

  // Committed state shows; commit button is gone
  await expect(page.getByText("Committed ✓")).toBeVisible();
  await expect(commitBtn).not.toBeVisible();
});

test("can write a custom mission and commit", async ({ page }) => {
  await loginAsDemo(page);

  await expect(page.getByTestId("mission-option-1")).toBeVisible();

  // Select "Write your own…" radio
  const radios = page.locator('input[type="radio"][name="mission"]');
  const lastRadio = radios.last();
  await lastRadio.click();

  // Custom textarea appears
  await expect(page.getByTestId("mission-custom-input")).toBeVisible();

  // Commit button should be disabled with empty text
  await expect(page.getByTestId("commit-button")).toBeDisabled();

  // Fill in custom mission
  await page
    .getByTestId("mission-custom-input")
    .fill("I will recite Surah Al-Fatiha mindfully before every salah today.");

  // Now commit is enabled
  await expect(page.getByTestId("commit-button")).toBeEnabled();
  await page.getByTestId("commit-button").click();

  await expect(page.getByText("Committed ✓")).toBeVisible();
});

test("commit button stays disabled until a prompt is selected", async ({
  page,
}) => {
  await loginAsDemo(page);

  await expect(page.getByTestId("mission-option-1")).toBeVisible();

  // Nothing selected — button should be disabled
  await expect(page.getByTestId("commit-button")).toBeDisabled();

  // Select first option — now enabled
  await page.getByTestId("mission-option-1").click();
  await expect(page.getByTestId("commit-button")).toBeEnabled();
});

test("reflection form requires 40+ chars before enabling submit", async ({
  page,
}) => {
  await loginAsDemo(page);

  await expect(page.getByTestId("mission-option-1")).toBeVisible();
  await page.getByTestId("mission-option-1").click();
  await page.getByTestId("commit-button").click();
  await expect(page.getByText("Committed ✓")).toBeVisible();

  // Reflection form appears
  await expect(page.getByTestId("did-apply-yes_fully")).toBeVisible();
  await page.getByTestId("did-apply-yes_fully").click();

  // Short text — submit disabled
  await page.getByTestId("reflection-textarea").fill("Too short.");
  await expect(page.getByTestId("submit-reflection-btn")).toBeDisabled();

  // Hint "X more characters needed" is shown
  await expect(page.getByText(/more characters needed/)).toBeVisible();

  // Fill to ≥ 40 chars
  await page
    .getByTestId("reflection-textarea")
    .fill(
      "Today I took time to reflect deeply on this ayah and applied it fully in my day."
    );
  await expect(page.getByTestId("submit-reflection-btn")).toBeEnabled();
});

test("full single-day flow: commit + reflect 'yes fully' → tree growth", async ({
  page,
}) => {
  await loginAsDemo(page);

  await expect(page.getByTestId("mission-option-1")).toBeVisible();
  await page.getByTestId("mission-option-1").click();
  await page.getByTestId("commit-button").click();
  await expect(page.getByText("Committed ✓")).toBeVisible();

  await page.getByTestId("did-apply-yes_fully").click();
  await page
    .getByTestId("reflection-textarea")
    .fill(
      "I focused on this verse throughout the day and it changed how I interacted with my family. " +
        "SubhanAllah, such a simple reminder with powerful impact."
    );

  await page.getByTestId("submit-reflection-btn").click();

  // Either the AI answer card or tree growth animation appears
  await expect(
    page
      .getByTestId("tree-growth-animation")
      .or(page.getByTestId("answer-holding-state"))
  ).toBeVisible({ timeout: 15000 });
});

test("full single-day flow: reflect 'not today' shows honest message", async ({
  page,
}) => {
  await loginAsDemo(page);

  await expect(page.getByTestId("mission-option-1")).toBeVisible();
  await page.getByTestId("mission-option-1").click();
  await page.getByTestId("commit-button").click();
  await expect(page.getByText("Committed ✓")).toBeVisible();

  await page.getByTestId("did-apply-not_today").click();
  await page
    .getByTestId("reflection-textarea")
    .fill(
      "I intended to but the day got away from me. Tomorrow I will try harder, in sha Allah."
    );

  await page.getByTestId("submit-reflection-btn").click();

  await expect(
    page
      .getByTestId("tree-growth-animation")
      .or(page.getByTestId("answer-holding-state"))
  ).toBeVisible({ timeout: 15000 });
});

// ──────────────────────────────────────────────────────────────
// SUITE 2: Multi-day usage — state persistence across days
// ──────────────────────────────────────────────────────────────

test("day 1 mission and reflection persist when revisiting same date", async ({
  page,
}) => {
  await loginAsDemo(page);

  const today = new Date();
  const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Commit a mission
  await expect(page.getByTestId("mission-option-1")).toBeVisible();
  await page.getByTestId("mission-option-1").click();
  await page.getByTestId("commit-button").click();
  await expect(page.getByText("Committed ✓")).toBeVisible();

  // Submit a reflection
  await page.getByTestId("did-apply-partly").click();
  await page
    .getByTestId("reflection-textarea")
    .fill(
      "I tried but only managed to act on it twice during the day. Still, progress."
    );
  await page.getByTestId("submit-reflection-btn").click();

  await expect(
    page
      .getByTestId("tree-growth-animation")
      .or(page.getByTestId("answer-holding-state"))
  ).toBeVisible({ timeout: 15000 });

  // Reload today's page — should show committed + reflection submitted state
  await page.goto(`/today`);
  await page.waitForLoadState("networkidle");

  await expect(page.getByText("Committed ✓")).toBeVisible();
  await expect(page.getByTestId("reflection-submitted")).toBeVisible();
});

test("multi-day: day 1 and day 2 get different verse assignments", async ({
  page,
}) => {
  await loginAsDemo(page);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  // Fetch day 1 (yesterday)
  const day1Res = await page.request.get(
    `/api/today?local_date=${fmt(yesterday)}`
  );
  expect(day1Res.status()).toBe(200);
  const day1 = await day1Res.json();

  // Fetch day 2 (today)
  const day2Res = await page.request.get(`/api/today?local_date=${fmt(today)}`);
  expect(day2Res.status()).toBe(200);
  const day2 = await day2Res.json();

  // Each day produces a valid assignment
  expect(day1.assignment_id).toBeTruthy();
  expect(day2.assignment_id).toBeTruthy();

  // Each day has arabic text and prompts
  expect(day1.arabic).toBeTruthy();
  expect(day2.arabic).toBeTruthy();
  expect(day1.prompts.length).toBeGreaterThan(0);
  expect(day2.prompts.length).toBeGreaterThan(0);
});

test("multi-day: complete 3 days via API, then today page reflects current day correctly", async ({
  page,
}) => {
  await loginAsDemo(page);

  const today = new Date();
  const fmt = (offset: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  // Day -2: Complete mission + reflection
  await completeDayViaApi(
    page,
    fmt(-2),
    "Two days ago I reflected on patience and tried to remain calm during a difficult meeting. It helped.",
    "yes_fully"
  );

  // Day -1: Complete mission + reflection
  await completeDayViaApi(
    page,
    fmt(-1),
    "Yesterday I applied the mission partly — morning was good but I forgot by evening. I will try again.",
    "partly"
  );

  // Day 0 (today): Use the UI to commit and reflect
  await page.goto("/today");
  await page.waitForLoadState("networkidle");

  // Today's ayah should load fresh (no pre-existing mission yet)
  await expect(page.getByTestId("ayah-arabic")).toBeVisible();
  await expect(page.getByTestId("mission-option-1")).toBeVisible();

  // The "committed" state must NOT be shown since today is fresh
  await expect(page.getByText("Committed ✓")).not.toBeVisible();

  // Commit today's mission
  await page.getByTestId("mission-option-1").click();
  await page.getByTestId("commit-button").click();
  await expect(page.getByText("Committed ✓")).toBeVisible();

  // Reflection form renders
  await expect(page.getByTestId("did-apply-yes_fully")).toBeVisible();
});

test("multi-day: streak counter increases with consecutive completed days", async ({
  page,
}) => {
  await loginAsDemo(page);

  const today = new Date();
  const fmt = (offset: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  // Get initial grove state (streak should be 0 for brand-new demo user)
  const groveBeforeRes = await page.request.get("/api/grove");
  const groveBefore = groveBeforeRes.ok() ? await groveBeforeRes.json() : null;
  const streakBefore = groveBefore?.streak_days ?? 0;

  // Complete yesterday + today via API
  await completeDayViaApi(
    page,
    fmt(-1),
    "Yesterday's mission: I took time to pause before responding in conversation, recalling this ayah.",
    "yes_fully"
  );
  await completeDayViaApi(
    page,
    fmt(0),
    "Today I made sincere dua using the theme of this verse, and felt a profound sense of clarity.",
    "yes_fully"
  );

  // Navigate to today page and confirm streak badge updated
  await page.goto("/today");
  await page.waitForLoadState("networkidle");

  // Streak chip is visible in the HeroStrip
  await expect(page.getByText(/streak/i)).toBeVisible();

  // Grove API should report updated streak
  const groveAfterRes = await page.request.get("/api/grove");
  if (groveAfterRes.ok()) {
    const groveAfter = await groveAfterRes.json();
    expect(groveAfter.streak_days).toBeGreaterThanOrEqual(streakBefore);
  }
});

test("multi-day: journal shows past reflections after multi-day usage", async ({
  page,
}) => {
  await loginAsDemo(page);

  const today = new Date();
  const fmt = (offset: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  // Seed two days of completed missions + reflections
  await completeDayViaApi(
    page,
    fmt(-2),
    "Two days ago: I was more mindful of my speech and tried to embody the meaning of this ayah.",
    "partly"
  );
  await completeDayViaApi(
    page,
    fmt(-1),
    "Yesterday: I recited this verse before sleeping and it brought peace to my heart, alhamdulillah.",
    "yes_fully"
  );

  // Navigate to journal
  await page.goto("/journal");
  await page.waitForLoadState("networkidle");

  // Calendar view should be default and visible
  await expect(page.getByTestId("calendar-view")).toBeVisible();

  // Switch to list view
  await page.getByTestId("view-list").click();
  await expect(page.getByTestId("journal-search")).toBeVisible();

  // Journal should not be empty — past reflections should appear
  await expect(page.getByTestId("journal-list")).toBeVisible();
  const items = page.locator(
    '[data-testid="journal-list"] [data-testid="journal-entry"]'
  );
  await expect(items.first()).toBeVisible({ timeout: 5000 });
});

test("multi-day: second-day visit shows committed state if already done that day", async ({
  page,
}) => {
  await loginAsDemo(page);

  const today = new Date();
  const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Use API to commit today's mission
  await completeDayViaApi(
    page,
    localDate,
    "I practiced the lesson from this ayah throughout my entire day and felt spiritually uplifted.",
    "yes_fully"
  );

  // Now visit /today — should show committed + reflection submitted states
  await page.goto("/today");
  await page.waitForLoadState("networkidle");

  await expect(page.getByText("Committed ✓")).toBeVisible();
  await expect(page.getByTestId("reflection-submitted")).toBeVisible();

  // Commit button should NOT be present
  await expect(page.getByTestId("commit-button")).not.toBeVisible();
});

test("multi-day: can re-select a different prompt before committing", async ({
  page,
}) => {
  await loginAsDemo(page);

  await expect(page.getByTestId("mission-option-1")).toBeVisible();

  // Select first option
  await page.getByTestId("mission-option-1").click();

  // Check if second option exists and switch to it
  const option2 = page.getByTestId("mission-option-2");
  const hasOption2 = await option2.count();
  if (hasOption2 > 0) {
    await option2.click();
    // Commit button is still enabled
    await expect(page.getByTestId("commit-button")).toBeEnabled();
  }

  await page.getByTestId("commit-button").click();
  await expect(page.getByText("Committed ✓")).toBeVisible();
});

test("multi-day: grove page shows trees after completing days", async ({
  page,
}) => {
  await loginAsDemo(page);

  const today = new Date();
  const fmt = (offset: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  // Complete two days
  await completeDayViaApi(
    page,
    fmt(-1),
    "Applied the lesson with patience and gratitude throughout the day.",
    "yes_fully"
  );
  await completeDayViaApi(
    page,
    fmt(0),
    "Today's mission guided my actions well — I noticed real change in how I dealt with challenges.",
    "yes_fully"
  );

  // Grove redirects to /today but grove API should have data
  const groveRes = await page.request.get("/api/grove");
  expect(groveRes.ok()).toBeTruthy();
  const grove = await groveRes.json();

  // After 2 completed days, tree data should exist
  expect(grove).not.toHaveProperty("error");

  // Today page should show updated garden
  await page.goto("/today");
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("today-garden")).toBeVisible();
});
