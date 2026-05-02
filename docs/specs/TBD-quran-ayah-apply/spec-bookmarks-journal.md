# Bookmarks & Reflection Journal

**Ticket:** TBD
**Discovery Brief:** `docs/discovery/quran-ayah-apply/brief.md`
**Epic Overview:** `docs/specs/TBD-quran-ayah-apply/spec.md`

A private, browsable journal of every reflection the user has ever completed, with the ability to star specific ayah-reflection pairs as favourites for quick return. The journal turns day-by-day engagement into a visible personal record of how the Quran has shaped a user's week, month, and year — and lets them revisit the ayat that most moved them without scrolling through everything else.

## User Story

As a practicing Muslim using the app to apply the Quran to my daily life, I want to browse and search my past reflections and bookmark the ayat that most moved me, so that I can revisit the verses and lessons that have shaped me and feel the cumulative weight of my engagement over time.

## Background & Context

**Current state:**

- Users complete a morning ayah-mission commitment and an evening reflection each day. After the day's 3:00am reflection window closes, that completed day's content (ayah, translation, audio, tafsir, mission, and reflection) is locked in and is not currently reachable from anywhere in the app.
- The grove home screen shows each completed day as a tree in a growing grove, but tapping a tree only reveals a small summary of that day, not the full record, and there is no way to gather multiple past days together.
- Users who want to look back at "the ayah about patience from two weeks ago" have no way to find it.

**Problem:**

- The emotional and spiritual value of the product compounds over time — the longer a user engages, the more meaningful their reflection history becomes — but without a way to browse and search that history, the value stays invisible to the user.
- A user who, for example, is currently going through a hard week and remembers writing something meaningful about patience last month has no way to retrieve it.
- Without a favouriting mechanism, every past reflection looks equally weighted in the grove, and the user cannot separate the "quiet ordinary day" reflections from the "this one changed something for me" reflections.

## Target User & Persona

- **Who:** A practicing Muslim who has been using the app for at least a few days and has accumulated reflections worth looking back on, or a demo-mode judge who wants to see what a populated journal feels like.
- **Context:** Encountered in quiet moments — a user who wants to re-read what they wrote, a user searching for a specific theme that came up before, or a user who has just finished today's reflection and wants to revisit the one from ten days ago that they starred.
- **Current workaround:** None. Past reflections are effectively lost to the user once the day closes, unless they manually kept a separate note outside the app.

## Goals

- Give the user a complete, chronological, searchable record of their reflections so the cumulative meaning of their engagement becomes visible to them.
- Let the user mark specific ayah-reflection pairs as favourites and retrieve them in one tap.
- Reinforce the product's core message — _"I have changed a little because of this"_ — by making the user's own words from previous days easy to re-encounter.
- Demonstrate integration with the Quran Foundation Bookmarks API in a way that is load-bearing to the user experience, not decorative.

## Non-Goals

- Editing, rewriting, or deleting past reflections. Once a day closes at 3:00am, its reflection is a read-only historical record.
- Sharing, exporting, printing, or emailing reflections. All journal content is private to the user's account.
- Categorisation, tagging, folders, or user-defined collections beyond the single flat favourites list.
- Social features of any kind — no comments, likes, or public views.
- Backfilling or retroactively creating entries for missed days. Missed days remain visible gaps in the journal.

## User Workflow

1. **Entry point** — From the grove home screen, the user taps a small journal icon (or an equivalent menu entry) to open their reflection journal.
2. **Browse** — The user sees a reverse-chronological list of their past completed reflections. Each row shows the date, the Surah and verse reference, and a short preview of what they wrote (truncated with an ellipsis after roughly two lines).
3. **Open an entry** — The user taps a row and is taken into the full day view for that date: the ayah in Arabic with the translation they had selected, a replayable audio recitation, the condensed tafsir, the mission they committed to that morning, and the full reflection they wrote in the evening.
4. **Bookmark** — From inside the day view, the user taps a bookmark star. The star fills in, confirming the bookmark has been saved, and that entry will now also appear in a "favourites" section at the top of the journal list.
5. **Un-bookmark** — The user taps a filled star and the star empties. The entry is removed from the favourites section at the top but remains in the main chronological list.
6. **Filter** — Back on the journal list, the user toggles a "show bookmarked only" filter. The list condenses to show only their starred entries. Toggling the filter off restores the full list.
7. **Search** — The user types a keyword such as _"patience"_ into a search field. The list filters to only those entries whose reflection text contains that keyword. Clearing the search restores the full list.
8. **Empty states** — A brand-new user with no completed reflections sees a gentle placeholder inviting them to start with today's ayah. A user whose search matches nothing sees a calm "no reflections match" message.

## Acceptance Criteria

### Scenario: Opening the journal shows reverse-chronological past reflections

```gherkin
Given I am a signed-in user who has completed the following reflections
  | Date        | Surah reference | Reflection excerpt                                               |
  | 2026-05-01  | Al-Baqarah 2:153 | "I held my tongue with my mother-in-law today even when..."    |
  | 2026-04-30  | Al-Hujurat 49:12 | "I caught myself about to repeat gossip about a colleague..."   |
  | 2026-04-29  | Ar-Rahman 55:13  | "I wrote down three things I am grateful for before bed..."    |
When I open my reflection journal
Then I see a list of my past reflections ordered from most recent to oldest
  And the first entry shows the date "2026-05-01", the reference "Al-Baqarah 2:153", and a preview beginning "I held my tongue with my mother-in-law today even when"
  And the second entry shows the date "2026-04-30", the reference "Al-Hujurat 49:12", and a preview beginning "I caught myself about to repeat gossip about a colleague"
  And the third entry shows the date "2026-04-29", the reference "Ar-Rahman 55:13", and a preview beginning "I wrote down three things I am grateful for before bed"
  And each preview is truncated with an ellipsis when the full reflection does not fit in two lines
```

### Scenario: Opening a past journal entry shows the full day

