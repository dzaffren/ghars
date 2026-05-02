# Grove Home Screen & Cumulative View

**Ticket:** TBD
**Discovery Brief:** `docs/discovery/quran-ayah-apply/brief.md`
**Epic Overview:** `docs/specs/TBD-quran-ayah-apply/spec.md`

The home screen a returning user lands on after their first day. It visualises the user's accumulated reflections as a grove of trees — one tree per completed reflection — and surfaces a cumulative "ayat reflected on this month" count as the lead metric. Today's status sits at the top so the user always knows where they are in the daily loop, and the streak is shown small and gentle so that meaningful cumulative engagement is what the user sees first, not consecutive-day anxiety.

## User Story

As a practising Muslim who has started using the app, I want to open the home screen and see my growing grove of reflected-upon ayat alongside a quiet monthly count, so that I feel the cumulative spiritual weight of what I have done — not the pressure of an unbroken streak.

## Background & Context

**Current state:**

- After completing their first evening reflection, the user has a single tree to their name and no screen that shows the bigger picture.
- The daily loop (morning ayah, evening reflection) gives the user a sense of today, but no sense of _across time_.
- Streak-based habit apps commonly put a prominent streak counter at the top of the home screen, which pushes users toward streak-farming behaviour and punishes a single missed day.

**Problem:**

- Without a cumulative landing screen, the user has no felt sense of "I have reflected on 14 ayat this month" — the thing the product is actually trying to build.
- If streak is the hero metric, users will optimise for it (shallow reflections, panic on a missed day) rather than for honest depth.
- Judges arriving at the app for the first time need to see the cumulative value of the loop in seconds, without having used the app for a week.

## Target User & Persona

- **Who:** A practising, non-Arabic-speaking Muslim who has signed up, completed onboarding, and has at least one day of use behind them. They also include first-time returning users on day one and judges evaluating the app in demo mode.
- **Context:** They open the app outside of the morning or evening notification windows — checking in on their own progress, or landing on the home screen between the two daily touches.
- **Current workaround:** Today, similar apps show a large streak number and a list of past entries. Users either feel pride in a long streak or shame at a broken one; neither response is aligned with how the product wants them to relate to the Quran.

## Goals

- Make the cumulative value of the user's practice visible in the first second of every app open.
- Frame the streak as gentle secondary information, not a hero metric.
- Let the user revisit any past day's ayah and reflection in one tap from the grove.
- Give a first-day user a hopeful, populated-feeling home screen even before their first tree exists.
- Give a judge in demo mode an immediate visual sense of what a week of use looks like.

## Non-Goals

- Full journal browsing, search, and filtering of reflections (handled in the Bookmarks & reflection journal story).
- The day-7 weekly summary experience (handled in the Weekly grove review story).
- Today's ayah reading, mission commit, and evening reflection flows themselves (handled in the Morning loop and Evening reflection stories).
- Editing past reflections or backfilling missed days (explicitly disallowed by the shared "no backfill" rule).

## User Workflow

1. **Open the app outside a notification touch** — The user taps the app icon or a notification takeaway and lands on the home screen.
2. **See today's status at the top** — A single line tells them exactly where they are in today's loop: the ayah is waiting, the evening reflection is waiting, or today's tree is planted.
3. **See the grove** — Below the status, a scrollable canvas of trees represents every completed reflection to date. Gaps and withered saplings honestly show missed days.
4. **See the cumulative count** — Below the grove, a quiet line reads "You've reflected on 14 ayat this month" (calendar-month basis — see Business Rules).
5. **See the streak** — Below the cumulative count, a small line reads "3-day streak" with a gentle sprout icon. Never above the grove.
6. **Tap any tree** — The user taps a past tree and is taken to a read-only view of that day's ayah and their reflection. Tapping back returns them to the grove in the same scroll position.
7. **Tap today's status** — If today's ayah is still waiting, tapping the status takes them into the morning ayah screen. If the evening reflection is waiting, it takes them into the evening reflection screen. If today's tree is planted, tapping does nothing (or shows a confirming affirmation).

## Acceptance Criteria

### Scenario: Brand-new user opens the home screen on day one before committing

```gherkin
Given Ahmad signed up for the first time this morning
  And he has not yet committed to today's mission
  And he has no completed reflections
When Ahmad opens the app and lands on the home screen
Then he sees today's status reading "Today's ayah is waiting"
  And he sees an empty grove area with a gentle placeholder reading "Your first tree will appear tonight"
  And he sees a cumulative line reading "You've reflected on 0 ayat this month"
  And he sees no streak line, or a line reading "Starting today"
```

### Scenario: First-day user scrolls the empty grove and sees a preview

```gherkin
Given Ahmad is on the home screen on day one with no completed reflections
When Ahmad scrolls the grove area
Then he sees a faded preview sketch of what his grove will look like after seven days
  And the preview is visually distinct from real trees so he understands none of it is his yet
```

