import { test, expect, type Page } from "@playwright/test";

// Reflection Judge v2 — five-marker rubric UI tests.
//
// These tests run against a locally-running dev server (`pnpm dev`) with a
// real QF OAuth session cookie already established — they cannot be run
// from CI without the real test account, which is why playwright.config
// leaves the webServer slot empty.
//
// All `/api/reflection` traffic is mocked via `page.route()` so the tests
// are deterministic regardless of whether the ANTHROPIC_API_KEY is valid.
//
// Locator strategies used throughout:
//   • Marker rows:  page.locator('[data-testid="marker-row-<key>"]')
//     where <key> is one of: specific-moment, behavioral-change,
//     temporal-anchor, honest-friction, next-step
//   • Present/absent: await expect(row).toHaveAttribute('data-marker-present', 'true'|'false')
//   • Summary:      page.locator('[data-testid="marker-summary"]')
//   • Pending banner: page.locator('[data-testid="pending-banner"]')
//   • Submit button:  page.locator('[data-testid="reflection-submit"]')
//   • Textarea:       page.locator('[data-testid="reflection-textarea"]')

type MarkerKey =
  | "specific_moment"
  | "behavioral_change"
  | "temporal_anchor"
  | "honest_friction"
  | "next_step";

interface MarkerFixture {
  present: boolean;
  triggering_phrase?: string;
  coaching_prompt?: string;
}

function presentMarker(phrase: string): MarkerFixture {
  return { present: true, triggering_phrase: phrase };
}

function absentMarker(prompt: string): MarkerFixture {
  return { present: false, coaching_prompt: prompt };
}

function markerKey(k: MarkerKey): string {
  return k.replace(/_/g, "-");
}

async function mockScoredReflection(
  page: Page,
  markers: Record<MarkerKey, MarkerFixture>,
  opts?: {
    growthPoints?: number;
    currentStreak?: number;
    pointsEarned?: number;
  }
): Promise<void> {
  const markerCount = Object.values(markers).filter((m) => m.present).length;
  await page.route("**/api/reflection", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "scored",
        reflectionId: "r-e2e-scored",
        markerCount,
        markers,
        growthPoints: opts?.growthPoints ?? 10 + markerCount,
        pointsEarned: opts?.pointsEarned ?? Math.max(2, markerCount),
        currentStreak: opts?.currentStreak ?? 1,
      }),
    });
  });
}

async function gotoTodayAndSubmit(
  page: Page,
  reflection: string
): Promise<void> {
  await page.goto("/today");
  // If unauthenticated, the page redirects to "/". Let the test author
  // resolve auth separately; here we assume a session exists.
  const textarea = page.getByTestId("reflection-textarea");
  await expect(textarea).toBeVisible();
  await textarea.fill(reflection);
  await page.getByTestId("reflection-submit").click();
}

// ── Scenario 1: five markers hit the maximum ───────────────────────────

