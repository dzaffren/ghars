# Ghars (غَرْس) — Overview

**Discovery Brief:** `docs/discovery/quran-ayah-apply/brief.md`
**Repo:** https://github.com/dzaffren/ghars
**Deploy:** https://ghars-nine.vercel.app
**Submission:** Quran Foundation Hackathon 2026 (deadline 2026-05-20)

_Ghars_ (Arabic: غَرْس, "planting / seedling") — the two-touch daily habit app that plants a tree for every honest reflection on an ayah.

## Summary

Ghars is a two-touch daily habit app that helps Muslims translate what they read in the Quran into specific, named actions in their lives. Each day the user receives one carefully curated ayah with translation, tafsir, and audio, commits to one of two human-written "missions" inspired by it, and reflects in the evening on what actually happened. An honesty-first gamification layer — a growing grove of trees — rewards cumulative meaningful engagement over consecutive-day streaks.

## Background & Context

**Current state:**

- Millions of non-Arabic-speaking Muslims read the Quran during Ramadan but struggle to maintain a living connection with it afterward.
- Existing apps solve comprehension (Quran.com, Muslim Pro), audio recitation (iQuran), and streak-based reading habits (Quran Companion) well.
- Existing social products (QuranReflect) invite users to share reflections after reading, but do not structure the day around translating an ayah into a specific action.

**Problem:**

- The gap between _understanding what an ayah means_ and _doing something different today because of it_ is large, unscaffolded, and personally painful for the target user. Users report reading regularly but being unsure whether the Quran is shaping how they live.
- No mainstream product provides a daily structural prompt that says, "here is today's ayah — here is a concrete action you could take because of it — did you act on it?"
- For the hackathon specifically, the judges will reward impact on Quran engagement (30 of 100 points) — this is the largest-weighted criterion, and it rewards products that move users from passive reading to active, named engagement.

## Goals

- Increase the number of users who take a specific, nameable action inspired by a Quranic ayah in a given week — measured in-app as reflection-reports per active user per week.
- Deliver a day-7 experience that makes the cumulative value of the app visible and emotionally resonant (the grove review), so users feel _"I have changed a little because of this"_ by end of week one.
- Score competitively across all five hackathon judging criteria, with deliberate over-achievement on _Impact on Quran engagement_ (30 pts) and _API integration quality_ (15 pts).

## Non-Goals

- This product will not teach users Arabic, transliteration, or recitation tajweed.
- This product will not support social sharing, public reflection feeds, or community comments in the hackathon submission scope.
- This product will not cover the full Quran; the curated corpus at submission is ≥60 ayat selected for actionability and thematic spread.
- This product will not integrate prayer-time-based notification scheduling for the submission; fixed user-set clock times are used instead.
- This product will not ship native iOS or Android apps through the stores in scope; it ships as an installable progressive web app.

## Story Index

| Ticket | Story                                      | Spec                                                     | Type        | Status      | Dependencies       |
| ------ | ------------------------------------------ | -------------------------------------------------------- | ----------- | ----------- | ------------------ |
| TBD    | Onboarding & account creation              | [spec-onboarding.md](spec-onboarding.md)                 | User-facing | Not Started | —                  |
| TBD    | Morning ayah & mission commit              | [spec-morning-loop.md](spec-morning-loop.md)             | User-facing | Not Started | Onboarding         |
| TBD    | Evening reflection & tree growth           | [spec-evening-reflection.md](spec-evening-reflection.md) | User-facing | Not Started | Morning loop       |
| TBD    | Grove home screen & cumulative view        | [spec-grove-home.md](spec-grove-home.md)                 | User-facing | Not Started | Evening reflection |
| TBD    | Weekly grove review                        | [spec-weekly-review.md](spec-weekly-review.md)           | User-facing | Not Started | Evening reflection |
| TBD    | Notifications & scheduling                 | [spec-notifications.md](spec-notifications.md)           | User-facing | Not Started | Onboarding         |
| TBD    | Bookmarks & reflection journal             | [spec-bookmarks-journal.md](spec-bookmarks-journal.md)   | User-facing | Not Started | Evening reflection |
| TBD    | Ayah corpus curation & demo-mode seed data | [spec-content-corpus.md](spec-content-corpus.md)         | Technical   | Not Started | —                  |