### Scenario: User has committed this morning but not yet reflected this evening

```gherkin
Given Aisha has committed to today's mission on Surah Al-Hujurat ayah 12
  And she has not yet submitted her evening reflection
  And she has 4 completed trees from previous days
When Aisha opens the app at 3pm and lands on the home screen
Then she sees today's status reading "Come back this evening"
  And the grove shows her 4 existing trees unchanged
  And the cumulative line reads "You've reflected on 4 ayat this month"
  And the streak line reads "4-day streak"
```

### Scenario: User completes evening reflection and returns to home

```gherkin
Given Aisha has 4 completed trees before today
  And she has just submitted a qualifying evening reflection for today
When the app returns her to the home screen
Then she sees a brief animation of a new tree appearing in the grove
  And the grove now shows 5 trees
  And the cumulative line reads "You've reflected on 5 ayat this month"
  And today's status reads "Today's tree is planted"
  And the streak line reads "5-day streak"
```

### Scenario: Returning user on day 8 sees a full first-week grove

```gherkin
Given Yusuf completed a qualifying reflection on each of the previous 7 days
  And today is his 8th day and he has not yet committed
When Yusuf opens the home screen
Then he sees today's status reading "Today's ayah is waiting"
  And the grove shows exactly 7 trees in the order the reflections were completed
  And the cumulative line reads "You've reflected on 7 ayat this month"
  And the streak line reads "7-day streak"
```

### Scenario: A single missed day within the weekly free-pass window is forgiven

```gherkin
Given Fatima completed reflections on Monday, Wednesday, Thursday, Friday, Saturday, and Sunday of this week
  And she did not open the app at all on Tuesday
  And no other day has been missed in the rolling 7-day window
When Fatima opens the home screen on Monday of the following week
Then the grove shows 6 trees and a visible gap where Tuesday would have been
  And the streak line reads "6-day streak" without resetting to zero
  And today's status reflects her current state in the daily loop
```

### Scenario: A second missed day in the same week breaks the streak cleanly

```gherkin
Given Fatima already missed Tuesday this week and the free pass has been used
  And she does not open the app at all on Thursday
When Fatima opens the home screen on Friday
Then the grove shows 4 trees with two visible gaps for Tuesday and Thursday
  And the streak line reads "Starting fresh" or "0-day streak"
  And no previously completed tree has been removed or hidden
```

### Scenario: "Not today" reflections appear in the grove as a distinct but equal form

```gherkin
Given Imran committed to a mission and honestly reported "Not today" with a qualifying reflection of at least 40 characters
  And he has 3 "Yes, fully" trees and 1 "Partly" tree from earlier in the week
When Imran lands on the home screen after submitting
Then the grove shows 5 trees in total, including the new "Not today" reflection
  And the "Not today" tree is visually distinguishable from "Yes, fully" trees but is clearly a real tree not a gap
  And the cumulative line reads "You've reflected on 5 ayat this month"
  And the streak line is not broken by the honest "Not today" submission
```

### Scenario: Tapping a past tree opens that day's ayah and reflection read-only

```gherkin
Given Yusuf has 7 trees in his grove
  And the third tree represents a reflection on Surah Al-Baqarah ayah 153 ("Seek help through patience and prayer")
When Yusuf taps the third tree
Then he sees a read-only view of Surah Al-Baqarah ayah 153 with its translation
  And he sees the action mission he committed to that day
  And he sees the reflection he wrote that evening exactly as he wrote it
  And he sees the date the reflection was completed
  And he sees no controls to edit or delete the entry
When Yusuf taps back
Then he returns to the home screen with the grove scrolled to the same position
```

### Scenario: Tapping today's status when the ayah is waiting takes the user into the morning flow

```gherkin
Given Ahmad is on the home screen
  And today's status reads "Today's ayah is waiting"
When Ahmad taps today's status
Then he is taken to today's ayah screen to read, listen, and commit to a mission
```

### Scenario: Tapping today's status when the evening reflection is waiting takes the user into the evening flow

```gherkin
Given Aisha is on the home screen
  And today's status reads "Come back this evening"
When Aisha taps today's status
Then she is taken to the evening reflection screen to answer the two reflection questions
```

### Scenario: Demo mode shows a pre-seeded 7-tree grove on first open

```gherkin
Given a judge has signed in using the demo account
  And the demo seed provides 7 pre-seeded completed reflections across 7 distinct ayat
When the judge opens the app and lands on the home screen
Then the grove shows 7 fully-grown trees without any growth animation
  And the cumulative line reads "You've reflected on 7 ayat this month"
  And the streak line reads "7-day streak"
  And today's status reflects the demo account's current state in the daily loop
  And tapping any of the 7 pre-seeded trees opens that day's ayah and the pre-seeded reflection read-only
```

### Scenario: Monthly rollover on the first of a new month