```gherkin
Given I have a completed reflection from 2026-04-22 on Surah Al-Asr verses 1 to 3
  And my committed mission that morning was "Message one person I've been meaning to thank"
  And my full reflection reads "I sent a voice note to my old teacher in Lahore thanking him for teaching me how to read Quran when I was ten. He replied within the hour. I cried."
When I tap that entry in my journal
Then I see Surah Al-Asr verses 1 to 3 displayed in Arabic alongside the translation I had selected on that day
  And I can play the audio recitation of those verses
  And I see the condensed tafsir I saw on that day
  And I see the mission "Message one person I've been meaning to thank"
  And I see the full reflection text exactly as I wrote it
  And the reflection text is shown as a read-only record with no editing controls
```

### Scenario: Bookmarking a journal entry adds it to favourites

```gherkin
Given I am viewing my journal entry for 2026-04-15 on Surah Ibrahim verse 7
  And the bookmark star on this entry is currently empty
When I tap the bookmark star
Then the star fills in to show the entry is now bookmarked
  And I see a brief confirmation that the entry has been saved to my favourites
  And when I return to the journal list, a "favourites" section appears at the top containing this entry
```

### Scenario: Un-bookmarking an entry removes it from favourites but keeps it in the journal

```gherkin
Given my journal entry for 2026-04-15 on Surah Ibrahim verse 7 is currently bookmarked
  And the entry appears in both the favourites section and the main chronological list
When I open that entry and tap the filled bookmark star
Then the star empties
  And when I return to the journal list, the entry no longer appears in the favourites section
  And the entry still appears in the main chronological list in its correct date position
```

### Scenario: Favourites-only filter narrows the list

```gherkin
Given I have 20 completed reflections in my journal
  And I have bookmarked 3 of them, on Al-Baqarah 2:286, An-Nahl 16:97, and Al-Insan 76:7
When I toggle the "show bookmarked only" filter on
Then I see only the 3 bookmarked entries in the list
  And the other 17 entries are hidden from view
When I toggle the filter off
Then all 20 entries reappear in reverse-chronological order
```

### Scenario: Keyword search finds matching reflections

```gherkin
Given my journal contains the following reflections
  | Date        | Reflection snippet                                                          |
  | 2026-04-28  | "Struggled with patience at work today but kept my words kind"            |
  | 2026-04-20  | "Felt impatient with the children but took a breath before responding"    |
  | 2026-04-12  | "A quiet day of gratitude, nothing felt out of place"                     |
  | 2026-04-05  | "Forgave my brother after two months of silence"                          |
When I search for the keyword "patience"
Then I see the entry from 2026-04-28 in the results
  And I do not see the entry from 2026-04-20 because it uses the word "impatient" only
  And I do not see the entry from 2026-04-12
  And I do not see the entry from 2026-04-05
```

### Scenario: Search matches are case-insensitive and match partial words where they appear literally

```gherkin
Given my journal contains a reflection that reads "Gratitude shifted how I prayed tonight"
When I search for "gratitude"
Then the reflection is shown in the results regardless of the casing I typed
```

### Scenario: Empty journal for a brand-new user

```gherkin
Given I am a signed-in user who has never completed an evening reflection
When I open my reflection journal
Then I see a gentle placeholder message inviting me to start with today's ayah
  And I do not see an error or a blank screen
```

### Scenario: Search that matches nothing

```gherkin
Given my journal contains 12 completed reflections
  And none of them contain the word "elephant"
When I search for "elephant"
Then I see a calm "no reflections match" message
  And I do not see an error
  And I can clear the search to return to the full journal
```

### Scenario: Past reflections are read-only once the day has closed

```gherkin
Given I have a journal entry from 10 days ago
  And the 3:00am reflection window for that day has long closed
When I open that entry
Then I can read the full reflection text I wrote
  And I cannot edit, rewrite, or delete the reflection
  And no editing controls are shown on the entry
```

### Scenario: Today's reflection appears in the journal once submitted

```gherkin
Given today is 2026-05-02
  And I completed my evening reflection for today on Surah Al-Fatihah verses 1 to 7 before opening the journal
When I open my reflection journal
Then the entry for 2026-05-02 on Al-Fatihah 1:1-7 appears at the top of the list
  And the preview shows the opening of the reflection I just wrote
```

### Scenario: Today's reflection does not yet appear if I have not completed it

```gherkin
Given today is 2026-05-02
  And I have committed to today's morning mission but have not yet completed today's evening reflection
When I open my reflection journal
Then no entry for 2026-05-02 appears in the list
  And my most recent entry is from 2026-05-01 or earlier
```

### Scenario: Demo mode journal is pre-populated

```gherkin
Given I am signed in to the demo account used for hackathon judging
  And the demo account ships with 7 seed reflections covering character, patience, gratitude, family, dhikr, trust in Allah, and worship
When I open the reflection journal from the demo grove
Then I see all 7 seed entries in reverse-chronological order
  And each entry shows a realistic date, a Surah-and-verse reference, and a seed reflection preview
  And I can open any seed entry and see a complete day view including ayah, translation, audio, tafsir, mission, and reflection
```

### Scenario: Missed days leave visible gaps in the journal

```gherkin
Given I completed reflections on 2026-04-27, 2026-04-28, 2026-04-30, and 2026-05-01
  And I did not open the app at all on 2026-04-29
When I open my reflection journal
Then the list contains entries for 2026-05-01, 2026-04-30, 2026-04-28, and 2026-04-27 in that order
  And no entry for 2026-04-29 is shown
  And no placeholder or error appears in place of the missed day
```

### Scenario: "Not today" honest reflections also appear in the journal

```gherkin
Given on 2026-04-25 I completed the evening reflection by selecting "Not today" and writing "Life got loud today and I never slowed down to think about the ayah — I want to try again tomorrow"
When I open my reflection journal
Then the entry for 2026-04-25 appears in the list alongside all other completed reflections
  And the preview shows the opening of what I wrote that evening
  And the entry is not visually shamed or excluded
```

