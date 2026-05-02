# Evening Reflection & Tree Growth

**Ticket:** TBD
**Discovery Brief:** `docs/discovery/quran-ayah-apply/brief.md`
**Epic Overview:** `docs/specs/TBD-quran-ayah-apply/spec.md`

This feature is the second of the two daily touches that define Quran Ayah Apply. After a user has committed in the morning to a specific mission inspired by the day's ayah, this feature brings them back in the evening to honestly report what happened, capture a short written reflection, and complete the visible growth of that day's tree in their grove. It is the moment the day's loop closes — where meaning is converted into a named, remembered action — and is the single most important interaction for the product's core outcome of turning Quranic reading into lived practice.

## User Story

As a practicing Muslim who committed to a mission inspired by today's ayah, I want to return in the evening to honestly answer whether I acted on it and capture what happened in a short written reflection, so that the day's meaning is turned into something I have named, remembered, and can look back on — and so my grove grows as a record of what Allah has guided me through.

## Background & Context

**Current state:**

- Users who have engaged with the morning touch have committed to a specific mission inspired by today's ayah and are carrying that commitment through their day.
- Existing Quran apps do not prompt a structured return in the evening to name what the user actually did — reflection, where it exists, is unscaffolded and often skipped.
- Without a structural closing touch, the day's ayah dissolves back into the pile of things-read-but-not-acted-on, which is exactly the pain this product exists to solve.

**Problem:**

- Without an evening return, the morning commit becomes a well-intentioned promise with no accountability, no record, and no cumulative story.
- Without a minimum-quality reflection bar, a streak mechanic invites users to tap-through and farm trees, hollowing out the product.
- Without an explicit honest option ("Not today"), users feel pressured to lie or abandon the app on hard days — both outcomes are failures.

## Target User & Persona

- **Who:** A practicing, non-Arabic-speaking Muslim who opened the app this morning, read today's ayah, and committed to a specific mission.
- **Context:** Evening — typically after Isha, at the user's chosen evening notification time. The user is often tired, sometimes uncertain whether they actually kept their commitment, and needs a gentle, low-friction invitation to be honest.
- **Current workaround:** Mental recap without writing, or no recap at all. The day's intention is forgotten by the next morning.

## Goals

- Give every user who committed in the morning a low-friction, dignified evening return that completes the day's loop.
- Reward honesty as strongly as success — a user who says "Not today" with a real reflection is given the same completed-day treatment as a user who says "Yes, fully."
- Hold a genuine quality bar for what counts as reflection (40 characters) so the grove represents real thought, not streak-farming.
- Close the day cleanly at 3:00am local time so the app never feels stale and the next morning's ayah is always waiting.

## Non-Goals

- This feature does not surface the morning ayah-display or mission-selection flow — that is handled by the morning loop story.
- This feature does not render the grove home screen or compute month/week totals — it updates state that the grove home screen reads.
- This feature does not produce the weekly seven-day summary — that is the weekly review story.
- This feature does not support browsing, searching, or re-reading past reflections — that is the bookmarks and journal story. It only covers writing and editing today's reflection during the open window.
- This feature does not schedule or deliver the evening notification — the notifications story owns that.

## User Workflow

1. **Evening notification arrives** — At the user's chosen evening time, a gentle reminder brings them back to the app.
2. **User opens the app** — They are taken directly to the evening reflection screen for today, which shows the ayah they read this morning and the specific mission they committed to, so they remember what they are reflecting on.
3. **User answers "Did you act on it?"** — Three options are available: _Yes, fully_, _Partly_, and _Not today_. The user selects one.
4. **User writes "What happened?"** — A freeform text area invites a short written reflection. A visible character counter shows progress toward the 40-character minimum needed to complete the day.
5. **User submits** — If the answer is selected and the reflection is at least 40 characters, submit is enabled. On submit, the sapling animation from the morning completes into a full tree, the grove updates, the streak updates, and a brief thank-you acknowledgement is shown.
6. **User may edit until the window closes** — Any time before 3:00am local, the user can return and refine their reflection. After 3:00am, the day is finalised and the reflection becomes read-only in the journal.

## Acceptance Criteria

### Scenario: User completes the happy path with a full "Yes, fully" reflection

```gherkin
Given Ahmad committed this morning to the mission "Spend 15 minutes learning something that brings you closer to Allah" inspired by Surah Al-Alaq
  And his chosen evening notification time is 9:00pm
  And the current local time is 9:05pm
When Ahmad opens the app from the evening notification
  And he sees today's ayah and the mission he committed to displayed at the top of the reflection screen
  And he selects "Yes, fully"
  And he writes "I sat with Ibn Kathir's tafsir on this verse for 20 minutes after Maghrib. I noticed I always skipped the tafsir section before. Felt different to slow down."
  And he taps Submit
Then Ahmad sees the sapling from this morning complete its growth into a full tree
  And he sees a brief acknowledgement that today's reflection has been saved
  And his grove now shows one additional tree for today
  And his streak count has increased by one
```

### Scenario: User selects "Partly" and reflects on what got in the way

```gherkin
Given Fatima committed this morning to the mission "Send a kind message to a family member you haven't spoken to this week" inspired by Surah An-Nisa
  And the current local time is 10:15pm
When Fatima opens the evening reflection screen
  And she selects "Partly"
  And she writes "I messaged my aunt but not my brother. I kept putting off the brother one because I know it will be a longer conversation. Tomorrow."
  And she taps Submit
Then Fatima sees her tree complete its growth
  And today is recorded as a completed reflection day
  And her streak count increases by one
```

### Scenario: User selects "Not today" with an honest reflection and is still rewarded