```gherkin
Given Sara ended April with 22 completed trees and a cumulative line reading "You've reflected on 22 ayat this month"
  And today is the first of May and she has not yet completed a reflection this month
When Sara opens the home screen
Then the cumulative line reads "You've reflected on 0 ayat this month"
  And the grove still shows all 22 trees from April alongside the gap for today so far
  And no previously completed tree has been removed
```

### Scenario: Cumulative count increments only on qualifying reflections

```gherkin
Given Hamza has 3 trees this month
When Hamza submits a reflection of fewer than 40 characters and is blocked
Then no new tree appears in the grove
  And the cumulative line still reads "You've reflected on 3 ayat this month"
When Hamza resubmits with a reflection of at least 40 characters
Then a new tree appears with animation
  And the cumulative line reads "You've reflected on 4 ayat this month"
```

### Scenario Outline: Today's status line reflects the user's position in the daily loop

```gherkin
Given a user's state in today's loop is <state>
When they open the home screen
Then today's status reads <status message>
  And tapping the status takes them to <destination>

Examples:
  | state                                | status message              | destination                             |
  | not yet committed to today's mission | "Today's ayah is waiting"    | today's ayah and mission commit screen  |
  | committed but not yet reflected      | "Come back this evening"     | the evening reflection screen           |
  | reflection submitted and qualifying  | "Today's tree is planted"    | nowhere — a confirming affirmation only |
```

## Business Rules & Constraints

- **Grove is the hero visual.** Every completed, qualifying reflection adds exactly one tree to the grove. The grove is always the largest element on the home screen below today's status.
- **Cumulative count uses calendar month.** The "ayat reflected on this month" count is scoped to the user's local calendar month and resets to zero at local midnight on the first of each month. Previously completed trees remain visible in the grove regardless of the month reset; only the counter resets.
- **Streak is secondary.** The streak line appears below the cumulative count, in a smaller size, phrased gently (for example "3-day streak" with a small sprout icon). It is never the largest or topmost metric.
- **One missed day per rolling 7-day window is forgiven.** A user who misses exactly one day in any 7-day rolling window keeps their streak number unchanged. A second missed day in the same window breaks the streak to zero. The grove itself always shows gaps for missed days regardless of the streak forgiveness rule.
- **Missed days are visible, not hidden.** Missed days appear as gaps or withered saplings in the grove. They are never removed, glossed over, or retroactively completed.
- **"Not today" reflections count as real trees.** A "Not today" reflection with a qualifying written reflection of at least 40 characters grows a real tree that counts toward the cumulative line and does not break the streak. Its visual form may differ from a "Yes, fully" tree, but it is clearly distinct from a gap.
- **Tree → day view is read-only.** Tapping a past tree opens that day's ayah and reflection in read-only form. No editing, no deletion, and no backfill is ever offered from this surface.
- **Demo mode pre-seeds 7 trees.** A user signed in as the demo account lands on a home screen with 7 pre-seeded trees from 7 distinct ayat across the curated corpus, a cumulative count of 7, and a 7-day streak, so judges see the cumulative effect immediately.
- **Qualifying reflections only.** Only reflections that meet the 40-character minimum count toward the grove, the cumulative count, and the streak. Incomplete submissions do not leave a tree or advance the counter.

## Success Metrics

- **First-open depth signal.** Returning users tap at least one past tree per home-screen session on average by day 7, indicating the grove is being used as a revisiting surface rather than just a decoration.
- **Streak anxiety signal.** Fewer than 10% of users edit their notification times in the 24 hours after a streak break, indicating the gentle streak framing is working as intended.
- **Demo comprehension.** In judge observation, judges correctly describe the grove as "one tree per reflection" and name the cumulative count before being prompted, on their first look at the home screen.
- **Return engagement.** Day-7 retention — percentage of users who open the app on day seven after first session — reaches or exceeds 40%, aligned with the epic-level target.

## Dependencies

- **Evening reflection & tree growth** — produces the completed reflections that populate the grove.
- **Morning ayah & mission commit** — determines the "Today's ayah is waiting" vs. "Come back this evening" state shown at the top of the home screen.
- **Ayah corpus curation & demo-mode seed data** — supplies the 7 pre-seeded reflections that the demo account's home screen displays on first open.
- **Quran Foundation Activity/Goals integration** — is the source of truth for which days have been completed and therefore which trees appear in the grove.
- **Quran Foundation Streak Tracking integration** — is the source of truth for the streak number and the forgiveness-window behaviour displayed as secondary text.

## Open Questions