### Scenario: Bookmarking is also available from the grove tree-tap day view

```gherkin
Given I am on the grove home screen
  And I tap a tree representing my completed reflection from 2026-04-18 on Surah Luqman verse 19
When the day view for that entry opens
Then I see a bookmark star on the day view
  And tapping it fills the star and adds the entry to my favourites
  And returning to the journal shows the entry in the favourites section at the top
```

### Scenario: Bookmarks persist across sessions and devices

```gherkin
Given I bookmarked my journal entry for 2026-04-10 on Surah An-Nas verses 1 to 6 on my phone yesterday
When I sign in on a different device and open my journal today
Then the entry for 2026-04-10 still shows a filled bookmark star
  And it still appears in the favourites section at the top of the list
```

### Scenario: Journal is private to my account

```gherkin
Given I have completed 30 reflections and bookmarked 4 of them
When another user signs in to their own account on any device
Then they see only their own journal
  And they cannot see, search, or retrieve any of my reflections or bookmarks under any circumstances
```

## Business Rules & Constraints

- **Every completed reflection is journaled.** This includes reflections submitted under all three honesty options (_Yes, fully / Partly / Not today_). Reflections shorter than the 40-character minimum are never created in the first place (per the evening-reflection story) and therefore never appear in the journal.
- **Chronological ordering.** The main journal list is strictly reverse-chronological by the local calendar date of the reflection. The favourites section at the top is also reverse-chronological among bookmarked entries.
- **Previews are truncated to roughly two lines** with an ellipsis. The full text is always available on the entry's day view.
- **Read-only after close.** A journal entry's reflection text is immutable once the 3:00am window for that day has closed. The journal displays past reflections but never offers editing.
- **Bookmarks are user-managed and reversible.** A user can bookmark or un-bookmark any completed entry at any time with no limit on the number of bookmarks.
- **Bookmarks persist across devices and sessions** via the Quran Foundation Bookmarks API, so that bookmarking on one device is visible on another under the same account.
- **Search is keyword-based against the reflection text only.** It is case-insensitive. It does not (in submission scope) search ayah references, translations, or tafsir text.
- **Privacy is absolute.** Journal content and bookmarks never leave the user's account. No sharing, exporting, public links, or cross-user visibility exists in submission scope.
- **Missed days are silently absent.** No placeholder row, no "you missed this day" message, and no way to add a reflection after the fact.
- **Demo mode ships with 7 seed entries** spanning a full thematic week so a judge opening the journal for the first time sees a realistic populated experience.

## Success Metrics

- Percentage of weekly-active users who open the journal at least once per week. Target: ≥30% by week two of usage.
- Percentage of users who have bookmarked at least one entry after 14 days of usage. Target: ≥25%.
- Search usage — any non-empty search query submitted — as a leading indicator that users are actively returning to revisit prior reflections rather than only consuming the daily loop.
- Zero reports of reflection content visible across accounts (privacy integrity check).

## Dependencies

- **Evening reflection & tree growth story** — produces the reflections that are journaled. The journal reads from whichever storage surface that story finalises for reflections; this story does not decide or change that surface.
- **Morning ayah & mission commit story** — produces the ayah reference, translation selection at the time, tafsir extract, and committed mission that are all displayed in a past day view.
- **Grove home screen story** — provides the entry point (journal icon) and also the secondary path into the day view via tapping a tree, from which bookmarking is also available.
- **Ayah corpus curation & demo-mode seed data story** — provides the 7-day demo journal seed so judges see a populated journal.
- **Quran Foundation Bookmarks API** — source of truth for whether an entry is bookmarked, and the mechanism by which bookmarks persist across devices.

## Open Questions

- [x] ~~Does the journal need tags, categories, or folders?~~ — **Resolved:** No. Keyword search plus a single flat bookmarks list is sufficient for submission scope.
- [x] ~~Can users edit past reflections?~~ — **Resolved:** No. Reflections are read-only after the 3:00am window closes, consistent with the evening-reflection story.
- [x] ~~Can users delete past reflections or bookmarks?~~ — **Resolved:** Bookmarks are user-reversible at any time via the star toggle. Reflections themselves are not deletable in submission scope, since the journal is intended as an honest record and the grove visibly reflects prior activity.
- [x] ~~Can users share or export journal content?~~ — **Resolved:** No. Privacy is absolute in submission scope; sharing and export are deferred.
- [x] ~~Does search cover ayah, translation, and tafsir text too?~~ — **Resolved:** No. Submission-scope search covers the user's own reflection text only. Extending search to ayah metadata is deferred.
- [x] ~~Should "Not today" honest reflections be visually distinguished in the journal?~~ — **Resolved:** They appear exactly like any other completed reflection. The honesty-first product principle treats them as equal-weight completed check-ins; visually shaming them would violate that principle.
- [ ] Exact reflection storage surface (Quran Foundation Activity/Goals API vs. lightweight own storage) the journal reads from — **Deferred (non-blocking):** Inherited from the evening-reflection story's technical refinement. Does not change any user-visible behavior in this story.

---

## Functional Requirements

