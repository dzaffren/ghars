# Weekly Grove Review

**Ticket:** TBD
**Discovery Brief:** `docs/discovery/quran-ayah-apply/brief.md`
**Epic Overview:** `docs/specs/TBD-quran-ayah-apply/spec.md`

A once-a-week scrollable summary that gathers the seven ayat the user reflected on and the seven reflections they wrote, framed as "Here's what Allah guided you through this week." The review turns a week of small, honest daily touches into a single narrative moment of noticing — the point where cumulative engagement becomes visible and emotionally resonant.

## User Story

As a Muslim using the app to apply the Quran in daily life, I want to see all seven ayat and all seven of my reflections from the past week in one continuous read so that I can notice the thread of what Allah has been guiding me toward and feel the cumulative meaning of my week, not just the day I am on.

## Background & Context

**Current state:**

- Users who commit to a daily ayah and evening reflection currently only see one day at a time.
- The grove home screen shows a count of ayat reflected on this month and a visual of trees, but does not re-surface the actual content of the ayat or the words the user wrote.
- A user finishing their seventh reflection gets the same "tree grown" feedback as any other day — there is no landmark that acknowledges a week of honest effort.

**Problem:**

- The product promises that the Quran will begin to shape how the user lives. After a week of work, the user has no moment where that promise is delivered back to them in their own words.
- Without a weekly landmark, the loop risks feeling like a streak tracker rather than a practice of noticing.
- The hackathon's highest-weighted judging criterion is impact on Quran engagement; the weekly review is the clearest single screen where a judge can feel the depth of the loop in a short evaluation session.

## Target User & Persona

- **Who:** A practicing, non-Arabic-speaking Muslim who has been using the app daily and has just completed their seventh honest reflection (or is revisiting a prior week).
- **Context:** They have just submitted an evening reflection, or they are opening the grove home after a week and want to revisit what the week held. They are alone with the app, usually at home, usually on a phone.
- **Current workaround:** They have no way to do this today. At best they might scroll back through their own journal entries one at a time, without the ayat attached, and without any framing.

## Goals

- Give the user a single, unhurried screen that answers the question "what did this week of reading do to me?"
- Reinforce the meaning-to-action outcome by placing the user's own words next to the ayat that prompted them.
- Reward effort honestly — adapt the summary to however many reflections the user actually wrote, without shaming gaps.
- Make the cumulative depth of the app demonstrable to a judge in a single session via demo mode.

## Non-Goals

- No sharing, exporting, printing, or sending the review to anyone else.
- No editing of past reflections from inside the review (the journal handles that).
- No performance scoring or grading of the week ("you did X of 7 days!" with medals — explicitly avoided).
- No coverage of partial-week notifications or push scheduling — that lives in the notifications story.

## User Workflow

1. **Seventh honest reflection submitted** — The user finishes an evening reflection that takes their lifetime count of completed reflections to seven. The tree-grown confirmation plays as normal, and then the grove home quietly gains a new card at the top: "Your first week — see what Allah guided you through."
2. **Tapping the card** — The user taps the card and enters the review. The first thing they see is a gentle opening line: "Here's what Allah guided you through this week." Below it, today's date range for the week ("26 Apr – 2 May 2026") appears as quiet context.
3. **Scrolling the narrative** — The user scrolls. Each of the seven days appears in chronological order. For each day, the user sees the Arabic of that day's ayah, its translation, the short reference (surah name and ayah number), the mission they committed to, and the reflection they wrote in their own words. Days flow one after the next, with a small day marker ("Day 1 — Monday") separating them.
4. **Reaching the closing** — At the end of the scroll the user sees a short, quiet closing: "You reflected on 7 ayat this week. May Allah accept your effort."
5. **Returning** — The user taps back and lands on the grove home. The "your first week" card has moved into a small history strip above the grove ("Past weeks"), from which they can re-open that week any time.
6. **Next week** — Seven more honest reflections later, a new "Week 2" review card appears above the grove. The first week is still accessible from the history strip.

## Acceptance Criteria

### Scenario: First-week review appears after the seventh honest reflection

```gherkin
Given Aisha has completed six evening reflections over the past six days
  And each reflection is at least 40 characters long
  And she has not yet seen a weekly review in this app
When she submits her seventh evening reflection of 40 or more characters
  And returns to the grove home screen
Then she sees a new card above her grove labelled "Your first week — see what Allah guided you through"
  And the card appears once her seventh tree has finished growing
  And her streak and grove counts continue to be shown as before
```

### Scenario: Reading the first-week review end to end

