# Morning Ayah & Mission Commit

**Ticket:** TBD
**Discovery Brief:** `docs/discovery/quran-ayah-apply/brief.md`
**Epic:** `docs/specs/TBD-quran-ayah-apply/spec.md`

This feature delivers the first of the two daily touches in Quran Ayah Apply. The user opens the app, reads today's one curated ayah (Arabic text, their chosen translation, a condensed tafsir, and full recitation audio), chooses one of two curated action missions — or writes their own — and commits to carrying that mission through the day. The commitment plants a sapling that will grow into a tree when they reflect in the evening.

## User Story

As a practicing Muslim who reads the Quran in translation and wants the Book to shape how I actually live, I want to open the app once in the morning, sit with today's ayah, and commit to one specific action inspired by it, so that the rest of my day carries a named intention rooted in what Allah has guided me toward today.

## Background & Context

**Current state:**

- Readers of the Quran in translation frequently finish a session without a concrete idea of what to do differently today because of what they just read.
- Existing reading and reflection apps show ayat and translations beautifully but do not structure a daily commitment to action.
- The user has just completed onboarding, chosen a translation, and set their morning and evening notification times.

**Problem:**

- Without a structural prompt — "here is today's ayah, pick one thing to do about it, commit now" — meaning-to-action is left as homework that most users never do.
- A loop that asks for commitment only _after_ the user sees the options risks users picking whatever is easiest in hindsight, which undermines reflection integrity.
- Users opening the app at unusual hours (late morning, afternoon) must still receive today's ayah rather than be told they missed the window, otherwise the product feels punishing.

## Target User & Persona

- **Who:** Non-Arabic-speaking practicing Muslim, adult, reads the Quran in English translation, has completed onboarding in Quran Ayah Apply.
- **Context:** Opens the app on waking, after Fajr, or on their first quiet moment of the day — typically responding to the morning notification but sometimes opening unprompted.
- **Current workaround:** Reading an ayah in a standard translation app and hoping a thought stays with them through the day; no external structure to convert the thought into a named action.

## Goals

- Make every morning open of the app produce a single, committed, day-scoped action the user has chosen before they see the rest of their day.
- Protect reflection integrity by making the mission un-editable after commit, so the user cannot retroactively pick whatever is easiest.
- Keep the morning touch short enough (under two minutes end-to-end) that it fits into a real morning routine, while offering deeper tafsir for those who want it.

## Non-Goals

- This feature does not include the evening reflection, tree-completion animation, or streak update — those belong to the evening reflection story.
- This feature does not include the grove home screen or cumulative views — those belong to the grove home story.
- This feature does not include push notification scheduling or delivery — that belongs to the notifications story. The morning flow must work whether or not a notification triggered it.
- This feature does not include selecting or curating which ayah appears on which day — that is owned by the content corpus story.

## User Workflow

1. **Morning arrival** — The user opens the app for the first time today. They see today's ayah, presented calmly: Arabic text, their chosen translation beneath it, the ayah's reference (surah name and verse number), and a play control for the recitation.
2. **Sit with the ayah** — The user reads the translation. If they want, they tap play to hear the full recitation. They can pause and resume. Beneath the translation, a one-to-two-sentence tafsir summary gives them the gist; a "read the full tafsir" control expands Ibn Kathir's full commentary on the ayah.
3. **See today's mission card** — Below the ayah, the user sees a card titled "Your mission today" with two distinct, concrete action options and a third option to write their own.
4. **Pick a mission** — The user taps one of the two options to select it, or taps "write your own" and types an action of their own. They can change their selection freely before committing.
5. **Commit** — The user taps Commit. The mission is locked in for the day. A short sapling animation plays, confirming the commitment has been made.
6. **Carry it through the day** — The user closes the app. The ayah screen remains available if they want to return and re-read or re-listen, but the mission cannot be changed. A quiet cue on the screen invites them to come back in the evening to reflect.

## Acceptance Criteria

### Scenario: First morning open — user reads, listens, picks a curated mission, and commits

```gherkin
Given Aisha has completed onboarding with The Clear Quran as her chosen translation
  And she has not yet opened the app today
  And today's ayah is Surah Al-Alaq 96:1-5 "Read in the name of your Lord who created"
  And today's two curated mission options are "Read one page of the Quran with translation today" and "Teach one thing you learned from the Quran to someone in your family"
When Aisha opens the app at 7:42am
  And she taps play and listens to the recitation
  And she reads the one-sentence tafsir summary
  And she taps "Read the full tafsir" and scrolls through Ibn Kathir's commentary
  And she taps the first mission option to select it
  And she taps Commit
Then she sees today's ayah with Arabic text, The Clear Quran translation, and the reference Surah Al-Alaq 96:1-5
  And she sees her committed mission "Read one page of the Quran with translation today"
  And she sees a sapling animation begin
  And she sees a quiet message inviting her to return in the evening to reflect
```

### Scenario: User writes their own mission instead of choosing a curated one

```gherkin
Given Yusuf has completed onboarding
  And today's ayah is Surah Al-Baqarah 2:286 "Allah does not burden a soul beyond what it can bear"
  And today's two curated mission options are "Make dua for someone carrying a burden you know about" and "Name one hardship you are carrying and ask Allah for ease"
When Yusuf opens the app
  And he taps "or write your own"
  And he types "Call my mother and ask her what she is struggling with today"
  And he taps Commit
Then he sees his committed mission shown as "Call my mother and ask her what she is struggling with today"
  And he sees the sapling animation begin
```

### Scenario: User opens for the first time in the afternoon — today's ayah is still waiting