- **Read-only past reflections.** The journal only surfaces reflections that have already been committed and whose 3:00am local close-window has already passed. Read-only enforcement is already provided by the evening-reflection story (rows in `reflections` become immutable after `window_closes_at`); this story adds no new write paths on reflection text, and the UI exposes no edit affordance on the day view.
- **Dual-write bookmarks.** When a user toggles a bookmark star, the server-side proxy calls the Quran Foundation Bookmarks API (`POST /bookmarks` with body `{ verse_key: "96:1" }`) AND inserts a row into a local `bookmarks_mirror` table. The mirror exists to (a) keep the journal list query fast by avoiding a network round-trip to QF on every page load, and (b) make the "bookmarked only" filter a single local join rather than an N+1 external lookup.
- **Partial-failure policy.** If the QF `POST /bookmarks` call fails (network, 5xx, or timeout), the mirror row is STILL inserted with `qf_bookmark_id = NULL` and the failure is logged to `qf_api_errors`. The user sees a filled star. A background reconciler (out of scope for this story; tracked under notifications/scheduling cron) will later retry the QF call. This ensures the user-facing action is never lost even if QF is transiently unavailable.
- **Full-text search is local-only.** Keyword search runs against `reflections.text` in the local Postgres via `to_tsvector('english', text) @@ plainto_tsquery('english', :q)`. It does NOT call any QF search endpoint. It does NOT search ayah references, translations, or tafsir text (explicitly excluded by the story).
- **Pagination.** The journal list is paginated at 25 rows per page to keep payloads small. The UI's virtualized list further guards against jank when users scroll long histories.
- **Atomicity.** Bookmark create: QF call first (if it succeeds, capture `qf_bookmark_id`), then INSERT mirror row inside the same HTTP handler. Bookmark delete: QF DELETE first, then DELETE mirror row. Mirror write failures after a successful QF write are retried once before returning 500.
- **Idempotency.** Repeated `POST /api/bookmarks` for the same `(user_id, verse_key)` must not produce duplicate mirror rows (enforced by the UNIQUE constraint) and must not produce duplicate QF bookmarks (if the mirror already holds a non-null `qf_bookmark_id`, the handler short-circuits and returns 200 with the existing id).

## Permissions & Security

- **Scope:** Authenticated user only. Every route in this story calls `requireSession()` from `lib/session.ts` and returns `401 UNAUTHENTICATED` if no valid `qf_sessions` cookie is present.
- **Authorization:** The session-resolved `user_id` is the ONLY identity used in every query. No route accepts a `user_id` parameter from the client.
- **Row-level security:** Supabase RLS policies on `reflections`, `missions`, `daily_assignments`, and the new `bookmarks_mirror` restrict SELECT/UPDATE/DELETE to rows where `user_id = auth.uid()` (the session-resolved internal user id). Search queries MUST go through the RLS-enforced Postgres role — direct service-role access from the search builder is forbidden.
- **Search isolation:** The full-text search builder parameterises `:q` via prepared statements and wraps the tsquery filter with `AND user_id = :session_user_id`. There is no code path that can execute a search across more than one user's reflections.
- **Input validation:** `verse_key` must match `^\d{1,3}:\d{1,3}$`. `q` is clipped to 200 characters. `page` ≥ 1 and `page_size` ∈ {25} (fixed; ignore client overrides). `reflection_id` must be a UUID.
- **No tokens in mirror.** The `bookmarks_mirror` table stores `qf_bookmark_id` (an opaque id returned by QF) but NEVER stores access or refresh tokens. Token storage remains solely in `qf_sessions`, encrypted at rest.

## API Design

All routes are server-side Next.js Route Handlers under `app/api/`. Each resolves the session and attaches `x-auth-token` + `x-client-id` headers when calling QF.

### `GET /api/journal`

**Query parameters:**

| Name        | Type                  | Required | Default | Description                                         |
| ----------- | --------------------- | -------- | ------- | --------------------------------------------------- |
| `page`      | int ≥ 1               | no       | 1       | Page number (1-indexed)                             |
| `page_size` | int (fixed at 25)     | no       | 25      | Ignored if other value passed                       |
| `filter`    | `all` \| `bookmarked` | no       | `all`   | Bookmarked-only requires join on `bookmarks_mirror` |
| `q`         | string (≤ 200 chars)  | no       | —       | Full-text search against `reflections.text`         |

**Response (200):**

```json
{
  "page": 1,
  "page_size": 25,
  "total": 42,
  "entries": [
    {
      "reflection_id": "b7f3e2a0-4c8e-4d2a-9f1a-2e3b4c5d6e7f",
      "verse_key": "96:1",
      "local_date": "2026-05-01",
      "preview": "I held my tongue with my mother-in-law today even when she...",
      "is_bookmarked": true
    },
    {
      "reflection_id": "c8a4f3b1-5d9f-4e3b-a012-3f4c5d6e7f80",
      "verse_key": "2:286",
      "local_date": "2026-04-28",
      "preview": "Struggled with patience at work today but kept my words kind...",
      "is_bookmarked": false
    },
    {
      "reflection_id": "d9b5a4c2-6eaf-4f4c-b123-405d6e7f8091",
      "verse_key": "49:11",
      "local_date": "2026-04-30",
      "preview": "I caught myself about to repeat gossip about a colleague...",
      "is_bookmarked": true
    }
  ]
}
```

The underlying query joins `reflections` → `missions` → `daily_assignments` (for `local_date` and `verse_key`) → `corpus_entries` (for metadata) → LEFT JOIN `bookmarks_mirror` on `(user_id, verse_key)` to populate `is_bookmarked`. `preview` is `left(text, 180)` computed in SQL.

**Errors:**

| Status | Code              | Condition                                       |
| ------ | ----------------- | ----------------------------------------------- |
| 400    | `INVALID_QUERY`   | `q` > 200 chars, malformed `filter`, bad `page` |
| 401    | `UNAUTHENTICATED` | No valid session cookie                         |

### `GET /api/journal/:reflection_id`

**Response (200):**

```json
{
  "reflection_id": "b7f3e2a0-4c8e-4d2a-9f1a-2e3b4c5d6e7f",
  "verse_key": "96:1",
  "local_date": "2026-05-01",
  "did_apply": "yes_fully",
  "text": "I held my tongue with my mother-in-law today even when she raised her voice. Read 96:1 again before bed and realised being 'read in the name of your Lord' means starting every conversation with mindfulness.",
  "mission": {
    "selected_prompt": "Respond with one gentle word when someone raises their voice at you today",
    "is_custom": false
  },
  "ayah": {
    "arabic": "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ",
    "translation": "Read in the name of your Lord who created —",
    "tafsir_extract": "The first command revealed: read, reflect, and acknowledge the Creator in every act of knowledge.",
    "audio_url": "https://.../096001.mp3"
  },
  "is_bookmarked": true,
  "window_closed_at": "2026-05-02T03:00:00-04:00"
}
```