```gherkin
Given Aisha has seven completed reflections from the past seven days covering the following ayat
  | Day | Surah and ayah        | Theme      | Mission committed                                  | Reflection written                                                                                                              |
  | 1   | Al-Alaq 96:1          | Learning   | Read five pages of Quran with translation today.   | Read five pages after Fajr. Noticed how much I had been skimming before — slowed down on verse about the pen.                  |
  | 2   | Al-Baqarah 2:286      | Trust      | Name one worry and hand it back to Allah in dua.   | Worry about my father's health. Made dua after Dhuhr. Felt lighter, not resolved, but lighter.                                 |
  | 3   | Al-Hujurat 49:12      | Speech     | Avoid speaking about anyone not in the room today. | Caught myself twice at lunch. Once I changed the subject, once I failed. Honest attempt.                                       |
  | 4   | Al-Asr 103:1-3        | Time       | Cut one scroll session today and replace with dua. | Deleted Instagram from the home screen instead. Replaced it with dhikr at 3pm. Small but it stuck.                             |
  | 5   | Ar-Rahman 55:13       | Gratitude  | List three mercies out loud after Maghrib.         | Said them to my daughter. She added two of her own. Unexpected.                                                                |
  | 6   | An-Nisa 4:36          | Family     | Call a relative I have not spoken to in a month.   | Called my uncle in Lahore. Forty minute call. He cried a little. I did too.                                                    |
  | 7   | At-Tin 95:4           | Dignity    | Treat one stranger today as if they were honoured. | Elderly man at the bus stop. Helped him with his bag. Looked him in the eye. Small thing. Felt right.                          |
  And she has just arrived at the grove home and seen the "Your first week" card
When she taps the card
Then she sees an opening line "Here's what Allah guided you through this week"
  And she sees the date range of the week she completed
  And she can scroll through all seven days in order
  And each day shows the Arabic of the ayah, the translation, the surah and ayah reference, the mission she chose, and the reflection she wrote
  And at the end of the scroll she sees the closing "You reflected on 7 ayat this week. May Allah accept your effort."
```

### Scenario: Subsequent week re-triggers the review

```gherkin
Given Aisha has already seen her first weekly review
  And she has completed seven more evening reflections since then
  And each of those seven reflections is at least 40 characters long
When she returns to the grove home after submitting the fourteenth reflection
Then she sees a new card labelled for her second week — for example "Week 2 — see what Allah guided you through"
  And her first-week review is still accessible from a "Past weeks" history section above the grove
  And tapping the new card opens a review containing only the seven ayat and reflections from days eight through fourteen
```

### Scenario: Partial week — review is earned, not timed

```gherkin
Given Ibrahim has opened the app on each of the last seven calendar days
  And he completed an evening reflection on only five of those days
  And two days were opened in the morning but the evening reflection was not submitted
When seven calendar days have passed since his first reflection
Then no weekly review card appears on his grove home
  And the grove home continues to show his cumulative counts and growing grove as normal
  And the weekly review card only appears after he has submitted a total of seven qualifying reflections, whenever that happens
```

### Scenario: An "honest Not today" reflection is included in the review

```gherkin
Given Yusuf has completed seven qualifying reflections in the past week
  And on day 3 his answer to "Did you act on it?" was "Not today"
  And on day 3 his written reflection said "I had every intention but got pulled into a work call and forgot by Maghrib. Noticed only at bedtime. Will try again tomorrow."
When he opens the weekly review
Then his day 3 entry appears in the review alongside the other six days
  And the day 3 entry shows the ayah, the mission, and his full reflection text
  And there is no visual shaming, no red marker, and no "missed" label on the day 3 entry
  And the closing summary still says he reflected on seven ayat this week
```

### Scenario: Re-opening a past week from history

```gherkin
Given Layla saw her first weekly review two weeks ago
  And she has since completed a second week of seven reflections and seen that review as well
When she opens the grove home today
Then she sees a "Past weeks" section above or near her grove that lists her completed weekly reviews in reverse chronological order
  And each entry is labelled with the week ("Week 1", "Week 2") and its date range
  And tapping any entry re-opens that week's review exactly as she first saw it
  And re-opening a past review does not create a new review or change her grove
```

### Scenario: No review card before seven reflections are complete

```gherkin
Given Hafsa is in her first week of using the app
  And she has completed three qualifying evening reflections so far
When she opens the grove home
Then she does not see any weekly review card
  And she sees her three trees in the grove
  And she sees her cumulative "3 ayat reflected" count
  And no "almost there" progress bar toward a weekly review is shown
```

### Scenario: Demo mode user lands on a pre-populated review

```gherkin
Given a judge opens the app in demo mode for the first time
  And the demo account has been pre-populated with seven seed ayat, seven seed missions, and seven seed reflections
When the judge arrives on the grove home
Then they see seven trees in the grove
  And they see a "Your first week — see what Allah guided you through" card above the grove
  And tapping the card opens a fully populated weekly review with all seven seed entries and the closing summary
  And this review is available on first open without the judge waiting seven days
```

### Scenario Outline: Closing summary adapts to the number of reflections in the window

```gherkin
Given a user has completed <count> qualifying reflections across the seven days of their review window
  And a weekly review has been earned according to the seven-qualifying-reflections rule
When the user scrolls to the end of the review
Then they see a closing line that reads "<closing>"
  And the closing line contains no language that frames missed days as failure

Examples:
  | count | closing                                                          |
  | 7     | You reflected on 7 ayat this week. May Allah accept your effort. |
```

### Scenario: Partial-week review after a grace-forgiven gap

