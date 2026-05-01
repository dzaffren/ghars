# Morning intention field on the mission card

**Ticket:** TBD

This story adds a single optional line beneath the daily mission where the user can pre-commit, in the morning, to _where_ or _when_ they will try today's mission. The field arrives pre-filled with an AI-generated suggestion drawn from that day's mission, which the user can accept in one tap, edit, replace, or skip. Once set, the intention is locked for the rest of the day so that the evening reflection can honestly answer "did you follow through on what you said you'd do?"

See the epic overview for shared business rules, the five-marker rubric, and the end-to-end user journey: [spec.md](spec.md).

## User Story

As a practicing Muslim who has just received today's mission on /today, I want to write down — in one line — when or where in my day I will actually try it, so that by the evening I have something specific and honest to reflect against instead of sitting down at 9pm with a blank page.

## Background & Context

**Current state:**

- When a user opens /today in the morning, they see the day's verse and a one-sentence mission (for example, "Practice patience with someone who frustrates you today").
- Nothing connects that morning mission to the evening reflection form. The user closes the app and is not asked to commit to anything specific.
- In the evening, the user opens the reflection form against a blank prompt and writes whatever comes to mind — often something abstract, because nothing in the morning nudged them toward a concrete plan.

**Problem:**

- Without a lightweight morning touchpoint, the evening reflection is unanchored. Users frequently write something thoughtful but not applied, and then feel vaguely that the day "didn't really connect."
- The mission lives in the user's head for twelve hours with no commitment device, and commonly evaporates by lunchtime.
- The discovery brief (Solution 2 of the selected bundle) identified this gap as the compounding half of the "evidence over eloquence" thesis — the morning intention gives the evening reflection something specific to report against.

## Target User & Persona

- **Who:** A practicing Muslim who has completed onboarding and opens Ghars on their phone in the morning. They already trust the app enough to look at the daily mission; they have not yet figured out how to translate missions into action during the workday.
- **Context:** Morning — at breakfast, on the commute, or just after Fajr. They open /today, read the verse, read the mission, and presently have nothing further to do in the app until the evening.
- **Current workaround:** They try to hold the mission in memory throughout the day. By the evening they usually remember the gist of the mission but not a specific moment when they applied it.

## Goals

- Let the user pre-commit, in under ten seconds, to a specific moment in their day when they will try the mission.
- Make the commitment step so low-friction that accepting the suggestion is effectively one tap.
- Ensure the intention, once set, is honest — locked, visible all day, not rewritable when convenient.
- Pass the intention cleanly into the evening reflection flow so that the reflection prompt can personalize against it.
- Preserve the existing flow for users who choose not to set an intention — skipping must cost nothing.

## Non-Goals

- Generating a push notification, reminder, or badge based on the intention. The intention never interrupts the user's day.
- Changing how the daily mission itself is generated. The mission is an input to this feature, not a target of change.
- Altering the evening reflection prompt text or the scoring rubric. Those belong to the Reflection judge v2 story.
- Allowing multiple intentions per day, or intentions spanning more than one day.
- Showing the intention to anyone else (for example, garden circles). The intention is private to the user.
- Editing an intention after it has been set. This is a deliberate business rule from the epic.

## User Workflow

1. **Morning — mission arrives.** The user opens /today and sees the day's verse and one-sentence mission. Directly beneath the mission, a single-line intention field is visible. The field is pre-filled with a suggestion the app has generated from today's mission (for example, "At the afternoon meeting, don't interrupt Rahim when he speaks"). The pre-filled text is editable. Next to the field there is a confirm action and a skip action.
2. **User chooses how to engage.** The user does one of four things:
   - Taps confirm without changing anything — the suggestion as shown becomes their intention for the day.
   - Edits the suggestion (for example, changes "afternoon meeting" to "standup at 10") and then taps confirm.
   - Clears the field, types their own (for example, "Before bed, call Ammi and listen without interrupting"), and taps confirm.
   - Taps skip — no intention is recorded for the day.
3. **Lock confirmation.** On confirm, the field's appearance changes to a read-only state. The text remains fully visible. The edit area is no longer interactive. A short, unobtrusive cue (for example, the phrase "Locked for today") makes it clear the user has committed.
4. **Throughout the day.** The user may reopen /today any number of times. The mission and the locked intention are both shown. There is no way to re-edit the intention from this state.
5. **Late-in-the-day add.** If the user skipped earlier and wants to set an intention later (for example, at 4pm), the field is still editable with the same pre-filled suggestion. On confirm, it locks in the same way.
6. **Evening — handoff to reflection.** When the user opens the reflection form, the intention (if set) is visible there and is used to personalize the reflection prompt. If no intention was set, the default reflection prompt is used. The specific wording of the reflection prompt is the responsibility of the Reflection judge v2 story; this story guarantees only that the intention is available to it.
7. **Journal.** Once the reflection has been submitted, the journal entry for that day shows both the reflection and the intention that preceded it. If no intention was set, the journal entry simply omits that line.

## Acceptance Criteria

### Scenario: The mission card shows a pre-filled intention suggestion in the morning

```gherkin
Given today's mission on /today reads "Practice patience with someone who frustrates you today"
  And I have not yet set an intention for today
When I open /today in the morning
Then I see the day's verse and the mission at the top of the card
  And directly beneath the mission I see a single-line intention field
  And the intention field is pre-filled with a suggestion generated from today's mission, for example "At the afternoon meeting, don't interrupt Rahim when he speaks"
  And I see a confirm action and a skip action alongside the field
  And the field is editable
```

### Scenario: I accept the suggested intention as-is with one tap