`ayah.arabic`, `ayah.translation`, and `ayah.audio_url` are fetched live from QF Content APIs via `lib/qf/content.ts` (with Next.js 24-hour revalidation).

**Errors:**

| Status | Code              | Condition                                                                                      |
| ------ | ----------------- | ---------------------------------------------------------------------------------------------- |
| 401    | `UNAUTHENTICATED` | No valid session cookie                                                                        |
| 404    | `NOT_FOUND`       | Reflection does not exist OR is owned by another user (RLS returns empty; handler returns 404) |

### `POST /api/bookmarks`

**Request:**

```json
{
  "verse_key": "2:286",
  "reflection_id": "c8a4f3b1-5d9f-4e3b-a012-3f4c5d6e7f80"
}
```

`reflection_id` is optional (user may bookmark from the grove tree-tap day view where the reflection-id-to-verse link is already known; also accepts bookmarking an ayah from contexts that do not carry a reflection id).

**Response (201):**

```json
{
  "verse_key": "2:286",
  "qf_bookmark_id": "qf-bm-7f3a2b1c",
  "created_at": "2026-05-02T14:22:10Z"
}
```

Behaviour:

1. Validate input, resolve session.
2. Call QF `POST /bookmarks` with `{ verse_key }`.
3. On QF success: INSERT into `bookmarks_mirror` with `qf_bookmark_id` populated.
4. On QF failure: log to `qf_api_errors`, still INSERT mirror row with `qf_bookmark_id = NULL`, return 201 (user-facing success).
5. If mirror INSERT violates UNIQUE: return existing row (idempotent 200).

**Errors:**

| Status | Code              | Condition                                |
| ------ | ----------------- | ---------------------------------------- |
| 400    | `INVALID_INPUT`   | Malformed `verse_key` or `reflection_id` |
| 401    | `UNAUTHENTICATED` | No session                               |
| 500    | `MIRROR_WRITE`    | Mirror INSERT failed after QF succeeded  |

### `DELETE /api/bookmarks/:verse_key`

**Response (204):** empty body.

Behaviour:

1. Resolve session; look up the mirror row for `(user_id, verse_key)`.
2. If `qf_bookmark_id IS NOT NULL`, call QF `DELETE /bookmarks/{qf_bookmark_id}`. Ignore 404 from QF (already gone).
3. DELETE the mirror row.
4. Return 204 even if the mirror row was already absent (idempotent).

**Errors:**

| Status | Code              | Condition             |
| ------ | ----------------- | --------------------- |
| 400    | `INVALID_INPUT`   | Malformed `verse_key` |
| 401    | `UNAUTHENTICATED` | No session            |

### `GET /api/bookmarks`

**Response (200):**

```json
{
  "bookmarks": [
    {
      "verse_key": "96:1",
      "qf_bookmark_id": "qf-bm-aaa1",
      "created_at": "2026-05-01T21:10:00Z"
    },
    {
      "verse_key": "49:11",
      "qf_bookmark_id": "qf-bm-bbb2",
      "created_at": "2026-04-30T21:45:00Z"
    }
  ],
  "source": "qf"
}
```

Behaviour:

1. Call QF `GET /bookmarks` (source of truth).
2. On success: return QF's list with `source: "qf"`.
3. On failure: return `bookmarks_mirror` contents for `user_id` with `source: "mirror"` and log the QF failure. The client treats both identically.

**Errors:**

| Status | Code              | Condition                                             |
| ------ | ----------------- | ----------------------------------------------------- |
| 401    | `UNAUTHENTICATED` | No session                                            |
| 500    | `UPSTREAM`        | QF failed AND mirror read failed (only if DB is down) |

## Data Model & Migrations

### New table: `bookmarks_mirror`

```sql
CREATE TABLE bookmarks_mirror (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verse_key text NOT NULL,
  qf_bookmark_id text,  -- nullable if QF call failed; backfilled by reconciler
  reflection_id uuid REFERENCES reflections(id) ON DELETE SET NULL,  -- optional link
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, verse_key)
);

CREATE INDEX bookmarks_mirror_user_idx ON bookmarks_mirror(user_id);

ALTER TABLE bookmarks_mirror ENABLE ROW LEVEL SECURITY;

CREATE POLICY bookmarks_mirror_owner_select ON bookmarks_mirror
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY bookmarks_mirror_owner_insert ON bookmarks_mirror
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY bookmarks_mirror_owner_delete ON bookmarks_mirror
  FOR DELETE USING (user_id = auth.uid());
```

### GIN index on `reflections.text`

```sql
CREATE INDEX reflections_text_gin ON reflections
  USING gin (to_tsvector('english', text));
```

This powers the `plainto_tsquery('english', :q) @@ to_tsvector('english', text)` predicate used by the search builder.

### Migration Notes

- Migration file: `supabase/migrations/0006_bookmarks_mirror.sql`. Must run AFTER the evening-reflection story's migration that creates `reflections` (Task 1 dependency).
- Zero downtime; both changes are additive.
- No backfill needed — `bookmarks_mirror` starts empty and fills as users bookmark, and a one-time reconciliation script can optionally pull existing QF bookmarks on demand (out of scope for this story).

## UI/Frontend Requirements

### Route

`app/(app)/journal/page.tsx` — server component that resolves session and renders the client-side `JournalClient`.

### Components

**`JournalClient`** — `app/(app)/journal/journal-client.tsx`

- **Type:** New (client component)
- **Purpose:** Orchestrates search/filter state, data fetching, and detail sheet.
- State: `query`, `filter` (`all` | `bookmarked`), `selectedReflectionId | null`.
- Debounces `query` at 300ms before dispatching `GET /api/journal?q=…`.
- Uses `@tanstack/react-query` for list + detail fetches (matching evening-reflection story conventions).

**`JournalHeader`** — `app/(app)/journal/_components/journal-header.tsx`