```gherkin
Given Maryam has used the app for nine calendar days
  And on one of those days she did not open the app at all, which the one-free-pass-per-week rule forgives
  And on the remaining eight days she opened the app and submitted a qualifying evening reflection on seven of them
When she submits the reflection that brings her qualifying count to seven
Then a "Your first week" review card appears on the grove home
  And the review contains all seven of her qualifying reflections in the order she wrote them
  And the review does not contain a blank entry for the forgiven day
  And the closing summary says she reflected on seven ayat this week
```

### Scenario: Revisiting mid-week does not show a premature review

```gherkin
Given Khalid has completed four qualifying reflections this week
  And the current calendar day is the seventh day since he began
When Khalid opens the grove home
Then no weekly review card is shown
  And he sees his four trees and his cumulative count
  And the review card will only appear once three more qualifying reflections are submitted
```

## Business Rules & Constraints

- **The review is earned, not timed.** The weekly review card appears when the user has submitted seven qualifying evening reflections, not on the seventh calendar day. A user who takes ten calendar days to reach seven qualifying reflections gets their review on reflection seven.
- **Qualifying reflection definition.** A reflection qualifies toward the weekly review if and only if it is a completed evening reflection of at least 40 characters, including reflections where the answer to "Did you act on it?" is "Not today." This matches the honesty-first rule shared across the epic.
- **Seven-at-a-time.** Each weekly review covers exactly the seven qualifying reflections that earned it, in the order they were written. Subsequent reviews cover the next seven, and so on. No rolling windows, no overlap between reviews.
- **Content shown per day.** Each day's block in the review shows: the Arabic of the ayah, the user's chosen translation of the ayah, the surah name and ayah number reference, the mission the user committed to that morning, and the full text of the reflection the user wrote that evening.
- **Opening and closing framing.** The review always opens with gentle, non-performative language along the lines of "Here's what Allah guided you through this week" and closes with "You reflected on 7 ayat this week. May Allah accept your effort." No medals, percentages, scores, "streak saved", or "perfect week" language anywhere in the review.
- **Never shame a gap.** The review contains no language that calls out missed days, lapsed streaks, partial weeks, or anything that frames the user's week as incomplete. Entries for "Not today" reflections are shown in the same visual treatment as "Yes, fully" reflections.
- **Re-accessibility.** Once a weekly review has appeared, it remains accessible from a "Past weeks" section on the grove home in reverse chronological order, indefinitely. Re-opening a past review shows the same content the user first saw.
- **Privacy.** The weekly review is private to the user's account. There is no sharing, exporting, or public surface for any part of it.
- **Demo mode.** When the app is opened on a demo account, a pre-populated first-week review must be available from the grove home on the first open, using seven seed ayat, missions, and reflections spanning a thematic spread (for example: Al-Alaq on learning, Al-Baqarah on trust, Al-Hujurat on speech, Al-Asr on time, Ar-Rahman on gratitude, An-Nisa on family, At-Tin on dignity).

## Success Metrics

- **Landmark engagement.** Percentage of users who open the weekly review card within 24 hours of it first appearing. Target: at least 80 percent of users who reach seven reflections.
- **Scroll depth.** Percentage of users who, having opened the review, scroll to the closing summary. Target: at least 70 percent.
- **Return to past weeks.** Percentage of multi-week users who re-open at least one past weekly review from the history section. Target: at least 30 percent of users with two or more completed weeks.
- **Judge-facing demo signal.** In demo mode, the weekly review is reachable from the grove home within two taps of first opening the app.

## Dependencies

- **Evening reflection & tree growth** — the review pulls its content from qualifying evening reflections. This story cannot be delivered before that one is working end to end.
- **Grove home screen & cumulative view** — the review is surfaced via a card on the grove home and, after first appearance, via a "Past weeks" section on the grove home.
- **Morning ayah & mission commit** — the mission text shown per day in the review comes from the morning commit step.
- **Bookmarks & reflection journal** — the review reads from the same private reflection store as the journal; no new authoring happens inside the review.
- **Ayah corpus curation & demo-mode seed data** — the demo-mode pre-populated review depends on seven seed ayat, missions, and reflections being present in the demo seed.

## Open Questions

- [x] ~~Is the review triggered on day 7 of the calendar or on the seventh qualifying reflection?~~ — **Resolved:** On the seventh qualifying reflection. The review is earned, so a user who takes longer than seven calendar days still receives a full-fidelity review rather than a half-empty one.
- [x] ~~What happens in a partial week where the user completed only five reflections in seven calendar days?~~ — **Resolved:** No review appears until seven qualifying reflections are submitted. The grove home continues to show cumulative counts in the meantime. No "partial-week" review is ever generated.
- [x] ~~Are "Not today" reflections included in the review?~~ — **Resolved:** Yes, treated identically to "Yes, fully" and "Partly" reflections. The product's honesty-first stance requires it.
- [x] ~~Is sharing or exporting in scope?~~ — **Resolved:** No. Private to the account, consistent with the epic-level privacy rule.
- [x] ~~How does a judge see this screen in a short evaluation session?~~ — **Resolved:** Demo mode pre-populates a first-week review reachable from the grove home on first open.
- [ ] Exact visual treatment of the "Past weeks" history entry on the grove home (list vs. horizontal strip vs. small badge) — **Deferred (non-blocking):** Resolved during design polish; does not change the underlying behaviour specified above.