```gherkin
Given the intention field is pre-filled with "At lunch, practice patience with the colleague who always interrupts"
  And I have not changed the text
When I tap confirm
Then the intention "At lunch, practice patience with the colleague who always interrupts" is saved as my intention for today
  And the intention field becomes read-only
  And I see an unobtrusive cue indicating it is locked for today
  And the confirm and skip actions are no longer shown
```

### Scenario: I edit the suggestion and then confirm

```gherkin
Given the intention field is pre-filled with "At the afternoon meeting, don't interrupt Rahim when he speaks"
When I change the text to "At standup at 10am, let Rahim finish before I respond"
  And I tap confirm
Then my intention for today is saved as "At standup at 10am, let Rahim finish before I respond"
  And the intention field becomes read-only with that exact wording
  And the edit area is no longer interactive
```

### Scenario: I write my own intention from scratch

```gherkin
Given the intention field is pre-filled with a suggestion
When I clear the field
  And I type "Before Maghrib, recite Surah Al-Asr without my phone nearby"
  And I tap confirm
Then my intention for today is saved as "Before Maghrib, recite Surah Al-Asr without my phone nearby"
  And the intention field becomes read-only with that exact wording
```

### Scenario: I skip the intention for today

```gherkin
Given the intention field is pre-filled with a suggestion
  And I do not want to commit to an intention today
When I tap skip
Then no intention is saved for today
  And the intention field is no longer prompting me to confirm
  And the rest of /today continues to work normally
```

### Scenario: I skipped in the morning and set an intention later in the day

```gherkin
Given I tapped skip on the intention field at 7am
  And no intention has been saved for today
When I reopen /today at 4pm
Then I see the intention field again in its editable, pre-filled state
  And the same pre-filled suggestion from this morning is shown
When I tap confirm
Then my intention for today is saved
  And the intention field becomes read-only
  And I cannot change it again for the rest of the day
```

### Scenario: I return to /today after setting an intention and cannot edit it

```gherkin
Given earlier today I confirmed the intention "Bring coffee to the night-shift guard at my building"
When I reopen /today
Then I see the mission card with the intention displayed in its read-only state
  And the intention text reads exactly "Bring coffee to the night-shift guard at my building"
  And I see the cue indicating it is locked for today
  And there is no confirm or skip action available
  And I cannot change the intention text
```

### Scenario: I try to edit a locked intention

```gherkin
Given I have a locked intention set for today
When I tap on the intention text
Then no editor opens
  And the intention remains unchanged
  And the locked cue remains visible
```

### Scenario: The pre-fill suggestion is unavailable when the mission loads

```gherkin
Given the suggestion service is unavailable when I open /today in the morning
When the mission card appears
Then the intention field is shown but empty
  And it displays guiding placeholder text such as "e.g. At lunch, before a meeting, with my sister..."
  And I can type my own intention and tap confirm
  And I can also tap skip
```

### Scenario: The intention persists across app restarts within the same day

```gherkin
Given at 8am I confirmed the intention "At the 2pm one-on-one, listen twice before speaking once"
  And I have closed the app
When I reopen the app at 1pm and navigate to /today
Then I see the intention "At the 2pm one-on-one, listen twice before speaking once" in its read-only state
  And the locked cue is visible
```

### Scenario: Tomorrow's flow is unaffected by today's choice

```gherkin
Given yesterday I set and locked an intention
  And today is a new day with a new mission
When I open /today in the morning
Then I see an editable, pre-filled intention field for today's mission
  And yesterday's intention is not shown on today's card
  And I am free to confirm, edit, replace, or skip today's intention independently
```

### Scenario Outline: The pre-fill suggestion reflects the specific mission of the day

```gherkin
Given today's mission reads <mission>
When I open /today in the morning
  And the suggestion service is available
Then the intention field is pre-filled with a concrete suggestion of the shape <example_suggestion>
  And the suggestion names a specific time, place, or person rather than restating the mission abstractly

Examples:
  | mission                                                          | example_suggestion                                                     |
  | "Practice patience with someone who frustrates you today"        | "At the afternoon meeting, don't interrupt Rahim when he speaks"       |
  | "Offer kindness to someone who wouldn't expect it"               | "Bring coffee to the night-shift guard at your building"               |
  | "Make time to recite one surah slowly, listening to each word"   | "Before Maghrib, recite Surah Al-Asr without the phone nearby"         |
```

### Scenario: Each day's suggestion is newly generated from that day's mission

```gherkin
Given on Monday the mission was "Practice patience with someone who frustrates you today" and the suggestion was "At the afternoon meeting, don't interrupt Rahim when he speaks"
  And on Tuesday the mission is "Offer kindness to someone who wouldn't expect it"
When I open /today on Tuesday morning
Then the pre-filled suggestion is drawn from Tuesday's mission
  And the suggestion is not a reuse of Monday's suggestion
  And the suggestion is consistent with the theme of Tuesday's mission, such as "Bring coffee to the night-shift guard at your building"
```

### Scenario: Skipping does not penalize me in the evening flow

```gherkin
Given I skipped the intention field this morning
  And I have not set an intention at any point today
When I open the reflection form in the evening
Then the reflection form works exactly as it does for any user who had no intention set
  And I am not warned, penalized, or told I missed a step
  And I can submit a reflection in the normal way
```

### Scenario: The intention is passed through to the evening reflection when it was set

```gherkin
Given at 7am I confirmed the intention "At the 2pm one-on-one, listen twice before speaking once"
When I open the reflection form at 9pm
Then the reflection form has access to my intention "At the 2pm one-on-one, listen twice before speaking once"
  And the reflection form is able to display or refer to that intention text exactly as I wrote it
```

### Scenario: The intention appears in the journal entry once a reflection is submitted

```gherkin
Given today I confirmed the intention "Bring coffee to the night-shift guard at my building"
  And this evening I submitted a reflection
When I later open my journal and look at today's entry
Then I see the intention "Bring coffee to the night-shift guard at my building" alongside my reflection
  And the intention is shown as the morning pre-commitment for that day
```

