# Onboarding & Account Creation

**Ticket:** TBD
**Discovery Brief:** `docs/discovery/quran-ayah-apply/brief.md`
**Epic Overview:** `docs/specs/TBD-quran-ayah-apply/spec.md`

A two-screen welcome that explains the product's "daily ayah mission" premise, walks a new user through account creation via the Quran Foundation authentication flow, captures their initial translation and notification-time preferences, and drops them directly onto today's ayah so the product's value is visible within the first session. Returning users can sign back in from the same welcome, and judges can enter a pre-seeded demo environment with one tap.

## User Story

As a practicing Muslim who reads the Quran and wants reading to shape how I live, I want a welcome flow that introduces the app in under a minute and sets up my account and preferences, so that I can begin today's daily ayah mission immediately rather than configuring settings before I understand what the app does.

## Background & Context

**Current state:**

- A user arriving at the progressive web app for the first time has no context for what the product is or how it differs from other Quran apps they may have used.
- No account exists for them, and no preferences (translation choice, morning/evening notification times) are yet known.
- Judges evaluating the submission typically have a few minutes per app and need to see the product's depth without a week of personal use.

**Problem:**

- Without a crisp two-screen introduction, users will not understand that this is an _apply-and-reflect_ loop rather than another reading or streak app, and will drop off before reaching today's ayah.
- Without account creation tied to the Quran Foundation authentication flow, the submission misses API-integration points and cannot persist a user's grove, streak, or reflections across devices.
- Without a demo-mode entry path, judges cannot experience the grove home screen or weekly review inside their evaluation window.

## Target User & Persona

- **Who:** A non-Arabic-speaking practicing Muslim, typically 20s to 40s, who reads the Quran in translation and wants reading to change how they live. Also: a hackathon judge evaluating the submission.
- **Context:** First open of the installable web app, either on a phone immediately after install or on a laptop during an evaluation session.
- **Current workaround:** Users today read the Quran in Quran.com or Muslim Pro without a daily applied-action prompt; judges today open hackathon submissions and must guess at depth from screenshots.

## Goals

- A brand-new user can go from first open to viewing today's ayah in under 90 seconds without reading any help text.
- Every new account is created through the Quran Foundation authentication flow, contributing to the API-integration judging criterion.
- Every judge can enter a fully populated demo environment with a single tap from the welcome screen.
- A returning user on a new device can sign back in and land exactly where they would have landed had they never left.

## Non-Goals

- This story does not cover editing preferences after onboarding — that lives in the notifications and settings story.
- This story does not cover password reset flows beyond what the Quran Foundation authentication flow itself provides.
- This story does not cover the morning ayah screen's behaviour, the evening reflection screen, or the grove — those are separate stories. Onboarding only delivers the user _to_ today's ayah; what happens there is out of scope here.

## User Workflow

1. **First open** — The user arrives on the welcome screen and sees a single short sentence naming the product's promise: "One ayah a day. One small action. One growing grove." Three choices are visible: _Get started_, _I already have an account_, and _Try with sample data_.
2. **What the app is** — On tapping _Get started_, the user sees the second welcome screen: a plain-language summary of the daily loop — morning ayah and mission, evening reflection, a grove that grows over time — with one continue control.
3. **Account creation** — The user completes sign-up via the Quran Foundation authentication flow. On success, they are returned to the app signed in.
4. **Preferences** — The user is shown a preferences screen with a translation picker (The Clear Quran selected by default, with Sahih International and Pickthall as alternatives) and two time pickers for morning and evening notifications (8:00am and 9:00pm filled in by default). They can accept all defaults with one tap.
5. **Today's ayah** — The user lands directly on today's ayah screen (the morning loop entry point) with no further clicks required. Onboarding is complete.
6. **Returning user variant** — A user who taps _I already have an account_ on the first screen signs in via the Quran Foundation authentication flow and is taken to the appropriate point in their day: today's ayah if they have not yet committed to a mission, or today's evening reflection if they have.
7. **Demo-mode variant** — A user who taps _Try with sample data_ is placed into a demo account with a seven-day grove already grown, and is taken to the grove home screen so the cumulative view is the first thing they see.

## Acceptance Criteria

### Scenario: Brand-new user completes onboarding with all defaults

```gherkin
Given Aisha is opening the app for the first time on her phone
  And she has no existing account
When she taps "Get started" on the welcome screen
  And she reads the "how it works" screen and taps continue
  And she completes sign-up through the Quran Foundation sign-up flow with the name "Aisha Rahman" and a valid email
  And she accepts the default translation "The Clear Quran (Mustafa Khattab)"
  And she accepts the default morning notification time of 8:00am
  And she accepts the default evening notification time of 9:00pm
  And she taps "Start my first day"
Then she lands on today's ayah screen
  And she sees the ayah, its translation, a condensed tafsir, and today's two mission options
  And her account is signed in and persists if she closes and reopens the app
```

### Scenario: Brand-new user customises translation and notification times

```gherkin
Given Yusuf is opening the app for the first time
  And he prefers a different translation and a later evening reminder
When he taps "Get started"
  And he completes sign-up through the Quran Foundation sign-up flow
  And on the preferences screen he selects translation "Sahih International"
  And he changes the morning notification time from 8:00am to 6:30am
  And he changes the evening notification time from 9:00pm to 10:15pm
  And he taps "Start my first day"
Then he lands on today's ayah screen
  And the ayah translation shown is from Sahih International
  And his saved morning notification time is 6:30am
  And his saved evening notification time is 10:15pm
```

### Scenario: Returning user who has not yet committed today signs in and lands on today's ayah