```gherkin
Given Yusuf committed this morning to the mission "Make one extra dua for a person you are struggling with" inspired by Surah Al-Furqan
  And the current local time is 11:40pm
When Yusuf opens the evening reflection screen
  And he selects "Not today"
  And he writes "Work meetings ran over and I forgot until just now. Being honest: I didn't even think about it after lunch."
  And he taps Submit
Then Yusuf sees his tree complete its growth as a visibly distinct sapling of honest reflection
  And today is recorded as a completed reflection day
  And his streak count increases by one
  And a gentle note confirms that honesty counts
```

### Scenario: User selects "Not today" with too short a reflection and is prompted to add more or explicitly skip

```gherkin
Given Maryam committed this morning to a mission inspired by Surah Al-Asr
  And the current local time is 10:30pm
When Maryam opens the evening reflection screen
  And she selects "Not today"
  And she writes only "couldn't"
  And she taps Submit
Then Maryam sees a gentle hint explaining the reflection needs at least 40 characters to count
  And she sees her current character count (8) next to the minimum (40)
  And she is offered two choices: add more to her reflection, or confirm "skip for today"
  And no tree is grown and no streak change occurs until she chooses
```

### Scenario: User confirms "skip for today" after a too-short "Not today" reflection

```gherkin
Given Maryam has written an 8-character reflection and been prompted to add more or skip
When Maryam taps "skip for today" and confirms on the confirmation prompt
Then today is recorded as a missed day
  And no tree is added to Maryam's grove for today
  And the one-missed-day-per-rolling-7-days forgiveness rule preserves her streak if applicable
  And Maryam is returned to the app's home view
```

### Scenario: User tries to submit with a reflection below the 40-character floor

```gherkin
Given Omar has selected "Yes, fully"
  And Omar has written "Yes I did it today" (18 characters)
When Omar looks at the Submit control
Then Submit is not available
  And Omar sees a calm hint reading "A little more — reflections need at least 40 characters to count. (18/40)"
  And the character counter updates as Omar types
```

### Scenario: User reaches exactly 40 characters and Submit becomes available

```gherkin
Given Omar has selected "Yes, fully"
When Omar writes a reflection that reaches exactly 40 characters
Then Submit becomes available
  And the character counter reads "40/40"
```

### Scenario: User taps Submit without selecting an answer to "Did you act on it?"

```gherkin
Given Sara is on the evening reflection screen
  And Sara has not selected any option for "Did you act on it?"
  And Sara has written a 120-character reflection
When Sara taps Submit
Then Sara sees a gentle prompt asking her to pick one of "Yes, fully", "Partly", or "Not today"
  And the reflection she has already written remains in place
  And no tree is grown and no state is changed until she selects an option
```

### Scenario: User submits a late reflection within the window (before 3:00am)

```gherkin
Given Hamza committed this morning to a mission inspired by Surah At-Talaq
  And the current local time is 2:30am the following morning
  And the reflection window closes at 3:00am local time
When Hamza opens the evening reflection screen
  And he selects "Partly"
  And he writes a 95-character honest reflection
  And he taps Submit
Then Hamza's reflection is accepted for the previous calendar day
  And his tree for that day completes growth
  And his streak and grove update as for any completed day
```

### Scenario: User opens the app after the reflection window has closed

```gherkin
Given Hamza committed yesterday to a mission inspired by Surah At-Talaq
  And Hamza did not submit an evening reflection before 3:00am this morning
  And the current local time is 4:00am
When Hamza opens the app
Then Hamza sees today's new ayah on the morning screen, not yesterday's reflection form
  And yesterday appears in his grove as a missed day with no tree
  And if yesterday is the first miss in a rolling 7-day window, his streak is preserved by the automatic forgiveness rule
  And Hamza cannot write or edit a reflection for yesterday
```

### Scenario: User edits a submitted reflection before the window closes

```gherkin
Given Layla submitted her reflection at 9:00pm reading "Short version, I did the dhikr after Asr but not Maghrib" (55 characters)
  And the current local time is 11:00pm
When Layla reopens the evening reflection screen
  And she changes her reflection to "I did the dhikr after Asr but not after Maghrib. Realised I only remember when I'm already sitting down — need to build a physical trigger." (141 characters)
  And she taps Save
Then Layla's updated reflection replaces the earlier version
  And her tree and grove remain unchanged (still one completed tree for today)
  And her streak remains unchanged
```

### Scenario: User tries to edit a reflection after the window has closed

```gherkin
Given Layla submitted a reflection yesterday evening
  And the current local time is the following afternoon (well after 3:00am)
When Layla navigates to yesterday's reflection in her journal
Then yesterday's reflection is shown in read-only form
  And no edit control is available
  And Layla sees a quiet note that the day has been closed
```

### Scenario: User opens the evening flow without having committed in the morning

```gherkin
Given Ibrahim did not open the app this morning
  And Ibrahim did not commit to a mission for today
  And the current local time is 9:00pm
When Ibrahim opens the app
Then Ibrahim does not see an evening reflection form
  And Ibrahim sees a gentle message: "You didn't start today — come back tomorrow morning for a fresh ayah."
  And Ibrahim cannot write a reflection for today
  And today will be recorded as a missed day at the 3:00am cutoff
```

### Scenario: User changes their mind from "Yes, fully" to "Not today" before submitting

```gherkin
Given Amina is on the evening reflection screen
  And Amina initially selected "Yes, fully"
  And Amina wrote an 80-character reflection
When Amina changes her selection to "Not today"
  And she taps Submit
Then her reflection text is preserved
  And the submission is recorded as "Not today"
  And her tree completes growth as a sapling of honest reflection
  And her streak updates as for any completed day
```