### Scenario: A journal entry for a day with no intention simply omits it

```gherkin
Given today I skipped the intention field and never set one
  And this evening I submitted a reflection
When I later open my journal and look at today's entry
Then I see my reflection for the day
  And no morning intention line is shown for that day
  And the entry looks coherent, not as if something is missing
```

### Scenario: The mission card itself does not change after I confirm

```gherkin
Given today's verse and mission are visible on /today
  And I have not yet confirmed an intention
When I confirm an intention
Then the day's verse remains unchanged
  And the day's mission remains unchanged
  And only the intention field transitions to its read-only state
```

### Scenario: The intention is not editable if the mission somehow updates mid-day

```gherkin
Given at 7am I confirmed the intention "At lunch, practice patience with Ayesha"
  And through some unexpected condition the underlying mission text refreshes later in the day
When I reopen /today
Then my locked intention "At lunch, practice patience with Ayesha" is still shown
  And it is still in its read-only state
  And I am not prompted to re-enter or re-confirm it
```

### Scenario: I never receive a reminder or notification about my intention

```gherkin
Given I have confirmed an intention for today
When time passes during the day
Then I receive no push notification about the intention
  And I receive no in-app reminder or badge about the intention
  And the intention only resurfaces when I open /today or the reflection form myself
```

## Business Rules & Constraints

- **Optional in both directions.** Setting an intention is never required to use the app, complete the mission, submit a reflection, or grow the plant. Skipping is a first-class option.
- **Lock on confirm.** The moment the user taps confirm, the saved text cannot be changed for the rest of that calendar day. This applies whether the user accepted the suggestion verbatim, edited it, or wrote their own. The lock does not apply if the user only skipped — a skipped field remains editable later that day.
- **One intention per day, maximum.** Each day has either exactly one intention (set and locked) or zero intentions (skipped and never set). The user cannot replace an intention with a second one.
- **Day boundary.** "Today" for the purposes of the lock and the reset follows the same daily boundary already used by the daily mission. When a new mission appears, a new editable intention field appears with it.
- **Pre-fill is AI-generated from the day's mission.** The suggestion is a concrete, specific-sounding line (naming a time, a place, or a person) that reflects the intent of today's mission. It is not a templated fill-in-the-blank and it is not reused from previous days.
- **Pre-fill failure is graceful.** If the AI suggestion cannot be produced at the moment the mission is opened, the field shows guiding placeholder text (for example, "e.g. At lunch, before a meeting, with my sister...") and the user can still type their own intention or skip. The rest of the flow is unaffected.
- **No notifications.** The intention never triggers a push, email, haptic, badge, or in-app popup reminder. It is a quiet commitment device, not an alarm.
- **Privacy.** The intention is visible only to the user who wrote it. It is not shared with circles, not included in any social surface, and not displayed on any screen seen by other users.
- **Persistence.** The intention set for a given day remains available for the evening reflection of that same day and for the journal entry of that same day. It is retained as part of the user's journal record so they can look back on it later.
- **Handoff only; no prompt changes here.** This story is responsible for storing the intention and making it available to the reflection flow. The wording of the reflection prompt — including "You planned to {intention}. What happened?" versus the default — is owned by the Reflection judge v2 story.

## Success Metrics

- **Hallway-test adoption.** In the pre-implementation UX test (Experiment C in the discovery brief), at least two of three testers say they would fill in the morning intention at least three days a week. This directly gates whether the story ships at all.
- **Daily set-rate.** On the live test account during the post-build period, the intention is set on at least 60% of days where /today was opened in the morning.
- **Accept-as-is rate.** Of the days where an intention was set, at least 40% are confirmed without edits — evidence that the pre-fill suggestion is good enough to accept in one tap.
- **Skip is used but rare.** Skip is used on fewer than 40% of mornings, confirming the flow feels optional without feeling pointless.
- **Evening personalization coverage.** On days where an intention was set, the evening reflection prompt is personalized against it 100% of the time (no silent drops in the handoff to Story 1).

## Dependencies

- **Reflection judge v2 (Story 1 of this epic).** Story 1 consumes the intention this story produces. Story 1 owns the reflection prompt wording, the scoring rubric, and the journal entry layout. This story's only obligation to Story 1 is to make the user's intention reliably available at reflection time.
- **Daily mission generation.** The AI-generated suggestion is produced from the day's mission. If the mission is not yet available when /today loads, the intention field either waits for the mission or falls back to the empty-with-placeholder behavior described in the API-unavailable scenario.
- **AI suggestion service availability.** Claude generates the pre-fill suggestion. If Claude is unavailable, the field gracefully degrades to empty with placeholder text; the rest of the feature still works.
- **Experiment C (hallway UX test) from the discovery brief.** Per the epic's rollout strategy, if Experiment C fails its acceptance criteria (fewer than two of three testers would set the intention three days a week), this story is cut and Story 1 ships alone.

## Rollout Considerations

- **Order within the epic.** Story 1 ships first. This story ships second. If Experiment C fails, this story is cut.
- **User base.** The app has a single live test account. There is no user migration concern — when this story ships, the intention field simply appears on /today for all future days. Past days are not backfilled with intentions.
- **Communication.** No user-facing communication is required. A release-note paragraph in the README and a mention in the demo-video voice-over are sufficient.

## Open Questions

All product questions for this story were resolved in the epic overview and the discovery brief.