```gherkin
Given Mariam has completed onboarding
  And she did not open the app in the morning today
  And today's ayah is Surah Al-Hujurat 49:11 "Do not let a people mock another people"
When Mariam opens the app for the first time today at 3:15pm
Then she sees Surah Al-Hujurat 49:11 as today's ayah
  And she sees the two curated mission options and the "or write your own" option
  And she can listen, read the tafsir, pick a mission, and commit exactly as she would in the morning
```

### Scenario: User selects a mission but leaves before committing

```gherkin
Given Ibrahim has opened the app at 8:10am
  And today's ayah is Surah Al-Asr 103:1-3 "By time, indeed mankind is in loss"
  And he has tapped the second mission option to select it
  And he has not yet tapped Commit
When Ibrahim closes the app
  And he returns to the app at 11:30am
Then he sees the same ayah Surah Al-Asr 103:1-3
  And no mission is shown as selected
  And the two curated options and "or write your own" are all available again
  And he has not committed anything yet
```

### Scenario: User returns after committing — the mission is locked and the screen is a re-read surface

```gherkin
Given Khadijah committed at 7:55am to the mission "Give sadaqah today, even a small amount" inspired by Surah Al-Baqarah 2:261 "The example of those who spend their wealth in the way of Allah is like a seed"
When Khadijah reopens the app at 1:20pm
Then she sees today's ayah Surah Al-Baqarah 2:261 with Arabic, translation, and audio controls available
  And she sees her committed mission "Give sadaqah today, even a small amount"
  And she does not see the two curated options or the "write your own" input
  And she does not see a Commit control
  And she sees a quiet cue inviting her to return this evening to reflect
  And she can replay the audio and re-open the full tafsir
```

### Scenario: User plays audio, then the phone screen locks or the app is backgrounded

```gherkin
Given Omar has opened the app and started audio playback of Surah Ar-Rahman 55:13 "So which of the favours of your Lord will you deny?"
When Omar locks his phone while the recitation is still playing
Then the audio stops playing
When Omar unlocks his phone and returns to the app
  And he taps the play control again
Then the recitation plays from the beginning of the ayah
  And the play control behaves exactly as it did on first load
```

### Scenario: User changes their translation in settings after committing

```gherkin
Given Fatima committed this morning to a mission inspired by Surah Ibrahim 14:7 "If you are grateful, I will surely increase you"
  And her translation was set to The Clear Quran when she committed
When Fatima opens settings and changes her translation to Sahih International
  And she returns to today's ayah screen
Then she sees the Arabic text and the reference Surah Ibrahim 14:7 unchanged
  And she sees the Sahih International rendering of the translation
  And her committed mission is still shown exactly as she committed it
  And she still cannot change or re-commit the mission
```

### Scenario: User arrives at the morning screen without completing onboarding

```gherkin
Given a visitor has not created an account and not chosen a translation
When the visitor navigates directly to the morning ayah screen
Then the visitor is taken to onboarding instead
  And the visitor does not see today's ayah or any mission options until onboarding is complete
```

### Scenario: Ayah delivery is temporarily unavailable

```gherkin
Given Zainab has completed onboarding
  And the ayah content service is temporarily unreachable
When Zainab opens the app at 8:05am
Then she sees a calm, gentle message such as "We'll be back in a moment, in sha Allah — please try again shortly"
  And she does not see any technical error wording, codes, or system names
  And she sees a way to retry
When the service becomes reachable again
  And Zainab taps retry
Then she sees today's ayah and the mission card exactly as she would have on a normal morning
```

### Scenario Outline: User switches between the two curated mission options before committing

```gherkin
Given Hassan has opened the app
  And today's two curated mission options are shown
When Hassan taps <first tap>
  And he then taps <second tap>
  And he taps Commit
Then the committed mission is <committed mission>

Examples:
  | first tap           | second tap          | committed mission                                                 |
  | the first option    | the second option   | the second option as written                                      |
  | the second option   | the first option    | the first option as written                                       |
  | the first option    | "or write your own" | the custom text Hassan typed                                      |
  | "or write your own" | the first option    | the first option as written, and the custom text is not committed |
```

### Scenario: User attempts to commit "write your own" with an empty or whitespace-only entry

```gherkin
Given Layla has tapped "or write your own"
  And she has typed only spaces in the input
When Layla taps Commit
Then the mission is not committed
  And she sees a gentle prompt inviting her to write what she will do today
  And she remains on the mission card able to edit her text or pick a curated option
```

### Scenario: User pauses and resumes audio playback

```gherkin
Given Bilal has opened today's ayah
  And the full recitation runs for about thirty seconds
When Bilal taps play
  And five seconds later he taps pause
  And shortly after he taps play again
Then the recitation resumes from the point at which he paused
  And the control reflects the current playing or paused state at all times
```

### Scenario: User opens the app a second time on the same day before committing

```gherkin
Given Nadia opened the app at 6:50am
  And she read the ayah but left without selecting a mission
When Nadia returns to the app at 9:10am on the same calendar day
Then she sees the same ayah she saw at 6:50am
  And she sees the same two curated mission options she saw at 6:50am
  And she has not yet committed, so Commit is available
```

### Scenario: User opens the app on a new calendar day having committed the previous day

```gherkin
Given Rashid committed yesterday to a mission inspired by Surah Al-Furqan 25:63 "The servants of the Most Merciful are those who walk upon the earth in humility"
When Rashid opens the app the following morning
Then he sees a new ayah — today's ayah, different from yesterday's
  And he sees today's two curated mission options with "or write your own" available
  And he can select and commit today's mission freshly
  And yesterday's committed mission is not shown on the morning screen
```