- [x] ~~Calendar month vs. rolling 30-day window for the cumulative count?~~ — **Resolved:** Calendar month, resetting at local midnight on the first of each month. Rationale: aligns with how users naturally talk about "this month", matches the weekly grove review cadence, and makes the monthly rollover moment feel like a natural chapter break.
- [x] ~~Should "Not today" trees look different from "Yes, fully" trees?~~ — **Resolved:** Yes, visually distinguishable but clearly a real tree, not a gap. Exact visual treatment is decided during UI refinement; both forms count equally toward the cumulative line and the streak.
- [x] ~~What happens when a tree is tapped on day 1 with an empty grove?~~ — **Resolved:** There are no real trees to tap on day 1. The preview sketch is not tappable and clearly signals "not yet yours" so there is no confusion.
- [ ] Exact copy for the streak line when the streak is zero — **Deferred (non-blocking):** Candidates are "Starting fresh", "0-day streak", or hiding the line altogether. To be finalised during UI refinement; does not affect the logic of any scenario in this spec.
- [ ] Should the grove scroll horizontally, vertically, or be pannable in both directions — **Deferred (non-blocking):** Interaction and layout decision resolved during UI refinement; behaviour described in this spec (tap a tree, scroll to find past trees) is unchanged either way.

---

## Functional Requirements

- **Read-only aggregation.** This surface performs no writes. It only reads `reflections`, `missions`, and `daily_assignments` for the current user (plus a single live call to the QF Streak endpoint for the canonical streak number).
- **Today's status.** The server derives `today_status` from the user's rows for `local_date = today`:
  - No `daily_assignments` row or no `missions` row → `awaiting_morning`.
  - `missions` row exists but no `reflections` row → `awaiting_evening`.
  - `reflections` row exists and passes the 40-character check → `complete`.
- **Grove window.** The tree list is limited to the last 60 days (`local_date BETWEEN today - 60 AND today`). Older trees are paginated on demand via a `?before=<date>` query parameter (stub for v1; not wired to UI in this story).
- **Month count.** `month_count` is the count of `reflections` whose associated `daily_assignments.local_date` falls in the user's current calendar month (`date_trunc('month', today)` inclusive up to `today`).
- **Streak source of truth.** `streak_days` and `free_pass_available` come from the live QF `GET /streaks/current` call, not a local computation. (Confirmed in `lib/qf/user.ts`.)
- **Tree variant mapping.** `did_apply = "yes_fully"` → `full tree`; `"partly"` → `half tree`; `"not_today"` → `sapling`; gap day (no `reflections` row for a past `local_date`) → synthesised `withered` entry with `reflection_id = null`.
- **Short preview.** `short_preview` is the first 80 characters of the reflection text with trailing whitespace trimmed and a literal `"..."` appended if truncated.
- **Demo mode.** When `users.is_demo = true`, the seed has already populated 7 `daily_assignments` + `missions` + `reflections` across the last 7 local dates; no special code path in this endpoint — it simply reads the same tables.
- **Idempotency.** GET endpoints only; safely repeatable. The client revalidates this endpoint after every reflection submit via a Next.js server action invalidation on the `/grove` route segment.

### Validation & Business Rules

- `local_date` parameter on the day endpoint must be a valid ISO date `YYYY-MM-DD` and must not be in the future; otherwise `400 INVALID_DATE`.
- Requested day must belong to the authenticated user; cross-user access returns `404 DAY_NOT_FOUND` (never `403`, to avoid leaking existence).
- If QF `/streaks/current` call fails or times out (>2s), return `streak_days: null` and `free_pass_available: null`; the UI then hides the streak line rather than erroring the whole screen.

## Permissions & Security

- **Scope:** Authenticated user only. The HTTP-only session cookie must resolve to a valid `qf_sessions` row.
- **Authorization:** RLS on `reflections`, `missions`, and `daily_assignments` restricts rows to the owning `user_id`. The route handler passes the session's `user_id` into a Supabase client scoped to that user; no cross-tenant data can be returned even if the query is malformed.
- **Input validation:** `local_date` path param is regex-matched `^\d{4}-\d{2}-\d{2}$` and parsed with `Date.parse` before use. Unknown query params are ignored.
- **No token leakage.** The QF streak call is made server-side using the session's decrypted `access_token`; the browser never sees it.

## API Design

### `GET /api/grove`

Returns the user's full grove view: today's status, trees from the last 60 days, month count, and streak.

**Request:** No body. Session cookie required.

**Response (200):**