### Scenario Outline: Each answer option produces an appropriate outcome when paired with a qualifying reflection

```gherkin
Given a user has committed to a mission earlier today
  And the current local time is within the reflection window
When the user selects <answer>
  And the user writes a reflection of at least 40 characters
  And the user taps Submit
Then the day is recorded as <day_status>
  And the user's grove gains <tree_outcome>
  And the user's streak <streak_effect>

Examples:
  | answer      | day_status             | tree_outcome                               | streak_effect     |
  | Yes, fully  | completed — acted fully | a full tree                                | increases by one  |
  | Partly      | completed — acted partly | a full tree                                | increases by one  |
  | Not today   | completed — honest miss  | a sapling of honest reflection             | increases by one  |
```

### Scenario: User enters the evening screen multiple times before submitting

```gherkin
Given Khalid opened the evening reflection screen at 8:15pm and typed a partial reflection of 22 characters without submitting
  And Khalid closed the app
  And the current local time is 9:45pm
When Khalid reopens the evening reflection screen
Then Khalid's in-progress reflection of 22 characters is still present
  And his previously selected "Did you act on it?" answer, if any, is still selected
  And he can continue writing from where he left off
```

## Business Rules & Constraints

- **Prerequisite: morning commit.** A user may only access the evening reflection form for a day in which they committed to a mission earlier that same day. If they did not commit, they see a gentle "you didn't start today — come back tomorrow" message and cannot write a reflection for that day.
- **Three answer options.** "Did you act on it?" offers exactly three options: _Yes, fully_, _Partly_, and _Not today_. Exactly one must be selected before submission.
- **40-character reflection floor.** A reflection must contain at least 40 characters to complete the day's tree, update the streak, and add to the grove. The Submit control is unavailable below 40 characters and a live character counter is shown.
- **Honesty is rewarded.** A "Not today" answer paired with a reflection of at least 40 characters counts as a completed check-in: the tree is grown (visibly distinct as a sapling of honest reflection), the streak updates, and the grove increments.
- **Skip-for-today path.** If a user selects "Not today" and writes fewer than 40 characters, they may explicitly confirm "skip for today", which records the day as missed. Missed days do not grow a tree, and the one-free-pass-per-rolling-7-days rule preserves the streak for a single slip per window.
- **Reflection window.** Reflection submission is open from the moment of morning commit until 3:00am local time the following morning. After 3:00am the day is finalised.
- **Missed-window = missed day.** If the window closes before the user submits, the day is recorded as missed — no tree, no streak credit beyond the one-free-pass-per-week rule.
- **Edit before close, locked after.** The reflection may be edited freely until the window closes at 3:00am local. After that, the reflection is locked and becomes read-only in the private journal.
- **Privacy.** Reflections are private to the user's account and never shared, shown publicly, or attributed to the user outside their own view.
- **Mission visibility at reflection time.** The reflection screen must display today's ayah reference and the specific mission the user committed to, so they are reflecting on the right thing.
- **One reflection per day.** A user submits at most one reflection per calendar day. Edits replace the prior version; a second reflection cannot be created for the same day.

## Success Metrics

- **Evening return rate.** Percentage of users who committed in the morning and then submitted an evening reflection the same day. Target: ≥60% for pilot users by week two.
- **Honest-miss rate.** Share of reflections where the user selects "Not today" but still writes a qualifying reflection. A healthy figure (≥10%) indicates the honesty mechanic is trusted, not avoided.
- **Median reflection length.** Characters per submitted reflection. Target: ≥80 characters (twice the floor), signalling genuine reflection rather than streak-farming.
- **Window-closed miss rate.** Percentage of committed days where the window closes unanswered. Target: ≤20%. A higher figure signals the evening notification or return flow needs attention.

## Dependencies

- The user must have completed the morning loop (ayah read, mission committed) for the same calendar day — this feature cannot function without that prerequisite.
- The grove home screen reads the state this feature writes and is the place the newly grown tree becomes visible.
- The bookmarks and journal feature reads saved reflections after their window has closed.
- The notifications feature triggers the evening return that brings most users to this flow.
- The curated ayah and mission corpus provides the content this feature displays at the top of the reflection screen.

## Open Questions

- [x] ~~Does "Not today" with a qualifying reflection count as a completed day?~~ — **Resolved:** Yes. Honesty is rewarded; the tree grows (visibly distinct as a sapling of honest reflection) and the streak updates.
- [x] ~~What is the minimum reflection length?~~ — **Resolved:** 40 characters — low enough to be humane, high enough to force a thought, set in the epic's shared business rules.
- [x] ~~How long is the reflection window open?~~ — **Resolved:** From morning commit until 3:00am local the following morning; set in the epic's shared business rules.
- [x] ~~Can a user edit a submitted reflection?~~ — **Resolved:** Yes, until the window closes at 3:00am local. After that, the reflection is locked into the journal.
- [x] ~~What happens if a user opens the evening flow without having committed that morning?~~ — **Resolved:** Shown a gentle "you didn't start today — come back tomorrow" message; no backfill, matching the epic-wide no-backfill rule.
- [x] ~~Should "Not today" visibly differ from "Yes, fully" / "Partly" in the grove?~~ — **Resolved:** Yes — a sapling of honest reflection, visibly distinct from a full tree, reinforces that the day counted while being truthful about what happened. Exact visual treatment is a UX polish concern, not a behavioural rule.
- [ ] Exact wording of the "you didn't start today" message and the honest-miss acknowledgement — **Deferred (non-blocking):** Copy refinement during build; the behavioural rule is fixed.

---

## Functional Requirements

### Atomicity