## Shared Business Rules

- **Honesty over streak.** A day where the user opens the app and submits "Not today" as their reflection counts as a completed check-in and does not break the streak. Streaks only break when a user does not open the app at all for a full day, and a single missed day per rolling 7-day window is forgiven automatically.
- **Minimum reflection length.** A written reflection must contain at least 40 characters to complete the day's tree. Blank or one-word submissions do not count toward the streak or the grove.
- **One ayah per calendar day.** Each user receives exactly one ayah per local calendar day. The ayah is anchored to the day, not to the clock — a user who opens the app for the first time at 2pm still sees _today's_ ayah, not one the app would have shown at morning.
- **No backfill.** A day that was missed in its entirety cannot be retroactively completed. The grove visibly has a gap where that day would have been; the streak uses the one-free-pass-per-week rule to remain motivating.
- **Evening reflection window.** A user may submit their evening reflection any time from commit up until 3:00am local time the following morning. After 3:00am, the day closes and a new ayah is available.
- **Reflections are private.** All reflections, bookmarks, and grove state are private to the user's account. No sharing, public feed, or social features exist in the submission.
- **Content integrity.** Every action prompt shown to a user has been human-edited by the product owner. No unedited AI-generated text reaches the user.
- **Minimum corpus at submission.** The app must ship with at least 60 curated ayat covering a thematic spread: character, worship, family, patience, dhikr, gratitude, trust in Allah, and justice.

## User Journey Map

1. **Discovery and first open** — A user arrives on the web app and sees a two-screen welcome: what the app is for, and a prompt to create an account. _(Story: Onboarding & account creation)_
2. **Account creation and preferences** — The user signs up with the Quran Foundation auth flow, chooses a translation (default: The Clear Quran), picks their morning and evening notification times, and lands on today's ayah. _(Story: Onboarding & account creation)_
3. **Morning touch** — At their chosen morning time, the user receives a push notification. They open the app, read today's ayah with translation, listen to the audio if they wish, scan the condensed tafsir, and are presented with two curated action missions plus an "or write your own" option. They pick one and tap Commit. A sapling animation begins. _(Story: Morning ayah & mission commit)_
4. **Through the day** — The user goes about their day carrying the commitment. No further interaction is required until evening.
5. **Evening touch** — At their chosen evening time, a second push notification arrives. The user returns and answers two questions: Did you act on it? _(Yes, fully / Partly / Not today)_ and What happened? _(freeform reflection, minimum 40 characters)_. On submit, the sapling grows into a full tree and joins the grove. _(Story: Evening reflection & tree growth)_
6. **Cumulative view** — Whenever the user opens the app on subsequent days, the home screen greets them with their growing grove and a quiet counter — "you have reflected on 14 ayat this month" — with the streak shown as secondary information. _(Story: Grove home screen & cumulative view)_
7. **Weekly landmark** — On day seven of an active week, the user is presented with a scrollable summary of all seven ayat and all seven reflections from that week, framed as _"Here's what Allah guided you through this week."_ _(Story: Weekly grove review)_
8. **Returning to favorites** — At any time, the user can browse a private journal of their reflections and bookmarked ayat, searching and revisiting what they have written. _(Story: Bookmarks & reflection journal)_
9. **Rhythm maintained** — Notifications adapt as the user changes their schedule; if they miss a day, the one-free-pass-per-week rule keeps their streak alive; if they miss more, they are never shamed back — a new ayah is simply waiting. _(Story: Notifications & scheduling)_

## Success Metrics

- **Primary engagement metric:** Reflection-reports submitted per active user per week. A successful pilot user completes at least 4 reflections per week by week two.
- **Secondary engagement metric:** Day-7 retention — percentage of users who open the app on day seven after their first session. Target: ≥40% for judges and pilot users.
- **Depth signal:** Average reflection length. Target: ≥80 characters (well above the 40-character floor), indicating users are genuinely reflecting rather than streak-farming.
- **Judge-facing metric:** Score of ≥85 of 100 across the hackathon's five criteria, with full marks on _Impact on Quran engagement_ and _API integration quality_.
- **API breadth:** Use of at least four Content APIs (Quran, Translation, Tafsir, Audio) and at least three User APIs (Bookmarks, Streak Tracking, Activity/Goals) — every integration load-bearing.