---

## Functional Requirements

- **Trigger rule (reflection-count based, not calendar-based).** When a user's lifetime `reflections` row count crosses any multiple of 7 (7, 14, 21, …) the next load of grove home MUST surface a "new weekly review" card anchored to the just-crossed milestone.
- **Partial week handling.** If a user has completed fewer than the next multiple of 7 qualifying reflections, no weekly review is offered, regardless of how many calendar days have elapsed. Example: 5 of the last 7 calendar days reflected = 5 total reflections = no review yet.
- **Earned-not-timed.** A qualifying reflection is any row in `reflections` (length ≥ 40 enforced upstream). "Not today" reflections count.
- **Seven-at-a-time windowing.** Week N contains exactly the 7 reflections that brought the lifetime count from `(N-1)*7 + 1` through `N*7`, in insertion order. No overlaps. No rolling windows.
- **Re-access.** All prior weekly reviews are listed under a "Past weeks" section in grove home, reverse-chronological, indefinitely.
- **Idempotency.** Re-opening a past weekly review returns the same content; no new materialised row is created on read.
- **Atomicity.** The trigger that materialises `weekly_reviews` runs in the same transaction as the `reflections` insert; if the insert rolls back, the weekly-review row does too.

### Validation & Business Rules

- Week content is immutable once materialised. Editing an underlying reflection updates its text when re-rendered, but does not create a new week row or re-shuffle week membership.
- `week_number` for a given user is strictly monotonic starting at 1. Skips are impossible because the trigger fires deterministically every 7 inserts.
- `GET /api/weeks/:week_id` MUST return 404 if the `week_id` belongs to another user (no leakage via ID probing).

## Permissions & Security

- **Scope:** Authenticated user-facing API.
- **Authorization:** Active session required (HTTP-only cookie → `qf_sessions` → `users.id`).
- **Row-level security:** Supabase RLS on `weekly_reviews` restricts SELECT to rows where `user_id = auth_user_id()`. All nested reads (`reflections`, `missions`, `daily_assignments`) inherit existing RLS.
- **Input validation:** `:week_id` parsed as integer; invalid strings return 400.
- **No cross-user exposure.** The weekly review is never rendered on any public surface.

## API Design

### `GET /api/weeks`

Lists every completed weekly review for the authenticated user, reverse-chronological.

**Response (200):**

```json
{
  "weeks": [
    {
      "week_id": "2",
      "completed_at": "2026-05-08T20:47:11Z",
      "reflection_count": 7
    },
    {
      "week_id": "1",
      "completed_at": "2026-05-01T21:12:03Z",
      "reflection_count": 7
    }
  ]
}
```

**Errors:**

| Status | Code           | Condition             |
| ------ | -------------- | --------------------- |
| 401    | `UNAUTHORIZED` | No session cookie     |
| 500    | `DB_ERROR`     | Supabase query failed |

### `GET /api/weeks/:week_id`

Returns the full scrollable payload for one weekly review owned by the session user.

**Response (200):**

```json
{
  "week_id": "1",
  "completed_at": "2026-05-01T21:12:03Z",
  "date_range": { "start": "2026-04-25", "end": "2026-05-01" },
  "reflections": [
    {
      "verse_key": "96:1",
      "ayah": "ٱقْرَأْ بِٱسْمِ رَبِّكَ ٱلَّذِى خَلَقَ",
      "translation": "Read in the name of your Lord who created.",
      "surah_name": "Al-Alaq",
      "mission_text": "Read five pages of Quran with translation today.",
      "reflection_text": "Read five pages after Fajr. Noticed how much I had been skimming before — slowed down on verse about the pen.",
      "did_apply": "yes_fully",
      "date": "2026-04-25"
    },
    {
      "verse_key": "2:286",
      "surah_name": "Al-Baqarah",
      "date": "2026-04-26",
      "...": "..."
    },
    {
      "verse_key": "49:11",
      "surah_name": "Al-Hujurat",
      "date": "2026-04-27",
      "...": "..."
    },
    {
      "verse_key": "103:1",
      "surah_name": "Al-Asr",
      "date": "2026-04-28",
      "...": "..."
    },
    {
      "verse_key": "55:13",
      "surah_name": "Ar-Rahman",
      "date": "2026-04-29",
      "...": "..."
    },
    {
      "verse_key": "4:36",
      "surah_name": "An-Nisa",
      "date": "2026-04-30",
      "...": "..."
    },
    {
      "verse_key": "95:4",
      "surah_name": "At-Tin",
      "date": "2026-05-01",
      "...": "..."
    }
  ],
  "closing_line": "You reflected on 7 ayat this week. May Allah accept your effort."
}
```

**Resolution of ayah text + translation per reflection:**