- The evening submission triggers four writes in strict order:
  1. Insert (or update) a row in `reflections`.
  2. `POST /notes` to the Quran Foundation User API (store `qf_note_id` on the row).
  3. `POST /activity/day` to register today as an activity day (used by QF to auto-compute the streak).
  4. `GET /streaks/current` to read back the authoritative streak count for the UI response.
- **Local insert is the canonical source of user-visible success.** If step 1 fails, the request fails (no tree growth, no success toast). If step 1 succeeds but any of steps 2–4 fail, the reflection row is kept (with `qf_note_id: null` where applicable), an entry is written to `qf_api_errors`, and a background retry worker attempts the remote writes. The user sees a success state with a subtle "saved locally" toast.
- The reflections row is **never** deleted in response to a QF failure. Rollback only applies when the Supabase insert itself fails.

### Idempotency

- The `reflections.mission_id` column has a `UNIQUE` constraint, so there is exactly one reflection per mission.
- A second `POST /api/reflections` for the same `mission_id`:
  - If `now() < window_closes_at` → treated as an **edit**: the existing row is updated and the same `reflection_id` returned (HTTP `200`).
  - If `now() >= window_closes_at` → returns HTTP `409 CONFLICT_WINDOW_CLOSED` with no writes.
- `PATCH /api/reflections/:id` is idempotent within the window: repeating the same payload produces the same final state.

### Validation & Business Rules

- `text` must be ≥ 40 characters. Enforced at **three** layers: client (Submit disabled), route handler (400 on submit), and database (`CHECK (length(text) >= 40)`).
- `text` must be ≤ 2000 characters (app + DB CHECK).
- `did_apply` must be one of `yes_fully`, `partly`, `not_today` (Postgres `CHECK` constraint).
- `window_closes_at` is computed once, at insert time, as `date_trunc('day', committed_at at time zone user_tz) + interval '1 day 3 hours'` — i.e. 3:00am on the calendar day after the commit.
- The mission referenced by `mission_id` must belong to the authenticated user (RLS-enforced).

## Permissions & Security

- **Scope:** Authenticated PWA session only. Every endpoint requires a valid Supabase session cookie that resolves to a `users.id` with non-expired `qf_sessions`.
- **Authorization:** RLS policies on `reflections` and `missions` restrict SELECT / INSERT / UPDATE / DELETE to the owning user. The route handler uses the Supabase client created from the session cookie, so the DB enforces ownership automatically.
- **Token handling:** The QF access token is looked up server-side from `qf_sessions`, never exposed to the browser.
- **Input validation:** Text length (40–2000), `did_apply` enum, `mission_id` UUID shape, `reflection_id` UUID shape. Text is stored as-is (no HTML interpreted anywhere) — the UI renders it inside a `<p>` with whitespace-preserving CSS.
- **Rate limiting:** Default Next.js route handler rate limiting plus a Supabase-side soft cap of 50 reflection writes per user per hour (way above any plausible honest flow).

## API Design

### `POST /api/reflections`

Create or update (within window) today's reflection for the caller's morning-committed mission.

**Request:**

```json
{
  "mission_id": "8f4c2e4a-5b7a-4b2c-9d13-2e6f5d9a1c33",
  "did_apply": "yes_fully",
  "text": "I sat with Ibn Kathir's tafsir on Al-Alaq for 20 minutes after Maghrib. I noticed I always skipped the tafsir section before. Felt different to slow down and actually absorb what Allah means by 'Read'."
}
```

**Response (200):**

```json
{
  "reflection_id": "c7ab91d4-6b4e-4a1f-9b22-f1c8e0bdc4a9",
  "mission_id": "8f4c2e4a-5b7a-4b2c-9d13-2e6f5d9a1c33",
  "did_apply": "yes_fully",
  "qf_note_id": "note_018f29c4b3",
  "submitted_at": "2026-05-02T21:05:12-04:00",
  "window_closes_at": "2026-05-03T03:00:00-04:00",
  "tree_growth_complete": true,
  "streak": {
    "current_days": 8,
    "source": "qf"
  }
}
```

**Response (200, QF sync partial-fail):**

```json
{
  "reflection_id": "c7ab91d4-6b4e-4a1f-9b22-f1c8e0bdc4a9",
  "mission_id": "8f4c2e4a-5b7a-4b2c-9d13-2e6f5d9a1c33",
  "did_apply": "not_today",
  "qf_note_id": null,
  "submitted_at": "2026-05-02T23:48:02-04:00",
  "window_closes_at": "2026-05-03T03:00:00-04:00",
  "tree_growth_complete": true,
  "streak": {
    "current_days": 5,
    "source": "local_estimate"
  },
  "sync_status": "retry_queued"
}
```

**Errors:**

| Status | Code                     | Condition                                                                |
| ------ | ------------------------ | ------------------------------------------------------------------------ |
| 400    | `REFLECTION_TOO_SHORT`   | `text` length < 40.                                                      |
| 400    | `REFLECTION_TOO_LONG`    | `text` length > 2000.                                                    |
| 400    | `INVALID_DID_APPLY`      | `did_apply` not in `yes_fully` / `partly` / `not_today`.                 |
| 401    | `UNAUTHENTICATED`        | No valid session cookie.                                                 |
| 404    | `MISSION_NOT_FOUND`      | `mission_id` missing or not owned by caller.                             |
| 409    | `CONFLICT_WINDOW_CLOSED` | `now() >= window_closes_at` for the existing reflection.                 |
| 500    | `QF_NOTE_SYNC_FAILED`    | Logged only — the request still succeeds; `sync_status: "retry_queued"`. |

### `PATCH /api/reflections/:id`

Edit an existing reflection within the window. Any of the three body fields may be sent.