## Dependencies

- **Quran Foundation Content APIs:** Quran text, Translation, Tafsir, Audio.
- **Quran Foundation User APIs:** Authentication, Bookmarks, Streak Tracking, Activity/Goals.
- **Curated ayah corpus:** At least 60 ayat with human-edited action prompts, produced by the product owner in parallel with development.
- **Push notification infrastructure:** Browser-based push on both iOS (Safari 16.4+) and Android, delivered from the progressive web app.

## Rollout Strategy

- **Story delivery order.** Stories will be delivered in this priority so that an earlier cut of the app is shippable if the sprint tightens:
  1. Onboarding & account creation
  2. Morning ayah & mission commit
  3. Evening reflection & tree growth
  4. Grove home screen & cumulative view
  5. Ayah corpus curation & demo-mode seed data _(parallel workstream, non-blocking for stories 1–4)_
  6. Notifications & scheduling
  7. Weekly grove review
  8. Bookmarks & reflection journal
- **Minimum shippable cut:** If the sprint is compromised, stories 1–4 plus the corpus story form a credible demo. Stories 5–8 are additive but non-essential for a judge to understand the loop.
- **Demo-mode consideration.** Because judges will typically evaluate the app in a single session, the corpus story also produces a demo-mode seed that pre-populates a 7-day grove on demand so the weekly review and grove home screen are reviewable without a week of use.

## Open Questions

- [x] ~~Platform for the submission?~~ — **Resolved:** Progressive web app. One codebase, installable, push notifications work on modern iOS and Android, no store review delay.
- [x] ~~Does the user need to sign up before using the app?~~ — **Resolved:** Yes. Sign-up uses the Quran Foundation authentication flow to demonstrate deeper API integration and earn additional judging points for breadth of API usage.
- [x] ~~What happens when users open the app at unusual times or miss a day?~~ — **Resolved:** First touch of the day anchors that day's ayah regardless of clock time. Evening reflection window extends to 3am local. No backfill; missed days are visible gaps. One missed day per rolling 7 days is forgiven automatically so a single slip does not break the streak.
- [x] ~~Default translation and tafsir?~~ — **Resolved:** The Clear Quran (Mustafa Khattab) as the default translation, user-selectable in settings. Ibn Kathir as the default tafsir, surfaced as a condensed 1–2 sentence extract on the ayah screen with a "read the full tafsir" expandable section.
- [x] ~~Notification timing defaults?~~ — **Resolved:** Fixed clock times, 8:00am morning and 9:00pm evening, user-editable in settings. Prayer-time-based scheduling is deferred to future work.
- [x] ~~Who curates the 60+ action prompts and when?~~ — **Resolved:** The product owner personally edits every action prompt, working in parallel with development across the first 12 days of the sprint. AI-drafted first pass, 100% human-edited before ship.
- [x] ~~How do judges experience depth in a short evaluation session?~~ — **Resolved:** Ship a demo mode that pre-populates a 7-day grove and reflection history on a demo account, so the grove home screen and weekly review are reviewable from the first open.
- [x] ~~Are reflections stored cloud or device only?~~ — **Resolved:** Cloud-synced, private to the user's account. Quran Foundation User APIs (Bookmarks, Streak Tracking, Activity/Goals) used wherever they fit the data shape; reflections themselves may require lightweight storage separate from the API surface and will be decided in technical refinement.
- [x] ~~Second set of eyes on the curated corpus before submission?~~ — **Resolved:** Best effort. If a knowledgeable friend is available the night before submission they review the corpus; otherwise the AI-draft-then-human-edit process is the defence. Risk accepted and documented.
- [x] ~~Which specific tafsir(s) the Tafsir API exposes, and condensation strategy for surfacing a 1–2 sentence extract~~ — **Resolved:** The Tafsir API exposes a list of tafsirs via `GET /tafsirs` and ayah-specific tafsir via `GET /quran/tafsirs/{tafsir_id}?verse_key={key}` (confirmed from `lib/qf/content.ts`; default `tafsir_id=169` = Ibn Kathir English). Condensation strategy: store a **manually authored ≤200-character extract** alongside each corpus entry (part of the content pipeline); the "read full tafsir" expandable drawer calls the live Tafsir API. This avoids runtime LLM summarisation and keeps the on-screen card fast and predictable.
- [x] ~~Exact reflection storage approach~~ — **Resolved:** Reflections are stored in the Quran Foundation **Notes API** (`POST /notes` (confirmed from `lib/qf/user.ts`), `GET /notes/by-verse/{verse_key}`, `PUT /notes/{note_id}`) attached to the ayah's `verse_key`. The Notes API natively supports per-ayah text with timestamps, which maps cleanly onto reflection data. This choice raises our User API integration from 3 APIs to 7 (Notes, Bookmarks, Streaks, Goals, Activity Days, Preferences, Collections) — a material win for the 15-point API integration criterion.