```gherkin
Given Khadija already has an account and has used the app for two weeks
  And today she has not yet opened the app on any device
  And it is 2:15pm local time
When she opens the app on a new device and taps "I already have an account"
  And she completes sign-in through the Quran Foundation sign-in flow with her existing credentials
Then she lands on today's ayah screen
  And today's mission has not yet been committed
  And her existing grove and streak are visible when she navigates to the grove home
```

### Scenario: Returning user who already committed today lands on the evening reflection

```gherkin
Given Omar already has an account
  And this morning at 8:12am he committed to today's mission on his laptop
  And it is now 8:45pm local time on his phone
When he opens the app on his phone and taps "I already have an account"
  And he completes sign-in through the Quran Foundation sign-in flow
Then he lands on today's evening reflection screen
  And today's morning ayah and his committed mission are shown for context
  And he is prompted to answer "Did you act on it?" and "What happened?"
```

### Scenario: Judge enters demo mode from the welcome screen

```gherkin
Given a hackathon judge is opening the app for the first time during evaluation
  And they have no Quran Foundation account they wish to use
When they tap "Try with sample data" on the welcome screen
Then a demo account is created for them without requiring credentials
  And the demo account is pre-seeded with a seven-day grove and seven past reflections
  And they land on the grove home screen showing seven grown trees
  And the translation used in the demo is "The Clear Quran (Mustafa Khattab)"
  And a subtle "Demo mode" indicator is visible so the state is not mistaken for a real account
```

### Scenario: User abandons onboarding partway and resumes at the step they left

```gherkin
Given Fatima began onboarding yesterday evening
  And she completed sign-up through the Quran Foundation flow
  And she closed the app on the preferences screen without saving her translation or notification times
When she reopens the app the next morning
Then she is taken directly to the preferences screen
  And she is not asked to sign up or sign in again
  And the translation defaults to "The Clear Quran (Mustafa Khattab)" and the times default to 8:00am and 9:00pm
  And on tapping "Start my first day" she lands on today's ayah for the current day, not yesterday's
```

### Scenario: Returning user enters wrong password

```gherkin
Given Bilal has an existing account with email "bilal@example.com"
When he taps "I already have an account"
  And he enters his email as "bilal@example.com" and an incorrect password
  And he submits the sign-in form
Then he sees a clear message that the email or password is incorrect
  And the message does not reveal whether the email exists
  And he remains on the sign-in screen with his email still filled in
  And he is offered a "Forgot password" option
```

### Scenario: Sign-up fails because the device has lost its internet connection

```gherkin
Given Zahra is partway through sign-up on an unstable train connection
When she submits the sign-up form and her device loses its connection before the account is created
Then she sees a message that the app could not reach the internet and her sign-up has not been completed
  And she sees a "Try again" option
  And when her connection is restored and she taps "Try again", the form is resubmitted with the details she already entered
  And no duplicate account is created if the original request eventually succeeded
```

### Scenario: Quran Foundation authentication service is temporarily unavailable

```gherkin
Given the Quran Foundation authentication service is not responding
When Layla taps "Get started" and attempts to complete sign-up
Then she sees a message that sign-in with Quran Foundation is temporarily unavailable and to try again in a few minutes
  And she sees the "Try with sample data" option as a fallback so the app is not a dead end
  And no partial account is created
```

### Scenario Outline: Preference inputs are validated before onboarding completes

```gherkin
Given a user is on the preferences screen during onboarding
When they set the morning notification time to <morning> and the evening notification time to <evening>
  And they tap "Start my first day"
Then they see <result>

Examples:
  | morning | evening | result                                                                                      |
  | 8:00am  | 9:00pm  | today's ayah screen                                                                         |
  | 6:30am  | 10:15pm | today's ayah screen                                                                         |
  | 9:00pm  | 8:00am  | a message that the morning time must come before the evening time on the same day           |
  | 8:00am  | 8:00am  | a message that morning and evening times must be at least two hours apart                    |
```

### Scenario Outline: Translation picker accepts any supported translation

```gherkin
Given a new user is on the preferences screen during onboarding
When they select translation <translation> and complete onboarding
Then today's ayah screen shows the translation text from <translation>

Examples:
  | translation                          |
  | The Clear Quran (Mustafa Khattab)    |
  | Sahih International                  |
  | Pickthall                            |
```

## Business Rules & Constraints

- Sign-up is mandatory for a real account; the only way to use the app without signing up is to enter demo mode via "Try with sample data", which creates a demo account and never sends real reflections anywhere.
- The default translation is _The Clear Quran (Mustafa Khattab)_. If a user completes onboarding without touching the translation picker, this is what they get.
- The default morning notification time is 8:00am local time and the default evening notification time is 9:00pm local time. Both are always editable during onboarding and later in settings.
- Morning time must be earlier than evening time, and the two must be at least two hours apart, so the loop is not collapsed into a single touch by accident.
- After onboarding completes, the user lands on today's ayah (the morning loop screen) unless they are a returning user who already committed today, in which case they land on today's evening reflection.
- Demo mode creates a clearly labelled demo account with a seven-day grove already present and lands the user on the grove home screen, not the morning ayah screen, because the grove is the part of the product a judge most needs to see immediately.
- A user who abandons onboarding partway is resumed at the step they left when they return; no progress already made (sign-up, translation choice, times) is lost.
- All onboarding text must be understandable by a first-time user who has never used a Quran app before — no theological jargon, no gamification jargon.

## Success Metrics

- Onboarding completion rate: at least 85% of users who tap "Get started" reach today's ayah in the same session.
- Median time from first open to today's ayah for a new user: under 90 seconds.
- Demo-mode entry rate during the judging window: at least one judge out of every three opens demo mode, measured by the demo-account flag.
- Returning-user sign-in success rate on first attempt: at least 95%, as a proxy for the sign-in flow being clear.