- [x] ~~Intention pre-fill — LLM, template, or rotating seeds?~~ — **Resolved:** LLM-generated from today's mission.
- [x] ~~Can users edit the morning intention during the day?~~ — **Resolved:** No — locked after set. A skipped field may still be set later that day; once set, it locks.
- [x] ~~Does the intention trigger reminders or notifications?~~ — **Resolved:** No. Silent commitment device only.
- [x] ~~Fallback when morning intention is skipped?~~ — **Resolved:** Evening prompt falls back to its default. No penalty or warning.
- [x] ~~Is the intention shown to anyone else?~~ — **Resolved:** No. Private to the user.
- [x] ~~What happens if the suggestion cannot be generated?~~ — **Resolved:** Field shows placeholder guidance; user can type their own or skip.

---

## Functional Requirements

- **Intention row uniqueness:** exactly one `daily_intentions` row per `(user_id, local_date)`. Enforced by a composite unique constraint mirroring `daily_missions`' `(user_id, local_date)` key.
- **Lock semantics:** a row with `text IS NOT NULL` is locked. A row with `text IS NULL AND skipped = true` is a recorded skip — the user opted out but may still set an intention later that same day. A row with `text IS NULL AND skipped = false` is an unconfirmed draft (transient; persistence only happens on confirm or explicit skip).
- **Persist on confirm only:** typing in the field does not write to the DB. Only the confirm action writes. Skip writes a "skipped" row but no text.
- **Once-locked-always-locked (same day):** if a row has `text IS NOT NULL`, server rejects any further writes for the same `(user_id, local_date)`.
- **Skip-then-set upgrade:** if a row exists with `skipped = true, text IS NULL`, a subsequent confirm replaces `skipped = false, text = <value>, locked_at = now()`. This is an explicit UPDATE, not an INSERT.
- **Atomicity:** the confirm handler performs a single upsert with a `WHERE text IS NULL` guard on UPDATE. If the guard fails (concurrent confirm), return `409 INTENTION_ALREADY_LOCKED`.
- **Idempotency (confirm):** posting the same text to the confirm endpoint after a successful lock returns `409 INTENTION_ALREADY_LOCKED`, not a silent success. UI-side: after the confirm response lands, the field is read-only and does not re-submit.
- **Suggestion generation:** on load of `/today` in the morning, if no intention row exists AND the mission exists AND no cached suggestion exists in `daily_missions.intention_suggestion`, generate one via Claude Haiku 4.5 and cache it on the mission row. All subsequent loads for the same day reuse the cached value — no regeneration per session.
- **Handoff to Story 1:** the today-page server component and the reflection-journal query read the `daily_intentions.text` column alongside the mission. Story 1 (reflection judge) consumes this value to decide the evening prompt wording and to show the intention in the journal.

### Validation & Business Rules

- `text` trimmed length must be in `[1, 240]`. Error: `400 INTENTION_TOO_LONG "Intention must be 240 characters or fewer"` or `400 INTENTION_EMPTY "Intention text is required"`.
- `local_date` is derived server-side from the user's timezone at `users.timezone`. Clients never set it.
- `user_id` is always `session.userId`. Clients never set it.
- Concurrent double-confirm: second request returns `409 INTENTION_ALREADY_LOCKED`.
- Suggestion fallback: if Haiku call throws or times out (5-second budget), return `intentionSuggestion: null` from the today-page server component. Client renders empty field with placeholder text.

## Permissions & Security

- **Scope:** Authenticated user-only endpoints. Session via `getRequiredSession()`.
- **Authorization:** Every read/write is scoped to `session.userId`. No cross-user access possible.
- **Row-Level Security:** Add `daily_intentions` to the RLS policy set in a new migration extension. Mirror the shape of the existing `reflections` RLS (see `supabase/migrations/0004_rls.sql`): users see only their own rows.
- **Input validation:** Cap `text` at 240 characters server-side. Trim whitespace. Do NOT sanitize the text — it is stored verbatim and shown back to the user in their own journal.
- **Privacy:** The intention text is never written to any shared surface (circles, public profile, invite previews). Grep at PR time for any circles code reading `daily_intentions` and reject.

## API Design

### `POST /api/intentions`

**Purpose:** Confirm and lock today's intention. Called when the user taps the confirm action on the mission card.

**Request:**

```json
{
  "text": "At lunch, practice patience with the colleague who always interrupts"
}
```

**Response (200):**

```json
{
  "id": "i-2026-05-01-u1",
  "text": "At lunch, practice patience with the colleague who always interrupts",
  "localDate": "2026-05-01",
  "lockedAt": "2026-05-01T07:42:13Z"
}
```

**Errors:**

| Status | Code                       | Condition                                                  |
| ------ | -------------------------- | ---------------------------------------------------------- |
| 400    | `INTENTION_EMPTY`          | `text` missing, whitespace-only, or empty after trim       |
| 400    | `INTENTION_TOO_LONG`       | `text` trimmed length > 240 characters                     |
| 401    | `UNAUTHORIZED`             | No valid session                                           |
| 409    | `INTENTION_ALREADY_LOCKED` | An intention with non-null `text` already exists for today |

### `POST /api/intentions/skip`

**Purpose:** Record that the user chose to skip the intention this morning. Distinct from "no row exists yet" so the UI can render a cleaner skipped state without re-offering the suggestion until the user explicitly reopens the field.

**Request:** (empty body)

**Response (200):**

```json
{
  "id": "i-2026-05-01-u1",
  "skipped": true,
  "localDate": "2026-05-01"
}
```

**Errors:**

| Status | Code                       | Condition                                                  |
| ------ | -------------------------- | ---------------------------------------------------------- |
| 401    | `UNAUTHORIZED`             | No valid session                                           |
| 409    | `INTENTION_ALREADY_LOCKED` | A locked (text-present) intention already exists for today |

### `GET /api/intentions/suggestion`

**Purpose:** Lazily fetch the AI-generated suggestion. Called client-side on mount if `intentionSuggestion` was null in the initial page payload (e.g., first-ever visit of the day before cache population).

**Response (200, happy path):**