```json
{
  "today_status": "awaiting_evening",
  "trees": [
    {
      "reflection_id": "b2c7e1f4-4f8a-4c9e-9d7a-2f1b8e3d5a01",
      "verse_key": "49:12",
      "local_date": "2026-05-01",
      "did_apply": "yes_fully",
      "short_preview": "Caught myself about to retell a story about a colleague and stopped. Instead asked..."
    },
    {
      "reflection_id": "c9d1a2b3-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
      "verse_key": "2:153",
      "local_date": "2026-05-02",
      "did_apply": "partly",
      "short_preview": "Managed one prayer with real presence today but fell back into rushing the rest...."
    },
    {
      "reflection_id": "d4e5f6a7-8b9c-4d1e-2f3a-4b5c6d7e8f90",
      "verse_key": "17:23",
      "local_date": "2026-05-03",
      "did_apply": "yes_fully",
      "short_preview": "Called my mother before she called me for the first time in months. She cried a little."
    },
    {
      "reflection_id": null,
      "verse_key": null,
      "local_date": "2026-05-04",
      "did_apply": "missed",
      "short_preview": null
    },
    {
      "reflection_id": "e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b",
      "verse_key": "25:63",
      "local_date": "2026-05-05",
      "did_apply": "not_today",
      "short_preview": "Snapped at a driver who cut me off. Wrote about what I wish I had done instead..."
    },
    {
      "reflection_id": "f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c",
      "verse_key": "13:28",
      "local_date": "2026-05-06",
      "did_apply": "yes_fully",
      "short_preview": "Sat for five minutes after fajr doing dhikr instead of picking up the phone..."
    },
    {
      "reflection_id": "a0b1c2d3-e4f5-4a6b-7c8d-9e0f1a2b3c4d",
      "verse_key": "31:14",
      "local_date": "2026-05-07",
      "did_apply": "yes_fully",
      "short_preview": "Visited my father without being asked. We spoke about his father for the first time."
    }
  ],
  "month_count": 6,
  "streak_days": 3,
  "free_pass_available": true
}
```

**Data source:**

```sql
SELECT r.id AS reflection_id,
       da.verse_key,
       da.local_date,
       r.did_apply,
       left(trim(trailing from r.text), 80) AS preview_raw,
       length(r.text) AS text_len
FROM reflections r
JOIN missions m ON m.id = r.mission_id
JOIN daily_assignments da ON da.id = m.assignment_id
WHERE da.user_id = $1
  AND da.local_date BETWEEN ($2::date - interval '60 days') AND $2::date
ORDER BY da.local_date ASC;
```

Gap days are synthesised in application code by walking each date in the 60-day window and inserting a `missed` entry for any date without a matching reflection. The streak number comes from a second call to QF: `GET {QF_USER_BASE}/streaks/current` (confirmed in `lib/qf/user.ts`; base URL set via `QF_USER_BASE` env var).

**Errors:**

| Status | Code              | Condition                                                 |
| ------ | ----------------- | --------------------------------------------------------- |
| 401    | `UNAUTHENTICATED` | No session cookie or session expired                      |
| 500    | `INTERNAL`        | Unexpected DB or server error (QF streak failure is soft) |

### `GET /api/grove/day/:local_date`

Returns the full read-only day view for a tapped tree.

**Request:** Path param `local_date` in `YYYY-MM-DD`. Session cookie required.

**Response (200):**

```json
{
  "local_date": "2026-05-03",
  "verse_key": "17:23",
  "ayah": {
    "arabic": "وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا...",
    "translation": "Your Lord has commanded that you worship none but Him, and honour your parents...",
    "tafsir_extract": "A command pairing tawhid with kindness to parents — the two most frequent companions in the Quran."
  },
  "mission": {
    "selected_prompt": "Call a parent before they call you and tell them one specific thing you appreciate.",
    "is_custom": false,
    "committed_at": "2026-05-03T08:12:44Z"
  },
  "reflection": {
    "did_apply": "yes_fully",
    "text": "Called my mother before she called me for the first time in months. She cried a little. I told her I was grateful she answers every time.",
    "submitted_at": "2026-05-03T21:44:19Z"
  }
}
```

**Errors:**

| Status | Code              | Condition                                                        |
| ------ | ----------------- | ---------------------------------------------------------------- |
| 400    | `INVALID_DATE`    | Malformed `local_date` or future date                            |
| 401    | `UNAUTHENTICATED` | No session                                                       |
| 404    | `DAY_NOT_FOUND`   | No reflection for that user on that date (including missed days) |

## Data Model & Migrations

No new tables. This story reads existing `reflections`, `missions`, and `daily_assignments`.

Ensure the following indexes exist (add in a new migration `0007_grove_indexes.sql` if not already present):

```sql
CREATE INDEX IF NOT EXISTS idx_reflections_mission_id
  ON reflections(mission_id);

CREATE INDEX IF NOT EXISTS idx_daily_assignments_user_local_date_desc
  ON daily_assignments(user_id, local_date DESC);
```

Rationale: the grove query joins `reflections → missions → daily_assignments` and filters by `user_id` + `local_date` range; both indexes eliminate sequential scans at the expected read volume.

**Migration Notes:** Index creation is online; no downtime. No data backfill.

## UI/Frontend Requirements

### Page: `app/(app)/grove/page.tsx`

Server component; calls `/api/grove` via `fetch` with `cache: "no-store"` on the server render, then passes data to client components.

### Components

**`GroveCanvas`** — `components/grove/GroveCanvas.tsx`

