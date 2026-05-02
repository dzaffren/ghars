# Answered Reflection

**Ticket:** TBD

**Discovery Brief:** `docs/discovery/answered-reflection/brief.md`

After a user submits their evening reflection, Ghars returns two short blocks of
text: a pair of sentences that deepen their understanding of the ayah, and a
single sentence that notices something specific in what they just wrote. The
reflection is no longer absorbed in silence — it is answered, once, in place,
before the tree-growth celebration plays.

## User Story

As a Ghars user who has just submitted my evening reflection, I want to
receive a short, specific response that shows me something new about the ayah
and notices something particular about what I wrote, so that the daily ritual
feels answered and I return tomorrow wanting more of both.

## Background & Context

**Current state:**

- The user submits a reflection and sees a tree-growth animation with the line
  "Your tree has grown." or "Honesty plants a sapling." for the "Not today" path.
- After 1.5 seconds the screen auto-redirects to the grove.
- The only "response" the app gives to the user's words is the tree growing by
  one visual stage. The text itself is absorbed with no acknowledgement that
  anyone (or anything) read it.
- The weekly review is the only surface that reflects the user's week back to
  them — and it only fires once every seven days.

**Problem:**

- The daily ritual is one-way. The user gives; the app takes silently.
- Users (in dogfood) describe wanting two missing things: to _understand the
  ayah more_ after reflecting, and to _be noticed_ for what they wrote. The
  current flow provides neither.
- Weekly review is too distant to close the loop within a single day. Without a
  daily answer, six days a week the reflection feels unread.

## Target User & Persona

- **Who:** A returning Ghars user, logged in, who has just submitted an
  evening reflection on today's ayah.
- **Context:** They are at the end of the daily loop — they read the ayah in
  the morning, chose a mission, attempted to live it during the day, and are
  now writing what happened. This is the most vulnerable moment in the ritual.
- **Current workaround:** None — they close the app and wait until the weekly
  review on Sunday for any sense of the app engaging with their words, or they
  write in a physical journal in parallel.

## Goals

- After submitting, the user receives a short, honest response that makes the
  ayah feel richer _and_ the user feel noticed.
- The response is delivered in place, before the tree-growth celebration
  transitions to the grove — the ritual remains continuous, not fragmented.
- The answer is specific to _this_ reflection, not a canned "beautiful
  reflection" line. Specificity is the feature; genericness is the failure
  mode.
- The "Not today" path is treated as the equal case — a user who honestly
  admits they didn't act receives the same depth of response as one who did.

## Non-Goals

- The response is not a coach, a therapist, or a theological authority. It
  does not give advice, prescribe actions, or correct the user's interpretation.
- No back-and-forth conversation. The answer is one-shot. The user reads it,
  plants the tree, and closes the app.
- No regeneration. One answer per reflection, saved once, shown whenever the
  user returns to that reflection in the journal or grove day view.
- No retroactive generation for reflections submitted before the feature
  launches.
- No answering for morning missions or ayah reads — only the evening
  reflection is answered in this feature.

## User Workflow

1. **Reflecting** — The user types their reflection and taps "Submit
   reflection." They see the existing "Saving…" state on the button.
2. **Waiting briefly** — Instead of jumping straight to the tree-growth
   animation, the screen shows a small "Reflecting on your words…" holding
   state for a few seconds while the answer is being generated.
3. **Reading the answer** — A calm, single-card response appears in place.
   Two sentences titled with the verse reference that add something to the
   ayah the user did not see in the tafsir snippet. One sentence below titled
   "What I noticed" that references something specific the user wrote — a
   word, a phrase, a moment, a person they mentioned.
4. **Planting the tree** — Below the answer, a single "Plant today's tree"
   button. When the user taps it, the existing tree-growth animation plays
   and the app transitions to the grove.
5. **Returning** — When the user opens the grove day view or their journal
   for this day later in the week, the same answer is shown again, unchanged.

## Acceptance Criteria

### Scenario: User submits a reflection and receives an answer

```gherkin
Given I have submitted today's reflection with the answer "I tried to listen more at work today but I interrupted my colleague twice in our one-to-one."
When the reflection is accepted
Then I see a "Reflecting on your words…" holding state
  And after a short pause I see a card titled with the verse reference containing two sentences about the ayah
  And I see a single sentence titled "What I noticed" that references my colleague or the interruption
  And I see a button that says "Plant today's tree" below the card
```

### Scenario: User reads the answer and plants the tree

```gherkin
Given I am reading the answer card
When I tap "Plant today's tree"
Then I see the tree-growth animation
  And the app transitions to the grove as it does today
```

### Scenario: User submits a "Not today" reflection