```json
{
  "suggestion": "At the afternoon meeting, don't interrupt Rahim when he speaks"
}
```

**Response (200, suggestion unavailable):**

```json
{
  "suggestion": null
}
```

**Errors:**

| Status | Code                | Condition                           |
| ------ | ------------------- | ----------------------------------- |
| 401    | `UNAUTHORIZED`      | No valid session                    |
| 404    | `MISSION_NOT_FOUND` | No mission row exists for today yet |

Note: `GET /api/intentions/suggestion` is intentionally cheap and idempotent. The suggestion is cached on `daily_missions.intention_suggestion` — a second call returns the same text without a second Haiku call.

## Data Model & Migrations

### New Table: `daily_intentions`

Defined in new migration `supabase/migrations/0011_daily_intentions.sql`.

| Field      | Type        | Constraints                                                               | Description                                                    |
| ---------- | ----------- | ------------------------------------------------------------------------- | -------------------------------------------------------------- |
| id         | uuid        | PK, default `gen_random_uuid()`                                           | Unique identifier                                              |
| user_id    | uuid        | NOT NULL, FK → `users(id)` ON DELETE CASCADE                              | Owner                                                          |
| local_date | date        | NOT NULL                                                                  | Day the intention is for, in the user's timezone               |
| text       | text        | nullable, CHECK `char_length(trim(text)) BETWEEN 1 AND 240` when not null | The locked intention; null while unskipped-unset or after skip |
| skipped    | boolean     | NOT NULL default `false`                                                  | True if the user explicitly skipped today                      |
| locked_at  | timestamptz | nullable                                                                  | Timestamp of lock (set when `text` is written)                 |
| created_at | timestamptz | NOT NULL default `now()`                                                  | Row creation                                                   |
|            |             | UNIQUE `(user_id, local_date)`                                            | At most one intention per user per local day                   |

### Modified Table: `daily_missions`

Add one column for the cached AI suggestion.

| Field                | Type | Constraints | Description                                                     |
| -------------------- | ---- | ----------- | --------------------------------------------------------------- |
| intention_suggestion | text | nullable    | Cached Haiku-generated suggestion for the day's intention field |

### New Migration: `0011_daily_intentions.sql`

```sql
-- Story 2: morning intention field

create table daily_intentions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  local_date date not null,
  text text,
  skipped boolean not null default false,
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, local_date),
  check (text is null or char_length(trim(text)) between 1 and 240),
  check (
    (text is not null and skipped = false and locked_at is not null)
    or (text is null and skipped = true and locked_at is null)
    or (text is null and skipped = false and locked_at is null)
  )
);

create index daily_intentions_user_date_idx on daily_intentions (user_id, local_date desc);

alter table daily_missions add column intention_suggestion text;

-- RLS: mirror reflections policies — users read/write only their own rows
alter table daily_intentions enable row level security;

create policy "users read own intentions" on daily_intentions
  for select using (auth.uid() = user_id);

create policy "users write own intentions" on daily_intentions
  for insert with check (auth.uid() = user_id);

create policy "users update own unlocked intentions" on daily_intentions
  for update using (auth.uid() = user_id and text is null);
```

### Migration Notes

- **Backfill:** none. Past days do not retroactively get intentions.
- **Downtime:** none.
- **Reversal:** `drop table daily_intentions; alter table daily_missions drop column intention_suggestion;` is safe — no cross-table dependencies.

## UI/Frontend Requirements

### Components

**`IntentionCard`** — `components/IntentionCard.tsx`

- **Type:** New
- **Purpose:** Render the optional morning intention field beneath the day's mission. Handles the four states: unset-with-suggestion, unset-no-suggestion (API failed), skipped, locked.
- **Props:**
  ```typescript
  interface IntentionCardProps {
    missionId: string;
    initialState:
      | { status: "unset"; suggestion: string | null }
      | { status: "skipped" }
      | { status: "locked"; text: string; lockedAt: string };
    onLocked?: (text: string) => void;
    onSkipped?: () => void;
  }
  ```
- **States:**
  - **`unset` with suggestion:** textarea pre-filled with the suggestion, edit enabled; a confirm button and a skip button beside it.
  - **`unset` without suggestion:** textarea empty; placeholder "e.g. At lunch, before a meeting, with my sister…"; confirm and skip buttons.
  - **`skipped`:** one-line "You chose to skip today. Tap to set one later." Tapping reverts to `unset` state (re-using the cached suggestion from the page payload).
  - **`locked`:** read-only display of `text` with a small "Locked for today" cue; no confirm or skip buttons; tapping the text does nothing.
  - **`submitting` (transient):** disabled inputs, spinner on confirm button.
  - **`error` (transient):** inline error text below the field; confirm button re-enabled for retry.

### User Interactions

- Tap "Confirm" with unchanged text → POST `/api/intentions` with the suggestion text → on 200, transition to `locked` state; fire `onLocked`.
- Edit text and tap "Confirm" → POST with edited text → on 200, transition to `locked`.
- Tap "Skip" in `unset` → POST `/api/intentions/skip` → on 200, transition to `skipped`.
- Tap skipped message → revert to `unset` (client-side only; DB stays `skipped = true` until a confirm arrives).
- Confirm in `unset`-after-skip → same POST `/api/intentions` (server upgrades the row).
- Server returns `409 INTENTION_ALREADY_LOCKED` → client refetches the intention and transitions to `locked`.

### Mission-card integration

- **`app/today/TodayClient.tsx`** receives a new prop `intention: { status: 'unset'; suggestion: string | null } | { status: 'skipped' } | { status: 'locked'; text: string; lockedAt: string }`.
- Renders `<IntentionCard>` between the "Today's mission" heading and the `<ReflectionForm>` (or the completed-mission summary when already reflected).
- Does NOT change the verse, audio, tafsir, or bookmark affordances.