1. Prefer `corpus_entries` join on `verse_key` — this is the fast path for the 60+ curated ayat.
2. Fall back to the QF Content API (`/quran/verses/uthmani?verse_key=` + `/quran/translations/{id}?verse_key=`) for any deep-linked ayah outside our corpus (rare; only occurs if a future story permits non-corpus ayat). Cached 24h per-ayah via `fetch { next: { revalidate: 86400 } }`.

**Errors:**

| Status | Code           | Condition                                         |
| ------ | -------------- | ------------------------------------------------- |
| 400    | `BAD_WEEK_ID`  | `:week_id` is not a positive integer              |
| 401    | `UNAUTHORIZED` | No session cookie                                 |
| 404    | `NOT_FOUND`    | `week_id` does not exist for this user (RLS-safe) |

## Data Model & Migrations

**Decision:** materialise every 7-completion milestone in a `weekly_reviews` table rather than computing windows on the fly. Rationale: demo reliability, O(1) listing on grove home, and a clean seam for future features (push notifications on milestone, sharing, etc.).

### Table: `weekly_reviews`

| Field                         | Type        | Constraints                | Description                                 |
| ----------------------------- | ----------- | -------------------------- | ------------------------------------------- |
| id                            | serial      | PK                         | Surrogate id                                |
| user_id                       | uuid        | FK `users`, NOT NULL       | Owner                                       |
| week_number                   | int         | NOT NULL                   | 1, 2, 3... monotonic per user               |
| first_reflection_id           | uuid        | FK `reflections`, NOT NULL | First of the 7 reflections in this week     |
| seventh_reflection_id         | uuid        | FK `reflections`, NOT NULL | Seventh (and final) reflection in this week |
| completed_at                  | timestamptz | NOT NULL                   | Mirrors the 7th reflection's `submitted_at` |
| UNIQUE (user_id, week_number) |             |                            | Guarantees no duplicate weeks for a user    |

RLS: `SELECT USING (user_id = auth_user_id())`, no INSERT/UPDATE/DELETE from client (trigger-managed only).

### Migration — `supabase/migrations/0004_weekly_reviews.sql`

```sql
CREATE TABLE weekly_reviews (
  id                    serial PRIMARY KEY,
  user_id               uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_number           int  NOT NULL,
  first_reflection_id   uuid NOT NULL REFERENCES reflections(id) ON DELETE CASCADE,
  seventh_reflection_id uuid NOT NULL REFERENCES reflections(id) ON DELETE CASCADE,
  completed_at          timestamptz NOT NULL,
  UNIQUE (user_id, week_number)
);

CREATE INDEX weekly_reviews_user_completed_idx
  ON weekly_reviews(user_id, completed_at DESC);

ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY weekly_reviews_owner_select ON weekly_reviews
  FOR SELECT USING (user_id = auth_user_id());

-- Trigger: after each reflection insert, if the user's lifetime reflection
-- count is a positive multiple of 7, materialise a new weekly_reviews row.
CREATE OR REPLACE FUNCTION fn_materialise_weekly_review()
RETURNS trigger AS $$
DECLARE
  v_user_id    uuid;
  v_count      int;
  v_week_no    int;
  v_first_id   uuid;
  v_seventh_id uuid;
BEGIN
  -- Find user_id via mission -> daily_assignments join
  SELECT da.user_id
    INTO v_user_id
    FROM missions m
    JOIN daily_assignments da ON da.id = m.assignment_id
   WHERE m.id = NEW.mission_id;

  SELECT COUNT(*)
    INTO v_count
    FROM reflections r
    JOIN missions m2           ON m2.id = r.mission_id
    JOIN daily_assignments da2 ON da2.id = m2.assignment_id
   WHERE da2.user_id = v_user_id;

  IF v_count > 0 AND v_count % 7 = 0 THEN
    v_week_no := v_count / 7;

    -- Pick the window of the last 7 reflections by submitted_at
    WITH last7 AS (
      SELECT r.id, r.submitted_at,
             ROW_NUMBER() OVER (ORDER BY r.submitted_at ASC) AS rn
        FROM reflections r
        JOIN missions m3           ON m3.id = r.mission_id
        JOIN daily_assignments da3 ON da3.id = m3.assignment_id
       WHERE da3.user_id = v_user_id
       ORDER BY r.submitted_at DESC
       LIMIT 7
    )
    SELECT
      (SELECT id FROM last7 ORDER BY submitted_at ASC  LIMIT 1),
      (SELECT id FROM last7 ORDER BY submitted_at DESC LIMIT 1)
      INTO v_first_id, v_seventh_id;

    INSERT INTO weekly_reviews
      (user_id, week_number, first_reflection_id, seventh_reflection_id, completed_at)
    VALUES
      (v_user_id, v_week_no, v_first_id, v_seventh_id, NEW.submitted_at)
    ON CONFLICT (user_id, week_number) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reflections_materialise_weekly_review
  AFTER INSERT ON reflections
  FOR EACH ROW
  EXECUTE FUNCTION fn_materialise_weekly_review();
```

### Migration Notes