```gherkin
Given I have selected "Not today"
  And my reflection text is "I forgot until this evening — I was pulled into an unplanned argument with my brother and lost the intention."
When I submit the reflection
Then I see a "Reflecting on your words…" holding state
  And after a short pause I see the answer card
  And the "What I noticed" sentence references my brother or the argument or the forgetting
  And the card does not praise me for submitting or imply my effort was still good
  And I see a "Plant today's tree" button that plants a sapling (the honest-failure variant that already exists today)
```

### Scenario: The answer never refers to the user in flattering terms

```gherkin
Given my reflection is "Today I did the dishes. It was fine."
When the answer is generated
Then the "What I noticed" sentence refers to the dishes or the word "fine"
  And the sentence does not contain "beautiful reflection"
  And the sentence does not contain "it's wonderful that you"
  And the sentence does not contain "what a meaningful moment"
  And the sentence does not paraphrase my reflection back to me without adding observation
```

### Scenario: The LLM answer is unavailable

```gherkin
Given the answer-generation service is unavailable when I submit
When I submit my reflection
Then my reflection is saved as it is today
  And I see the existing tree-growth animation without the answer card
  And I see the existing "Your tree has grown." or "Honesty plants a sapling." line
  And the app transitions to the grove as it does today
  And I am not shown an error message about the missing answer
```

### Scenario: The user revisits an already-answered reflection

```gherkin
Given I submitted a reflection yesterday that received an answer
When I open yesterday in the grove day view
Then I see the same answer card, unchanged
  And I do not see a new or different answer
```

### Scenario: The user revisits a reflection that was submitted before the feature launched

```gherkin
Given I submitted a reflection before the answered-reflection feature was live
When I open that day in the grove day view
Then I see the reflection text and the existing day-view content
  And I do not see an answer card
  And I do not see an error about a missing answer
```

### Scenario: The user is offline when submitting

```gherkin
Given I am offline when I submit my reflection
When the reflection is queued for sync
Then I see the existing "Saved locally — we'll sync when you're back online" line
  And I see the existing tree-growth animation without the answer card
  And when I next return with a connection and open today in the grove day view
  Then I see the answer card for this reflection
```

### Scenario Outline: The noticing sentence references something specific the user wrote

```gherkin
Given my reflection contains <specific detail>
When the answer is generated
Then the "What I noticed" sentence references <referenced element>

Examples:
  | specific detail                                   | referenced element            |
  | "my daughter Layla"                               | Layla or my daughter          |
  | "the meeting ran over and I skipped dhuhr"        | the meeting or the skipped prayer |
  | "I wanted to be patient but snapped at the kids"  | the snapping or the kids      |
  | "I was so tired I barely remembered the mission"  | the tiredness or the forgetting |
```

## Business Rules & Constraints

- **Specificity rule.** The "What I noticed" sentence must reference at least
  one concrete detail from the reflection — a named person, a named place,
  a specific action, a specific emotion, or a direct quotation of a phrase
  the user used. A noticing that could be pasted onto any reflection fails.
- **Tone rule.** The answer does not praise, validate, or paraphrase. It
  observes. Example of correct tone: "You mentioned your brother twice, and
  both times he was the one who needed listening to." Example of incorrect
  tone: "What a beautiful reflection on patience."
- **Parity rule.** "Not today" reflections receive an answer of the same
  length, depth, and specificity as "Yes, fully" reflections. The app does
  not reward honest failure with less response.
- **Permanence rule.** An answer is generated once, saved, and shown every
  time the user returns to that reflection. It does not change between
  sessions.
- **Non-blocking rule.** If the answer cannot be generated (service down,
  timeout, content-policy refusal), the reflection still saves, the tree
  still grows, and the user does not see an error. The feature is additive
  to the existing ritual, not a dependency of it.
- **Holding-state limit.** The "Reflecting on your words…" holding state has
  a maximum duration of eight seconds before the app falls through to the
  existing tree-growth animation without an answer card.
- **No retroactive generation.** Reflections submitted before the feature
  launches do not get answers added later.
- **Private by default.** The reflection text is sent to the answer service
  only for the purpose of generating the answer. It is not shared, sold, or
  used to train external models. This is stated to the user at the point of
  first seeing the feature (see Rollout Considerations).

## Success Metrics

- **Prompt-experiment gate (pre-launch).** Before this feature is built,
  the owner runs the prompt against five real reflections and scores each.
  At least three of five noticings must feel seen (not flattered, not
  paraphrased, not generic) for the build to proceed. If fewer than three
  pass, the prompt is re-authored before any code is written. This is the
  primary success gate.
- **Owner return signal (post-launch, dogfood).** The owner reports whether,
  after a week of use, the reflection ritual feels answered. Qualitative,
  single-user, honest — matches the evidence tier of the discovery brief.
- **Silent-failure check.** Across the first two weeks of use, no user sees
  an error or broken state caused by the answer service. If the answer
  service fails, the old flow is what the user sees.

## Dependencies

- Availability of an LLM service for short-form generation — whichever
  provider is already used elsewhere in Ghars, or the first one wired up if
  none exists yet.