- **Type:** New
- Contains:
  - `SearchInput` — shadcn `<Input />` with a leading magnifier icon, placeholder `"Search your reflections..."`. Clears on `Escape`.
  - `FilterToggle` — shadcn `<ToggleGroup />` with items `"All"` and `"Bookmarked"`.
- Props:
  ```typescript
  interface JournalHeaderProps {
    query: string;
    filter: "all" | "bookmarked";
    onQueryChange: (q: string) => void;
    onFilterChange: (f: "all" | "bookmarked") => void;
  }
  ```

**`JournalList`** — `app/(app)/journal/_components/journal-list.tsx`

- **Type:** New
- Renders a list of `JournalEntryCard` components from `GET /api/journal` response.
- Virtualized via `@tanstack/react-virtual` (new dependency) when `entries.length > 50`. Below 50, renders a plain scrollable list.
- Handles loading skeletons, error state, and "next page" infinite scroll (fires `page + 1` fetch when the last row enters viewport).

**`JournalEntryCard`** — `app/(app)/journal/_components/journal-entry-card.tsx`

- **Type:** New
- Displays: formatted `local_date` (e.g., "Fri, May 1"), `verse_key` formatted as "Al-\`Alaq 96:1" (lookup via `lib/qf/content.ts` chapter list, cached), 2-line clamped `preview`, and a `BookmarkStar` on the right.
- Click anywhere on the card (except the star) opens the `DayDetail` sheet.
- Props:
  ```typescript
  interface JournalEntryCardProps {
    reflectionId: string;
    verseKey: string;
    localDate: string; // ISO date
    preview: string;
    isBookmarked: boolean;
    onOpen: (reflectionId: string) => void;
    onToggleBookmark: (verseKey: string, reflectionId: string) => void;
  }
  ```

**`DayDetail`** — `app/(app)/journal/_components/day-detail.tsx`

- **Type:** New
- Rendered inside a shadcn `<Sheet />` anchored to the right on desktop and bottom on mobile.
- Fetches `GET /api/journal/:reflection_id` on open.
- Sections (top to bottom): ayah (Arabic via `<span translate="no" lang="ar">`), translation, audio `<audio controls>`, tafsir extract (with "read full tafsir" expandable that calls `/api/content/tafsir/{key}`), mission, reflection text (read-only, no editing affordance), `BookmarkStar` in the sheet header.

**`BookmarkStar`** — `app/(app)/journal/_components/bookmark-star.tsx`

- **Type:** New
- Toggle-style button. On click: optimistic local state flip → dispatch `POST`/`DELETE` → reconcile on success/failure (revert on failure and show a toast).
- Accessibility: `aria-pressed`, `aria-label` = `"Bookmark this reflection"` / `"Remove bookmark"`.

### User Interactions

- Type in search field → debounced refetch of journal list with `q` param; empty results show "No reflections match" state.
- Toggle `Bookmarked` filter → immediate refetch with `filter=bookmarked`.
- Tap entry card → opens `DayDetail` sheet.
- Tap bookmark star (list or sheet) → optimistic fill/unfill + API write.
- Escape or click-outside on sheet → close sheet.

### States

- **Loading (initial):** 5 shimmer skeleton cards.
- **Loading (pagination):** inline 1-row skeleton at bottom.
- **Empty (new user, no reflections ever):** centered placeholder with copy "Your journal will fill with your reflections as you check in each day. Start with today's ayah."
- **No-search-results:** centered copy "No reflections match." with a "Clear search" link.
- **Error:** toast + inline "Couldn't load your journal. Retry." button.

## Architecture Notes

- **Source of truth for bookmarks is QF; mirror is for speed + resilience.** We read from QF on the dedicated `GET /api/bookmarks` route (with mirror fallback on network failure) and read from the mirror when we need to JOIN against reflections for the journal list (speed-critical path). Writes dual-write to both.
- **Full-text search is local-only.** There is no QF endpoint for searching private user-authored reflection text; this is a purely local feature.
- **New dependencies:** `@tanstack/react-virtual` (virtualized list), uses existing `@tanstack/react-query`, `shadcn/ui` Sheet / ToggleGroup / Input components. If `@tanstack/react-query` is not yet in the project (check CLAUDE.md / package.json), add it as part of Task 4.
- **Dependencies & integration:**
  - Reads `reflections`, `missions`, `daily_assignments`, `corpus_entries` tables owned by morning-loop and evening-reflection stories — no schema changes to those.
  - Extends `lib/qf/user.ts` with bookmark helpers (create/delete/list). If evening-reflection introduced them, reuse; otherwise add in Task 2.
  - Shares session + RLS plumbing with all other stories via `lib/session.ts`.

## Exemplar Files

- **shadcn Sheet:** `https://ui.shadcn.com/docs/components/sheet` — use the right-side variant on `md:` breakpoints, bottom on mobile.
- **shadcn ToggleGroup:** `https://ui.shadcn.com/docs/components/toggle-group` — single-select variant for the All/Bookmarked filter.
- **Postgres full-text search:** `https://www.postgresql.org/docs/current/textsearch-controls.html` — use `plainto_tsquery` (not `to_tsquery`) because user input is natural-language free text, not a tsquery expression. `plainto_tsquery` handles tokenisation and ignores operators safely.
- **Repo exemplars:**
  - `lib/qf/client.ts` — fetch wrapper pattern (attach `x-auth-token` + `x-client-id`, log errors to `qf_api_errors`).
  - `lib/db/reflections.ts` (created by evening-reflection story) — query builder pattern using the RLS-enforced Postgres role.
  - `app/api/qf/notes/route.ts` — QF proxy pattern; bookmarks proxy follows the same shape.

## Implementation Plan

### Sub-tasks

**Task 1: Migration `0006_bookmarks_mirror.sql`** — _small_ (<100 LOC)

- Files: `supabase/migrations/0006_bookmarks_mirror.sql`
- Contents: create `bookmarks_mirror` table + indexes + RLS policies; create GIN index on `reflections.text`.
- **SEQUENTIAL — depends on the evening-reflection story's Task 1** (which creates `reflections`). Cannot run before `reflections` exists.