## Dependencies

- **Quran Foundation authentication** — sign-up and sign-in are provided by the Quran Foundation authentication flow. Onboarding cannot complete for a real account without this being reachable.
- **Curated ayah corpus and demo-mode seed** — the demo-mode entry in this story relies on the seed data produced by the content-corpus technical story; this story only provides the entry point, not the seeding logic.
- **Today's ayah screen (morning loop)** — onboarding delivers the user to this screen; its behaviour is defined in the morning loop story.
- **Today's evening reflection screen** — for the returning-user-already-committed case, onboarding delivers the user here; its behaviour is defined in the evening reflection story.
- **Grove home screen** — the demo-mode landing page; its behaviour is defined in the grove home story.

## Open Questions

All product-level decisions that bear on onboarding (auth is required, default translation, default notification times, demo mode exists, sign-up uses Quran Foundation authentication) are locked in the epic overview and are not re-litigated here.

- [ ] Whether the "Forgot password" path on the sign-in screen is handled entirely inside the Quran Foundation authentication flow or needs any additional prompting on our side — **Deferred (non-blocking):** discovered on first integration with the authentication flow during technical refinement; does not change the user-visible behaviour described above.

---

## Functional Requirements

> Shared stack, Supabase schema, QF endpoint catalogue, cookie/security rules, repo layout, and negative constraints are defined in [spec.md → Shared Architecture Notes](spec.md#shared-architecture-notes). This section only adds requirements specific to onboarding.

- **Auth flow:** New and returning real accounts must be created via the Quran Foundation OAuth2 `authorization_code` + PKCE grant. Supabase Auth is NOT used as the identity provider; Supabase only stores the `qf_sessions` row keyed by an HTTP-only cookie.
- **PKCE:** A fresh `code_verifier` (43–128 chars, RFC 7636 unreserved alphabet) and `state` (32 bytes, base64url) are generated per sign-in attempt and stored in an HTTP-only, `SameSite=Lax`, `Secure` cookie named `qf_oauth_tx` with a 10-minute TTL. The cookie is deleted on callback whether the exchange succeeded or failed.
- **Callback validation:** The `state` query param must strictly equal the value stored in `qf_oauth_tx`. On mismatch the handler returns `400 INVALID_STATE` and writes nothing to the database.
- **Token storage:** `access_token` and `refresh_token` are written to `qf_sessions` after being encrypted with `pgp_sym_encrypt` using the `QF_TOKEN_ENCRYPTION_KEY` secret (per shared Security rules in spec.md). Plaintext tokens never leave the route handler.
- **Session cookie:** On successful callback a `qf_session` cookie (HTTP-only, `SameSite=Lax`, `Secure`, `Max-Age=60*60*24*30`) is set. Its value is the `qf_sessions.id` (UUID v4).
- **Onboarding resumption:** If a signed-in user has `users.translation_id IS NULL` they are routed to `/onboarding/preferences`; otherwise to `/today` (or `/today/reflect` if the morning mission for today is already committed — cross-story branching handled by the landing router).
- **Preferences persistence:** `POST /api/onboarding/preferences` writes `translation_id`, `morning_time`, `evening_time` to `users`, and simultaneously mirrors those preferences to QF `POST /preferences` (sitemap `add-or-update-preference`; confirmed scope: `preference`) under keys `default_translation_id`, `morning_reminder_local`, and `evening_reminder_local`. If the QF mirror call fails, local state is kept and the client sees a 200 with `{ ok: true, mirrored: false, reason: "QF_PREFERENCES_UNAVAILABLE" }` — user is not blocked.
- **Demo mode:** `POST /api/demo/start` creates a Supabase `users` row with `is_demo = true`, `qf_user_id = "demo-" || uuid`, no QF token, and triggers the demo seed via `scripts/seed-demo.ts` (stub for this story — the real seeder belongs to `spec-content-corpus.md`). A `qf_session` cookie is issued against a synthetic `qf_sessions` row with empty token fields.
- **Atomicity:** The callback creates-or-updates the `users` row AND inserts the `qf_sessions` row in a single Supabase transaction. On any failure, both are rolled back and the caller sees `500 SESSION_CREATE_FAILED`.
- **Idempotency:** Repeating `GET /api/auth/callback` with the same `code` (e.g., user refreshes the redirect target) is safe: the QF token endpoint will reject the second exchange with `invalid_grant`; our handler surfaces `400 CODE_EXPIRED` and the user is redirected back to `/api/auth/start` for a fresh authorize cycle. `POST /api/onboarding/preferences` is idempotent: repeated calls with identical body produce the same final row and `{ ok: true }`.

### Validation & Business Rules

- `translation_id` must be one of the QF-supported translation IDs currently whitelisted in `lib/qf/translations.ts` (`131` = The Clear Quran, `20` = Sahih International, `19` = Pickthall). Other values → `400 INVALID_TRANSLATION`.
- `morning_time` and `evening_time` must each match `^([01]\d|2[0-3]):[0-5]\d$` (24-hour `HH:MM`). Invalid → `400 INVALID_TIME_FORMAT`.
- Difference between `evening_time` and `morning_time` must be `>= 120` minutes and `morning_time < evening_time` (same-day compare). Violation → `400 TIMES_TOO_CLOSE` or `400 MORNING_AFTER_EVENING`.
- `state` in `qf_oauth_tx` cookie must exist and match the callback query exactly; otherwise `400 INVALID_STATE`.
- Demo account creation is rate-limited to 5 per IP per hour (Vercel Edge middleware). Exceed → `429 DEMO_RATE_LIMIT`.

## Permissions & Security

- **Scope:** Public (unauthenticated) — these endpoints bootstrap the session. `GET /api/auth/start`, `GET /api/auth/callback`, `POST /api/demo/start` are reachable without a cookie. `POST /api/onboarding/preferences` and `POST /api/auth/signout` require a valid `qf_session` cookie.
- **Authorization:** `POST /api/onboarding/preferences` enforces RLS — the session's `users.id` is the only row the handler may update. Supabase RLS policy `users_self_update` enforces `auth_uid() = id` where `auth_uid()` is derived from the session cookie via `lib/session.ts`.
- **Input validation:** All bodies parsed by a Zod schema in `lib/validation/onboarding.ts`. Max body size 1 KB. Query strings validated against Zod too; unexpected params are rejected with `400 BAD_REQUEST`.
- **Cookies:** `qf_oauth_tx` and `qf_session` are HTTP-only, `Secure`, `SameSite=Lax`, `Path=/`. No token value is ever returned in a response body or URL.
- **Tokens at rest:** Encrypted with `pgp_sym_encrypt(..., current_setting('app.token_key'))`. Key is loaded from `QF_TOKEN_ENCRYPTION_KEY` env var at connection time. Rotation procedure documented in `docs/ops/key-rotation.md` (out of scope for this story).
- **PKCE parameters:** `code_verifier` is 64 bytes of `crypto.randomBytes` base64url-encoded; `code_challenge = BASE64URL(SHA256(verifier))`; `code_challenge_method = S256` (RFC 7636).

## API Design

All routes live under the own-app domain (e.g., `https://ayah-apply.vercel.app`). Routes consuming QF APIs do so server-side through `lib/qf/oauth.ts`.

### `GET /api/auth/start`

Initiates the QF authorize redirect. Pure GET, no body.

**Response:** `302 Found`

```
Set-Cookie: qf_oauth_tx=eyJzIjoiQzh3...; Max-Age=600; HttpOnly; Secure; SameSite=Lax; Path=/
Location: https://oauth2.quran.foundation/authorize?response_type=code&client_id=qf_hack_2026_xyz&redirect_uri=https%3A%2F%2Fayah-apply.vercel.app%2Fapi%2Fauth%2Fcallback&scope=user&code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM&code_challenge_method=S256&state=Xr4T_1W2p7-N6xVb0mYq8g
```

(QF authorize path confirmed: `https://oauth2.quran.foundation/oauth2/auth` — from QF docs and `lib/qf/oauth.ts` `buildAuthorizeUrl`.)

**Errors:**

| Status | Code                       | Condition                                           |
| ------ | -------------------------- | --------------------------------------------------- |
| 500    | `PKCE_GENERATION_FAILED`   | `crypto.randomBytes` failed (should be unreachable) |
| 503    | `QF_AUTHORIZE_UNREACHABLE` | Pre-flight TCP check to QF host failed              |

### `GET /api/auth/callback?code=...&state=...`

Exchanges the authorization code for tokens and establishes the session.

**Request (query string example):**

```
/api/auth/callback?code=ac_01HN3K5...&state=Xr4T_1W2p7-N6xVb0mYq8g
```

**Response (302):**

```
Set-Cookie: qf_session=7a2e9b4c-33f1-4a21-9c5d-1d0e2f8a4c11; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax; Path=/
Set-Cookie: qf_oauth_tx=; Max-Age=0; Path=/   (cleared)
Location: /onboarding/preferences
```

If the `users` row already has a `translation_id` (returning user), the Location is `/today` instead.

**Errors:**

| Status | Code                       | Condition                                                               |
| ------ | -------------------------- | ----------------------------------------------------------------------- |
| 400    | `INVALID_STATE`            | `state` query param does not match `qf_oauth_tx` cookie                 |
| 400    | `MISSING_TX_COOKIE`        | `qf_oauth_tx` cookie absent or expired (user bookmarked callback URL)   |
| 400    | `CODE_EXPIRED`             | QF token endpoint returned `invalid_grant`                              |
| 400    | `ACCESS_DENIED`            | User cancelled on QF consent screen (`error=access_denied` query param) |
| 502    | `QF_TOKEN_EXCHANGE_FAILED` | QF token endpoint returned 5xx or non-JSON                              |
| 500    | `SESSION_CREATE_FAILED`    | DB insert of `users`/`qf_sessions` failed; rolled back                  |

### `POST /api/onboarding/preferences`

Persists translation + notification-time preferences. Requires `qf_session` cookie.

**Request:**

```json
{
  "translation_id": "131",
  "morning_time": "08:00",
  "evening_time": "21:00"
}
```

**Response (200):**

```json
{
  "ok": true,
  "mirrored": true,
  "redirect": "/today"
}
```

**Alternate response when QF mirror fails but local succeeds (still 200):**

```json
{
  "ok": true,
  "mirrored": false,
  "reason": "QF_PREFERENCES_UNAVAILABLE",
  "redirect": "/today"
}
```

**Errors:**

| Status | Code                       | Condition                                                            |
| ------ | -------------------------- | -------------------------------------------------------------------- |
| 400    | `INVALID_TRANSLATION`      | `translation_id` not in whitelist (`131`/`20`/`19`)                  |
| 400    | `INVALID_TIME_FORMAT`      | `morning_time` or `evening_time` not `HH:MM`                         |
| 400    | `TIMES_TOO_CLOSE`          | `evening_time - morning_time < 120 minutes`                          |
| 400    | `MORNING_AFTER_EVENING`    | `morning_time >= evening_time`                                       |
| 401    | `NO_SESSION`               | `qf_session` cookie missing or expired                               |
| 403    | `DEMO_ACCOUNT_READ_ONLY`   | Demo accounts cannot mutate preferences (no real QF token to mirror) |
| 500    | `PREFERENCES_WRITE_FAILED` | DB transaction failed                                                |

### `POST /api/demo/start`

Creates a demo account and seeds a 7-day grove.

**Request:** empty body.

**Response (200):**

```json
{
  "redirect": "/grove",
  "demo_user_id": "demo-0b3d1f2e-9a14-4c2b-8d35-7e1a22c43f90"
}
```

Also sets `qf_session` cookie as in `/api/auth/callback`.

**Errors:**

| Status | Code               | Condition                                        |
| ------ | ------------------ | ------------------------------------------------ |
| 429    | `DEMO_RATE_LIMIT`  | More than 5 demo accounts from same IP in 1 hour |
| 500    | `DEMO_SEED_FAILED` | `scripts/seed-demo.ts` threw; rolled back        |

### `POST /api/auth/signout`

Clears the session.

**Request:** empty body. Requires `qf_session` cookie.

**Response (200):**

```json
{ "ok": true }
```

```
Set-Cookie: qf_session=; Max-Age=0; Path=/
```

The matching `qf_sessions` row is deleted. If the cookie is absent we still return 200 (idempotent sign-out).

## Data Model & Migrations

> The `users` and `qf_sessions` tables, plus RLS framework, are defined in [spec.md → Data model](spec.md#data-model-shared--supabase-postgres). This story adds three onboarding-specific columns to `users` and does NOT introduce new tables.

### Modified Table: `users` — add three columns

| Field          | Type | Constraints                                 | Description                      |
| -------------- | ---- | ------------------------------------------- | -------------------------------- | --------------------------------------------------------------- |
| translation_id | text | NULL allowed (null = onboarding incomplete) | Whitelisted: `131` / `20` / `19` |
| morning_time   | text | CHECK `~ '^([01]\d                          | 2[0-3]):[0-5]\d$'`               | Local clock string, 24h HH:MM. Default `'08:00'` on first save. |
| evening_time   | text | CHECK `~ '^([01]\d                          | 2[0-3]):[0-5]\d$'`               | Local clock string, 24h HH:MM. Default `'21:00'` on first save. |

Check constraint (table-level): `CHECK (morning_time IS NULL OR evening_time IS NULL OR (morning_time < evening_time))`. The 120-minute gap rule is enforced in app code, not DB (cheap string compare is not enough for minute arithmetic; a trigger would be overkill for the submission).

### Migration File: `supabase/migrations/0001_initial.sql`

This story contributes to the single epic-wide migration. The onboarding-specific additions:

```sql
ALTER TABLE users
  ADD COLUMN translation_id text,
  ADD COLUMN morning_time   text,
  ADD COLUMN evening_time   text,
  ADD CONSTRAINT users_morning_time_fmt  CHECK (morning_time  IS NULL OR morning_time  ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  ADD CONSTRAINT users_evening_time_fmt  CHECK (evening_time  IS NULL OR evening_time  ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  ADD CONSTRAINT users_times_ordered     CHECK (morning_time IS NULL OR evening_time IS NULL OR morning_time < evening_time);
```

### RLS

- Policy `users_self_select` — `SELECT` allowed where `id = current_setting('app.user_id')::uuid`.
- Policy `users_self_update` — `UPDATE` allowed where `id = current_setting('app.user_id')::uuid`. Column list restricted to `translation_id, morning_time, evening_time, display_name`.
- Policy `qf_sessions_self_all` — full CRUD scoped to `user_id = current_setting('app.user_id')::uuid`. Service-role key (used only by `app/api/auth/callback/route.ts`) bypasses RLS to insert the initial row before a session exists.

### Migration Notes

- Columns are nullable so existing (none at launch) rows remain valid; the app treats `translation_id IS NULL` as "onboarding incomplete" and routes accordingly.
- Backfill: n/a (greenfield).
- Downtime: none — pure `ALTER TABLE ADD COLUMN` + constraints, all online for Postgres 15.

## UI/Frontend Requirements

### Components

**`WelcomeSplash`** — `app/(marketing)/page.tsx`

- **Type:** New
- **Purpose:** The first-open screen with the three CTAs ("Get started", "I already have an account", "Try with sample data"). Server component; CTAs are `<Link>` + `<form action>` elements so no client bundle is needed.
- **Props:** none (reads nothing from server beyond env).
- **shadcn/ui:** `Button` (variant `default` for primary, `outline` for secondary, `ghost` for demo), `Card`.

**`HowItWorksStep`** — `app/(marketing)/how-it-works/page.tsx`

- **Type:** New
- **Purpose:** Second welcome screen explaining the daily loop.
- **Props:** none.
- **shadcn/ui:** `Card`, `Button`.

**`PreferencesStep`** — `app/(app)/onboarding/preferences/page.tsx` + `PreferencesForm.tsx` (client component)

- **Type:** New
- **Purpose:** Collects translation + morning/evening times, POSTs to `/api/onboarding/preferences`.
- **Props:**
  ```typescript
  interface PreferencesFormProps {
    defaults: {
      translationId: "131" | "20" | "19";
      morningTime: string; // "HH:MM"
      eveningTime: string; // "HH:MM"
    };
    availableTranslations: Array<{ id: "131" | "20" | "19"; label: string }>;
  }
  ```

**`TranslationPicker`** — `app/(app)/onboarding/_components/TranslationPicker.tsx`

- **Type:** New
- **Purpose:** Radio-group over the three whitelisted translations.
- **Props:**
  ```typescript
  interface TranslationPickerProps {
    value: "131" | "20" | "19";
    onChange: (next: "131" | "20" | "19") => void;
    options: Array<{ id: "131" | "20" | "19"; label: string; author: string }>;
  }
  ```
- **shadcn/ui:** `RadioGroup`, `Label`, `Card`.

**`NotificationTimePicker`** — `app/(app)/onboarding/_components/NotificationTimePicker.tsx`

- **Type:** New
- **Purpose:** HH:MM picker using native `<input type="time">` wrapped in shadcn styles; accessible on iOS and Android.
- **Props:**
  ```typescript
  interface NotificationTimePickerProps {
    label: "Morning" | "Evening";
    value: string; // "HH:MM"
    onChange: (next: string) => void;
    min?: string; // for evening: morning + 02:00
    max?: string; // for morning: evening - 02:00
    error?: string | null;
  }
  ```
- **shadcn/ui:** `Input` (type="time"), `Label`.

### User Interactions

- Tap "Get started" on `WelcomeSplash` → navigate to `/how-it-works`.
- Tap "Continue" on `HowItWorksStep` → navigate to `/api/auth/start` (full redirect, not client nav).
- Tap "I already have an account" on `WelcomeSplash` → navigate to `/api/auth/start`.
- Tap "Try with sample data" on `WelcomeSplash` → `fetch('/api/demo/start', { method: 'POST' })` then `router.push(res.redirect)`.
- On `PreferencesStep`, adjusting morning time auto-updates the `min` bound of evening (morning + 02:00); same for evening→morning `max`.
- Submitting `PreferencesStep` → `fetch('/api/onboarding/preferences', ...)` then `router.push('/today')`.

### States

- **Loading:** `PreferencesStep` shows a spinner-in-button during submit; the form is disabled but values are preserved. After 10s we show "Still working...".
- **Empty:** n/a — all three fields have sensible defaults.
- **Error:** Field-level errors appear under each field with the returned error code translated to a plain-language message (e.g., `TIMES_TOO_CLOSE` → "Morning and evening reminders must be at least two hours apart."). Transport errors (network / 5xx) show a single top-of-form banner with a "Try again" action.

## Architecture Notes

- **New dependencies:** as per epic — no additional npm packages beyond what `spec.md` already lists (`next-pwa`, `web-push`, `@supabase/supabase-js`, `zod`, `shadcn/ui`). PKCE generation uses Node's built-in `crypto` module.
- **Dependencies & integration:**
  - Integrates with QF OAuth2 authorize (`https://oauth2.quran.foundation/oauth2/auth`) and QF OAuth2 token endpoint (`https://oauth2.quran.foundation/oauth2/token`). Both confirmed in `lib/qf/oauth.ts`.
  - Integrates with QF User Preferences API: `POST /preferences` (sitemap `add-or-update-preference`, scope `preference`) to mirror translation/notification-time choices.
  - Downstream: every other story depends on `lib/session.ts` established here.

## Exemplar Files

Greenfield — there are no in-repo exemplars. Follow these external references:

- **Next.js auth cookbook** — `https://nextjs.org/docs/app/building-your-application/authentication` — shape of App Router session handling, HTTP-only cookies, route handler auth patterns.
- **RFC 7636 (PKCE)** — `https://www.rfc-editor.org/rfc/rfc7636` — exact `code_verifier` / `code_challenge` construction; `S256` method definition.
- **Auth0 Authorization Code + PKCE** — `https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-proof-key-for-code-exchange-pkce` — reference sequence diagram; use as shape template, not wire-compatible.

## Implementation Plan

### Sub-tasks

**Task 1: Supabase migration — `users`, `qf_sessions`, encryption helpers** — _medium_

- Files: `supabase/migrations/0001_initial.sql`, `lib/db/client.ts`
- Includes `CREATE EXTENSION IF NOT EXISTS pgcrypto`, the `users` and `qf_sessions` tables (per `spec.md`), the three onboarding columns above, RLS policies, and an `app.token_key` setting hook loaded from env.
- INDEPENDENT

**Task 2: `lib/qf/oauth.ts` — PKCE + token helpers** — _medium_

- Files: `lib/qf/oauth.ts`, `lib/qf/oauth.test.ts`
- Exports: `generatePkcePair()`, `buildAuthorizeUrl(opts)`, `exchangeCodeForTokens({code, verifier})`, `refreshAccessToken(refreshToken)`. Uses `fetch` against `https://oauth2.quran.foundation/oauth2/token` (confirmed in `lib/qf/oauth.ts`).
- INDEPENDENT

**Task 3: `app/api/auth/*` route handlers** — _medium_

- Files: `app/api/auth/start/route.ts`, `app/api/auth/callback/route.ts`, `app/api/auth/signout/route.ts`
- Implements the three endpoints per API Design section, including `qf_oauth_tx` cookie handling and session transaction.
- SEQUENTIAL (depends on Task 2)

**Task 4: `lib/session.ts` + session middleware** — _small_

- Files: `lib/session.ts`, `middleware.ts`
- `getSession(req)` reads `qf_session` cookie, looks up `qf_sessions`, returns `{ userId, accessToken, isDemo }` or `null`. Middleware sets `app.user_id` on the Supabase client for RLS.
- SEQUENTIAL (depends on Tasks 1 and 3)

**Task 5: Welcome + onboarding UI** — _medium_

- Files: `app/(marketing)/page.tsx`, `app/(marketing)/how-it-works/page.tsx`, `app/(app)/onboarding/preferences/page.tsx`, `app/(app)/onboarding/_components/PreferencesForm.tsx`, `app/(app)/onboarding/_components/TranslationPicker.tsx`, `app/(app)/onboarding/_components/NotificationTimePicker.tsx`
- Wire all interactions per UI section. shadcn/ui components scaffolded via `npx shadcn@latest add button card radio-group input label`.
- SEQUENTIAL (depends on Task 4)

**Task 6: `POST /api/onboarding/preferences` + QF Preferences mirror** — _small_

- Files: `app/api/onboarding/preferences/route.ts`, `lib/qf/user.ts` (add `upsertPreference`), `lib/validation/onboarding.ts`
- Validates body via Zod, writes to `users`, mirrors to QF `POST /preferences` (scope `preference`), returns per spec.
- SEQUENTIAL (depends on Task 5)

**Task 7: `POST /api/demo/start` — demo account + stub seeder** — _small_

- Files: `app/api/demo/start/route.ts`, `scripts/seed-demo.ts` (stub that creates minimal placeholder grove data; real seed is in `spec-content-corpus.md`)
- SEQUENTIAL (depends on Task 4)

### Negative Constraints

- Do NOT roll custom OAuth token handling outside `lib/qf/oauth.ts` and the `app/api/auth/*` route handlers (inherited from spec.md).
- Do NOT invent QF endpoint paths — use only the confirmed paths from `lib/qf/oauth.ts` and the epic's Shared Architecture Notes (`/oauth2/authorize`, `/oauth2/token`, `POST /preferences`).
- Do NOT use Supabase Auth as the identity provider; it is strictly the session/cookie store.
- Do NOT store tokens in `localStorage`, `sessionStorage`, or any non-HTTP-only cookie.
- Do NOT implement the demo seed's full 7-day grove in this story — only the entry point and stub (real seed lives in `spec-content-corpus.md`).
- Do NOT add prayer-time-based notification scheduling here (deferred per epic).

## Test Scenarios

**Test 1: Happy-path sign-up completes and lands on today's ayah**

- Setup: no existing `users` row; QF authorize stubbed to return `code=ac_test_001&state=<echoed>`; QF token endpoint stubbed to return `{access_token: "at_1", refresh_token: "rt_1", expires_in: 3600}`; QF userinfo stubbed to return `{sub: "qf_user_42", email: "aisha@example.com", name: "Aisha Rahman"}`; QF `POST /preferences` stubbed to return 200.
- Action:
  1. `GET /api/auth/start` → assert 302 to QF authorize with `state` and `code_challenge`; assert `qf_oauth_tx` cookie set.
  2. `GET /api/auth/callback?code=ac_test_001&state=<cookie_state>` → assert `qf_session` cookie set, assert `users` row created with `qf_user_id='qf_user_42'` and `translation_id IS NULL`; assert 302 to `/onboarding/preferences`.
  3. `POST /api/onboarding/preferences` body `{translation_id:"131", morning_time:"08:00", evening_time:"21:00"}` → expect `200 {ok:true, mirrored:true, redirect:"/today"}`.
- Expected: all three steps pass; `qf_sessions` row exists with encrypted tokens; `users.translation_id='131'`.

**Test 2: Invalid state on callback**

- Setup: `qf_oauth_tx` cookie contains `state=AAA`.
- Action: `GET /api/auth/callback?code=ac_test_002&state=BBB`.
- Expected: `400 INVALID_STATE "OAuth state mismatch; restart sign-in"`. No `users` row created. No `qf_sessions` row. `qf_oauth_tx` cookie cleared.

**Test 3: Expired authorization code**

- Setup: QF token endpoint stubbed to return `400 {error:"invalid_grant"}`. `qf_oauth_tx` state matches.
- Action: `GET /api/auth/callback?code=ac_expired&state=<cookie_state>`.
- Expected: `400 CODE_EXPIRED "Authorization code expired or already used; please sign in again"`. Zero DB writes. User can re-trigger `/api/auth/start` successfully afterward (idempotent).

**Test 4: Preferences validation — times too close**

- Setup: signed-in user, `users.translation_id IS NULL`.
- Action: `POST /api/onboarding/preferences` body `{translation_id:"131", morning_time:"08:00", evening_time:"08:00"}`.
- Expected: `400 TIMES_TOO_CLOSE "Morning and evening reminders must be at least two hours apart"`. `users.translation_id` remains null.

**Test 5: QF Preferences mirror failure — local still succeeds**

- Setup: signed-in user. QF `POST /preferences` stubbed to return `503`.
- Action: `POST /api/onboarding/preferences` body `{translation_id:"20", morning_time:"06:30", evening_time:"22:15"}`.
- Expected: `200 {ok:true, mirrored:false, reason:"QF_PREFERENCES_UNAVAILABLE", redirect:"/today"}`. `users` row updated with the new values. No retry queued (judges' scope).

**Test 6: Demo account creation**

- Setup: no cookie, clean IP.
- Action: `POST /api/demo/start` empty body.
- Expected: `200 {redirect:"/grove", demo_user_id:"demo-<uuid>"}`. `users` row has `is_demo=true`, `qf_user_id` prefixed `demo-`. `qf_session` cookie set. No QF API calls made.

**Test 7: Demo rate limit**

- Setup: 5 demo accounts already created from IP `203.0.113.7` in the last hour.
- Action: `POST /api/demo/start` from same IP.
- Expected: `429 DEMO_RATE_LIMIT "Too many demo accounts from this address; try again in an hour"`. No `users` row created.

**Test 8: Sign-out is idempotent**

- Setup: valid `qf_session` cookie `sess_001`.
- Action: `POST /api/auth/signout` twice.
- Expected: First call `200 {ok:true}`, `qf_sessions` row deleted, cookie cleared. Second call `200 {ok:true}` (no cookie, no row — still success).

## Acceptance Criteria

- [ ] `GET /api/auth/start` returns 302 to QF authorize with a valid `code_challenge` (S256) and sets `qf_oauth_tx` cookie.
- [ ] `GET /api/auth/callback` rejects mismatched `state` with `400 INVALID_STATE` and writes nothing.
- [ ] `GET /api/auth/callback` with a valid code creates the `users` + `qf_sessions` rows in a single transaction and sets `qf_session` cookie.
- [ ] `POST /api/onboarding/preferences` persists all three fields locally and mirrors to QF `POST /preferences` when reachable.
- [ ] QF Preferences mirror failures do NOT block the user — response is `200 {ok:true, mirrored:false}`.
- [ ] `POST /api/demo/start` creates a demo account with `is_demo=true` and no QF tokens.
- [ ] All tokens at rest in `qf_sessions` are encrypted (plaintext must not round-trip through logs).
- [ ] No token ever appears in a response body, URL, or non-HTTP-only cookie.
- [ ] RLS prevents user A from reading user B's `users` or `qf_sessions` row.
- [ ] No `any` types, no lint warnings, no type errors.
- [ ] All 8 Test Scenarios pass in Vitest.

## Verification

Run the verifier skill to confirm changes are clean.

### Backend API Tests (Vitest)

Create/modify these test files:

- `tests/unit/lib/qf/oauth.test.ts` — PKCE pair generation (RFC 7636 compliance: verifier length, base64url charset, challenge = SHA256(verifier) base64url); `exchangeCodeForTokens` happy path + `invalid_grant` branch.
- `tests/unit/lib/session.test.ts` — cookie parsing, session lookup, demo session detection.
- `tests/unit/lib/validation/onboarding.test.ts` — Zod schema accepts valid bodies and rejects each of the 5 error codes.
- `tests/integration/api/auth/callback.test.ts` — Tests 1–3 above, using `@supabase/supabase-js` against a local Supabase container and `undici`-mocked QF host.
- `tests/integration/api/onboarding/preferences.test.ts` — Tests 4 and 5 above.
- `tests/integration/api/demo/start.test.ts` — Tests 6 and 7 above.
- `tests/integration/api/auth/signout.test.ts` — Test 8 above.

Pattern: each integration test wraps the route handler with `new Request(...)` and asserts `Response` status, headers (including `Set-Cookie` fields), and body JSON. Seed Supabase from `supabase/migrations/0001_initial.sql` before each suite.

### Browser/UI Testing

Preview URL: `https://ayah-apply-preview.vercel.app` (Vercel preview deployment per PR). Test Supabase credentials in 1Password vault `hackathon-qf`.

1. Open `/` in Chrome mobile emulation (iPhone 14 Pro, 390×844). Expected: three buttons visible without scroll, "Get started" is the first focusable element.
2. Tap "Get started" → "Continue" → QF authorize page loads. Sign in with the sandbox test account `hackathon+test1@quran.foundation`. Expected: redirect to `/onboarding/preferences`.
3. On `/onboarding/preferences`, leave all defaults; tap "Start my first day". Expected: land on `/today` within 1.5s.
4. Re-run step 2 with a fresh incognito profile; on preferences, pick Sahih International + morning 06:30 + evening 22:15; submit. Expected: lands on `/today`; `users.translation_id=20`.
5. From a fresh incognito, tap "Try with sample data". Expected: land on `/grove`; page shows seven tree placeholders; a "Demo mode" badge is visible.
6. Desktop viewport (1440×900): re-run step 2. Expected: layout fills but does not stretch; max content width 720px.

### E2E Tests (Playwright)

| Key Scenario                                                                      | Test file                                         | Assigned sub-task |
| --------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------- |
| Brand-new user completes onboarding with all defaults                             | `tests/e2e/onboarding-happy-path.spec.ts`         | Task 6            |
| Brand-new user customises translation and notification times                      | `tests/e2e/onboarding-custom-prefs.spec.ts`       | Task 6            |
| Returning user who has not yet committed today signs in and lands on today's ayah | `tests/e2e/onboarding-returning-morning.spec.ts`  | Task 5            |
| Returning user who already committed today lands on the evening reflection        | `tests/e2e/onboarding-returning-evening.spec.ts`  | Task 5            |
| Judge enters demo mode from the welcome screen                                    | `tests/e2e/onboarding-demo-mode.spec.ts`          | Task 7            |
| User abandons onboarding partway and resumes at the step they left                | `tests/e2e/onboarding-resume.spec.ts`             | Task 5            |
| Returning user enters wrong password                                              | `tests/e2e/onboarding-wrong-password.spec.ts`     | Task 3            |
| Sign-up fails because the device has lost its internet connection                 | `tests/e2e/onboarding-offline.spec.ts`            | Task 3            |
| Quran Foundation authentication service is temporarily unavailable                | `tests/e2e/onboarding-qf-down.spec.ts`            | Task 3            |
| Preference inputs are validated before onboarding completes                       | `tests/e2e/onboarding-prefs-validation.spec.ts`   | Task 6            |
| Translation picker accepts any supported translation                              | `tests/e2e/onboarding-translation-picker.spec.ts` | Task 6            |

**Locator strategies:**

- Prefer ARIA roles and accessible names: `page.getByRole('button', { name: 'Get started' })`, `page.getByRole('radio', { name: /Sahih International/ })`.
- For the time pickers use `page.getByLabel('Morning reminder')` and `page.getByLabel('Evening reminder')`.
- Only use `data-testid` where roles are ambiguous: `data-testid="demo-mode-badge"` on the demo-mode indicator, `data-testid="preferences-submit"` on the final CTA.
- QF OAuth pages are treated as third-party — tests use a mocked QF stub (`tests/e2e/fixtures/qf-mock-server.ts`) to avoid flakes against live QF.