## Architecture Notes

- **New dependencies:** none. Reuses `@anthropic-ai/sdk` (already present) for suggestion generation.
- **Model choice:** `claude-haiku-4-5` for suggestion generation — same model already used for mission picking and word suggestions. Tool-use mode with a small schema `{suggestion: string}` for reliable single-field output.
- **Server-side suggestion fetch:** performed in `app/today/page.tsx` (the server component) alongside the existing mission fetch. If the `daily_missions.intention_suggestion` column is null, call Haiku inline and UPSERT the result. If Haiku fails, set `suggestion: null` and render the empty state.
- **Dependencies & integration:**
  - Story 1 (Reflection Judge v2) reads `daily_intentions.text` to construct the evening prompt. The schema is owned by this story; Story 1 is a read-only consumer.
  - The reflection journal page (`app/reflections/page.tsx` and `app/reflections/[id]/page.tsx`) gains a left-join to `daily_intentions` and renders the intention line above the reflection when present.
  - The today page server component's query expands to include the intention row.
- **Breaking changes:** none for existing flows. Users on today's date with an existing mission and no intention row will see the new field appear; no migration or user action required.

## Exemplar Files

- **`lib/mission/generate.ts`** — pattern for generating and persisting per-day, per-user content via Haiku. The intention suggestion follows the same shape: call provider, upsert result on `daily_missions`.
- **`app/api/dhikr/route.ts` (if present) or `app/api/bookmarks/route.ts`** — pattern for a small authenticated POST route that does a single DB write and returns a slim JSON. Confirm/skip handlers mirror this shape.
- **`app/today/TodayClient.tsx:593-617`** — existing completed-vs-reflection-form conditional. The new intention card inserts above this block in a similar conditional-render pattern.
- **`lib/llm/anthropic.ts:42-72`** — the existing `SUGGEST_TOOL` schema is a direct template for the new `INTENTION_SUGGESTION_TOOL`: a single-field tool with a `description` instructing Haiku to name a time, a place, or a person.

## Implementation Plan

### Sub-tasks

**Task 1: Migration + RLS policy** — _small_ (<100 LOC)

- Files:
  - `supabase/migrations/0011_daily_intentions.sql` — create table, unique constraint, row-level security, add `intention_suggestion` column on `daily_missions`.
- INDEPENDENT

**Task 2: Suggestion generation prompt + provider method** — _small_ (<100 LOC)

- Files:
  - `lib/llm/types.ts` — add `SuggestIntentionInput` and `SuggestIntentionResult` types; add `suggestIntention(input)` to `LLMProvider`.
  - `lib/llm/prompts.ts` — add `SUGGEST_INTENTION_SYSTEM` and `buildSuggestIntentionPrompt`. System prompt: "You generate a single one-line intention a Muslim can act on today, specific to one named time/place/person, based on today's mission. Under 240 characters. Never restate the mission abstractly."
  - `lib/llm/anthropic.ts` — add `INTENTION_SUGGESTION_TOOL` and `suggestIntention` method using Haiku 4.5.
  - `lib/llm/ollama.ts` — add `suggestIntention` implementation (best-effort).
  - `lib/llm/stub.ts` — deterministic stub: returns `"At lunch, try the day's mission with the next person you meet"` regardless of input.
- INDEPENDENT (no DB dependency; pure additive to provider contract)

**Task 3: Intention data layer + server-side page integration** — _small_ (<100 LOC)

- Files:
  - `lib/intentions/service.ts` — NEW. `getTodayIntention(userId, localDate)` returns the intention row; `getOrGenerateSuggestion(missionId, llm)` does the cache-or-call pattern; both are pure data functions.
  - `app/today/page.tsx` — server component. Fetch the intention alongside the mission; if no intention row and no cached suggestion, call `getOrGenerateSuggestion`. Pass `intention` prop to `TodayClient`.
- SEQUENTIAL (depends on Tasks 1 and 2)

**Task 4: Confirm / skip / suggestion API routes** — _small_ (<100 LOC)

- Files:
  - `app/api/intentions/route.ts` — NEW. POST handler for confirm. Validates `text`, trims, length-checks, upserts with the `text IS NULL` guard, returns the new row or `409 INTENTION_ALREADY_LOCKED`.
  - `app/api/intentions/skip/route.ts` — NEW. POST handler for skip. Inserts a skipped row with no text; if a skipped row exists already, returns a 200 with the same payload (idempotent). If a locked row exists, returns `409`.
  - `app/api/intentions/suggestion/route.ts` — NEW. GET handler. Reads `daily_missions.intention_suggestion` for today; if null, calls `getOrGenerateSuggestion` and UPSERTs. Returns `{suggestion: string | null}`.
- SEQUENTIAL (depends on Task 1 for DB schema, Task 2 for provider method, Task 3 for service module)

**Task 5: `IntentionCard` component** — _medium_ (100–300 LOC)

- Files:
  - `components/IntentionCard.tsx` — NEW. Implements the four states (unset-with/without-suggestion, submitting, skipped, locked). Uses `motion.div` for the lock transition (fade + slight scale), matching the existing celebratory feel in `MissionCelebration.tsx`. Uses `Textarea` from `components/ui/textarea.tsx` for the edit mode and a static paragraph for the locked mode. Confirm + skip buttons from `components/ui/button.tsx`.
- SEQUENTIAL (depends on Task 4 for the endpoints)

**Task 6: Integrate `IntentionCard` into `TodayClient`** — _small_ (<100 LOC)

- Files:
  - `app/today/TodayClient.tsx` — accept `intention` prop; render `<IntentionCard>` above `<ReflectionForm>` (and above the completed-mission block); wire optimistic state (`locked` transition is client-side after POST success).
  - `app/today/page.tsx` — pass `intention` prop into `TodayClient`.