## Business Rules & Constraints

- **One ayah per calendar day, anchored to first touch.** Once a user opens the app for the first time on a given local calendar day, that day's ayah is fixed for them. Opening at 6am or at 4pm on the same day shows the same ayah.
- **Mission is locked at commit.** Once the user taps Commit, the chosen mission cannot be changed, re-picked, edited, or replaced for the rest of the day. This is a deliberate integrity protection, not a bug.
- **Pre-commit state does not persist.** If the user selects a mission but does not commit, the selection is discarded when they leave the app. The ayah itself persists for the day.
- **Custom mission requires real content.** A "write your own" mission must contain at least one non-whitespace character. Empty or whitespace-only entries cannot be committed.
- **Ayah screen is always readable.** Whether or not the user has committed, the ayah, translation, audio, tafsir summary, and full tafsir remain available to open, re-read, and replay at any time the same day.
- **Translation change is immediate and non-destructive.** Changing the user's translation in settings updates the translation shown on the ayah screen on next view and does not alter, undo, or reset an already-committed mission.
- **Gentle failure language.** Any service failure the user sees must use calm, human wording. No technical codes, system names, or stack details reach the user.
- **Onboarding gate.** The morning ayah screen is only reachable once the user has completed onboarding, including choosing a translation.

## Success Metrics

- **Commit rate:** Percentage of morning opens that result in a committed mission. Target: ≥70% of first-opens-of-the-day in pilot usage.
- **Time to commit:** Median time between opening the app and tapping Commit. Target: under two minutes, indicating the flow fits a real morning routine.
- **Custom mission share:** Percentage of commits that use "write your own". A healthy range is 10–30% — too low suggests the curated options are not inspiring personalisation, too high suggests the curated options are not resonating.
- **Audio engagement:** Percentage of morning sessions in which the user taps play at least once. Used as a signal that the Arabic recitation is part of the ritual and not ignored.
- **Full tafsir expansion rate:** Percentage of morning sessions in which the user opens the full tafsir. Used as a signal of depth of engagement for the API-integration judging criterion.

## Dependencies

- **Onboarding & account creation** — The user must have an account and a chosen translation before this flow is reachable.
- **Ayah corpus curation** — A ready corpus of at least 60 curated ayat, each with two human-edited mission options, is required for the content shown every day.
- **Translation content** — The user's chosen translation text for each ayah in the corpus.
- **Tafsir content** — A condensed 1–2 sentence tafsir summary and the full Ibn Kathir commentary for each ayah in the corpus.
- **Audio recitation** — A full recitation recording per ayah, playable and pausable within the app.
- **Notifications & scheduling** — While this story works without notifications, morning notifications are the expected entry path for most users in normal operation.

## Open Questions

> Shared product-level questions (translation default, tafsir source, notification defaults, corpus curation process, platform, auth model, reflection storage) are resolved in the epic overview — see `docs/specs/TBD-quran-ayah-apply/spec.md`.

- [x] ~~Can the user change their mission after committing on the same day?~~ — **Resolved:** No. Locking the mission after commit is the integrity protection that distinguishes this product from a generic habit tracker. The user may still re-read the ayah, replay audio, and re-open the tafsir.
- [x] ~~What happens if the user opens the app for the first time in the afternoon?~~ — **Resolved:** Today's ayah is shown normally; the flow is identical to a morning open. The ayah is anchored to the calendar day, not the clock.
- [x] ~~Does a committed mission show on the morning screen on subsequent days?~~ — **Resolved:** No. Yesterday's committed mission is not shown on today's morning screen; only today's ayah and today's mission state appear there. Historical missions live in the reflection journal (separate story).
- [ ] Exact length ceiling (if any) for a "write your own" custom mission — **Deferred (non-blocking):** A sensible upper bound (e.g., a short sentence or two) will be confirmed during technical refinement; it does not change the user-visible flow.
- [ ] Whether the audio control should resume mid-ayah across app backgrounding within the same session, rather than restarting — **Deferred (non-blocking):** Current rule is restart-from-beginning on return after the phone locks; a more forgiving resume behaviour may be a later polish but is not required for the submission.

---

## Functional Requirements

- **Atomicity.** The `GET /api/today` handler resolves-or-creates today's `daily_assignments` row in a single Supabase transaction; if any downstream QF content fetch fails after row insert, the insert is rolled back so no phantom assignment is persisted.
- **Lazy assignment.** The `daily_assignments` row for `(user_id, local_date)` is created on the first touch of the day. Clock-of-open (morning vs. afternoon) has no effect on which verse is chosen — the selection is a pure function of `local_date` and `user_seed`.
- **Idempotency — commit.** `POST /api/today/commit` is idempotent on `assignment_id`. A second POST with the same `{ assignment_id, selected_prompt, is_custom }` returns the existing `mission_id` and the original `committed_at`, never a duplicate row (enforced by `UNIQUE (assignment_id)` on `missions`).
- **Idempotency — today package.** Calling `GET /api/today` repeatedly on the same local_date returns the same `assignment_id` and the same verse/prompts. `mission` in the response is `null` until commit, populated thereafter.
- **Validation — curated prompt.** When `is_custom=false`, `selected_prompt` must match one of the two strings in the assignment's `prompts` array byte-for-byte. Mismatch → `400 PROMPT_MISMATCH`.
- **Validation — custom prompt.** When `is_custom=true`, `selected_prompt` (after `trim()`) must satisfy `1 <= char_length <= 280`. Empty/whitespace-only → `400 PROMPT_MISMATCH` ("Custom mission cannot be empty"). Over 280 chars → `400 CUSTOM_TOO_LONG`.
- **Post-commit immutability.** Once a mission row exists for an assignment, the ayah screen renders in read-only mode for the mission card; audio/tafsir/translation remain fully interactive.
- **Translation-change safety.** Changing the user's translation in settings affects subsequent `/api/today` responses only (via a fresh content fetch); it does not alter `missions.selected_prompt` or re-trigger QF fetches for already-rendered content.