- **Depends on** `spec-evening-reflection.md` Task 1 having created the `reflections` table.
- **Backfill.** For demo accounts seeded with 7 reflections, the trigger fires during the seed script, so no explicit backfill is required. For a production backfill (if ever needed) run: `SELECT fn_backfill_weekly_reviews(user_id)` — helper left out of scope.
- **No downtime.** Trigger is additive and does not modify existing rows.

## UI/Frontend Requirements

### Components

**WeekReviewPage** — `app/(app)/week/[weekId]/page.tsx`

- **Type:** New (server component).
- **Purpose:** Top-level page, fetches `/api/weeks/:weekId` server-side and renders header + 7 cards + closing.
- **Data fetch:** Direct `lib/db/weeks.ts` call (co-located with the server component), no client round-trip.
- **404 handling:** Uses Next.js `notFound()` if the query returns null (unowned or non-existent week).

**WeekReviewHeader** — `app/(app)/week/[weekId]/_components/WeekReviewHeader.tsx`

- **Purpose:** Opening framing.
- **Content:** "Here's what Allah guided you through this week" + date range ("25 Apr – 1 May 2026").
- **Props:**
  ```typescript
  interface WeekReviewHeaderProps {
    weekNumber: number;
    dateRange: { start: string; end: string };
  }
  ```

**ReflectionCard** — `app/(app)/week/[weekId]/_components/ReflectionCard.tsx`

- **Purpose:** Renders one of the 7 reflection entries.
- **Content (top to bottom):** Day marker ("Day 3 — Wednesday"), Arabic ayah (wrapped in `<span translate="no" lang="ar">` per epic negative constraint), translation, surah + ayah reference (e.g., "Al-Hujurat 49:11"), mission text, user reflection text, small `did_apply` indicator (non-shaming; "Yes, fully" / "Partly" / "Not today" shown as neutral text).
- **Props:**
  ```typescript
  interface ReflectionCardProps {
    dayNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    verseKey: string;
    ayah: string;
    translation: string;
    surahName: string;
    missionText: string;
    reflectionText: string;
    didApply: "yes_fully" | "partly" | "not_today";
    date: string;
  }
  ```

**WeekClosing** — `app/(app)/week/[weekId]/_components/WeekClosing.tsx`

- **Purpose:** Closing line, no CTA, no share button, no "next week" prompt.
- **Content:** "You reflected on 7 ayat this week. May Allah accept your effort."

### User Interactions

- Scroll through the 7 cards in order — no pagination, no lazy load (payload is small: 7 entries ≈ 4 KB).
- Tap back → lands on grove home.
- No edit, share, export, or copy actions anywhere on the page.

### States

- **Loading:** Server-rendered, so no client loading state on first paint. If JS hydration delays, the static HTML is already readable.
- **Empty:** Not applicable — if the week exists, it has exactly 7 reflections. If it doesn't, the page 404s.
- **Error:** 404 renders the standard `app/not-found.tsx`; 500 renders the standard error boundary.

## Architecture Notes

- **Trigger-backed materialisation.** The `weekly_reviews` table is populated by a Postgres trigger on `reflections` insert. This guarantees that if a reflection is recorded, the corresponding weekly review row exists in the same transaction — no race between "reflection saved" and "review card appears".
- **Server-rendered, co-located data.** `app/(app)/week/[weekId]/page.tsx` is a Next.js 15 server component calling `lib/db/weeks.ts` directly (no internal HTTP hop). The `app/api/weeks/[weekId]/route.ts` JSON handler exists for programmatic use (e.g., grove-home client fetch of the latest-week card summary).
- **Ayah content reuse.** The same helper that renders an ayah package on `/today` (`lib/content/ayahPackage.ts`) is reused to fetch `ayah + translation + surah_name` for each of the 7 cards in a week. For corpus ayat, we join `corpus_entries` locally; for non-corpus ayat, we call QF Content API with `revalidate: 86400`.
- **No new dependencies.** Reuses Next.js App Router, Supabase client, existing shadcn/ui primitives.
- **Integration with grove-home.** Grove home calls `/api/weeks?limit=1` to decide whether to render the "new weekly review" card and the "Past weeks" strip. Implementation detail lives in the grove-home story; this story only exposes the API.

## Exemplar Files

- **Next.js 15 dynamic route + server component data fetching:** `app/(app)/today/page.tsx` (from `spec-morning-loop.md`) — same pattern of `async function Page({ params })`, direct DB call, `notFound()` on missing data.
- **Supabase RLS + trigger migration:** `supabase/migrations/0001_initial.sql` — follow its pattern for `CREATE POLICY` statements and `auth_user_id()` helper reference.
- **API route handler with session cookie lookup:** `app/api/qf/notes/route.ts` (from `spec-evening-reflection.md`) — copy the session-extraction prelude.
- **Arabic rendering:** `app/(app)/today/_components/AyahBlock.tsx` — wraps Arabic in `<span translate="no" lang="ar">` per the epic negative constraint.

## Implementation Plan

### Sub-tasks

**Task 1: Migration `0004_weekly_reviews.sql` with trigger** — _small_