- SEQUENTIAL (depends on Task 5)

**Task 7: Journal / reflection detail integration** — _small_ (<100 LOC)

- Files:
  - `app/reflections/page.tsx` — expand the SELECT to include `daily_intentions` via the mission join.
  - `app/reflections/[id]/page.tsx` — display the intention line above the reflection body, prefaced "Morning intention:"; omit entirely if null.
  - `lib/reflections/filter.ts` — thread the intention through the entry type so the archive list can optionally show a small indicator.
- SEQUENTIAL (depends on Tasks 1 and 6)

**Recommended sequencing:**

1. Task 1 + Task 2 in parallel
2. Task 3 (wires 1 + 2 into the today server component)
3. Task 4 (API routes)
4. Task 5 (component) → Task 6 (integration)
5. Task 7 (journal) — can actually run in parallel with Task 6

### Negative Constraints

- Do NOT add push notifications, badges, emails, haptics, or in-app reminders related to the intention.
- Do NOT modify `PICK_MISSION_*` prompts in `lib/llm/prompts.ts`.
- Do NOT modify circles code.
- Do NOT edit the intention text in `ReflectionForm.tsx` — Story 1 owns the reflection prompt wording.
- Do NOT allow the same user's second confirm for today to overwrite the first (the lock is the product contract).
- Do NOT introduce a timezone-change-midday edge case by reading `local_date` from the client; always derive server-side from `users.timezone`.
- Do NOT cache the suggestion across days. Each day generates a fresh suggestion from that day's mission.

## Test Scenarios

**Test 1: First-visit-of-day flow, happy path**

- Setup: user `u-1`, no `daily_intentions` row for `2026-05-01`, mission row exists with `intention_suggestion IS NULL`. `ANTHROPIC_API_KEY` valid.
- Action: GET `/today` server-render.
- Expected: server calls Haiku, upserts `daily_missions.intention_suggestion` with a non-empty string (≤ 240 chars), passes `intention: { status: 'unset', suggestion: <str> }` to `TodayClient`. Second render of `/today` in the same session does NOT call Haiku again (cache hit).

**Test 2: Confirm with unchanged suggestion**

- Setup: user with intention `{ status: 'unset', suggestion: "At lunch, practice patience with the colleague who always interrupts" }`.
- Action: `POST /api/intentions` with `text: "At lunch, practice patience with the colleague who always interrupts"`.
- Expected: `200` with `{id, text: <same>, localDate: '2026-05-01', lockedAt: <now>}`. `daily_intentions` row has `text = <value>, skipped = false, locked_at IS NOT NULL`.

**Test 3: Confirm with edited text**

- Setup: same as Test 2.
- Action: `POST /api/intentions` with `text: "At standup at 10am, let Rahim finish before I respond"`.
- Expected: `200`. `daily_intentions.text = "At standup at 10am, let Rahim finish before I respond"`.

**Test 4: Confirm with empty text → 400**

- Setup: user `u-1`.
- Action: `POST /api/intentions` with `text: "   "`.
- Expected: `400 INTENTION_EMPTY`. No DB write.

**Test 5: Confirm with 241-character text → 400**

- Action: POST with `text` of trimmed length 241.
- Expected: `400 INTENTION_TOO_LONG`.

**Test 6: Double-confirm → 409**

- Setup: user `u-1` has a locked intention for today (`text = "X"`).
- Action: `POST /api/intentions` with `text: "Y"`.
- Expected: `409 INTENTION_ALREADY_LOCKED`. Row in DB unchanged — still `text = "X"`.

**Test 7: Skip then later confirm**

- Setup: user `u-1`, no intention row.
- Action 1: `POST /api/intentions/skip`.
- Expected 1: `200 {skipped: true}`. DB row: `text IS NULL, skipped = true, locked_at IS NULL`.
- Action 2: same-day, `POST /api/intentions` with `text: "Call my mother before Maghrib"`.
- Expected 2: `200`. Row upgraded to `text = "Call my mother before Maghrib", skipped = false, locked_at IS NOT NULL`.

**Test 8: Skip after lock → 409**

- Setup: locked intention.
- Action: `POST /api/intentions/skip`.
- Expected: `409 INTENTION_ALREADY_LOCKED`.

**Test 9: Suggestion endpoint — cache hit**

- Setup: `daily_missions.intention_suggestion = "Bring coffee to the night-shift guard"` for today.
- Action: `GET /api/intentions/suggestion`.
- Expected: `200 {suggestion: "Bring coffee to the night-shift guard"}`. No Haiku call.

**Test 10: Suggestion endpoint — Haiku throws**

- Setup: `intention_suggestion IS NULL`, mock `suggestIntention` to throw.
- Action: `GET /api/intentions/suggestion`.
- Expected: `200 {suggestion: null}`. `daily_missions.intention_suggestion` remains NULL (no bogus cache write).

**Test 11: Cross-user isolation**

- Setup: user `u-1` has locked intention "A"; user `u-2` has no intention row.
- Action: authenticated as `u-2`, `POST /api/intentions` with `text: "B"`.
- Expected: `200`. `u-2`'s row created with `text = "B"`. `u-1`'s row unchanged.

**Test 12: Tomorrow's flow is independent**

- Setup: yesterday's intention locked for user `u-1`.
- Action: day rolls over; `GET /today`.
- Expected: new day → new `daily_missions` row → new `intention_suggestion` generated → `intention: { status: 'unset', suggestion: <new> }`. Yesterday's row is untouched and not visible on today's card.

**Test 13: Suggestion length clamped**

- Setup: Haiku returns a 300-character suggestion.
- Action: `GET /api/intentions/suggestion`.
- Expected: server truncates or rejects. **Implementation decision: reject.** If the Haiku suggestion exceeds 240 characters, the suggestion service logs `logEvent('intention_suggestion_too_long')` and returns `null`. Avoids a situation where the prefilled text fails our own confirm validator.