- Consent posture: at first encounter, the user must be told in plain
  language that their reflection is sent to an AI service for this purpose.
  Phrasing is a small part of the rollout story below, not a separate
  feature.

## Rollout Considerations

- **Ship behind a feature flag.** Default off. Owner turns it on for their
  own account first and lives with it for several days before enabling it
  for any wider group.
- **First-time disclosure.** The very first time a user sees the answer
  card, a one-line note at the bottom reads something like "Your reflections
  are sent to an AI service to generate this note. They are not used for
  anything else." The note appears once per user and does not repeat.
- **No A/B test.** Evidence tier is dogfood. A statistical comparison would
  be noise at current user volume.
- **Kill switch.** If the quality of answers drops or the service becomes
  unreliable, the feature flag can be turned off and the app returns to the
  current behaviour without any user-visible regression.

## Open Questions

- [x] ~~Should "Not today" reflections receive an answer?~~ — **Resolved:**
      Yes. Skipping them would signal that the app only engages with success.
      The honest-failure path is the most emotionally loaded in the ritual and
      the one most in need of acknowledgement.
- [x] ~~Should answers regenerate or stay permanent?~~ — **Resolved:** Stay
      permanent. A reflection being answered differently each visit would feel
      arbitrary and would erode the "someone noticed me" feeling the feature is
      built on.
- [x] ~~Should the feature block the tree-growth animation if the answer is
      slow to generate?~~ — **Resolved:** No. Eight-second cap, then fall through
      to the existing animation without the card. The ritual must not be held
      hostage by AI latency.
- [x] ~~Should the answer appear before or after the tree-growth
      animation?~~ — **Resolved:** Before. The tree growing is the user's
      reward; the answer is the app's half of the exchange. Reward comes last.
- [x] ~~Which LLM provider should generate the answer?~~ — **Resolved:**
      Anthropic Claude via `@anthropic-ai/sdk` (already in `package.json`).
      Model: `claude-haiku-4-5-20251001` for cost/latency; upgrade path to
      `claude-sonnet-4-6` if quality falls short during dogfood. No provider
      abstraction layer for v1 — swap later if needed.
- [ ] Should the answer eventually inform the weekly review (e.g., "here are
      the three things the app noticed you doing this week")? — **Deferred
      (future scope):** Out of scope for v1. Revisit once this feature has been
      lived with for two weeks.

---

## Functional Requirements

- **Atomicity:** The reflection write in `POST /api/reflections` must remain
  atomic exactly as it is today. Answer generation is a separate, non-blocking
  concern — it must not extend, wrap, or roll back the reflection transaction.
- **Idempotency:** Each reflection can have at most one stored answer. The
  generation path must be safe to retry without producing a second answer
  row. Enforced by a unique index on `reflection_answers.reflection_id`.
- **Non-blocking:** Answer generation failures must never cause the
  reflection POST to fail. The client polls a separate endpoint for the
  answer and gracefully falls through after a hard cap.
- **Permanence:** An answer, once stored, is returned verbatim on all
  subsequent reads. No regeneration for any reason (including model
  upgrades).
- **Fail-open:** If generation fails permanently, the client shows the
  existing tree-growth animation and no error.
- **Feature flag:** The whole generation path is gated by
  `ENABLE_ANSWERED_REFLECTION` (env flag). When `false`: no generation call,
  no holding state, no answer card — identical to today's behaviour.

### Validation & Business Rules

- The generated `ayah_insight` must be 2 sentences and between 80 and 360
  characters. A generation that falls outside these bounds is retried once,
  then discarded.
- The generated `noticing` must be 1 sentence, between 30 and 180
  characters, and must contain at least one substring that also appears in
  the user's reflection text (case-insensitive, after stripping punctuation,
  minimum 4 characters). This is the "specificity guard" — a generation
  that fails it is retried once, then discarded.
- Blocklist strings in `noticing`: `"beautiful reflection"`, `"meaningful
reflection"`, `"wonderful that you"`, `"what a"`, `"your reflection is"`.
  A generation containing any is retried once, then discarded.
- Generation is triggered only for reflections created after the feature
  flag is turned on. No retroactive pass over pre-existing reflections.
- Generation is triggered for all three `did_apply` values. No branching by
  outcome.
- The reflection text sent to the LLM is the exact stored text, plus the
  ayah Arabic, translation, and tafsir snippet as context. No user PII
  (name, email) is sent.

## Permissions & Security

- **Scope:** Internal API, authenticated. The generation endpoint may only
  be called for reflections belonging to the session user.
- **Authorization:** `getSession()` required. 401 on missing session. 403
  if the reflection belongs to another user.
- **Input validation:** All inputs to the generation endpoint are IDs
  (UUIDs). The reflection text is loaded server-side from the canonical
  `reflections` row; the client cannot supply or modify the text at
  generation time.