- Files: `supabase/migrations/0004_weekly_reviews.sql`
- SEQUENTIAL (depends on `spec-evening-reflection.md` Task 1 — the `reflections` table must exist).
- Includes: table DDL, RLS policy, `fn_materialise_weekly_review()` function, `trg_reflections_materialise_weekly_review` trigger.
- Verification: unit test inserts 7 reflections for a test user and asserts exactly one `weekly_reviews` row with `week_number = 1`.

**Task 2: `lib/db/weeks.ts` — list + fetch queries** — _small_

- Files: `lib/db/weeks.ts`
- SEQUENTIAL (depends on Task 1).
- Exports: `listWeeksForUser(userId)`, `getWeekForUser(userId, weekNumber)` — the latter does the join against `reflections → missions → daily_assignments → corpus_entries` and returns the full payload shape.

**Task 3: API route handlers** — _small_

- Files: `app/api/weeks/route.ts`, `app/api/weeks/[weekId]/route.ts`
- SEQUENTIAL (depends on Task 2).
- Route prelude: read session cookie → resolve `user.id` → delegate to `lib/db/weeks.ts`. Non-owners get 404 (RLS returns empty, handler translates to `notFound`).

**Task 4: Week review page + components** — _medium_

- Files: `app/(app)/week/[weekId]/page.tsx`, `app/(app)/week/[weekId]/_components/WeekReviewHeader.tsx`, `app/(app)/week/[weekId]/_components/ReflectionCard.tsx`, `app/(app)/week/[weekId]/_components/WeekClosing.tsx`
- SEQUENTIAL (depends on Task 3).
- Server component, direct DB call. Invokes `notFound()` on missing/unowned week. Uses `<span translate="no" lang="ar">` for Arabic.

**Task 5: Surface latest weekly-review card on grove home** — _small_

- Files: `app/(app)/grove/page.tsx` (modify), `app/(app)/grove/_components/WeekReviewCard.tsx` (new).
- SEQUENTIAL (depends on `spec-grove-home.md` Task 3 — grove home structure must exist).
- Reads `listWeeksForUser(userId)`, renders the most-recent unread (or always-latest) week as a prominent card, and renders older weeks in a "Past weeks" strip linking to `/week/[weekId]`.

### Negative Constraints

- Do NOT expose weekly reviews across users — every query MUST pass through RLS-backed helpers in `lib/db/weeks.ts`; never raw-SQL bypass.
- Do NOT add sharing, export, printing, copy-to-clipboard, or any outbound surface on the week page.
- Do NOT allow editing of reflections from inside the review.
- Do NOT compute weeks on the fly as the primary read path — always read `weekly_reviews` (ephemeral compute is fine in tests only).
- Do NOT use QF Posts, Collections, or Rooms APIs as a storage backend for week metadata.
- Do NOT render Arabic inside a browser-translation-eligible element; always `<span translate="no" lang="ar">`.

## Test Scenarios

**Test 1: First week materialises after 7th reflection**

- Setup: User with 6 `reflections` rows, no `weekly_reviews` row yet.
- Action: Insert the 7th reflection (via `POST /api/qf/notes` mirror path, or directly via DB in unit test).
- Expected: Exactly one `weekly_reviews` row exists for the user with `week_number = 1`, `first_reflection_id` = reflection 1, `seventh_reflection_id` = reflection 7, `completed_at` = reflection 7's `submitted_at`.

**Test 2: 8th reflection does NOT re-trigger week 1**

- Setup: User with `week_number = 1` already materialised and 7 reflections.
- Action: Insert the 8th reflection.
- Expected: Still exactly one `weekly_reviews` row (`week_number = 1`); no duplicate; no `week_number = 2` yet. Count is 8, 8 % 7 ≠ 0, so trigger is a no-op.

**Test 3: 14th reflection materialises week 2**

- Setup: User with 13 reflections, `week_number = 1` already present.
- Action: Insert the 14th reflection.
- Expected: Two `weekly_reviews` rows exist (`week_number = 1` and `week_number = 2`). Week 2's `first_reflection_id` = reflection 8, `seventh_reflection_id` = reflection 14.

**Test 4: Week containing a `did_apply = 'not_today'` entry still counts as 7**

- Setup: 7 reflections where reflection 3 has `did_apply = 'not_today'`, all at least 40 characters.
- Action: Fetch `GET /api/weeks/1`.
- Expected: Response contains all 7 reflections (including the `not_today` one), `closing_line` = "You reflected on 7 ayat this week. May Allah accept your effort.", no special flag or shaming indicator on reflection 3.

**Test 5: Deep-link to unowned `week_id` returns 404**