## Permissions & Security

- **Session required.** Every route in this story calls `lib/auth/session.ts#requireUser()`; missing or expired session → `401 UNAUTHENTICATED`.
- **Supabase RLS.** Both `daily_assignments` and `missions` have row-level security enabled with the policy `user_id = auth.uid()`. Server-side writes use the service-role key only inside `lib/db/*`; all reads that originate from the browser are filtered by RLS via the user JWT.
- **Server-side proxying.** QF tokens (`x-client-id`, `x-auth-token`) never reach the browser. All QF fetches originate from `lib/qf/client.ts` on the Next.js server runtime. The `/api/content/tafsir/:verse_key` and `/api/content/verse/:verse_key` routes exist specifically so the browser can request content without seeing the upstream URL or headers.
- **Input sanitisation.** `selected_prompt` is stored as-is (UTF-8 text, no HTML rendering — React escapes on display). `local_date` is validated as strict `YYYY-MM-DD` via `zod`; anything else → `400 INVALID_LOCAL_DATE`.
- **No PII in logs.** Server logs include `user_id` (UUID) and `assignment_id` only; never `selected_prompt` body.

## API Design

All routes live in the own-repo Next.js App Router and return JSON. Error shape: `{ "error": { "code": "<CODE>", "message": "<human-readable>" } }`.

### `GET /api/today?local_date=YYYY-MM-DD`

Returns today's ayah package. Resolves or creates today's `daily_assignments` row using `((day_of_year(local_date) + user_seed) mod corpus_size)` to select a `corpus_entries` row, then fetches verse text, translation, and audio URL from QF and reads `tafsir_extract` from our `corpus_entries` row.

Sample response (verse_key `96:1`):

```json
{
  "assignment_id": "d3f8b2a0-4e11-4a7a-9c62-8b2f8d1d7a01",
  "verse_key": "96:1",
  "surah_name": "Al-Alaq",
  "ayah_number": 1,
  "arabic": "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ",
  "translation": "Read in the name of your Lord who created —",
  "translation_id": "131",
  "tafsir_extract": "Read — the first command of revelation. Learning is the foundation of connecting to Allah.",
  "audio_url": "https://audio.qurancdn.com/Alafasy/mp3/001001.mp3",
  "prompts": [
    "Spend 15 minutes today learning something that brings you closer to Allah.",
    "Teach one thing you know to someone — even a single ayah's meaning."
  ],
  "mission": null
}
```

Post-commit, `mission` is populated:

```json
{
  "mission": {
    "mission_id": "7a1b09e2-3f44-4b08-8e99-0ab6d5a7f123",
    "selected_prompt": "Spend 15 minutes today learning something that brings you closer to Allah.",
    "is_custom": false,
    "committed_at": "2026-05-02T06:42:11Z"
  }
}
```

Errors:

| Code                     | HTTP | Message                                          |
| ------------------------ | ---- | ------------------------------------------------ |
| `UNAUTHENTICATED`        | 401  | Session required                                 |
| `INVALID_LOCAL_DATE`     | 400  | local_date must be YYYY-MM-DD                    |
| `CORPUS_EMPTY`           | 404  | No reviewed corpus entries available             |
| `QF_CONTENT_UNAVAILABLE` | 503  | Quran content service is temporarily unreachable |

### `POST /api/today/commit`

Body: `{ assignment_id: string, selected_prompt: string, is_custom: boolean }`.
Response: `{ mission_id: string, committed_at: string }` (ISO-8601 UTC).
Idempotent on `assignment_id`.

Sample request:

```json
{
  "assignment_id": "d3f8b2a0-4e11-4a7a-9c62-8b2f8d1d7a01",
  "selected_prompt": "Teach one thing you know to someone — even a single ayah's meaning.",
  "is_custom": false
}
```

Sample response:

```json
{
  "mission_id": "7a1b09e2-3f44-4b08-8e99-0ab6d5a7f123",
  "committed_at": "2026-05-02T06:42:11Z"
}
```

Errors:

| Code                          | HTTP | Message                                           |
| ----------------------------- | ---- | ------------------------------------------------- |
| `UNAUTHENTICATED`             | 401  | Session required                                  |
| `ASSIGNMENT_NOT_FOUND`        | 404  | Assignment not found or not owned by user         |
| `PROMPT_MISMATCH`             | 400  | selected_prompt does not match any curated option |
| `CUSTOM_TOO_LONG`             | 400  | Custom mission must be 280 characters or fewer    |
| `ALREADY_COMMITTED_DIFFERENT` | 409  | Mission already committed for this assignment     |

### `GET /api/content/tafsir/:verse_key?full=true`

Proxies the QF full tafsir endpoint (`/quran/tafsirs/{tafsir_id}?verse_key={key}` — confirmed in `lib/qf/content.ts`; default `tafsir_id=169` Ibn Kathir English) for the expandable drawer. Response is passed through with minimal shaping: `{ verse_key, tafsir_id, text_html, source_name }`. Cached with `revalidate: 86400` (content is pure and not user-specific).