**Task 2: `lib/qf/user.ts` bookmark helpers** — _small_ (<100 LOC)

- Files: `lib/qf/user.ts`
- Add (if not already covered by morning-loop or evening-reflection stories): `createBookmark(verse_key)`, `deleteBookmark(bookmark_id)`, `listBookmarks()`. All go through the shared `lib/qf/client.ts` fetch wrapper.
- **INDEPENDENT** in principle (no DB dependency), though in practice authored after `lib/qf/user.ts` exists from earlier stories. Can be developed in parallel with Task 1.

**Task 3: API routes** — _medium_ (100–300 LOC)

- Files:
  - `app/api/journal/route.ts` (GET list with pagination + filter + search)
  - `app/api/journal/[id]/route.ts` (GET day detail)
  - `app/api/bookmarks/route.ts` (GET list, POST create)
  - `app/api/bookmarks/[verse_key]/route.ts` (DELETE)
  - `lib/db/journal.ts` (query builders for list + detail + search, with `plainto_tsquery`)
  - `lib/db/bookmarks_mirror.ts` (mirror CRUD helpers)
- **SEQUENTIAL — depends on Tasks 1 and 2.**

**Task 4: Journal page + components** — _medium_ (100–300 LOC)

- Files:
  - `app/(app)/journal/page.tsx` (server component shell)
  - `app/(app)/journal/journal-client.tsx`
  - `app/(app)/journal/_components/journal-header.tsx`
  - `app/(app)/journal/_components/journal-list.tsx`
  - `app/(app)/journal/_components/journal-entry-card.tsx`
  - `app/(app)/journal/_components/day-detail.tsx`
  - `app/(app)/journal/_components/bookmark-star.tsx`
- Adds `@tanstack/react-virtual` to `package.json`.
- **SEQUENTIAL — depends on Task 3.**

**Task 5: Full-text search wiring** — _small_ (<100 LOC)

- Files: `lib/db/journal.ts` (extend search builder), `app/(app)/journal/_components/journal-header.tsx` (debounce hook)
- Uses `plainto_tsquery('english', :q)` with prepared parameter binding. Clips input to 200 chars client-side AND server-side.
- **SEQUENTIAL — depends on Task 4.**

### Negative Constraints

- Do NOT expose any other user's reflections or bookmarks under any circumstance. All queries must include `user_id = :session_user_id` AND rely on RLS as a second defence.
- Do NOT store QF access or refresh tokens in `bookmarks_mirror`. Tokens live only in `qf_sessions`.
- Do NOT edit `reflections.text` or add editing affordance on `DayDetail`. Read-only is a product-level invariant.
- Do NOT call QF inside the hot journal-list path. Use the mirror for `is_bookmarked`.
- Do NOT refactor `lib/qf/client.ts`, `lib/session.ts`, `reflections`/`missions`/`daily_assignments` schemas, or evening-reflection API routes.
- Do NOT use `to_tsquery` (raw-operator form) — user input is natural-language; `plainto_tsquery` is the safe form.
- Do NOT add a global search across ayah/translation/tafsir text — out of scope by the story's business rules.

## Test Scenarios

**Test 1: List with 10 entries, reverse-chronological**

- Setup: user `ahmad` has 10 reflections across dates 2026-04-23 → 2026-05-02, one per day, on varying `verse_key`s including 96:1, 2:286, 49:11.
- Action: `GET /api/journal?page=1&page_size=25` with Ahmad's session cookie.
- Expected: 200. `total = 10`. `entries[0].local_date = "2026-05-02"`, `entries[9].local_date = "2026-04-23"`. Each entry has `preview` (≤ 180 chars) and `is_bookmarked: false` for non-bookmarked rows.

**Test 2: Bookmark a day — QF POST succeeds, mirror inserts**

- Setup: Ahmad has a reflection on 2026-05-01 for `verse_key = "96:1"`. No mirror row exists. QF `POST /bookmarks` is mocked to return `{ id: "qf-bm-aaa1" }`.
- Action: `POST /api/bookmarks` with `{ verse_key: "96:1", reflection_id: "<id>" }`.
- Expected: 201 with `{ verse_key: "96:1", qf_bookmark_id: "qf-bm-aaa1", created_at: ... }`. `bookmarks_mirror` has exactly one row for `(ahmad.id, "96:1")` with `qf_bookmark_id = "qf-bm-aaa1"`. No errors logged.

**Test 3: Bookmark when QF POST fails — mirror still inserts, error logged**

- Setup: Same as Test 2 but QF `POST /bookmarks` is mocked to return 503.
- Action: `POST /api/bookmarks` with `{ verse_key: "96:1" }`.
- Expected: 201 (user-facing success). `bookmarks_mirror` has one row with `qf_bookmark_id = NULL`. One row appended to `qf_api_errors` with status `503` and the endpoint path.

**Test 4: Un-bookmark**

- Setup: Ahmad has a mirror row for `(ahmad.id, "49:11", qf_bookmark_id = "qf-bm-bbb2")`. QF `DELETE /bookmarks/qf-bm-bbb2` is mocked 204.
- Action: `DELETE /api/bookmarks/49:11`.
- Expected: 204. Mirror row is gone. Idempotent repeat: `DELETE /api/bookmarks/49:11` again returns 204 with no error.

**Test 5: Keyword search "patience" hits 3 entries**

- Setup: Ahmad has reflections:
  - 2026-04-28 on 2:286, text contains "Struggled with patience at work today..."
  - 2026-04-20 on 16:97, text contains "Felt impatient with the children..." (no word "patience")
  - 2026-04-15 on 39:10, text contains "...praying with patience renewed me..."
  - 2026-04-10 on 103:3, text contains "My patience with my father was tested today..."
  - 7 other reflections with no "patience" match.