---

## Shared Architecture Notes

### Stack

- **Framework:** Next.js 15 (App Router) + TypeScript, React 19, Tailwind CSS v4, shadcn/ui for components. PWA support via `next-pwa`.
- **Deploy target:** Vercel (`git push` deploy).
- **Database & auth session storage:** Supabase (Postgres + Auth session cookies). Supabase is used for our own tables and session management; user authentication itself goes through Quran Foundation OAuth2 (Supabase Auth is NOT used as the identity provider — it is only the cookie/session store).
- **Push notifications:** `web-push` library + VAPID keys. Service worker registered by `next-pwa`. Supported on iOS 16.4+ Safari and all modern Android.
- **Audio:** Native HTML `<audio>` element fed with signed URLs from the Recitation Audio Files endpoint.
- **Testing:** Vitest for unit/integration, Playwright for E2E. `@testing-library/react` for component tests.

### Quran Foundation API integration

**Base paths:**

- Content APIs: `https://api.quran.com/api/v4` (confirmed working — same for prelive and production) — set via `QF_CONTENT_BASE` env var; default is this URL
- User-related APIs: `https://apis.quran.foundation/auth/v1` (production) / `https://apis-prelive.quran.foundation/auth/v1` (prelive) — set via `QF_USER_BASE` env var; default is production. Confirmed from user-apis-quickstart docs.
- Search API: `https://apis.quran.foundation/content/api/search/v1` (unconfirmed — not yet used in codebase)
- OAuth2: `https://oauth2.quran.foundation` (production) / `https://prelive-oauth2.quran.foundation` (prelive) — set via `QF_OAUTH_BASE` env var; authorize endpoint `/oauth2/auth`, token endpoint `/oauth2/token` (confirmed from QF docs)

**Authentication headers (required on every call):**

- `x-auth-token: <JWT access token>`
- `x-client-id: <our client id>`

**OAuth2 flows:**

- **Content APIs** → `client_credentials` grant, scope `content` (`search` scope for Search API). Token fetched server-side and cached in-memory for its TTL.
- **User APIs** → `authorization_code` + PKCE grant. User is redirected to the QF authorize endpoint from our onboarding flow; the code is exchanged server-side in a Next.js Route Handler; the resulting access + refresh tokens are stored in a Supabase-backed session row and referenced by an HTTP-only cookie. The browser never sees a raw token.

**Content endpoints (base: `https://api.quran.com/api/v4` — all `GET`):**