**Request:**

```json
{
  "did_apply": "partly",
  "text": "Follow-up: I revisited the tafsir after Isha and realised the 'Read' command has a worship dimension I had glossed over. Updating."
}
```

**Response (200):** Same shape as `POST` 200.

**Errors:** Same table; additionally `404 REFLECTION_NOT_FOUND` if the id is missing or not owned by the caller.

### `GET /api/reflections/:id`

Read back a single reflection (used by the edit view and the journal story after window-close).

**Response (200):**

```json
{
  "reflection_id": "c7ab91d4-6b4e-4a1f-9b22-f1c8e0bdc4a9",
  "mission_id": "8f4c2e4a-5b7a-4b2c-9d13-2e6f5d9a1c33",
  "did_apply": "yes_fully",
  "text": "I sat with Ibn Kathir's tafsir on Al-Alaq for 20 minutes after Maghrib. I noticed I always skipped the tafsir section before. Felt different to slow down and actually absorb what Allah means by 'Read'.",
  "qf_note_id": "note_018f29c4b3",
  "submitted_at": "2026-05-02T21:05:12-04:00",
  "window_closes_at": "2026-05-03T03:00:00-04:00",
  "is_editable": false
}
```

### Downstream QF calls (server-side only)

On each `POST /api/reflections`, after the Supabase insert the route handler sequentially calls:

1. **`POST /notes`** — body `{ "verse_key": "96:1", "body": "<reflection text>" }` (confirmed in `lib/qf/user.ts`). Returns `{ "id": "..." }` which we persist as `reflections.qf_note_id`.
2. **`POST /activity/day`** — body `{ "date": "2026-05-02", "seconds_read": 60 }` (confirmed in `lib/qf/user.ts`). `seconds_read` is nominal; a non-zero record signals the day as active to the QF streak engine.
3. **`GET /streaks/current`** (confirmed in `lib/qf/user.ts`) — reads back the QF-computed streak for inclusion in the response.
4. QF auto-computes the streak from registered activity days; there is **no** explicit "POST streaks" call unless live docs require one. Default: rely on server-side auto-compute.

All four calls go through `lib/qf/user.ts`, which attaches `x-auth-token` and `x-client-id` headers and writes failures to `qf_api_errors` for the retry worker.

## Data Model & Migrations

The `reflections` table already exists in the shared Supabase schema. Story adds CHECK constraints and computed defaults, plus a new `qf_api_errors` table for the retry worker.

### Migration — `supabase/migrations/0003_reflections.sql`

**Alter `reflections`:**

```sql
ALTER TABLE reflections
  ADD CONSTRAINT reflections_text_min_length CHECK (length(text) >= 40),
  ADD CONSTRAINT reflections_text_max_length CHECK (length(text) <= 2000),
  ADD CONSTRAINT reflections_did_apply_valid CHECK (did_apply IN ('yes_fully', 'partly', 'not_today'));

CREATE UNIQUE INDEX IF NOT EXISTS reflections_mission_id_uniq ON reflections (mission_id);

CREATE INDEX IF NOT EXISTS reflections_window_closes_at_idx ON reflections (window_closes_at);
```

**Compute `window_closes_at` at insert time:** the route handler sets it explicitly as `date_trunc('day', committed_at AT TIME ZONE user_tz) + interval '1 day 3 hours'` — we do not rely on a DB trigger so the user timezone comes from the authenticated session payload.

**New table — `qf_api_errors`:**

| Field         | Type        | Constraints                  | Description                                                |
| ------------- | ----------- | ---------------------------- | ---------------------------------------------------------- |
| id            | uuid        | PK DEFAULT gen_random_uuid() |                                                            |
| user_id       | uuid        | FK users, NOT NULL           |                                                            |
| endpoint      | text        | NOT NULL                     | e.g. `"POST /notes"`                                       |
| payload       | jsonb       | NOT NULL                     | Serialised request body (reflection text, verse_key, etc.) |
| related_id    | uuid        |                              | `reflections.id` for reflection-originated errors          |
| status_code   | int         |                              | QF response status                                         |
| error_body    | text        |                              | QF response body, truncated to 4kB                         |
| attempts      | int         | NOT NULL DEFAULT 0           |                                                            |
| next_retry_at | timestamptz | NOT NULL DEFAULT now()       | Exponential backoff                                        |
| resolved_at   | timestamptz |                              | Non-null once the retry succeeds                           |
| created_at    | timestamptz | NOT NULL DEFAULT now()       |                                                            |

```sql
CREATE INDEX qf_api_errors_retry_idx ON qf_api_errors (resolved_at, next_retry_at)
  WHERE resolved_at IS NULL;
```

RLS: users may `SELECT` their own rows (for debugging surfaces later); only the service-role key used by the cron worker may `UPDATE` / `DELETE`.

### Migration Notes

- No data backfill needed — the table is being tightened before any real users write rows.
- The CHECK on `length(text) >= 40` will fail to add if any row violates it; acceptable since this is pre-launch.
- `gen_random_uuid()` requires `pgcrypto` — already enabled in `0001_initial.sql`.

## UI/Frontend Requirements

The evening flow is a phase of `app/(app)/today/page.tsx`. When the URL contains `?phase=reflect` (set either by direct link from the notification or by the morning-loop flow after 3pm local), the page renders the reflection view from `app/(app)/today/reflect/`.

### Components

**`ReflectView`** — `app/(app)/today/reflect/ReflectView.tsx`