**Test 14: RLS — cross-user read blocked**

- Setup: user `u-1` has intention row for today; authenticated as `u-2`.
- Action: attempt a direct supabase query for `u-1`'s intention row.
- Expected: empty result set (RLS blocks the read).

## Acceptance Criteria

- [ ] Migration `0011_daily_intentions.sql` applies cleanly on a freshly-initialized DB.
- [ ] `pnpm test` passes including new unit tests in `tests/intentions.test.ts`.
- [ ] `pnpm build` succeeds with no TypeScript errors.
- [ ] On `/today`, the first-ever load of a day renders the `IntentionCard` with a non-empty AI suggestion OR the empty-placeholder state if Haiku is unavailable. No blank loading state lingers > 3 seconds.
- [ ] Confirming the intention transitions the card to its locked visual state without a full page reload.
- [ ] Skipping transitions the card to its skipped state; tapping the skipped message re-opens the editable card with the cached suggestion.
- [ ] After locking, reloading `/today` shows the same locked card.
- [ ] `/reflections/:id` for a day-with-intention shows the intention text above the reflection.
- [ ] RLS policies prevent cross-user reads and writes (verified by Test 14).
- [ ] No push notifications, emails, or haptic reminders are triggered at any point.

## Verification

### Backend API Tests (Vitest)

- **`tests/intentions.test.ts`** (NEW) — covers the full API behavior:
  - Confirm with valid text returns 200 and locks the row.
  - Confirm with empty/too-long text returns 400 with the correct code.
  - Double-confirm returns 409.
  - Skip then confirm upgrades the row correctly.
  - Skip after lock returns 409.
  - Suggestion endpoint cache-hit vs. cache-miss paths.
  - Suggestion endpoint handles Haiku failure gracefully.
  - Suggestion endpoint rejects > 240-char Haiku output.
- **`tests/intentions-rls.test.ts`** (NEW, optional — can be deferred if time-pressed) — uses a second Supabase client to verify RLS blocks cross-user reads and update-locks.

### Browser/UI Testing

- **URL:** `http://localhost:3000/today`
- **Credentials:** local test account.
- **Test 1 — First visit of the day:** With no intention row and no cached suggestion, visit `/today`. The intention card appears with a pre-filled suggestion under the mission. Tap confirm. The card transitions to the locked state within ~300ms. Reload the page — the locked state persists.
- **Test 2 — Edit + confirm:** Visit `/today` (first of the day). Edit the text to "At the 2pm one-on-one, listen twice before speaking once". Tap confirm. Reload — same text appears locked.
- **Test 3 — Skip + later set:** Visit `/today` in the morning; tap skip. Reload — the skipped state is shown. Tap the skipped message. The editable card reappears with the same pre-fill. Confirm a new text. Reload — locked.
- **Test 4 — Haiku outage:** Set `ANTHROPIC_API_KEY=invalid`. Restart dev server. Visit `/today`. The intention card appears with an empty field and placeholder text "e.g. At lunch, before a meeting, with my sister…". Typing + confirm still works.
- **Test 5 — Day rollover:** Using a development backdoor (or wait through midnight), change `users.timezone` or advance the system clock. Visit `/today`. A new intention card appears; yesterday's locked intention is not shown.
- **Mobile viewport (375×812):** Card fits width; textarea auto-grows up to 3 lines; confirm + skip buttons stack horizontally without overflow.

### E2E Tests (Playwright)

| Key Scenario                                                              | Test file                                 | Assigned sub-task |
| ------------------------------------------------------------------------- | ----------------------------------------- | ----------------- |
| The mission card shows a pre-filled intention suggestion                  | `e2e/intention-card.spec.ts`              | Task 6            |
| I accept the suggested intention as-is with one tap                       | `e2e/intention-card.spec.ts`              | Task 6            |
| I edit the suggestion and then confirm                                    | `e2e/intention-card.spec.ts`              | Task 6            |
| I write my own intention from scratch                                     | `e2e/intention-card.spec.ts`              | Task 6            |
| I skip the intention for today                                            | `e2e/intention-card.spec.ts`              | Task 6            |
| I skipped in the morning and set an intention later in the day            | `e2e/intention-card.spec.ts`              | Task 6            |
| I return to /today after setting an intention and cannot edit it          | `e2e/intention-card-lock.spec.ts`         | Task 6            |
| I try to edit a locked intention                                          | `e2e/intention-card-lock.spec.ts`         | Task 6            |
| The pre-fill suggestion is unavailable when the mission loads             | `e2e/intention-card-offline.spec.ts`      | Task 6            |
| The intention persists across app restarts within the same day            | `e2e/intention-card-lock.spec.ts`         | Task 6            |
| Tomorrow's flow is unaffected by today's choice                           | `e2e/intention-card-day-rollover.spec.ts` | Task 6            |
| The intention appears in the journal entry once a reflection is submitted | `e2e/intention-journal.spec.ts`           | Task 7            |
| A journal entry for a day with no intention simply omits it               | `e2e/intention-journal.spec.ts`           | Task 7            |

**Locator strategies:** `data-testid="intention-card"`, `data-testid="intention-textarea"`, `data-testid="intention-confirm"`, `data-testid="intention-skip"`, `data-testid="intention-locked"`, `data-testid="intention-skipped"`, `data-testid="intention-placeholder"`. Use `page.route()` to intercept `GET /api/intentions/suggestion` for the offline/outage scenarios.

- **Scenarios not mapped to E2E** (covered by Test Scenarios above): cross-user isolation, RLS enforcement, 400 validation errors, 409 concurrency, suggestion-length clamping, skip-after-lock rejection. These are pure backend/data concerns and do not need a browser.