| Purpose                          | Endpoint (relative)                                                     | Source                        |
| -------------------------------- | ----------------------------------------------------------------------- | ----------------------------- |
| List chapters                    | `/chapters`                                                             | docs                          |
| Ayah text (Uthmani script)       | `/quran/verses/uthmani?verse_key={key}`                                 | docs                          |
| Ayah metadata by key             | `/verses/by_key/{verse_key}?fields=text_uthmani,verse_key,verse_number` | confirmed `lib/qf/content.ts` |
| Translation for an ayah          | `/quran/translations/{translation_id}?verse_key={key}`                  | confirmed `lib/qf/content.ts` |
| List available translations      | `/translations`                                                         | confirmed docs                |
| Ayah-level tafsir                | `/quran/tafsirs/{tafsir_id}?verse_key={key}`                            | confirmed `lib/qf/content.ts` |
| List available tafsirs           | `/tafsirs`                                                              | confirmed docs                |
| List available recitations       | `/recitations`                                                          | confirmed docs                |
| Audio file for a reciter+chapter | `/chapter_recitations/{recitation_id}/{chapter_number}`                 | docs                          |
| Ayah-level recitation            | `/recitations/{recitation_id}/by_ayah/{verse_key}`                      | confirmed `lib/qf/content.ts` |

Default IDs in use: `translation_id=131` (The Clear Quran / Mustafa Khattab), `tafsir_id=169` (Ibn Kathir English), `recitation_id=7` (Alafasy). Audio CDN: `https://audio.qurancdn.com/{path}` when QF returns a relative URL.

**User endpoints (base URL: `QF_USER_BASE` env var — set to the QF User API host):**

| Purpose                 | Method | Endpoint (relative)                      | Source                             |
| ----------------------- | ------ | ---------------------------------------- | ---------------------------------- |
| Add note to ayah        | POST   | `/notes`                                 | confirmed `lib/qf/user.ts`         |
| Get notes by verse      | GET    | `/notes/by-verse/{verse_key}`            | sitemap `get-notes-by-verse`       |
| Update note             | PUT    | `/notes/{note_id}`                       | sitemap `update-note-by-id`        |
| Add bookmark            | POST   | `/bookmarks`                             | confirmed `lib/qf/bookmarks.ts`    |
| List bookmarks          | GET    | `/bookmarks`                             | confirmed `lib/qf/bookmarks.ts`    |
| Delete bookmark         | DELETE | `/bookmarks/{bookmark_id}`               | confirmed `lib/qf/bookmarks.ts`    |
| Get current streak      | GET    | `/streaks/current`                       | confirmed `lib/qf/user.ts`         |
| Get all streaks         | GET    | `/streaks`                               | sitemap `get-streaks`              |
| Create goal             | POST   | `/goals`                                 | sitemap `create-a-goal`            |
| Get today's goal plan   | GET    | `/goals/today`                           | sitemap `get-todays-goal-plan`     |
| Add/update activity day | POST   | `/activity/day`                          | confirmed `lib/qf/user.ts`         |
| Get activity days       | GET    | `/activity/days`                         | sitemap `get-activity-days`        |
| Add/update preference   | POST   | `/preferences`                           | sitemap `add-or-update-preference` |
| Add collection          | POST   | `/collections`                           | sitemap `add-collection`           |
| Add item to collection  | POST   | `/collections/{collection_id}/bookmarks` | sitemap `add-collection-bookmark`  |

Note body shape for `POST /notes`: `{ "verse_key": "96:1", "body": "<text>" }`. Returns `{ "id": "..." }` (persisted as `reflections.qf_note_id`). Body shape for `POST /activity/day`: `{ "date": "YYYY-MM-DD", "seconds_read": 60 }` (nominal read time; signals day active to QF streak engine).

### Data model (shared — Supabase Postgres)

**Table: `users`** — thin mirror of QF identity

| Field        | Type        | Constraints      | Description                   |
| ------------ | ----------- | ---------------- | ----------------------------- |
| id           | uuid        | PK               | Our internal user id          |
| qf_user_id   | text        | UNIQUE, NOT NULL | QF subject claim from JWT     |
| email        | text        | UNIQUE           | From QF userinfo              |
| display_name | text        |                  | From QF userinfo              |
| is_demo      | boolean     | DEFAULT false    | True for seeded demo accounts |
| created_at   | timestamptz | DEFAULT now()    |                               |

**Table: `qf_sessions`** — OAuth token storage, referenced by HTTP-only cookie