- **Type:** New
- **Purpose:** Container that fetches today's assignment + mission + existing reflection, drives state machine, and composes the four child components.
- **Props:**

  ```typescript
  interface ReflectViewProps {
    userTimezone: string;
    assignment: {
      verseKey: string;
      ayahText: string;
      translation: string;
      mission: { id: string; text: string };
    };
    existingReflection: {
      id: string;
      didApply: "yes_fully" | "partly" | "not_today";
      text: string;
      windowClosesAt: string;
    } | null;
  }
  ```

**`DidApplyPicker`** — `app/(app)/today/reflect/DidApplyPicker.tsx`

- **Type:** New (wraps shadcn `RadioGroup`)
- **Purpose:** The three-option picker for "Did you act on it?".
- **Props:**

  ```typescript
  interface DidApplyPickerProps {
    value: "yes_fully" | "partly" | "not_today" | null;
    onChange: (next: "yes_fully" | "partly" | "not_today") => void;
    disabled?: boolean;
  }
  ```

**`ReflectionTextarea`** — `app/(app)/today/reflect/ReflectionTextarea.tsx`

- **Type:** New (wraps shadcn `Textarea`)
- **Purpose:** Multi-line input with live character count, 40-char floor hint, and 2000-char hard cap.
- **Props:**

  ```typescript
  interface ReflectionTextareaProps {
    value: string;
    onChange: (next: string) => void;
    minChars: 40;
    maxChars: 2000;
    disabled?: boolean;
  }
  ```

**`SubmitButton`** — `app/(app)/today/reflect/SubmitButton.tsx`

- **Type:** New (wraps shadcn `Button`)
- **Purpose:** Disabled until `didApply` is set AND `text.length >= 40`. Shows spinner while submitting.

**`TreeGrowthAnimation`** — `app/(app)/today/reflect/TreeGrowthAnimation.tsx`

- **Type:** New (CSS/Lottie)
- **Purpose:** Plays the sapling → tree growth animation on successful submit. Different end-state asset for `not_today` ("sapling of honest reflection").

### User Interactions

- Select a "Did you act on it?" option → state update, Submit re-evaluates.
- Type in the textarea → live character count updates, Submit re-evaluates at ≥ 40 chars.
- Tap Submit (enabled) → `POST /api/reflections`, button goes into submitting state, on success the `TreeGrowthAnimation` plays and the user is routed to `/grove`.
- On partial QF failure → same animation plays; a toast reads "Saved locally — we'll sync when you're back online."
- After window close → the whole view renders read-only with a quiet "this day has been closed" note.

### States

- **Pre-submit:** form enabled, Submit disabled until valid.
- **Submitting:** form disabled, Submit shows spinner.
- **Success (full sync):** tree animation plays, redirect to `/grove` after ~1.5s.
- **Success (partial sync):** tree animation plays, "saved locally" toast, redirect after ~1.5s.
- **Error (local insert failed):** inline banner "We couldn't save your reflection — tap Submit again"; form remains filled.
- **Window-closed:** `window_closes_at <= now()` → read-only view with `is_editable: false`.

## Architecture Notes

- **New dependencies:** none beyond what the epic already pulls in (shadcn, supabase-js, optionally `lottie-react` if a Lottie animation is chosen — CSS fallback is the default).
- **Multi-API write strategy:** `POST /api/reflections` sequences the QF writes inside a try/catch per step. A single failure in step 2 or 3 enqueues a row in `qf_api_errors` and returns success with `sync_status: "retry_queued"`. A failure in step 1 (Supabase insert) returns 500.
- **Retry worker:** `app/api/cron/qf-retry/route.ts` scans `qf_api_errors WHERE resolved_at IS NULL AND next_retry_at <= now()` every 5 minutes (Vercel cron), replays the request using the stored `payload`, and either marks `resolved_at = now()` or bumps `attempts` and `next_retry_at = now() + 2^attempts minutes` (capped at 1h, dropped after 12 attempts).
- **Streak authority:** the QF Streaks API is the canonical source of truth. `lib/streak.ts` contains client-side **display** helpers (rolling-7-day free-pass formatting, "honesty counted today" banner) but does **not** recompute the streak independently; it reads the QF value and decorates.
- **Integration with morning-loop:** `app/(app)/today/page.tsx` is the phase switcher. It reads the session + assignment + mission, and if a mission exists and the current time is past a threshold (configurable per user; default after evening notification fires) it renders `phase=reflect`. Otherwise it renders the morning-loop view.

## Exemplar Files

- **Route Handler with Supabase + external API calls** — follow the pattern already used in `app/api/auth/callback/route.ts` for server-side token exchange: a single handler that awaits each step, catches per-step, and returns JSON.
- **QF client wrapper** — follow `lib/qf/client.ts` (shared fetch wrapper that attaches `x-auth-token` and `x-client-id`) as the base for `lib/qf/user.ts` additions.
- **RLS-scoped Supabase query** — follow `lib/db/missions.ts` for how the morning-loop story creates the ownership-scoped client from the session cookie.
- **Cron route** — follow `app/api/push/schedule/route.ts` (notifications story) for the Vercel-cron + `Authorization: Bearer $CRON_SECRET` pattern.

## Implementation Plan

### Sub-tasks

**Task 1: Migration `0003_reflections.sql`** — _small_ (<100 LOC)

- Files: `supabase/migrations/0003_reflections.sql`
- Contents: the CHECK constraints and unique index on `reflections`, the new `qf_api_errors` table, RLS policies for both.
- **SEQUENTIAL** — depends on the morning-loop story's Task 1 (which creates the `missions` table and the base `reflections` row definition in `0002_missions.sql`).

**Task 2: `lib/qf/user.ts` — Notes, Activity, Streaks wrappers** — _medium_ (100–300 LOC)