- **Output sanitisation:** The LLM response is parsed as JSON; any trailing
  prose or markdown is stripped. No HTML, no user-supplied markup, no
  `dangerouslySetInnerHTML` on the answer card — plain text only.
- **Rate limit:** Max 10 generation attempts per user per day. Exceeding
  the cap returns `429 ANSWER_RATE_LIMITED` and the client falls through to
  the old flow. (Guards against a runaway retry loop; normal use is 1 per
  day.)
- **PII posture:** Reflection text is sent to Anthropic's API. This is
  disclosed to the user on first encounter (see Rollout Considerations in
  the business section). No reflection data is logged in application logs
  beyond the `reflection_id`.

## API Design

### `POST /api/reflections/:id/answer`

Triggers answer generation for a reflection the user just submitted. Called
by the client immediately after a successful reflection POST. Idempotent —
safe to call twice.

**Request:** empty body.

**Response (200, answer ready):**

```json
{
  "status": "ready",
  "answer": {
    "ayah_insight": "The verb here carries the sense of 'turning toward' more than 'remembering' — the same root used in 2:152 for Allah's turning toward us. It frames the ritual as mutual, not one-way.",
    "noticing": "You mentioned your brother twice, and both times he was the one who needed listening to.",
    "model": "claude-haiku-4-5-20251001",
    "generated_at": "2026-05-02T21:15:42Z"
  }
}
```

**Response (202, generating — client should poll):**

```json
{
  "status": "pending",
  "poll_after_ms": 1500
}
```

**Response (200, fallen through — no answer available):**

```json
{
  "status": "unavailable"
}
```

**Errors:**

| Status | Code                   | Condition                                      |
| ------ | ---------------------- | ---------------------------------------------- |
| 401    | `UNAUTHENTICATED`      | No session cookie                              |
| 403    | `NOT_OWNER`            | Reflection exists but belongs to another user  |
| 404    | `REFLECTION_NOT_FOUND` | No reflection with that id                     |
| 429    | `ANSWER_RATE_LIMITED`  | User has exceeded 10 generation attempts today |
| 503    | `FEATURE_DISABLED`     | `ENABLE_ANSWERED_REFLECTION` is false          |

### `GET /api/reflections/:id/answer`

Returns the stored answer for a reflection. Used by the grove day view and
journal when the user revisits a previously answered reflection.

**Response (200, answer exists):**

```json
{
  "status": "ready",
  "answer": {
    "ayah_insight": "The verb here carries the sense of 'turning toward' more than 'remembering' — the same root used in 2:152 for Allah's turning toward us. It frames the ritual as mutual, not one-way.",
    "noticing": "You mentioned your brother twice, and both times he was the one who needed listening to.",
    "model": "claude-haiku-4-5-20251001",
    "generated_at": "2026-05-02T21:15:42Z"
  }
}
```

**Response (200, no answer stored — pre-launch reflection or fallen through):**

```json
{
  "status": "unavailable"
}
```

**Errors:** same 401/403/404 as `POST`.

## Data Model & Migrations

### New table: `reflection_answers`

| Field         | Type        | Constraints                                    | Description                                                  |
| ------------- | ----------- | ---------------------------------------------- | ------------------------------------------------------------ |
| id            | uuid        | PK, default gen_random_uuid()                  | Unique identifier                                            |
| reflection_id | uuid        | FK → reflections(id) ON DELETE CASCADE, UNIQUE | Reflection this answer belongs to                            |
| user_id       | uuid        | FK → users(id) ON DELETE CASCADE, NOT NULL     | Owner (denormalised for RLS and analytics)                   |
| ayah_insight  | text        | NOT NULL, CHECK length between 80 and 360      | Two-sentence ayah observation                                |
| noticing      | text        | NOT NULL, CHECK length between 30 and 180      | One-sentence noticing of the user's reflection               |
| model         | text        | NOT NULL                                       | Provider/model identifier (e.g. `claude-haiku-4-5-20251001`) |
| generated_at  | timestamptz | NOT NULL, default now()                        | When the answer was generated                                |

Additional indexes:

- `UNIQUE INDEX reflection_answers_reflection_id_uniq ON reflection_answers (reflection_id)` — enforces one answer per reflection.
- `INDEX reflection_answers_user_id_idx ON reflection_answers (user_id)` — for future aggregate queries.

### New table: `reflection_answer_attempts`

Tracks in-flight and failed generation attempts. Separate from
`reflection_answers` so a successful row is the only source of truth for
"the answer is ready."