- Setup: User A has `week_number = 1`. User B has no weeks. User B's session is active.
- Action: User B calls `GET /api/weeks/1` (probing User A's id).
- Expected: 404 `NOT_FOUND` (RLS returns empty, handler translates to `notFound`). No data from User A's week appears in the response body.

**Test 6 (bonus, atomicity): Reflection insert rollback does not leave orphan week**

- Setup: Mock a constraint violation on `reflections` insert (e.g., text < 40 chars — enforced by CHECK).
- Action: Attempt to insert reflection 7 with a 20-char text.
- Expected: Insert fails; no `weekly_reviews` row is created (trigger ran in the same transaction).

## Acceptance Criteria

- [ ] `supabase/migrations/0004_weekly_reviews.sql` creates the `weekly_reviews` table with RLS enabled and the trigger installed.
- [ ] Inserting the 7th reflection materialises `week_number = 1` atomically; inserting the 8th does not duplicate it.
- [ ] `GET /api/weeks` returns only the authenticated user's weeks, reverse-chronological.
- [ ] `GET /api/weeks/:week_id` returns the full 7-entry payload with ayah + translation + mission + reflection + `did_apply` + date, plus the exact closing line.
- [ ] `GET /api/weeks/:week_id` returns 404 when the week belongs to another user.
- [ ] `/week/[weekId]` server-renders the header, 7 `ReflectionCard` instances in chronological order, and the closing line with no CTA.
- [ ] Arabic text on the week page is wrapped in `<span translate="no" lang="ar">`.
- [ ] Grove home surfaces the latest weekly-review card and a "Past weeks" list linking to `/week/[weekId]`.
- [ ] No sharing, export, print, or edit affordances exist anywhere on the week page.
- [ ] RLS prevents any cross-user leak via direct table access or API probing.
- [ ] No type errors or lint warnings; `verifier` skill passes clean.

## Verification

Run the verifier skill to confirm changes are clean.

### Backend API Tests (Vitest)

- `tests/unit/db/weeks.test.ts` — unit tests for `listWeeksForUser`, `getWeekForUser`, including the 5 test scenarios above against a local Supabase instance.
- `tests/unit/migrations/weekly-reviews-trigger.test.ts` — asserts the trigger fires on every 7th reflection, is idempotent on the 8th, and runs inside the insert transaction (rollback leaves no orphan row).
- `tests/integration/api/weeks.test.ts` — hits `GET /api/weeks` and `GET /api/weeks/:week_id` with a seeded session cookie; asserts response shape, 404 on unowned id, 401 on missing cookie.

### Browser/UI Testing

- URL under test: `http://localhost:3000/week/1` with a demo-mode session cookie pre-seeded.
- Setup: run `pnpm seed:demo` to create a demo user with 7 seed reflections covering Al-Alaq 96:1, Al-Baqarah 2:286, Al-Hujurat 49:11, Al-Asr 103:1, Ar-Rahman 55:13, An-Nisa 4:36, At-Tin 95:4.
- Steps:
  1. Sign in as demo → land on grove home → verify "Your first week" card is visible. Expected: card labelled and tappable.
  2. Tap the card → verify URL = `/week/1`, header reads "Here's what Allah guided you through this week", date range is rendered.
  3. Scroll through all 7 `ReflectionCard`s → verify each shows Arabic ayah + translation + surah reference + mission + reflection + `did_apply` indicator in that order.
  4. Reach the bottom → verify `WeekClosing` shows the exact string "You reflected on 7 ayat this week. May Allah accept your effort." and no CTA buttons.
  5. Tap back → verify return to grove home with the week now visible in the "Past weeks" strip.
  6. Deep-link to `/week/999` while signed in → verify 404 page renders.
- Mobile viewport: 375×812 (iPhone 13 mini) — verify Arabic line-wrap and card padding are correct.

### E2E Tests (Playwright)

Each Key Scenario that involves a user-facing flow maps to an E2E test.

| Key Scenario                                                  | Test file                                     | Assigned sub-task |
| ------------------------------------------------------------- | --------------------------------------------- | ----------------- |
| First-week review appears after the seventh honest reflection | `tests/e2e/weekly-first-week-appears.spec.ts` | Task 5            |
| Reading the first-week review end to end                      | `tests/e2e/weekly-read-first-week.spec.ts`    | Task 4            |
| Subsequent week re-triggers the review                        | `tests/e2e/weekly-second-week.spec.ts`        | Task 5            |
| Partial week — review is earned, not timed                    | `tests/e2e/weekly-partial-week.spec.ts`       | Task 5            |
| An "honest Not today" reflection is included in the review    | `tests/e2e/weekly-not-today-included.spec.ts` | Task 4            |
| Re-opening a past week from history                           | `tests/e2e/weekly-past-weeks.spec.ts`         | Task 5            |
| Demo mode user lands on a pre-populated review                | `tests/e2e/weekly-demo-mode.spec.ts`          | Task 4            |

**Locator strategies:**

- `data-testid="week-review-card"` — grove home card linking into the current week.
- `data-testid="past-weeks-list"` — grove home past-weeks strip container.
- `data-testid="week-header"` / `data-testid="week-closing"` — header and closing blocks on the week page.
- `data-testid="reflection-card-day-{1..7}"` — the 7 ordered cards.
- `data-testid="did-apply-indicator"` — neutral `did_apply` badge inside a card.
- ARIA roles: `role="main"` on the page container, `role="article"` on each `ReflectionCard`.