- **Type:** New.
- **Purpose:** Renders the tree grid with scroll/pan on mobile. Implemented as SVG or CSS grid; exact choice made in frontend design pass.
- **Props:**
  ```typescript
  interface GroveCanvasProps {
    trees: Array<{
      reflection_id: string | null;
      verse_key: string | null;
      local_date: string;
      did_apply: "yes_fully" | "partly" | "not_today" | "missed";
      short_preview: string | null;
    }>;
    onTreeTap: (local_date: string) => void;
  }
  ```
- Each child is a `TreeIcon` whose variant is chosen from `did_apply`: `yes_fully` → full tree, `partly` → half tree, `not_today` → sapling, `missed` → withered. Visual design deferred to frontend design pass; this story only fixes the variant mapping and component contract.

**`TreeIcon`** — `components/grove/TreeIcon.tsx`

- **Type:** New.
- **Purpose:** Renders a single tree variant. Pulls the SVG asset from `public/trees/{variant}.svg`.
- **Props:** `{ variant: "full" | "half" | "sapling" | "withered"; tappable: boolean; onTap?: () => void }`.

**`MonthCount`** — `components/grove/MonthCount.tsx`

- **Type:** New.
- **Purpose:** Prominent cumulative count. Copy: `"You've reflected on {month_count} ayat this month"`. Largest text on the page below today's status.

**`StreakBadge`** — `components/grove/StreakBadge.tsx`

- **Type:** New.
- **Purpose:** Small, soft-colour streak line below `MonthCount`. Copy: `"{streak_days}-day streak"` with sprout icon. If `streak_days` is null (QF failure) or zero, the component renders `null` or a "Starting fresh" line per the deferred copy question.

**`TodayStatus`** — `components/grove/TodayStatus.tsx`

- **Type:** New.
- **Purpose:** Context-aware card at the top of the page. Tapping routes:
  - `awaiting_morning` → `/today`
  - `awaiting_evening` → `/today?phase=reflect`
  - `complete` → no-op (or subtle confirming affirmation).

**`TreeDetailSheet`** — `components/grove/TreeDetailSheet.tsx`

- **Type:** New.
- **Purpose:** shadcn `Sheet` opened when a tree is tapped. Fetches `/api/grove/day/:local_date` on open and renders the read-only day view (ayah + mission + reflection). Closes via swipe-down or the sheet's close button; no edit controls.

### User Interactions

- Tap tree → open `TreeDetailSheet` for that `local_date`.
- Tap today's status card → navigate per `today_status` mapping above.
- Pull-to-refresh → re-fetch `/api/grove`.

### States

- **Loading:** Skeleton grove with muted placeholder trees.
- **Empty:** `"your first tree will appear tonight"` placeholder inside `GroveCanvas` when `trees` contains zero non-missed entries.
- **Error:** If `/api/grove` fails, inline error card with retry button; today's status and streak hidden to avoid showing stale info.

## Architecture Notes

- **New dependencies:** none beyond shadcn `Sheet` (already in project).
- **Live query.** No Redis or KV caching; every page load hits Supabase fresh. Response time target <300ms p95 for the grove endpoint.
- **Revalidation.** After every successful reflection submit, the evening-reflection server action calls `revalidatePath("/grove")` so the user sees the new tree on return. The `/api/grove` route itself is marked `export const dynamic = "force-dynamic"` because its output depends on the current user and the current local date.
- **Streak call isolation.** The QF streak fetch runs in parallel with the DB query (`Promise.all`) and is soft-wrapped so a QF outage does not break the grove.

## Exemplar Files

- None in this repo — this is the first grove/read-only aggregation surface. Reference patterns:
  - Next.js 15 server actions + `revalidatePath`: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
  - shadcn `Sheet` component: https://ui.shadcn.com/docs/components/sheet

## Implementation Plan

### Sub-tasks

**Task 1: Query helpers** — _small_ (<100 LOC)

- Files: `lib/db/grove.ts`
- Exports: `getGroveAggregate(userId, today)` (returns trees + month_count) and `getDayDetail(userId, localDate)` (returns ayah + mission + reflection). Builds the gap-day synthesis in TS after the SQL returns.
- SEQUENTIAL — depends on `spec-evening-reflection.md` Task 1 (reflections table + insert path must exist first).

**Task 2: Route handlers** — _small_ (<100 LOC)

- Files: `app/api/grove/route.ts`, `app/api/grove/day/[date]/route.ts`
- Thin handlers: session check → call `lib/db/grove.ts` → call QF streak client (for `/api/grove` only) in parallel → return JSON. Input validation on `:date` param.
- SEQUENTIAL — depends on Task 1.

**Task 3: Page + components** — _medium_ (100–300 LOC)

- Files: `app/(app)/grove/page.tsx`, `components/grove/{GroveCanvas,TreeIcon,MonthCount,StreakBadge,TodayStatus,TreeDetailSheet}.tsx`
- Wires server-render of `/api/grove` into the page, renders all components, handles the `TreeDetailSheet` open/close state with a client component at the canvas level.
- SEQUENTIAL — depends on Task 2.