- Files: `lib/qf/user.ts`
- Add `postNote({ verseKey, body })`, `postActivityDay({ date, secondsRead })`, `getCurrentStreak()`, plus a shared `recordQfError(userId, endpoint, payload, response)` helper that writes to `qf_api_errors`.
- **INDEPENDENT** — depends only on the shared `lib/qf/client.ts` which lands with onboarding.

**Task 3: `app/api/reflections/route.ts` + `[id]/route.ts`** — _medium_ (100–300 LOC)

- Files: `app/api/reflections/route.ts`, `app/api/reflections/[id]/route.ts`
- POST handler: validate → insert → call QF sequentially → return. PATCH + GET on the [id] route. Error enqueue to `qf_api_errors` on partial failure.
- **SEQUENTIAL** — depends on Task 1 (schema) and Task 2 (QF wrappers).

**Task 4: `lib/streak.ts` — display helpers** — _small_ (<100 LOC)

- Files: `lib/streak.ts`
- Pure functions that take the QF streak value + the user's `reflections` history for the last 7 local days and return `{ displayDays, hasFreePassRemaining, honestyToday }`. No DB writes.
- **SEQUENTIAL** — depends on Task 1 (needs the `reflections` table shape to read history). Independent of Tasks 2–3.

**Task 5: Reflection UI — phase switcher + components** — _medium_ (100–300 LOC)

- Files: `app/(app)/today/page.tsx` (phase switcher), `app/(app)/today/reflect/ReflectView.tsx`, `app/(app)/today/reflect/DidApplyPicker.tsx`, `app/(app)/today/reflect/ReflectionTextarea.tsx`, `app/(app)/today/reflect/SubmitButton.tsx`, `app/(app)/today/reflect/TreeGrowthAnimation.tsx`.
- **SEQUENTIAL** — depends on Task 3 (the endpoints it calls).

**Task 6: `app/api/cron/qf-retry/route.ts` — retry worker** — _small_ (<100 LOC)

- Files: `app/api/cron/qf-retry/route.ts`, plus a Vercel cron config entry.
- Reads `qf_api_errors WHERE resolved_at IS NULL AND next_retry_at <= now()`, replays each, updates row. Auth via `Authorization: Bearer $CRON_SECRET`.
- **SEQUENTIAL** — depends on Task 3 (which writes into `qf_api_errors`).

### Negative Constraints

- Do NOT block the UI submit on QF sync — the user sees success as soon as the Supabase insert returns.
- Do NOT delete a `reflections` row in response to a QF failure — the row stays, the retry queue handles reconciliation.
- Do NOT attempt to compute the QF streak locally as the source of truth — `lib/streak.ts` is display-only.
- Do NOT call QF endpoints from the browser — all QF traffic is server-side from the route handler.
- Do NOT cache the QF streak value — the User API is marked "always live" in the epic's negative constraints.

## Test Scenarios

**Test 1: Happy path — `yes_fully` with a full reflection**

- Setup: user has a committed mission for today (`verse_key: "96:1"`), local time is 9:05pm, `window_closes_at` is 03:00 tomorrow.
- Action: `POST /api/reflections` with `{ mission_id, did_apply: "yes_fully", text: "I sat with Ibn Kathir's tafsir on Al-Alaq for 20 minutes after Maghrib. I noticed I always skipped the tafsir section before. Felt different to slow down and actually absorb what Allah means by 'Read'." }`.
- Expected: 200 with `tree_growth_complete: true`, `qf_note_id` populated; `reflections` row present; QF Notes + Activity Day calls both succeeded; streak value in response matches the QF `GET /streaks/current` value.

**Test 2: Happy path — `partly` with a 60-character reflection**

- Setup: committed mission, local time 10:15pm.
- Action: `POST /api/reflections` with `{ did_apply: "partly", text: "I messaged my aunt but not my brother. Tomorrow I will." }` (58 chars).
- Expected: 200, row written, QF Notes synced, `did_apply = "partly"`.

**Test 3: Happy path — `not_today` with a 60-character reflection**

- Setup: committed mission, local time 11:40pm.
- Action: `POST /api/reflections` with `{ did_apply: "not_today", text: "Work meetings ran over and I forgot until just now. Being honest about it." }` (73 chars).
- Expected: 200, `did_apply = "not_today"`, streak increments by one (honesty is rewarded).

**Test 4: Reflection below 40 chars rejected**

- Setup: committed mission.
- Action: `POST /api/reflections` with `{ did_apply: "yes_fully", text: "Yes I did it today" }` (18 chars).
- Expected: 400 `REFLECTION_TOO_SHORT`. No DB write. No QF call made.

**Test 5: Late-night submission at 2:55am — accepted**

- Setup: mission committed yesterday evening, `window_closes_at = 2026-05-03T03:00:00-04:00`, current time `2026-05-03T02:55:00-04:00`.
- Action: `POST /api/reflections` with a qualifying reflection.
- Expected: 200, row written, tree grown for yesterday's `local_date`.

**Test 6: Submission at 3:05am — rejected with 409**

- Setup: same mission, current time `2026-05-03T03:05:00-04:00`.
- Action: `POST /api/reflections` with a qualifying reflection.
- Expected: 409 `CONFLICT_WINDOW_CLOSED`. No DB write. No QF call. Client displays "this day has been closed".

**Test 7: QF Notes sync failure — local saved + retry queued**

- Setup: committed mission, QF Notes API mocked to return 503.
- Action: `POST /api/reflections` with a qualifying reflection.
- Expected: 200 with `qf_note_id: null`, `sync_status: "retry_queued"`. `reflections` row present. `qf_api_errors` row present with `endpoint: "POST /notes"`, `attempts: 0`, `resolved_at: null`. Tree growth animation still plays.