Errors: `503 QF_CONTENT_UNAVAILABLE`, `400 INVALID_VERSE_KEY` (must match `^\d{1,3}:\d{1,3}$`).

### `GET /api/content/verse/:verse_key`

Fallback direct lookup for deep-linked verses (e.g. shared links, QA). Returns the same package shape as `/api/today` minus `mission` and minus `prompts` (no assignment context).

Sample response (verse_key `2:286`):

```json
{
  "verse_key": "2:286",
  "surah_name": "Al-Baqarah",
  "ayah_number": 286,
  "arabic": "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
  "translation": "Allah does not burden a soul beyond what it can bear.",
  "translation_id": "131",
  "tafsir_extract": null,
  "audio_url": "https://audio.qurancdn.com/Alafasy/mp3/002286.mp3"
}
```

Errors: `400 INVALID_VERSE_KEY`, `503 QF_CONTENT_UNAVAILABLE`.

## Data Model & Migrations

The `daily_assignments` and `missions` tables are defined in the epic's Shared Data Model (see `docs/specs/TBD-quran-ayah-apply/spec.md`). This story owns the migration file `supabase/migrations/0002_daily_assignment_mission.sql` which materialises them and adds story-specific constraints.

Migration contents:

```sql
-- supabase/migrations/0002_daily_assignment_mission.sql

create table if not exists public.daily_assignments (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  local_date      date not null,
  corpus_entry_id uuid not null references public.corpus_entries(id),
  verse_key       text not null,
  prompts         jsonb not null,
  created_at      timestamptz not null default now(),
  unique (user_id, local_date)
);

create index daily_assignments_user_date
  on public.daily_assignments (user_id, local_date desc);

create table if not exists public.missions (
  id              uuid primary key default gen_random_uuid(),
  assignment_id   uuid not null references public.daily_assignments(id) on delete cascade,
  user_id         uuid not null references public.users(id) on delete cascade,
  selected_prompt text not null,
  is_custom       boolean not null default false,
  committed_at    timestamptz not null default now(),
  unique (assignment_id),
  check (char_length(selected_prompt) between 1 and 280)
);

alter table public.daily_assignments enable row level security;
alter table public.missions enable row level security;

create policy daily_assignments_owner on public.daily_assignments
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy missions_owner on public.missions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
```

Notes:

- `daily_assignments.prompts` is a `jsonb` array of exactly two strings (the two curated prompts snapshotted from `corpus_entries.prompts` at assignment time, so corpus edits after assignment don't retroactively change today's options).
- `missions.assignment_id` is `UNIQUE`, which is what makes the commit endpoint idempotent at the DB level.
- The CHECK on `selected_prompt` is the last-line defence against application bugs; the Zod schema at the route handler is the first.

## UI/Frontend Requirements

Entry page: `app/(app)/today/page.tsx`. The page hosts a phase switcher (`morning | reflect`) driven by the presence of `mission` and the local-time-of-day, but only the `morning` branch is owned by this story.

All components live in `app/(app)/today/_components/`.

| Component            | File                                                 | Props                                                                                       | Notes                                                                                                              |
| -------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `AyahCard`           | `app/(app)/today/_components/AyahCard.tsx`           | `{ arabic: string, translation: string, surah_name: string, ayah_number: number }`          | Arabic rendered inside `<span translate="no" lang="ar" dir="rtl">` per QF guidance (see epic negative constraints) |
| `TafsirExtract`      | `app/(app)/today/_components/TafsirExtract.tsx`      | `{ extract: string, onExpand: () => void }`                                                 | Condensed tafsir; tap opens drawer.                                                                                |
| `TafsirFullDrawer`   | `app/(app)/today/_components/TafsirFullDrawer.tsx`   | `{ verse_key: string, open: boolean, onOpenChange: (v: boolean) => void }`                  | shadcn `Sheet`; lazy-fetches `/api/content/tafsir/:verse_key?full=true` on first open.                             |
| `AudioPlayer`        | `app/(app)/today/_components/AudioPlayer.tsx`        | `{ src: string }`                                                                           | Wraps native `<audio>`, shadcn `Button` for play/pause, progress bar driven by `timeupdate`.                       |
| `MissionCard`        | `app/(app)/today/_components/MissionCard.tsx`        | `{ prompts: [string, string], mode: "pre_commit" \| "committed", committed_text?: string }` | shadcn `RadioGroup` for selection; switches to read-only text when `mode === "committed"`.                         |
| `CustomMissionInput` | `app/(app)/today/_components/CustomMissionInput.tsx` | `{ value: string, onChange: (v: string) => void, disabled: boolean }`                       | shadcn `Textarea` + 280-char counter; disabled when a radio option is selected.                                    |
| `CommitButton`       | `app/(app)/today/_components/CommitButton.tsx`       | `{ onCommit: () => Promise<void>, disabled: boolean, loading: boolean }`                    | shadcn `Button`; loading spinner while POST in flight; disabled until a prompt is chosen.                          |

States the `today/page.tsx` must handle:

1. **Loading** — skeleton for ayah + mission card while `GET /api/today` resolves.
2. **Ready pre-commit** — ayah + prompts + custom input + enabled `CommitButton` once any prompt chosen.
3. **Commit in flight** — `CommitButton` shows spinner; card inputs disabled.
4. **Commit error** — toast using shadcn `Sonner`: `PROMPT_MISMATCH`, `CUSTOM_TOO_LONG`, `ALREADY_COMMITTED_DIFFERENT` each map to a specific friendly string; inputs re-enabled.
5. **Committed / read-only** — mission card shows committed text, no radios, no textarea, no Commit button; evening cue appears.
6. **QF unavailable fallback** — "We'll be back in a moment, in sha Allah — please try again shortly" card with retry button; shown on `503 QF_CONTENT_UNAVAILABLE` or `404 CORPUS_EMPTY`.