**Task 4: Tree variant visuals** — _small_ (<100 LOC of SVG + a small styles file)

- Files: `public/trees/full.svg`, `public/trees/half.svg`, `public/trees/sapling.svg`, `public/trees/withered.svg`
- Four static SVGs wired through `TreeIcon`. First-pass visual identity; refined in the frontend design pass.
- SEQUENTIAL — depends on Task 3 (so the component contract is stable).

### Negative Constraints

- Do NOT write to any QF endpoint from this story (no `POST /notes`, no `POST /activity/day`, no `POST /goals`). This screen is read-only.
- Do NOT deduplicate or aggregate trees across users — the grove is strictly per-user, even for the demo account. Privacy and RLS require it.
- Do NOT compute the streak locally; always call QF `/streaks/current` and accept the canonical number.
- Do NOT add infinite-scroll pagination in this story; the 60-day window is the cap. Older trees become reachable from the Journal story.
- Do NOT render Arabic text returned by the day endpoint without `<span translate="no" lang="ar">` per the shared rule.

## Test Scenarios

**Test 1: Empty new user**

- Setup: `users` row for Ahmad with no `daily_assignments`, no `missions`, no `reflections`. Today = `2026-05-02`.
- Action: `GET /api/grove`.
- Expected: `200`, `today_status = "awaiting_morning"`, `trees = []`, `month_count = 0`, `streak_days = 0` (QF returns 0), `free_pass_available = true`.

**Test 2: Single tree, day 1**

- Setup: Aisha, `daily_assignments` + `missions` + `reflections` for `2026-05-01` only, `did_apply = "yes_fully"`, text = `"Gave the first piece of bread to my daughter for the first time in weeks. Small but deliberate."`. Today = `2026-05-02`, no row yet for today.
- Action: `GET /api/grove`.
- Expected: `200`, `today_status = "awaiting_morning"`, `trees.length = 1`, tree has `did_apply = "yes_fully"` and `short_preview` length ≤ 80, `month_count = 1`, `streak_days = 1`.

**Test 3: 7-tree week with one missed day inside the free-pass window**

- Setup: Fatima, reflections on `2026-04-27, 04-29, 04-30, 05-01, 05-02, 05-03` (Monday–Wednesday she reflected; Tuesday `04-28` she missed). Mix of `yes_fully` and one `partly`. Today = `2026-05-04`, no row yet.
- Action: `GET /api/grove`.
- Expected: `200`, `trees.length = 7` (6 real + 1 synthesised `missed` for `2026-04-28`), `month_count = 3` (only May dates count), QF returns `streak_days = 6` and `free_pass_available = false` (pass consumed).

**Test 4: 14-tree span with streak broken**

- Setup: Yusuf, reflections on 14 distinct dates across 2026-04-18 to 2026-05-02 with two missed days in the same week breaking the streak. Today = `2026-05-02`.
- Action: `GET /api/grove`.
- Expected: `200`, `trees.length = 15` (14 real + 1 synthesised missed — the second missed day; first consumed the pass), `month_count = 2` (only the two May reflections), QF returns `streak_days = 0`.

**Test 5: Demo-mode user**