| Field             | Type        | Constraints        | Description               |
| ----------------- | ----------- | ------------------ | ------------------------- |
| id                | uuid        | PK                 | Session id (cookie value) |
| user_id           | uuid        | FK users, NOT NULL |                           |
| access_token      | text        | NOT NULL           | Encrypted at rest         |
| refresh_token     | text        |                    | Encrypted at rest         |
| access_expires_at | timestamptz | NOT NULL           |                           |
| created_at        | timestamptz | DEFAULT now()      |                           |

**Table: `corpus_entries`** — the 60+ curated ayat (build-time seed data)

| Field             | Type        | Constraints       | Description                           |
| ----------------- | ----------- | ----------------- | ------------------------------------- |
| id                | int         | PK                | Ordered id, determines day assignment |
| verse_key         | text        | UNIQUE, NOT NULL  | e.g., `"96:1"`                        |
| theme             | text        | NOT NULL          | One of 8 themes                       |
| tafsir_extract    | text        | NOT NULL, ≤200 ch | Human-authored condensed summary      |
| action_prompt_1   | text        | NOT NULL          | Human-edited                          |
| action_prompt_2   | text        | NOT NULL          | Human-edited                          |
| human_reviewed_at | timestamptz | NOT NULL          | Enforces "no AI strings leak" rule    |

**Table: `daily_assignments`** — which ayah each user sees on which local date

| Field                        | Type | Constraints                 | Description                  |
| ---------------------------- | ---- | --------------------------- | ---------------------------- |
| id                           | uuid | PK                          |                              |
| user_id                      | uuid | FK users, NOT NULL          |                              |
| local_date                   | date | NOT NULL                    | User's local calendar date   |
| corpus_entry_id              | int  | FK corpus_entries, NOT NULL |                              |
| verse_key                    | text | NOT NULL                    | Mirror for query convenience |
| UNIQUE (user_id, local_date) |      |                             |

**Table: `missions`** — the morning commit

| Field           | Type        | Constraints                  | Description                 |
| --------------- | ----------- | ---------------------------- | --------------------------- |
| id              | uuid        | PK                           |                             |
| assignment_id   | uuid        | UNIQUE, FK daily_assignments | One mission per assignment  |
| selected_prompt | text        | NOT NULL                     | Text of the chosen action   |
| is_custom       | boolean     | DEFAULT false                | True = user wrote their own |
| committed_at    | timestamptz | NOT NULL                     |                             |

**Table: `reflections`** — the evening submit (local mirror of QF Note)

| Field            | Type        | Constraints                 | Description                          |
| ---------------- | ----------- | --------------------------- | ------------------------------------ |
| id               | uuid        | PK                          |                                      |
| mission_id       | uuid        | UNIQUE, FK missions         | One reflection per mission           |
| did_apply        | text        | NOT NULL                    | `yes_fully` / `partly` / `not_today` |
| text             | text        | NOT NULL, CHECK length ≥ 40 | Enforced in DB and app               |
| qf_note_id       | text        |                             | Id returned by QF Notes API          |
| submitted_at     | timestamptz | NOT NULL                    |                                      |
| window_closes_at | timestamptz | NOT NULL                    | 3am local day+1; editable until      |

Row-level security policies: every table with `user_id` (or reachable via FK) restricts SELECT/UPDATE/DELETE to the row's owner, enforced by Supabase RLS on the session's `users.id`.

### Content caching

- **Build-time.** The 60+ corpus entries include `verse_key`, human-authored `tafsir_extract`, and both action prompts. These are seeded into Supabase by a one-time script (see `spec-content-corpus.md`) and are deployed statically.
- **Runtime.** Arabic text, full tafsir, translation text, and audio URLs are fetched live from QF Content APIs on ayah view. Cached with Next.js `fetch` `revalidate: 86400` (24h) to avoid pummelling the API while still demonstrating live integration.
- **Audio.** The audio URL returned by QF is used directly in an `<audio>` element; the browser handles streaming.

### Repo layout