| Field         | Type        | Constraints                                            | Description                                                                             |
| ------------- | ----------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| id            | uuid        | PK, default gen_random_uuid()                          | Unique identifier                                                                       |
| reflection_id | uuid        | FK → reflections(id) ON DELETE CASCADE, NOT NULL       | Reflection being generated for                                                          |
| user_id       | uuid        | FK → users(id) ON DELETE CASCADE, NOT NULL             | Owner                                                                                   |
| status        | text        | NOT NULL, CHECK IN ('in_progress','failed','given_up') | Current state                                                                           |
| error_code    | text        | NULL                                                   | On failure: `LLM_TIMEOUT`, `LLM_POLICY_REFUSED`, `VALIDATION_FAILED`, `LLM_UNAVAILABLE` |
| started_at    | timestamptz | NOT NULL, default now()                                | Attempt start                                                                           |
| ended_at      | timestamptz | NULL                                                   | Attempt end                                                                             |

Index: `INDEX reflection_answer_attempts_user_day_idx ON reflection_answer_attempts (user_id, (started_at::date))` — for the 10/day rate limit.

### Migration file: `supabase/migrations/0007_reflection_answers.sql`

Creates both tables, indexes, and RLS policies matching the existing
reflections-table pattern: a user can `SELECT` their own rows; `INSERT`
and `UPDATE` are service-role only (all routes go through admin client —
see `docs/learnings/convention-admin-supabase-for-all-routes.md`).

### No retroactive backfill

Pre-launch reflections have no matching `reflection_answers` row. The `GET`
endpoint returns `{"status": "unavailable"}` for them; this is the same
response as a fallen-through generation, which the client already handles.

## UI/Frontend Requirements

### Component: `AnswerCard`

**Path:** `app/(app)/today/_components/AnswerCard.tsx` — new file.

**Purpose:** Renders the generated answer in place of (or before) the
existing tree-growth success block. Owns no business logic — presentational
only.

**Props:**

```typescript
interface Props {
  ayahInsight: string;
  noticing: string;
  surahName: string;
  ayahNumber: number;
  showDisclosure: boolean; // first-time-seen badge
  onPlantTree: () => void;
}
```

**Layout (visual — not implementation-prescriptive):**

- Uses the `GradientCard` visual language already added to `AyahCard` —
  dark green gradient, noise texture, glass reflection.
- Header block: the verse reference (e.g. `Al-Fatihah · 3`).
- Ayah insight block: two sentences, larger line-height.
- Divider.
- "What I noticed" block: label in small uppercase, then the one sentence.
- If `showDisclosure`: a one-line italic foot note —
  `"Your reflections are sent to an AI service to generate this note. They are not used for anything else."` — shown once per user, dismissed by flipping `users.answered_reflection_disclosure_seen` to true.
- Primary button: `"Plant today's tree"`.

`data-testid`s: `answer-card`, `answer-ayah-insight`, `answer-noticing`,
`plant-tree-btn`.

### Component modification: `ReflectView`

**Path:** `app/(app)/today/reflect/ReflectView.tsx` — modify.

After a successful `POST /api/reflections`, the existing path immediately
runs `setDone(true)` which shows the tree-growth emoji and `setTimeout →
router.push("/grove")`. New flow:

1. On reflection-POST success: set a new client state `phase = "awaiting_answer"`
   and render a small holding block containing the text
   `"Reflecting on your words…"` with a subtle spinner.
2. Immediately POST `/api/reflections/:id/answer`.
3. If response is `{"status":"ready"}`: set `phase = "answer"`, render
   `<AnswerCard>` with the returned content.
4. If response is `{"status":"pending"}`: schedule a `GET /api/reflections/:id/answer`
   after `poll_after_ms`. Max 4 polls (~6 seconds total after the initial
   POST). Hard cap on total wait: 8 seconds from reflection submission.
5. If response is `{"status":"unavailable"}`, timeout elapses, or any
   non-success network error: set `phase = "fallen_through"`, render the
   existing tree-growth emoji block unchanged. Then `setTimeout → router.push("/grove")`
   as today.
6. When `phase = "answer"` and the user taps `"Plant today's tree"`: set
   `phase = "planting"`, render the existing tree-growth emoji block, then
   `setTimeout → router.push("/grove")`.