- Setup: `users.is_demo = true`, seed has inserted 7 reflections across `2026-04-26` through `2026-05-02`, all `did_apply = "yes_fully"`. Today = `2026-05-02`, reflection for today is present (it's one of the 7).
- Action: `GET /api/grove`.
- Expected: `200`, `today_status = "complete"`, `trees.length = 7` (all real, no gaps), `month_count = 2` (only May 01 and May 02 fall in current month), `streak_days = 7`.

**Test 6: Monthly rollover**

- Setup: Sara, reflections on every day of April 2026 (30 trees). Today = `2026-05-01`, no row for today.
- Action: `GET /api/grove`.
- Expected: `200`, `trees.length = 30` (last 60 days includes all of April), `month_count = 0` (cumulative resets because we are at May 01 and no May row exists yet), `streak_days = 30`. The grove still visibly carries all 30 April trees.

**Test 7: Tap-tree detail endpoint returns full day view**

- Setup: Yusuf, reflection on `2026-05-03` for `verse_key = "17:23"` with mission and text as in the example response above.
- Action: `GET /api/grove/day/2026-05-03`.
- Expected: `200`, response body matches the shape in the API Design section, including Arabic, translation, tafsir extract, mission prompt, reflection text.

**Test 8: Cross-user day access blocked**

- Setup: Ahmad's session, but request targets Aisha's `local_date` for `2026-05-01`.
- Action: `GET /api/grove/day/2026-05-01` (Ahmad has no row for that date).
- Expected: `404 DAY_NOT_FOUND`, no ayah or reflection text leaked.

**Test 9: QF streak endpoint fails soft**

- Setup: Aisha, 3 trees, QF `/streaks/current` returns 500 or times out after 2s.
- Action: `GET /api/grove`.
- Expected: `200`, `trees.length = 3`, `month_count` correct, `streak_days = null`, `free_pass_available = null`. UI hides the streak line.

**Test 10: Invalid date param**

- Setup: Any session.
- Action: `GET /api/grove/day/not-a-date` and `GET /api/grove/day/2099-01-01`.
- Expected: Both return `400 INVALID_DATE`.

## Acceptance Criteria

- [ ] `GET /api/grove` returns the documented shape for all 10 test scenarios.
- [ ] `GET /api/grove/day/:local_date` returns the documented shape and rejects malformed, future, and cross-user dates.
- [ ] Gap days appear as synthesised `missed` entries with `reflection_id = null` between the earliest tree and today.
- [ ] `month_count` is scoped to the user's current calendar month (resets on the 1st, no grove entries deleted).
- [ ] `streak_days` and `free_pass_available` come from QF `/streaks/current`; QF failure degrades gracefully to `null`.
- [ ] `short_preview` is ≤ 80 characters plus optional `"..."` suffix; never leaks the full reflection text on the list endpoint.
- [ ] RLS prevents any cross-user data from being returned even under crafted query params.
- [ ] Page `app/(app)/grove/page.tsx` renders today's status, grove, month count, and streak in the documented order and size hierarchy.
- [ ] Tapping a tree opens `TreeDetailSheet`, which fetches the day endpoint and displays the full ayah + mission + reflection read-only.
- [ ] Tapping today's status routes correctly for each of the three states.
- [ ] Empty-state placeholder reads `"your first tree will appear tonight"` when no real trees exist.
- [ ] After reflection submit, `revalidatePath("/grove")` causes the new tree to appear on next grove view.
- [ ] No type errors, no lint warnings, no writes to any QF endpoint from this surface.

## Verification

Run the verifier skill to confirm changes are clean.

### Backend API Tests

Vitest in `tests/unit/` and `tests/integration/`:

- `tests/unit/lib/db/grove.test.ts` — covers `getGroveAggregate` gap synthesis, `month_count` math, 60-day window boundary, `short_preview` truncation.
- `tests/integration/api/grove.test.ts` — boots a Supabase test schema with seed data matching Tests 1–6 and 9 above, hits the route handler, asserts full response shape.
- `tests/integration/api/grove-day.test.ts` — covers Tests 7, 8, 10 (day endpoint happy path, cross-user 404, invalid date 400).

### Browser/UI Testing

- URL: local dev at `http://localhost:3000/grove` after signing in as the demo account.
- Setup: Run `pnpm seed:demo` to populate 7 trees, then sign in via QF OAuth demo flow.
- Steps:
  1. Land on `/grove` → expect today's status card, grove with 7 trees, month count, streak badge in that visual order.
  2. Tap the third tree → `TreeDetailSheet` opens with that day's ayah and reflection.
  3. Close the sheet → grove is re-shown scrolled to the same position.
  4. Tap today's status (while `awaiting_morning`) → navigates to `/today`.
  5. Mobile viewport (iPhone 13) → grove scrolls smoothly, no horizontal overflow beyond the canvas.

### E2E Tests

| Key Scenario                                                       | Test file                                      | Assigned sub-task |
| ------------------------------------------------------------------ | ---------------------------------------------- | ----------------- |
| Brand-new user opens the home screen on day one before committing  | `tests/e2e/grove-empty-day-one.spec.ts`        | Task 3            |
| Returning user on day 8 sees a full first-week grove               | `tests/e2e/grove-seven-trees.spec.ts`          | Task 3            |
| A single missed day within the weekly free-pass window is forgiven | `tests/e2e/grove-free-pass.spec.ts`            | Task 3            |
| Tapping a past tree opens that day's ayah and reflection read-only | `tests/e2e/grove-tap-tree-detail.spec.ts`      | Task 3            |
| Demo mode shows a pre-seeded 7-tree grove on first open            | `tests/e2e/grove-demo-mode.spec.ts`            | Task 3            |
| Monthly rollover on the first of a new month                       | `tests/e2e/grove-monthly-rollover.spec.ts`     | Task 3            |
| Tapping today's status routes by state                             | `tests/e2e/grove-today-status-routing.spec.ts` | Task 3            |

**Locator strategies:**

- `data-testid="today-status-card"` — the top status card.
- `data-testid="grove-canvas"` — the tree grid wrapper.
- `data-testid="tree-{local_date}"` — each tree (including synthesised `missed` entries).
- `data-testid="month-count"` — the cumulative count line.
- `data-testid="streak-badge"` — the secondary streak line.
- `data-testid="tree-detail-sheet"` — the shadcn Sheet root when open.
- Date-dependent tests freeze the test clock via Playwright's `page.clock.install({ time: "2026-05-02T09:00:00Z" })` before navigation.