## Architecture Notes

- **Server-side assembly.** `app/api/today/route.ts` fans out to:
  - `lib/db/assignments.ts` — resolve-or-create `daily_assignments` row.
  - `lib/qf/content.ts` — verse text, translation (by `user.preferred_translation_id`), audio URL.
  - `lib/db/corpus.ts` — read `tafsir_extract` + curated prompts from `corpus_entries`.
    All QF calls go through `lib/qf/client.ts`, which passes `x-auth-token` (cached client_credentials token) + `x-client-id` on every request and handles 401-refresh transparently.
    Route-level cache: `revalidate: 0` (user-specific). The three pure-content sub-fetches inside `lib/qf/content.ts` use `fetch(url, { next: { revalidate: 86400 } })` at module level, so multiple users on the same verse share a single upstream hit per day.
- **Assignment algorithm.** `user_seed` is a stable 32-bit hash of `users.id` computed once (persisted in `users.seed` via the onboarding story migration). `day_of_year(local_date)` is computed in UTC-local (the user's `local_date` is already zoned at the client). Formula: `index = (day_of_year + user_seed) mod count(corpus_entries where status='reviewed')`. Ordering is deterministic by `corpus_entries.id ASC`. This gives each user a deterministic, personalised rotation; demo users use the same algorithm so "today's ayah" is reproducible for judges.
- **Audio URL expiry.** If the QF CDN returns a signed URL with short TTL, the `<audio>` element may 403 mid-session. The client silently retries once by re-invoking `GET /api/today`, which refreshes the audio URL. A second failure bubbles up to the QF-unavailable fallback.
- **Transaction discipline.** The resolve-or-create path in `lib/db/assignments.ts` uses a Postgres function `upsert_daily_assignment(user_id, local_date, corpus_entry_id, verse_key, prompts)` with `ON CONFLICT (user_id, local_date) DO NOTHING RETURNING *` — this is the single source of atomicity for Test 2 (mid-day first open) and the concurrent-open edge case (two tabs opening `/today` simultaneously).

## Exemplar Files

This story is greenfield — no prior exemplars in the own repo. Cite:

- Next.js App Router data-fetching patterns — `https://nextjs.org/docs/app/building-your-application/data-fetching/patterns`
- shadcn `Sheet` docs — `https://ui.shadcn.com/docs/components/sheet`
- shadcn `RadioGroup` docs — `https://ui.shadcn.com/docs/components/radio-group`
- QF API reference — see epic's Shared Architecture Notes. Confirmed paths: `/verses/by_key/{key}?fields=text_uthmani,...`, `/recitations/{id}/by_ayah/{key}`, `/quran/tafsirs/{id}?verse_key={key}` (all in `lib/qf/content.ts`).

## Implementation Plan — Sub-tasks

### Task 1: Migration for `daily_assignments` + `missions` — _small_

- Files: `supabase/migrations/0002_daily_assignment_mission.sql`
- SEQUENTIAL — depends on onboarding Task 1 (the `users` table and `users.seed` column must exist).

### Task 2: QF Content API client — _medium_

- Files:
  - `lib/qf/client.ts` — shared `fetch` wrapper with client_credentials token cache, automatic 401-refresh, and `x-client-id` header injection.
  - `lib/qf/content.ts` — typed helpers `getVerseByKey(verseKey)`, `getTranslation(verseKey, translationId)`, `getAudioUrl(verseKey, reciterId)`, `getFullTafsir(verseKey, tafsirId)`.
- INDEPENDENT.

### Task 3: Assignment resolver — _small_

- Files: `lib/db/assignments.ts` — exports `resolveOrCreateAssignment(userId, localDate)` using the day-of-year + `user_seed` formula and the `upsert_daily_assignment` Postgres function.
- SEQUENTIAL — depends on Task 1.

### Task 4: `GET /api/today` handler — _medium_

- Files: `app/api/today/route.ts`
- SEQUENTIAL — depends on Tasks 2 and 3.

### Task 5: `POST /api/today/commit` handler — _small_

- Files:
  - `app/api/today/commit/route.ts`
  - `lib/db/missions.ts` — exports `commitMission({ userId, assignmentId, selectedPrompt, isCustom })` with idempotency + PROMPT_MISMATCH / ALREADY_COMMITTED_DIFFERENT logic.
- SEQUENTIAL — depends on Task 3.

### Task 6: Today page + components — _medium_

- Files:
  - `app/(app)/today/page.tsx`
  - `app/(app)/today/_components/AyahCard.tsx`
  - `app/(app)/today/_components/TafsirExtract.tsx`
  - `app/(app)/today/_components/TafsirFullDrawer.tsx`
  - `app/(app)/today/_components/AudioPlayer.tsx`
  - `app/(app)/today/_components/MissionCard.tsx`
  - `app/(app)/today/_components/CustomMissionInput.tsx`
  - `app/(app)/today/_components/CommitButton.tsx`
- SEQUENTIAL — depends on Tasks 4 and 5.

### Task 7: Full-tafsir + deep-link content proxies — _small_

- Files:
  - `app/api/content/tafsir/[key]/route.ts`
  - `app/api/content/verse/[key]/route.ts`
- SEQUENTIAL — depends on Task 2.

### Negative Constraints

- Do NOT mutate QF content responses server-side beyond assembling them into the ayah package (no summarising, no translation rewriting, no Arabic normalisation).
- Do NOT cache user-specific fields (`mission`, `assignment_id`, `prompts` after personalisation) in the shared module-level `fetch` cache. Only pure content (verse text, translation, audio URL, full tafsir) is cached with `revalidate: 86400`.
- Do NOT modify the `users` table in this story; `user_seed` is added by the onboarding story.
- Do NOT render Arabic text without `translate="no" lang="ar"` attributes on the enclosing element.
- Do NOT expose QF tokens (`x-auth-token`, `x-client-id`) in any client-bound response, cookie, or log line.

## Test Scenarios

### Test 1: Happy path commit

- **Setup:** User Aisha (`user_id=aaaaaaaa-...`), `local_date=2026-05-02`, corpus seeded with ≥1 reviewed entry, today's assignment maps to verse_key `96:1`.
- **Action:** `GET /api/today?local_date=2026-05-02` then `POST /api/today/commit` with `{ assignment_id, selected_prompt: "Spend 15 minutes today learning something that brings you closer to Allah.", is_custom: false }`.
- **Expected:** Both return 200. `missions` row exists with `is_custom=false`, `selected_prompt` matching. Second `GET /api/today` returns `mission: { mission_id, selected_prompt, is_custom: false, committed_at }` populated.

### Test 2: Mid-day first open

- **Setup:** User has no `daily_assignments` row for today; opens app at 15:00 local.
- **Action:** `GET /api/today?local_date=2026-05-02`.
- **Expected:** 200; `daily_assignments` row created lazily; `verse_key` identical to what would have been returned at 08:00 on the same `local_date` (deterministic by formula).

### Test 3: Custom mission commit

- **Setup:** As Test 1, but pre-commit.
- **Action:** `POST /api/today/commit` with `{ assignment_id, is_custom: true, selected_prompt: "Read one page of Riyad as-Salihin" }`.
- **Expected:** 200; `missions.is_custom=true`; `missions.selected_prompt = "Read one page of Riyad as-Salihin"` stored verbatim.

### Test 4: Double-commit idempotency

- **Setup:** Mission already committed for assignment with `selected_prompt = "P"`, `mission_id = 7a1b09e2-...`.
- **Action:** Second `POST /api/today/commit` with identical `{ assignment_id, selected_prompt: "P", is_custom: false }`.
- **Expected:** 200; response `mission_id = 7a1b09e2-...` (same); `committed_at` unchanged; `select count(*) from missions where assignment_id = ...` returns exactly 1.

### Test 5: Double-commit different prompt rejected

- **Setup:** Mission already committed with `selected_prompt = "Prompt A"`.
- **Action:** `POST /api/today/commit` with `selected_prompt = "Prompt B"` and same `assignment_id`.
- **Expected:** `409 ALREADY_COMMITTED_DIFFERENT` with message `"Mission already committed for this assignment"`; DB row unchanged.

### Test 6: Custom too long rejected

- **Setup:** Valid session; valid `assignment_id`; no mission yet.
- **Action:** `POST /api/today/commit` with `is_custom=true`, `selected_prompt` = 281 characters.
- **Expected:** `400 CUSTOM_TOO_LONG` with message `"Custom mission must be 280 characters or fewer"`; `missions` row count unchanged.

### Test 7: Curated prompt mismatch rejected

- **Setup:** Assignment's `prompts = ["A", "B"]`; no mission yet.
- **Action:** `POST /api/today/commit` with `is_custom=false`, `selected_prompt = "C"`.
- **Expected:** `400 PROMPT_MISMATCH` with message `"selected_prompt does not match any curated option"`; `missions` row count unchanged.

### Test 8: Corpus empty

- **Setup:** `corpus_entries` has 0 rows with `status='reviewed'`.
- **Action:** `GET /api/today?local_date=2026-05-02`.
- **Expected:** `404 CORPUS_EMPTY` with message `"No reviewed corpus entries available"`; UI shows "we'll be back shortly" card; no `daily_assignments` row written.

### Test 9: QF content 503 fallback

- **Setup:** Mock `lib/qf/content.ts#getVerseByKey` to throw a 503-equivalent error.
- **Action:** `GET /api/today?local_date=2026-05-02` for a user with no existing assignment today.
- **Expected:** `503 QF_CONTENT_UNAVAILABLE`; transaction rolls back so no partial `daily_assignments` row exists; UI shows graceful fallback card with retry.

### Test 10: Unauthenticated

- **Setup:** No session cookie.
- **Action:** `GET /api/today?local_date=2026-05-02` and `POST /api/today/commit`.
- **Expected:** Both return `401 UNAUTHENTICATED` with message `"Session required"`.

## Acceptance Criteria

- [ ] `GET /api/today?local_date=YYYY-MM-DD` returns the exact response shape documented above (all 10 fields for pre-commit; `mission` populated post-commit).
- [ ] `POST /api/today/commit` is idempotent on `assignment_id`: two identical POSTs return the same `mission_id` and never create a duplicate row (verified by `UNIQUE (assignment_id)`).
- [ ] `POST /api/today/commit` returns `409 ALREADY_COMMITTED_DIFFERENT` when called a second time with a different prompt.
- [ ] Custom prompts > 280 chars are rejected with `400 CUSTOM_TOO_LONG`; custom prompts that are empty after `trim()` are rejected with `400 PROMPT_MISMATCH`.
- [ ] Curated prompts not in the assignment's `prompts` array are rejected with `400 PROMPT_MISMATCH`.
- [ ] RLS is enforced: a user cannot read or write another user's `daily_assignments` or `missions` rows (verified by integration test with two users).
- [ ] Session is required on every route (`401 UNAUTHENTICATED` otherwise); QF tokens never appear in any client-visible response, cookie, or log.
- [ ] Arabic text is wrapped in `<span translate="no" lang="ar">` in every place it renders (AyahCard, verse proxy consumers).
- [ ] Audio playback works in Chrome Android and iOS Safari mobile viewports (play, pause, resume, complete).
- [ ] The "we'll be back shortly" fallback card renders on `CORPUS_EMPTY` and `QF_CONTENT_UNAVAILABLE` with a working retry button; no technical codes are shown to the user.
- [ ] Deep-linked verse lookup `GET /api/content/verse/:verse_key` returns a verse package for any valid `verse_key` regardless of whether it's in the corpus.
- [ ] `npm run lint` and `npm run typecheck` pass clean on all files touched by this story.
- [ ] Migration `supabase/migrations/0002_daily_assignment_mission.sql` applies and rolls back cleanly on a fresh Supabase instance.
- [ ] Post-commit, the mission card is read-only (no radios, no textarea, no Commit button); ayah/audio/tafsir remain fully interactive.
- [ ] Mid-day first open produces the same verse as a morning first open for the same `local_date` (deterministic by formula).

## Verification

### Backend API Tests

- `lib/db/assignments.test.ts` — resolve-or-create; day-of-year rotation determinism; `user_seed` produces distinct sequences for distinct users; concurrent resolve returns the same row.
- `app/api/today/route.test.ts` — integration test with mocked QF client; covers happy path, `CORPUS_EMPTY`, `QF_CONTENT_UNAVAILABLE` (with rollback verification), `INVALID_LOCAL_DATE`, `UNAUTHENTICATED`.
- `app/api/today/commit/route.test.ts` — happy path (curated + custom), idempotency (Test 4), `ALREADY_COMMITTED_DIFFERENT`, `CUSTOM_TOO_LONG`, `PROMPT_MISMATCH`, `ASSIGNMENT_NOT_FOUND`.
- `app/api/content/tafsir/[key]/route.test.ts` — proxy returns cached shape; `INVALID_VERSE_KEY`; `QF_CONTENT_UNAVAILABLE`.

### Browser/UI Testing

- Deploy to Vercel preview.
- Sign in as a test user; verify today's ayah renders Arabic, translation, tafsir extract, and that audio plays in both iOS Safari and Chrome Android mobile viewports (use device emulation + one real-device smoke).
- Tap "Read full tafsir" — drawer opens, loads `/api/content/tafsir/:verse_key?full=true`, renders tafsir text.
- Select mission option 1 → tap Commit → page transitions to read-only state with "come back this evening to reflect" cue.
- Refresh the page post-commit — still read-only, same `mission_id`.
- Change translation in settings — revisit today — translation updates; committed mission unchanged.

### E2E Tests

Each Key Scenario from the business section maps to a Playwright spec in `tests/e2e/`:

| Key Scenario                                      | Test file                                        | Assigned sub-task |
| ------------------------------------------------- | ------------------------------------------------ | ----------------- |
| Morning touch — happy path commit                 | `tests/e2e/morning-happy-commit.spec.ts`         | Task 6            |
| Mid-day first open shows today's ayah             | `tests/e2e/morning-midday-first-open.spec.ts`    | Task 6            |
| Custom mission commit                             | `tests/e2e/morning-custom-mission.spec.ts`       | Task 6            |
| Read full tafsir drawer                           | `tests/e2e/morning-full-tafsir.spec.ts`          | Task 6            |
| Return after commit shows read-only + evening cue | `tests/e2e/morning-post-commit-readonly.spec.ts` | Task 6            |
| Audio play/pause lifecycle                        | `tests/e2e/morning-audio-playback.spec.ts`       | Task 6            |
| Translation switch picks up on next view          | `tests/e2e/morning-translation-switch.spec.ts`   | Task 6            |
| Onboarding not complete → redirect                | `tests/e2e/morning-onboarding-redirect.spec.ts`  | Task 6            |
| Content API unavailable → graceful card           | `tests/e2e/morning-qf-unavailable.spec.ts`       | Task 6            |

**Locator strategies** (must be added as `data-testid` attributes on the corresponding components):

- `data-testid="ayah-arabic"` — on the Arabic `<span>` inside `AyahCard`.
- `data-testid="ayah-translation"` — on the translation block inside `AyahCard`.
- `data-testid="tafsir-extract"` — on the extract text inside `TafsirExtract`.
- `data-testid="tafsir-full-trigger"` — on the button that opens `TafsirFullDrawer`.
- `data-testid="mission-option-1"` / `data-testid="mission-option-2"` — on the two shadcn `RadioGroupItem`s inside `MissionCard`.
- `data-testid="mission-custom-input"` — on the `Textarea` inside `CustomMissionInput`.
- `data-testid="commit-button"` — on the `CommitButton` shadcn `Button`.
- `data-testid="audio-play"` — on the play/pause button inside `AudioPlayer`.

## Open Questions

- [ ] Exact QF tafsir endpoint path (list-ayah-tafsirs vs. `/tafsir/{tafsir_id}/by_ayah/{verse_key}`) — **Deferred:** verified during first hour of build against live docs; both produce the same consumed shape (`{ text, resource_name }`) so the client wrapper in `lib/qf/content.ts` is the only file that changes.