**Test 8: Idempotent PATCH within window**

- Setup: reflection already submitted at 9:00pm with `text = "First version that is at least forty characters long for the check."`, current time 10:30pm, window still open.
- Action: `PATCH /api/reflections/:id` with `{ text: "Updated version of the reflection, still well above forty chars for the check." }`.
- Expected: 200, same `reflection_id`, row updated, QF Notes API called with `PUT /notes/{note_id}` to mirror the update, `window_closes_at` unchanged, `submitted_at` unchanged (originated at insert; edits don't move the timestamp).

**Test 9: Retry worker drains the queue**

- Setup: `qf_api_errors` has two open rows from an earlier Notes API outage. QF Notes mocked to return 200 for both.
- Action: Cron fires `POST /api/cron/qf-retry` with `Authorization: Bearer $CRON_SECRET`.
- Expected: Both rows get `resolved_at` set; corresponding `reflections.qf_note_id` populated.

## Acceptance Criteria

- [ ] `POST /api/reflections` returns 200 with populated `qf_note_id` on the happy path for all three `did_apply` values.
- [ ] `POST /api/reflections` returns 400 `REFLECTION_TOO_SHORT` when `text.length < 40`.
- [ ] `POST /api/reflections` returns 409 `CONFLICT_WINDOW_CLOSED` after `window_closes_at`.
- [ ] `POST /api/reflections` returns 200 with `sync_status: "retry_queued"` when QF Notes fails, and the `reflections` row is present.
- [ ] `PATCH /api/reflections/:id` mirrors edits to `PUT /notes/{note_id}` within the window.
- [ ] `GET /api/reflections/:id` returns the reflection with `is_editable` correctly set.
- [ ] RLS prevents user A from reading or editing user B's reflection.
- [ ] DB `CHECK (length(text) >= 40)` rejects direct inserts below the floor.
- [ ] `qf_api_errors` rows are created on partial QF failure and drained by the cron worker.
- [ ] Reflection UI disables Submit until both `did_apply` is selected and text ≥ 40 chars.
- [ ] Tree growth animation plays on successful submit for all three `did_apply` values; the `not_today` visual is distinct.
- [ ] After `window_closes_at` the UI is read-only with a "day closed" note.
- [ ] No QF calls are made from the browser; all QF traffic originates in the route handler.
- [ ] No type errors or lint warnings.

## Verification

Run the verifier skill to confirm changes are clean.

### Backend Tests (Vitest)

- `tests/unit/reflection-window.spec.ts` — `window_closes_at` computation for multiple timezones (UTC, America/New_York with DST boundary, Asia/Karachi). At least three boundary cases: 2:59am (open), 3:00am (closed), 3:01am (closed).
- `tests/unit/reflection-validation.spec.ts` — 39-char rejected, 40-char accepted, 2000-char accepted, 2001-char rejected; invalid `did_apply` rejected.
- `tests/unit/streak-display.spec.ts` — `lib/streak.ts` helpers: free-pass remaining, honesty-today flag, display formatting.
- `tests/integration/api-reflections-post.spec.ts` — happy path, all three `did_apply`; short-reflection 400; window-closed 409; QF sync failure → 200 + `qf_api_errors` row.
- `tests/integration/api-reflections-patch.spec.ts` — in-window edit succeeds, post-window edit 409, PUT mirror to QF.
- `tests/integration/cron-qf-retry.spec.ts` — queue drain path with successful and still-failing rows, backoff math, 12-attempt drop.

### Browser Testing

- Credentials & URL: Supabase test user on `http://localhost:3000`.
- Setup: sign in, seed a mission for today via test helper.
- Steps:
  1. Navigate to `/today?phase=reflect` → expect the ayah + mission shown at top.
  2. Type 20 characters → Submit remains disabled, counter reads `20/40`.
  3. Type through 40 → Submit enables, counter reads `40/40`.
  4. Select "Yes, fully" → Submit stays enabled.
  5. Tap Submit → spinner → tree animation → redirect to `/grove`.
  6. Navigate back to `/today` → page renders read-only reflection with "day closes at 3:00am" note.
- Mobile viewport: repeat step 5 on 375×812 to confirm the textarea and animation are touch-friendly.

### E2E Tests (Playwright)

| Key Scenario                                                        | Test file                                    | Assigned sub-task |
| ------------------------------------------------------------------- | -------------------------------------------- | ----------------- |
| User completes the happy path with a full "Yes, fully" reflection   | `tests/e2e/evening-happy-yes-fully.spec.ts`  | Task 5            |
| User selects "Partly" and reflects on what got in the way           | `tests/e2e/evening-happy-partly.spec.ts`     | Task 5            |
| User selects "Not today" with an honest reflection and is rewarded  | `tests/e2e/evening-happy-not-today.spec.ts`  | Task 5            |
| User tries to submit with a reflection below the 40-character floor | `tests/e2e/evening-short-reflection.spec.ts` | Task 5            |
| User submits a late reflection within the window (before 3:00am)    | `tests/e2e/evening-late-window.spec.ts`      | Task 5            |
| User opens the app after the reflection window has closed           | `tests/e2e/evening-window-closed.spec.ts`    | Task 5            |
| User edits a submitted reflection before the window closes          | `tests/e2e/evening-edit-in-window.spec.ts`   | Task 5            |

**Locator strategies:** `data-testid="did-apply-yes-fully"`, `data-testid="did-apply-partly"`, `data-testid="did-apply-not-today"`, `data-testid="reflection-textarea"`, `data-testid="reflection-char-count"`, `data-testid="reflection-submit"`, `data-testid="tree-growth-animation"`, `role="alert"` for the "day closed" banner and the "saved locally" toast.