test.describe("Reflection judge v2 — five-marker rubric", () => {
  test("all-five-marker reflection shows every row as present", async ({
    page,
  }) => {
    const markers = {
      specific_moment: presentMarker(
        "At Maghrib my sister snapped at me about the dishes"
      ),
      behavioral_change: presentMarker(
        "I paused, said 'you're right, I forgot,' and did them"
      ),
      temporal_anchor: presentMarker("At Maghrib"),
      honest_friction: presentMarker("It felt hard not to defend myself"),
      next_step: presentMarker(
        "Tomorrow when she gets home from work I'll just do the dishes"
      ),
    } satisfies Record<MarkerKey, MarkerFixture>;

    await mockScoredReflection(page, markers);
    await gotoTodayAndSubmit(
      page,
      "At Maghrib my sister snapped at me about the dishes. I almost snapped back but I paused, said 'you're right, I forgot,' and did them. It felt hard not to defend myself. Tomorrow when she gets home from work I'll just do the dishes before she has to ask."
    );

    // Every row is present=true
    for (const key of Object.keys(markers) as MarkerKey[]) {
      const row = page.locator(`[data-testid="marker-row-${markerKey(key)}"]`);
      await expect(row).toBeVisible();
      await expect(row).toHaveAttribute("data-marker-present", "true");
    }

    // Summary line reads "5 of 5 markers present"
    const summary = page.locator('[data-testid="marker-summary"]');
    await expect(summary).toBeVisible();
    await expect(summary).toHaveText("5 of 5 markers present");

    // No numeric 1-to-5 grade visible anywhere on the page.
    const body = await page.locator("body").textContent();
    expect(body).not.toMatch(/\b[1-5]\s*\/\s*5\s*(depth|grade|score)\b/i);
  });

  // ── Scenario 2: three-marker reflection ──────────────────────────────

  test("three-marker reflection shows three present, two absent with coaching", async ({
    page,
  }) => {
    const markers = {
      specific_moment: presentMarker("At the standup Rachel cut me off twice"),
      behavioral_change: presentMarker(
        "I just waited and finished my sentence after she was done"
      ),
      temporal_anchor: presentMarker("Today at the standup"),
      honest_friction: absentMarker(
        "Next time, try naming what made it hard — the struggle counts"
      ),
      next_step: absentMarker(
        "Next time, try writing one small thing you'll do tomorrow"
      ),
    } satisfies Record<MarkerKey, MarkerFixture>;

    await mockScoredReflection(page, markers);
    await gotoTodayAndSubmit(
      page,
      "Today at the standup Rachel cut me off twice while I was explaining the migration plan. I felt my chest tighten but I just waited and finished my sentence after she was done."
    );

    for (const k of [
      "specific_moment",
      "behavioral_change",
      "temporal_anchor",
    ] as MarkerKey[]) {
      await expect(
        page.locator(`[data-testid="marker-row-${markerKey(k)}"]`)
      ).toHaveAttribute("data-marker-present", "true");
    }
    for (const k of ["honest_friction", "next_step"] as MarkerKey[]) {
      const row = page.locator(`[data-testid="marker-row-${markerKey(k)}"]`);
      await expect(row).toHaveAttribute("data-marker-present", "false");
      // The row contains the coaching prompt
      await expect(row).toContainText(/^.*Next time.*$/);
    }

    await expect(page.locator('[data-testid="marker-summary"]')).toHaveText(
      "3 of 5 markers present"
    );
  });

  // ── Scenario 3 + 4: zero markers still grows plant; coaching is encouraging ──

  test("zero-marker reflection shows all five absent with encouraging coaching", async ({
    page,
  }) => {
    const markers = {
      specific_moment: absentMarker(
        "Next time, try naming a moment from today"
      ),
      behavioral_change: absentMarker(
        "Next time, try naming something you did"
      ),
      temporal_anchor: absentMarker(
        "For tomorrow, ground your reflection in today"
      ),
      honest_friction: absentMarker("Next time, try naming what made it hard"),
      next_step: absentMarker(
        "Next time, name one small thing you'll do tomorrow"
      ),
    } satisfies Record<MarkerKey, MarkerFixture>;

    await mockScoredReflection(page, markers, { pointsEarned: 2 });
    await gotoTodayAndSubmit(
      page,
      "Patience is a virtue we should all practice."
    );

    // All five rows are absent
    for (const key of Object.keys(markers) as MarkerKey[]) {
      await expect(
        page.locator(`[data-testid="marker-row-${markerKey(key)}"]`)
      ).toHaveAttribute("data-marker-present", "false");
    }

    // Every coaching prompt starts with "Next time" or "For tomorrow"
    for (const key of Object.keys(markers) as MarkerKey[]) {
      const row = page.locator(`[data-testid="marker-row-${markerKey(key)}"]`);
      const text = (await row.textContent()) ?? "";
      expect(text).toMatch(/(Next time|For tomorrow)/);
    }

    // Summary reads zero — framed as count, not rejection.
    await expect(page.locator('[data-testid="marker-summary"]')).toHaveText(
      "0 of 5 markers present"
    );

    // No "Try again" / "Rejected" style language on the page.
    const body = await page.locator("body").textContent();
    expect(body).not.toMatch(/Try again/i);
    expect(body).not.toMatch(/rejected/i);
    expect(body).not.toMatch(/rewrite/i);
  });

  // ── Scenario 5: animation plays once ──────────────────────────────────

  test("after submission, all five rows are visible in sequence", async ({
    page,
  }) => {
    const markers = {
      specific_moment: presentMarker("at dinner tonight"),
      behavioral_change: presentMarker("I took a breath instead of snapping"),
      temporal_anchor: presentMarker("tonight"),
      honest_friction: absentMarker("Next time, name what made it hard"),
      next_step: absentMarker("For tomorrow, name one small thing"),
    } satisfies Record<MarkerKey, MarkerFixture>;

    await mockScoredReflection(page, markers);
    await gotoTodayAndSubmit(
      page,
      "My brother annoyed me at dinner tonight and I took a breath instead of snapping."
    );

    // The full reveal should be complete after the 0.15 * 5 + 0.3 ≈ 1.05s
    // window; we wait a generous 1500ms before asserting all five rows visible.
    await page.waitForTimeout(1500);
    for (const key of Object.keys(markers) as MarkerKey[]) {
      const row = page.locator(`[data-testid="marker-row-${markerKey(key)}"]`);
      await expect(row).toBeVisible();
    }
    await expect(page.locator('[data-testid="marker-summary"]')).toBeVisible();
  });

  // ── Scenario 11: one reflection per day ───────────────────────────────

  test("reflection form does not reappear after reload on same day", async ({
    page,
  }) => {
    const markers = {
      specific_moment: presentMarker("at dinner"),
      behavioral_change: presentMarker("I took a breath"),
      temporal_anchor: presentMarker("tonight"),
      honest_friction: absentMarker("Next time, name what made it hard"),
      next_step: absentMarker("For tomorrow, name one small thing"),
    } satisfies Record<MarkerKey, MarkerFixture>;

    await mockScoredReflection(page, markers);
    await gotoTodayAndSubmit(
      page,
      "My brother annoyed me at dinner tonight and I took a breath."
    );
    await expect(page.getByTestId("reflection-scored")).toBeVisible();

    // Reload: the server should render the already-completed branch. We
    // cannot assert the marker breakdown still shows (that depends on Task 5
    // wiring todaysMarkerBundle on the server side), but the form MUST NOT
    // reappear regardless.
    await page.reload();
    await expect(page.getByTestId("reflection-textarea")).toHaveCount(0);
    await expect(page.getByTestId("reflection-submit")).toHaveCount(0);
  });
});