```
/                               # Next.js App Router root
  app/
    (marketing)/page.tsx        # Welcome screen (onboarding story)
    (app)/
      today/page.tsx            # Morning + evening loop
      grove/page.tsx            # Grove home
      week/[weekId]/page.tsx    # Weekly review
      journal/page.tsx          # Reflection journal + bookmarks
      settings/page.tsx         # Notifications + preferences
    api/
      auth/
        start/route.ts          # Begin QF OAuth authorize
        callback/route.ts       # Exchange code → tokens
        signout/route.ts
      qf/                       # Server-side proxies (attach auth headers)
        notes/route.ts
        bookmarks/route.ts
        streaks/route.ts
        goals/route.ts
        activity/route.ts
      content/                  # Server-side proxies for content APIs
        verse/[key]/route.ts
        tafsir/[key]/route.ts
        translation/[key]/route.ts
        audio/[key]/route.ts
      push/
        subscribe/route.ts
        schedule/route.ts       # Cron-triggered push dispatch
      demo/
        seed/route.ts           # Create demo account with 7-day history
    layout.tsx
    manifest.ts                 # PWA manifest
    sw.ts                       # Service worker (push listener)
  lib/
    qf/                         # QF API client modules
      client.ts                 # Shared fetch wrapper with x-auth-token
      content.ts                # Content endpoints
      user.ts                   # User endpoints (notes/bookmarks/streaks/...)
      oauth.ts                  # client_credentials + auth_code helpers
    db/                         # Supabase client + queries
      client.ts
      assignments.ts
      missions.ts
      reflections.ts
    session.ts                  # HTTP-only cookie + qf_sessions lookup
    streak.ts                   # Streak rules (honesty, free-pass, 3am window)
    push.ts                     # web-push + VAPID
    demo.ts                     # Demo seeding
  scripts/
    seed-corpus.ts              # One-time corpus load (content-corpus story)
    seed-demo.ts                # Demo account seeder
  supabase/migrations/
    0001_initial.sql            # All tables defined above
  tests/
    unit/                       # Vitest
    integration/
    e2e/                        # Playwright
  public/
    icons/                      # PWA icons
```

### Cross-cutting concerns

- **Time zones.** All date-stamped logic uses the user's device-local date (derived client-side, sent to server in API calls). The 3:00am window close is computed against the same local date. Travellers get the local date of their current device time zone.
- **Error telemetry.** `lib/qf/client.ts` logs QF API errors with request id + status to a `qf_api_errors` Supabase table for post-submission debugging. No PII.
- **Security.** All tokens in `qf_sessions` are encrypted at rest using a Supabase secret (pgcrypto `pgp_sym_encrypt`). Cookies are HTTP-only, `SameSite=Lax`, `Secure`. No CSRF needed beyond SameSite because every state-mutating call is same-origin from the PWA.
- **Content safety.** A pre-seed check verifies every `corpus_entries` row has `human_reviewed_at IS NOT NULL`; the seed script refuses to insert rows without a review stamp.

### Cross-story dependencies and build order

1. **`spec-content-corpus.md`** (technical) and **`spec-onboarding.md`** are the only INDEPENDENT starting points.
2. `spec-morning-loop.md` depends on both of the above.
3. `spec-evening-reflection.md` depends on morning loop.
4. `spec-grove-home.md` depends on evening reflection.
5. `spec-weekly-review.md`, `spec-bookmarks-journal.md`, `spec-notifications.md` all depend on evening reflection and can be built in parallel thereafter.

A minimum shippable cut is: content-corpus + onboarding + morning-loop + evening-reflection + grove-home.

### Negative constraints (apply to all stories)

- Do NOT roll custom OAuth token handling outside `lib/qf/oauth.ts` and the `app/api/auth/*` route handlers.
- Do NOT cache user-specific QF responses (notes, bookmarks, streak) — always live.
- Do NOT store access tokens in the browser (no localStorage, no non-HTTP-only cookies).
- Do NOT render Arabic through a browser-translation-eligible element; always use `<span translate="no" lang="ar">` (explicit QF guidance to avoid semantic corruption).
- Do NOT use QF Posts or Rooms APIs in the submission scope — social features are out of scope and add attack surface.
- Do NOT implement prayer-time-based notification scheduling in the submission.