7. The existing `syncStatus === "retry_queued"` line ("Saved locally — we'll
   sync when you're back online.") is still shown beneath the tree-growth
   block in the `fallen_through` and `planting` phases, not in the
   `answer` phase (because the answer card already occupies that space).

### New state on `users` table

Add column `answered_reflection_disclosure_seen boolean NOT NULL DEFAULT false`.
Flipped to `true` by the client the first time an `AnswerCard` is rendered
for a user. Idempotent `PATCH /api/users/me` handles the flip.

### Grove day view / journal

**Path:** `app/(app)/grove/page.tsx`, `app/(app)/journal/...` — modify
wherever the day view renders a reflection.

When rendering a past reflection, `GET /api/reflections/:id/answer`. If
`{"status":"ready"}`, render a compact read-only `<AnswerCard>` variant
without the `"Plant today's tree"` button. If `{"status":"unavailable"}`,
render no answer block.

### States

- **Loading (holding state):** `"Reflecting on your words…"` with spinner.
  Max 8 seconds.
- **Ready:** `AnswerCard` rendered with both blocks.
- **Fallen-through:** identical to today's `done` state — emoji + message.
- **Planting:** identical to today's `done` state post-tap.

## Architecture Notes

- **New dependencies:** none. `@anthropic-ai/sdk` is already in
  `package.json`. Node's built-in `AbortController` is used for timeout.
- **Feature flag:** `ENABLE_ANSWERED_REFLECTION` env var, read server-side
  in the answer route. No client-side flag — the client always attempts
  the POST; the server short-circuits when disabled.
- **Generation mode:** synchronous inline inside the POST route, bounded
  by a 7-second `AbortController` timeout. No background queue — the
  client-side 8-second cap and 4-poll loop handle the UX. If a generation
  doesn't finish in 7 seconds, mark the attempt `given_up` and return
  `{"status":"unavailable"}` on subsequent polls for this reflection.
- **Rate limit check:** Before calling Anthropic, count today's
  `reflection_answer_attempts` rows for this user where `started_at::date = CURRENT_DATE`.
- **Prompt:** committed as a single constant in
  `lib/answered-reflection/prompt.ts`. No templating beyond variable
  substitution. Versioning via git history — model output carries the git
  SHA of the prompt at generation time in a future iteration, not v1.
- **Dependencies & integration:** Depends on existing `getSession()`,
  `createAdminSupabaseClient()`, and `reflections` table. No changes to
  the mission or grove APIs. The `AnswerCard` piggybacks on the
  `GradientCard` visual primitive added earlier.
- **Proxy auth is unchanged.** `/today` and `/grove` remain gated by
  `proxy.ts` (per `docs/learnings/convention-app-route-middleware.md`).
  The two new answer endpoints live under `/api/` and are self-guarded
  via `getSession()`.
- **Admin Supabase everywhere.** Both new routes and the new `lib/db/` helpers
  use `createAdminSupabaseClient()`, per
  `docs/learnings/convention-admin-supabase-for-all-routes.md`.

## Exemplar Files

- `app/api/reflections/route.ts` — canonical pattern for a reflections-area
  POST route: session guard, body validation, admin Supabase, structured
  error envelope.
- `app/(app)/today/_components/AyahCard.tsx` — pattern for using
  `GradientCard` around textual content.
- `components/ui/gradient-card.tsx` — the shared visual primitive.
- `lib/db/reflections.ts` — pattern for reflection-area DB helpers.

## Implementation Plan

### Sub-tasks

**Task 1: Prompt + generator module** — _small_

- Files:
  - `lib/answered-reflection/prompt.ts` (new) — the prompt constant and variable-substitution helper.
  - `lib/answered-reflection/generate.ts` (new) — `generateAnswer({ayahArabic, ayahTranslation, tafsirSnippet, reflectionText})`: one call to Anthropic with `AbortController` (7s), parses JSON response, runs length + specificity + blocklist validators, returns `{ok: true, ayahInsight, noticing, model} | {ok: false, error_code}`.
  - `lib/answered-reflection/validators.ts` (new) — the 3 validators as pure functions, unit-testable.
- INDEPENDENT

**Task 2: Migration + DB helpers** — _small_

- Files:
  - `supabase/migrations/0007_reflection_answers.sql` (new) — creates `reflection_answers`, `reflection_answer_attempts`, indexes, RLS, and adds `users.answered_reflection_disclosure_seen`.
  - `lib/db/reflection-answers.ts` (new) — `getAnswerByReflectionId`, `insertAnswer`, `insertAttempt`, `markAttemptFailed`, `countTodaysAttemptsForUser`, `markDisclosureSeen`.
- INDEPENDENT

**Task 3: Generation API routes** — _medium_

- Files:
  - `app/api/reflections/[id]/answer/route.ts` (new) — `POST` and `GET` handlers per the API Design section.
  - `app/api/users/me/route.ts` (new or modify) — `PATCH` to flip the disclosure flag.
- SEQUENTIAL (depends on Tasks 1 + 2)

**Task 4: AnswerCard component** — _small_

- Files:
  - `app/(app)/today/_components/AnswerCard.tsx` (new) — the presentational component per the UI section.
- INDEPENDENT

**Task 5: Wire ReflectView to the new flow** — _medium_

- Files:
  - `app/(app)/today/reflect/ReflectView.tsx` (modify) — replace the single-shot `done` state with the `awaiting_answer / answer / fallen_through / planting` state machine described in UI/Frontend Requirements.
- SEQUENTIAL (depends on Tasks 3 + 4)

**Task 6: Grove/journal read-only answer rendering** — _small_

- Files:
  - `app/(app)/grove/page.tsx` (modify — day sheet) — fetch and render the answer on past reflections.
  - `app/(app)/journal/page.tsx` or equivalent (modify) — same.
  - `app/api/grove/day/[date]/route.ts` (modify) — include `answer` in the day view response so the client does not need a second fetch.
- SEQUENTIAL (depends on Tasks 2 + 4)

**Task 7: E2E tests** — _small_

- Files:
  - `e2e/answered-reflection.spec.ts` (new) — per the Verification table below.
  - `e2e/today-flow.spec.ts` (modify) — the existing "user can submit an evening reflection" test must still pass with the feature flag off; add a before-each that sets `ENABLE_ANSWERED_REFLECTION=false` for this suite.
- SEQUENTIAL (depends on Task 5)

### Negative Constraints

- **Do NOT** modify `app/api/reflections/route.ts`. The reflection write stays as it is — answer generation is a separate endpoint triggered after success.
- **Do NOT** change any `data-testid` in `ReflectView` that is already used by `e2e/today-flow.spec.ts`: `did-apply-yes_fully`, `did-apply-partly`, `did-apply-not_today`, `reflection-textarea`, `submit-reflection-btn`, `tree-growth-animation`. The last one must still appear in the `fallen_through` and `planting` phases.
- **Do NOT** retroactively generate answers for pre-existing reflections — no migration-time backfill, no cron pass.
- **Do NOT** introduce a provider abstraction layer for v1. Import the Anthropic SDK directly in `lib/answered-reflection/generate.ts`.
- **Do NOT** log reflection text in application logs. Log only `reflection_id`, `user_id`, and `error_code`.
- **Do NOT** add `middleware.ts` — the project uses `proxy.ts` per the Next.js 16 convention in `docs/learnings/convention-app-route-middleware.md`.

## Test Scenarios

**Test 1: Happy path — answer generated and stored**

- Setup: user `demo@ghars.app` with session; mission `mission-happy` on verse `55:13`, committed; `ENABLE_ANSWERED_REFLECTION=true`; Anthropic mocked to return a valid response `{"ayah_insight":"…(140 chars)…","noticing":"you mentioned rain twice — both times as something softening the day."}` and the reflection text contains the word "rain".
- Action: `POST /api/reflections` with a 60-char text about rain → then `POST /api/reflections/:id/answer`.
- Expected: `POST /api/reflections/:id/answer` returns `200` with `status: "ready"` and both blocks; one row in `reflection_answers` with `reflection_id = <id>`, `model = "claude-haiku-4-5-20251001"`; one row in `reflection_answer_attempts` with `status = "in_progress"` then updated to no row (or status removed after success — simpler: no attempt row inserted on the happy path, only on failure).

**Test 2: Specificity guard rejects a generic noticing**

- Setup: user and reflection as Test 1; Anthropic mocked to return `{"ayah_insight":"…","noticing":"What a beautiful reflection."}`.
- Action: `POST /api/reflections/:id/answer`.
- Expected: generation is retried once; on second failure the validator rejects; response is `{"status":"unavailable"}`; one `reflection_answer_attempts` row with `status="failed"`, `error_code="VALIDATION_FAILED"`; no `reflection_answers` row.

**Test 3: LLM timeout — fall through**

- Setup: Anthropic mocked to hang longer than 7 seconds.
- Action: `POST /api/reflections/:id/answer`.
- Expected: `AbortController` fires at 7s; response is `{"status":"unavailable"}`; one `reflection_answer_attempts` row with `status="given_up"`, `error_code="LLM_TIMEOUT"`.

**Test 4: Cross-user access refused**

- Setup: reflection `ref-A` owned by user A; user B is authenticated.
- Action: user B calls `POST /api/reflections/ref-A/answer`.
- Expected: `403 NOT_OWNER`; no Anthropic call is made; no rows written.

**Test 5: Idempotent GET after generation**

- Setup: one `reflection_answers` row exists for `ref-id`.
- Action: `GET /api/reflections/ref-id/answer` called 5 times.
- Expected: each call returns identical `status:"ready"` + same `generated_at` timestamp; `reflection_answers` row count remains 1; no Anthropic calls.

**Test 6: Feature flag off**

- Setup: `ENABLE_ANSWERED_REFLECTION=false`.
- Action: `POST /api/reflections/:id/answer`.
- Expected: `503 FEATURE_DISABLED`; no Anthropic call; no rows written.

**Test 7: Rate limit — 11th attempt**

- Setup: 10 `reflection_answer_attempts` rows for this user with today's date.
- Action: `POST /api/reflections/:id/answer` for an 11th reflection.
- Expected: `429 ANSWER_RATE_LIMITED`; no Anthropic call.

**Test 8: Pre-launch reflection returns unavailable**

- Setup: `reflections` row created before migration 0007, no `reflection_answers` row.
- Action: `GET /api/reflections/:id/answer`.
- Expected: `200 {"status":"unavailable"}`; no rows written.

**Test 9: Validator unit tests**

- Setup: 15 generated outputs — 5 pass all guards, 5 fail length, 5 fail specificity or blocklist.
- Action: run `validators.ts` against each.
- Expected: first 5 return `{ok: true}`, remaining 10 return `{ok: false, reason}` with the specific failed guard.

## Verification

Run the `verifier` skill (`/did-workflow:verifier`) after each sub-task to
confirm format, lint, type check, and unit tests are clean. The project
uses Node + Vitest — the verifier auto-detects the stack.

### Backend API Tests

- `tests/unit/answered-reflection-validators.test.ts` — covers Test 9.
- `tests/integration/reflections-answer-route.test.ts` — covers Tests 1–8
  with Anthropic mocked via a test double injected into
  `lib/answered-reflection/generate.ts`. Uses the existing Vitest +
  Supabase-admin test infrastructure.

### Browser/UI Testing

Dev URL: `http://localhost:3000`. Log in via the "Try with sample data"
button on `/` (which calls `/api/demo/start`).

1. `ENABLE_ANSWERED_REFLECTION=true`. Open `/today`. Commit a mission.
   Write a reflection of at least 40 characters mentioning a specific
   person or place. Tap "Submit reflection."
   - Expected: "Reflecting on your words…" holding state for up to ~3s,
     then an `AnswerCard` with two blocks (ayah insight + noticing that
     references the person/place), then a "Plant today's tree" button.
2. Tap "Plant today's tree".
   - Expected: tree-growth animation, then redirect to `/grove`.
3. Navigate back to `/grove`, open the day sheet for today.
   - Expected: the same answer is shown in a read-only variant (no plant
     button).
4. Re-run step 1 with `ENABLE_ANSWERED_REFLECTION=false`.
   - Expected: no holding state, no answer card, the existing tree-growth
     emoji + message + redirect — identical to current behaviour.
5. Re-run step 1 with Anthropic unreachable (block the domain in devtools
   network tab).
   - Expected: "Reflecting on your words…" for ~8 seconds, then fall
     through to the existing tree-growth block and redirect.

Mobile viewport (iPhone 13 via Chrome devtools): repeat step 1 once;
confirm the answer card fits within the `max-w-sm` column and the button
is tappable.

### E2E Tests

| Key Scenario                                                                  | Test file                         | Assigned sub-task |
| ----------------------------------------------------------------------------- | --------------------------------- | ----------------- |
| User submits a reflection and receives an answer                              | `e2e/answered-reflection.spec.ts` | Task 7            |
| User reads the answer and plants the tree                                     | `e2e/answered-reflection.spec.ts` | Task 7            |
| User submits a "Not today" reflection                                         | `e2e/answered-reflection.spec.ts` | Task 7            |
| The LLM answer is unavailable                                                 | `e2e/answered-reflection.spec.ts` | Task 7            |
| The user revisits an already-answered reflection                              | `e2e/answered-reflection.spec.ts` | Task 7            |
| The user revisits a reflection that was submitted before the feature launched | `e2e/answered-reflection.spec.ts` | Task 7            |
| The user is offline when submitting                                           | `e2e/answered-reflection.spec.ts` | Task 7            |

**Locator strategies:** use `data-testid` throughout:
`reflection-textarea`, `did-apply-yes_fully`, `submit-reflection-btn`,
`answer-card`, `answer-ayah-insight`, `answer-noticing`, `plant-tree-btn`,
`tree-growth-animation`. Demo auth: `page.request.post("/api/demo/start")`
per `docs/learnings/pattern-playwright-demo-auth.md`. Anthropic is not
called in E2E — tests set `ENABLE_ANSWERED_REFLECTION=true` and inject a
local-stub response via an env var (`ANSWERED_REFLECTION_TEST_STUB_JSON`)
that the generator reads before attempting a real API call.

The "scenario outline" from the Acceptance Criteria (specificity by
detail) is covered by the unit validator tests (Test 9), not E2E, because
the variation is in the LLM output not the UI — duplicating it in E2E
would add no coverage.

### Acceptance Criteria

- [ ] `POST /api/reflections/:id/answer` returns the three states documented in API Design for all test scenarios.
- [ ] Permissions enforced (401/403/404) correctly.
- [ ] `reflection_answer_attempts` reflects every failure with a specific `error_code`.
- [ ] `reflection_answers` has exactly one row per successfully generated reflection.
- [ ] All Test Scenarios pass as Vitest tests.
- [ ] All E2E scenarios pass.
- [ ] No type errors or lint warnings (verifier clean).
- [ ] With `ENABLE_ANSWERED_REFLECTION=false`, the behaviour of `/today/reflect` is byte-identical to the current behaviour.
- [ ] The existing `e2e/today-flow.spec.ts` tests pass unchanged (with the feature flag off).
- [ ] First-time disclosure appears exactly once per user.