- Action: `GET /api/journal?q=patience`.
- Expected: 200. `total = 3`. Returned entries are 2026-04-28, 2026-04-15, 2026-04-10 in reverse-chronological order. The 2026-04-20 entry ("impatient") is NOT returned because `plainto_tsquery('english','patience')` stems to a different lexeme than "impatient" (standard English stemmer behaviour — confirmed in Postgres FTS docs).

**Test 6: Past entry read-only / cross-user isolation**

- Setup: Ahmad has a reflection on 2026-04-10 with `window_closes_at = 2026-04-11 03:00 local`. Second user `fatima` exists with her own separate reflections.
- Action A: `GET /api/journal/<ahmad-reflection-id>` with Ahmad's session. Expected: 200, returns full day view, `did_apply`, `text`, etc.
- Action B: The same endpoint with Fatima's session. Expected: 404 `NOT_FOUND` (RLS filters the row out; handler returns 404, not 403, to avoid confirming the id exists).
- Action C: `GET /api/journal?q=patience` with Fatima's session. Expected: 200 with `total = 0` (no cross-user leak even though Ahmad's entries match).

**Test 7: Bookmarked-only filter**

- Setup: Ahmad has 20 reflections; he has bookmarked 3 (on 96:1, 2:286, 103:1).
- Action: `GET /api/journal?filter=bookmarked`.
- Expected: 200. `total = 3`. Every returned entry has `is_bookmarked: true`.

**Test 8: Pagination**

- Setup: Ahmad has 42 reflections.
- Action: `GET /api/journal?page=2` (page_size fixed at 25).
- Expected: 200. `total = 42`. `entries.length = 17`. `entries[0]` is the 26th-most-recent reflection.

## Acceptance Criteria

- [ ] `GET /api/journal` returns reverse-chronological list with correct pagination, filter, and search behaviour.
- [ ] `GET /api/journal/:reflection_id` returns full day view and 404s for cross-user access.
- [ ] `POST /api/bookmarks` dual-writes to QF + mirror, is idempotent, and still succeeds (with logged error) when QF is down.
- [ ] `DELETE /api/bookmarks/:verse_key` removes from QF + mirror and is idempotent.
- [ ] `GET /api/bookmarks` returns QF source of truth, falls back to mirror on QF failure.
- [ ] `bookmarks_mirror` table + GIN index on `reflections.text` deployed with correct RLS policies.
- [ ] Journal page renders list, search, filter, and day-detail sheet per UI spec.
- [ ] Bookmark star toggles with optimistic update and reverts on failure.
- [ ] Empty, no-results, and loading states all display correctly.
- [ ] Full-text search is debounced 300ms and uses `plainto_tsquery('english', :q)`.
- [ ] No route exposes another user's reflections or bookmarks (verified by Test 6).
- [ ] No tokens stored in `bookmarks_mirror`.
- [ ] All verifier checks clean (format, lint, types, unit tests).

## Verification

Run the verifier skill to confirm changes are clean.

### Backend Unit / Integration Tests (Vitest)

- `tests/unit/lib/db/journal.test.ts` — full-text search builder:
  - Builds the expected parameterised SQL with `plainto_tsquery('english', :q)` clause.
  - Clips `q` to 200 chars.
  - Correctly ANDs `user_id = :session_user_id`.
  - Does NOT include a tsquery predicate when `q` is absent or empty.
- `tests/unit/lib/db/bookmarks_mirror.test.ts` — mirror CRUD helpers:
  - UNIQUE violation on duplicate insert returns existing row (idempotent).
  - DELETE when no row exists is a no-op and returns normally.
- `tests/integration/api/bookmarks.test.ts` — route-level:
  - Dual-write success path.
  - QF failure still inserts mirror row with `qf_bookmark_id = NULL`.
  - Cross-user DELETE attempt returns 204 but does NOT delete the other user's row (RLS blocks).
- `tests/integration/api/journal.test.ts` — route-level:
  - Pagination at 25 rows.
  - Filter `bookmarked` joins only mirror rows.
  - Search `q=patience` returns only stem matches.
  - Cross-user isolation.

### E2E Tests (Playwright)

| Key Scenario                                                     | Test file                                   | Assigned sub-task |
| ---------------------------------------------------------------- | ------------------------------------------- | ----------------- |
| Opening the journal shows reverse-chronological past reflections | `tests/e2e/journal-list.spec.ts`            | Task 4            |
| Opening a past journal entry shows the full day                  | `tests/e2e/journal-day-detail.spec.ts`      | Task 4            |
| Bookmarking a journal entry adds it to favourites                | `tests/e2e/journal-bookmark-toggle.spec.ts` | Task 4            |
| Un-bookmarking an entry removes it from favourites               | `tests/e2e/journal-bookmark-toggle.spec.ts` | Task 4            |
| Favourites-only filter narrows the list                          | `tests/e2e/journal-filter.spec.ts`          | Task 4            |
| Keyword search finds matching reflections                        | `tests/e2e/journal-search.spec.ts`          | Task 5            |
| Search matches are case-insensitive                              | `tests/e2e/journal-search.spec.ts`          | Task 5            |
| Empty journal for a brand-new user                               | `tests/e2e/journal-empty.spec.ts`           | Task 4            |
| Search that matches nothing                                      | `tests/e2e/journal-search.spec.ts`          | Task 5            |
| Past reflections are read-only once the day has closed           | `tests/e2e/journal-day-detail.spec.ts`      | Task 4            |

**Locator strategies:**

- `data-testid="journal-search-input"` on `SearchInput`.
- `data-testid="journal-filter-toggle"` on `FilterToggle`, values `"all"` / `"bookmarked"`.
- `data-testid="journal-entry-card"` on each card; child `data-testid="bookmark-star"` and `data-testid="entry-preview"`.
- `data-testid="day-detail-sheet"` on the sheet root; `aria-label="Bookmark this reflection"` / `"Remove bookmark"` for the star.
- Empty / no-results placeholders use `role="status"` with `data-testid="journal-empty"` and `data-testid="journal-no-results"`.
