# Notifications & Scheduling

**Ticket:** TBD
**Discovery Brief:** `docs/discovery/quran-ayah-apply/brief.md`
**Epic Overview:** `docs/specs/TBD-quran-ayah-apply/spec.md`

Two gentle, content-light push notifications per day — one in the morning to invite the user into today's ayah, and one in the evening to invite them to reflect on what happened — together with a settings screen where the user edits the times, switches translation, pauses notifications for a season of life, or signs out. This is the feature that keeps the two-touch daily loop alive without turning the app into a nagging streak machine.

## User Story

As a practicing Muslim building a daily habit of reading, acting on, and reflecting on one ayah, I want gentle reminders at times I choose and a simple place to adjust them so that the daily rhythm fits my real life and I can step away without being shamed.

## Background & Context

**Current state:**

- After onboarding, the user has selected a morning and an evening notification time. The morning loop surfaces today's ayah and a committed action; the evening loop collects the reflection that grows the tree.
- Without reminders, the two-touch loop depends entirely on the user remembering to open the app twice a day, which is exactly the breakdown that post-Ramadan Quran apps are known to suffer.
- Existing streak-based apps tend to either spam the user with alerts or punish missed days — both patterns work against the honesty-first design of this product.

**Problem:**

- The loop only produces behavioural change if the user actually returns in the evening. The discovery brief names this as the single riskiest product assumption.
- Preferences set during onboarding must be editable later, because users' schedules, translation preferences, and life circumstances change — travel, illness, Ramadan itself.
- Notifications must be respectful: never carry ayah content (privacy and the "open the app to meet the ayah" discipline), never fire when they are redundant, and must be pause-able without breaking anything else.

## Target User & Persona

- **Who:** A practicing, non-Arabic-speaking Muslim who has completed onboarding and has at least one day of active use behind them. They carry a phone all day; they have a recognisable morning routine and an evening wind-down.
- **Context:** Morning reminder lands in the first hour after waking; evening reminder lands after the day's obligations are mostly done. The user may be at work, with family, travelling, or observing a day off from technology.
- **Current workaround:** Calendar alarms, sticky notes on the fridge, or nothing at all — which is why the post-Ramadan drop-off happens.

## Goals

- Deliver the two reminders the daily loop depends on, at times the user chooses, in their local time.
- Make it effortless for the user to change times, switch translation, pause, or sign out without leaving the app.
- Never surprise the user: no redundant pushes, no ayah content in the notification payload, no alerts during a paused season.
- Degrade gracefully when the browser blocks notifications or doesn't support them, so the loop still works for users who open the app manually.

## Non-Goals

- Prayer-time-based scheduling (deferred — fixed user-set clock times only in the submission).
- Multiple reminder channels such as email or SMS.
- Changing the daily loop itself, the ayah, the mission, or the reflection — those belong to other stories.
- Adjusting the streak grace rules, which are owned by the evening-reflection and grove-home stories.

## User Workflow

1. **Morning arrives** — At the user's chosen morning time, a quiet push appears on their device with gentle, ayah-agnostic copy inviting them to spend a moment with today's ayah.
2. **Tapping the push** — The app opens directly to today's ayah screen, where the full morning loop takes over.
3. **Evening arrives** — At the user's chosen evening time, a second push appears inviting reflection on how the day went.
4. **Evening tap** — The app opens to the evening reflection screen.
5. **Adjusting preferences** — From the home screen's quiet menu, the user opens Settings and sees: morning time, evening time, translation, a pause toggle, and sign out.
6. **Editing a time** — The user picks a new time; a short confirmation note says the change will take effect on the next cycle. No notifications fire immediately.
7. **Pausing** — The user toggles pause; a gentle note frames this as a permitted concession (rukhsa) and confirms no pushes will fire until they turn it back on. The daily ayah is still waiting whenever they open the app.
8. **Permission edge** — If the user declined the browser's notification prompt during onboarding, the notifications section of Settings shows a clear, non-scolding message explaining that notifications are disabled in the browser and pointing to browser settings. The rest of Settings still works.
9. **Unsupported browser** — If the user's browser cannot deliver push notifications, Settings shows an explanatory note and no push attempts are made. The app remains fully usable when opened manually.
10. **Signing out** — The user taps Sign out; the app returns to the welcome screen and stops sending pushes to that device.

## Acceptance Criteria

### Background

```gherkin
Given Aisha has completed onboarding with these preferences
  | Preference           | Value                  |
  | Morning time         | 8:00 AM local          |
  | Evening time         | 9:00 PM local          |
  | Translation          | The Clear Quran        |
  | Notifications paused | No                     |
  | Time zone            | America/New_York       |
  And Aisha's browser has granted notification permission
  And today's ayah is available for Aisha
```

### Scenario: Default morning and evening reminders fire on a normal day

```gherkin
Given Aisha has not opened the app today before her morning time
  And she has not submitted an evening reflection today
When the clock reaches 8:00 AM in Aisha's local time
  And the clock later reaches 9:00 PM in Aisha's local time
Then at 8:00 AM Aisha receives a push with gentle copy such as "Your ayah is ready — spend a moment with it."
  And the push contains no ayah text, no translation, and no personal data
  And tapping the morning push opens the app to today's ayah screen
  And at 9:00 PM Aisha receives a push with copy such as "How did it go today? Reflect on your ayah."
  And tapping the evening push opens the app to the evening reflection screen
```

### Scenario: Morning push is suppressed when the user is already active that day

```gherkin
Given Aisha opens the app at 7:45 AM local time and views today's ayah
When the clock reaches 8:00 AM in Aisha's local time
Then no morning push is delivered to Aisha's device
  And the evening push at 9:00 PM is unaffected by the morning suppression
```

### Scenario: Evening push is suppressed when the reflection is already submitted

```gherkin
Given Aisha submitted her evening reflection at 6:10 PM local time
When the clock reaches 9:00 PM in Aisha's local time
Then no evening push is delivered to Aisha's device
  And the next morning's push at 8:00 AM is unaffected by the evening suppression
```

### Scenario: Editing the evening time takes effect on the next cycle

```gherkin
Given Aisha opens Settings at 3:00 PM local time
  And today's evening push has not yet fired
When Aisha changes her evening time from 9:00 PM to 10:30 PM
  And she confirms the change
Then Aisha sees a confirmation that the new time takes effect on the next cycle
  And tonight's evening push is delivered at 10:30 PM instead of 9:00 PM
  And no additional evening push is delivered at 9:00 PM
```

### Scenario: Same-day morning edit does not trigger a catch-up push

```gherkin
Given Yusuf has a morning time set to 8:00 AM
  And this morning's push already fired at 8:00 AM
  And Yusuf has not yet opened the app today
When Yusuf opens Settings at 10:15 AM and changes his morning time to 7:00 AM
Then no additional morning push fires today
  And Yusuf sees a confirmation that the new 7:00 AM time starts tomorrow
  And tomorrow's morning push is delivered at 7:00 AM local time
```

### Scenario: Pausing notifications suppresses all future pushes without breaking the loop

```gherkin
Given Fatima is travelling for a week and opens Settings
When Fatima toggles "Pause notifications" on
Then Fatima sees a gentle confirmation framed as a permitted concession (rukhsa)
  And no morning push is delivered at her 8:00 AM time the next day
  And no evening push is delivered at her 9:00 PM time the next day
  And when Fatima opens the app the next day, today's ayah is waiting for her as normal
  And when Fatima toggles pause back off, the following day's reminders resume at her chosen times
```

### Scenario: Browser notification permission was denied during onboarding

```gherkin
Given Ibrahim denied the browser's notification prompt during onboarding
When Ibrahim opens Settings
Then Ibrahim sees a clear, non-scolding message saying notifications are disabled in his browser
  And the message explains he can enable them in browser settings
  And no push attempts are made for Ibrahim
  And Ibrahim can still change translation, morning and evening times, pause, and sign out
  And the daily ayah is still available whenever Ibrahim opens the app
```

### Scenario: Browser does not support push notifications at all

```gherkin
Given Hanaa is using an older browser that cannot deliver push notifications
When Hanaa opens Settings
Then Hanaa sees an explanatory note that her browser does not support push reminders
  And no push attempts are made for Hanaa
  And Hanaa can still change translation, morning and evening times, and sign out
  And the daily loop still works whenever Hanaa opens the app manually
```

### Scenario: Time zone change follows the device's local time

```gherkin
Given Omar's device was set to America/New_York with a morning time of 8:00 AM and evening time of 9:00 PM
  And Omar flies to London and his device is now set to Europe/London
When the clock reaches 8:00 AM in Europe/London local time the next day
  And the clock later reaches 9:00 PM in Europe/London local time
Then Omar's morning push is delivered at 8:00 AM London time, not 8:00 AM New York time
  And Omar's evening push is delivered at 9:00 PM London time
  And Omar is not required to change any setting to make this work
```

### Scenario: Changing translation preference from Settings

```gherkin
Given Aisha's current translation preference is "The Clear Quran"
When Aisha opens Settings and changes her translation to "Sahih International"
  And she confirms the change
Then Aisha sees a confirmation that her translation preference is saved
  And the next ayah screen Aisha opens shows the translation text from Sahih International
  And future days' ayah screens continue to show Sahih International until she changes it again
```

### Scenario Outline: Editing morning or evening time to any valid local time

```gherkin
Given <user> is signed in with morning time <oldMorning> and evening time <oldEvening>
When <user> opens Settings and updates the times to <newMorning> and <newEvening>
  And confirms the changes
Then <user> sees a confirmation that the new times take effect on the next cycle
  And the next scheduled morning push is at <newMorning> local time
  And the next scheduled evening push is at <newEvening> local time

Examples:
  | user   | oldMorning | oldEvening | newMorning | newEvening |
  | Aisha  | 8:00 AM    | 9:00 PM    | 7:15 AM    | 10:00 PM   |
  | Yusuf  | 8:00 AM    | 9:00 PM    | 6:30 AM    | 11:15 PM   |
  | Fatima | 9:00 AM    | 10:00 PM   | 8:00 AM    | 9:30 PM    |
```

### Scenario: Signing out from Settings

```gherkin
Given Ibrahim is signed in and has active notification reminders at 8:00 AM and 9:00 PM
When Ibrahim opens Settings and taps Sign out
Then Ibrahim is returned to the welcome screen
  And no further morning or evening pushes are delivered to that device for Ibrahim's account
  And if someone else signs in on the same device, their own reminder times take effect instead
```

### Scenario: First reminder after onboarding uses the times chosen during onboarding

```gherkin
Given Maryam completed onboarding yesterday evening with morning time 7:30 AM and evening time 10:00 PM
  And Maryam has not opened the app yet today
When the clock reaches 7:30 AM in Maryam's local time
  And the clock later reaches 10:00 PM in Maryam's local time
Then Maryam receives a morning push at 7:30 AM
  And Maryam receives an evening push at 10:00 PM
  And neither push contains ayah text or personal data
```

### Scenario: Evening push still fires when morning was skipped but the day is open

```gherkin
Given Yusuf never opened the app in the morning
  And Yusuf has not submitted an evening reflection today
When the clock reaches 9:00 PM in Yusuf's local time
Then Yusuf receives the evening push inviting reflection
  And tapping the push opens the app where today's ayah is still waiting
```

## Business Rules & Constraints

- **Two reminders per day, both user-set.** Exactly one morning and one evening reminder per user per day. Defaults are 8:00 AM and 9:00 PM local time, set during onboarding and editable any time from Settings.
- **Local time always.** All reminder times are interpreted in the device's current local time. Travelling across time zones shifts the reminders automatically on the next cycle.
- **Generic copy only.** Notification text is gentle and ayah-agnostic. It never contains the ayah, translation, tafsir, mission, reflection, or any personal data. The user must open the app to meet today's ayah.
- **Morning suppression rule.** If the user has already opened the app on the current calendar day before the scheduled morning time, the morning push is skipped.
- **Evening suppression rule.** If the user has already submitted today's evening reflection before the scheduled evening time, the evening push is skipped.
- **Next-cycle-only edits.** Changes to morning time, evening time, or translation take effect starting with the next scheduled cycle. No retroactive catch-up pushes, and no second push on the same day if the original time has already passed.
- **Pause is a concession, not a penalty.** When notifications are paused, no pushes fire; the daily ayah is still available and the loop still runs when the user opens the app manually. Toggling pause off resumes reminders on the next cycle.
- **Graceful degradation on permission denial.** If the browser has denied notification permission, Settings shows a clear explanation and a pointer to browser settings. All other preferences remain editable and the in-app loop remains fully functional.
- **Graceful degradation on unsupported browsers.** If the browser cannot receive push notifications at all, Settings says so and no push attempts are made. The rest of the product works unchanged.
- **Sign out stops notifications for that account on that device.** Signing out returns the user to the welcome screen and ends push delivery for their account on that device.
- **Translation choices available.** The Clear Quran (default), Sahih International, and Pickthall where supported, chosen from a simple list in Settings.

## Success Metrics

- **Evening return rate.** Percentage of users who, after receiving the evening push, open the app and submit a reflection within the evening window. Target: ≥60% by week two.
- **Morning open rate.** Percentage of delivered morning pushes that result in the app being opened within 30 minutes. Target: ≥50%.
- **Suppression correctness.** Observed rate of pushes fired when the user was already active before the scheduled time, or after they had already reflected. Target: 0 per user per week (pure-correctness metric).
- **Settings engagement.** At least 25% of pilot users edit their morning or evening time at least once in the first two weeks — a signal that the schedule fits real life.
- **Pause usage without churn.** Users who toggle pause on and then return to the app within 14 days: ≥70%. Ensures pause behaves as a healthy concession, not a leave-taking.

## Dependencies

- **Onboarding & account creation** — supplies the initial morning time, evening time, translation, and notification permission state. This story does not collect those for the first time; it only edits them.
- **Morning ayah & mission commit** — the screen the morning push opens to. Its "user opened the app today" signal drives the morning suppression rule.
- **Evening reflection & tree growth** — the screen the evening push opens to. Its "evening reflection submitted today" signal drives the evening suppression rule.
- **Grove home screen & cumulative view** — hosts the quiet menu entry point that leads into Settings.
- **Curated ayah corpus** — not a direct dependency, but reminders are only valuable when there is an ayah waiting on the other side of the tap.

## Open Questions

- [x] ~~Should notification copy reference the ayah to lift open rates?~~ — **Resolved:** No. Generic, ayah-agnostic copy protects privacy and preserves the "open the app to meet the ayah" discipline that anchors the loop.
- [x] ~~What happens if a user travels across time zones mid-day?~~ — **Resolved:** Reminders follow the device's local time automatically on the next cycle. No manual action required.
- [x] ~~Should a same-day edit fire a catch-up push if the original time has already passed?~~ — **Resolved:** No. Edits take effect on the next cycle only; this prevents surprise pushes and double-notifications.
- [x] ~~Does pausing notifications also pause the daily ayah?~~ — **Resolved:** No. Pause only stops pushes; the daily ayah is still waiting when the user opens the app manually. Framed as a Quranic concession (rukhsa), not a penalty.
- [x] ~~How should the permission-denied state be communicated?~~ — **Resolved:** A clear, non-scolding message in Settings explaining that notifications are disabled in the browser and pointing to browser settings. The rest of Settings remains fully functional.
- [ ] Exact wording of the morning and evening push copy — **Deferred (non-blocking):** Product-owner copy pass during the final polish days. Guard-rails are already fixed: gentle, ayah-agnostic, ≤ 80 characters.
- [ ] Whether to expose a 24-hour time format toggle in Settings — **Deferred (non-blocking):** Time picker format follows platform convention by default; an explicit toggle can be added later if pilot feedback asks for it.

---

## Technical Refinement

This section is appended during `/prd-refine`. Business content above is authoritative for _what_ we build; this section is authoritative for _how_. Where the two appear to conflict, raise the conflict — do not silently override the business content.

### Worked example (running through this section)

> Aisha onboards in New York on a Monday evening. She sets morning to **07:15** and evening to **22:00** in `America/New_York`. On Tuesday morning at 07:15 EST, a gentle push lands on her phone. On Wednesday she flies to London for work; her device now reports `Europe/London`. On Thursday morning her next push fires at **07:15 BST** (London local) without her touching any setting. Thursday evening, she submits her reflection at 20:40 BST — the 22:00 push is suppressed by the evening-suppression rule.

This example exercises: fresh subscription, time-zone recapture on app open, local-time scheduling, evening suppression.

### Functional Requirements

- **Morning push schedule.** Fires at the user's `users.morning_time` interpreted in `users.tz` (IANA, e.g., `America/New_York`). `users.tz` is captured on device at login from `Intl.DateTimeFormat().resolvedOptions().timeZone` and **updated on every app open** (cheap POST to `/api/settings` when the detected tz differs from the stored tz).
- **Evening push schedule.** Fires at `users.evening_time` interpreted in `users.tz`. Same tz-recapture rule applies.
- **Morning suppression.** Skip the morning push if the user has already opened the app on the current local calendar day before the scheduled morning time. "Opened" = any authenticated page view recorded as a `last_opened_at` touch on the `users` row (driven by a silent beacon from `app/(app)/layout.tsx`).
- **Evening suppression.** Skip the evening push if a `reflections` row exists with `submitted_at` on the current local calendar day for that user.
- **Pause state.** When `users.paused = true`, the dispatcher emits **no** pushes. Daily assignment (in `spec-morning-loop.md`) still runs on the next manual open — pause only gates the push transport, never the loop.
- **Permission denied / unsupported browser.** Graceful degradation: Settings renders a `PermissionStatus` block explaining the state; no subscribe attempts are made; the in-app loop remains fully functional. Detected via `Notification.permission` and the presence/absence of `'PushManager' in window`.
- **Next-cycle only.** Edits to `morning_time` / `evening_time` take effect on the next scheduled cycle. No catch-up push if the original time has already passed today (business-rule parity).
- **Atomicity.** A settings save is a single transaction over the `users` row; if the downstream QF `POST /preferences` mirror call fails, the local save still commits (QF mirror is best-effort and retried on next save).
- **Idempotency.** `POST /api/push/subscribe` with the same `endpoint` for the same user is a no-op upsert — never creates a duplicate row (enforced by `UNIQUE(user_id, endpoint)`).

### Validation & Business Rules

- `morning_time`, `evening_time` must match `^([01]\d|2[0-3]):[0-5]\d$` (HH:MM 24h). Reject with `400 INVALID_TIME`.
- `morning_time` must be strictly before `evening_time` in the same local day. Reject with `400 TIME_ORDER`.
- `translation_id` must be one of the whitelisted ids (Clear Quran `131`, Sahih International `20`, Pickthall `19` — resolved from `GET /translations` at build time). Reject with `400 UNKNOWN_TRANSLATION`.
- `tz` must be a valid IANA zone — validated by round-tripping through `Intl.DateTimeFormat(undefined, { timeZone: tz })`. Reject with `400 INVALID_TZ`.
- `paused` is a boolean.

### Permissions & Security

- **Scope:** All endpoints in this story require an authenticated session (Supabase `qf_sessions` cookie resolves to a `users.id`).
- **Cron endpoint.** `GET /api/cron/push-dispatch` is protected by the `CRON_SECRET` header check — Vercel Cron sends a bearer token; unauthenticated calls return `401`. Not exposed in `app/(app)/`.
- **Subscription storage.** `push_subscriptions` is keyed to `user_id` with RLS restricting SELECT/DELETE to the owner. The cron dispatcher runs with the service-role key (bypasses RLS) — this is the only place we bypass RLS in the notifications story.
- **Payload contents.** Push payloads contain **only** generic, ayah-agnostic copy and a destination path (`/today` or `/today#reflect`). **No ayah text, no translation, no user name, no email, no verse key, no reflection text.** This is both a privacy rule and the "open the app to meet the ayah" UX discipline (see Negative Constraints below).
- **VAPID.** `VAPID_PRIVATE_KEY` is a Vercel server-only env var; `VAPID_PUBLIC_KEY` is exposed client-side as `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (by design — public key is public).

### API Design

#### `POST /api/push/subscribe`

Stores (upserts) a browser push subscription for the authenticated user.

**Request:**

```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/abc123...",
  "expirationTime": null,
  "keys": {
    "p256dh": "BN...base64url...",
    "auth": "xY...base64url..."
  }
}
```

(Shape matches `PushSubscription.toJSON()` exactly.)

**Response (200):**

```json
{ "id": "7f1c...uuid", "status": "subscribed" }
```

**Errors:**

| Status | Code              | Condition                                   |
| ------ | ----------------- | ------------------------------------------- |
| 400    | `INVALID_BODY`    | Missing `endpoint` or `keys.p256dh`/`.auth` |
| 401    | `UNAUTHENTICATED` | No valid session cookie                     |

#### `DELETE /api/push/subscribe`

Removes the caller's subscription for the `endpoint` in the body (body shape same as POST).

**Response (200):** `{ "status": "unsubscribed" }`
**Errors:** `401 UNAUTHENTICATED`, `404 NOT_FOUND` (no matching row).

#### `POST /api/settings`

Updates the caller's preferences. Also mirrors `translation_id` to QF `POST /preferences` (scope `preference`, sitemap `add-or-update-preference`) best-effort, non-blocking — failure is logged to `qf_api_errors` but the local save succeeds.

**Request:**

```json
{
  "morning_time": "07:15",
  "evening_time": "22:00",
  "translation_id": "131",
  "paused": false,
  "tz": "America/New_York"
}
```

(All fields optional — partial updates allowed. `tz` is sent automatically by the client whenever it differs from the stored value.)

**Response (200):**

```json
{
  "morning_time": "07:15",
  "evening_time": "22:00",
  "translation_id": "131",
  "paused": false,
  "tz": "America/New_York",
  "qf_preferences_mirrored": true
}
```

**Errors:**

| Status | Code                  | Condition                         |
| ------ | --------------------- | --------------------------------- |
| 400    | `INVALID_TIME`        | Time fails HH:MM regex            |
| 400    | `TIME_ORDER`          | morning ≥ evening                 |
| 400    | `UNKNOWN_TRANSLATION` | `translation_id` not in whitelist |
| 400    | `INVALID_TZ`          | `tz` not a valid IANA zone        |
| 401    | `UNAUTHENTICATED`     | No valid session cookie           |

#### `POST /api/auth/signout`

Defined in `spec-onboarding.md` — referenced here. On sign-out, the client also calls `DELETE /api/push/subscribe` with the current device's subscription so that device stops receiving pushes for that account.

#### `GET /api/cron/push-dispatch`

Vercel Cron endpoint. Runs every minute, scans a **rolling 5-minute window** for resilience against a missed tick.

**Algorithm (per invocation):**

1. Let `now = Date.now()`, `windowEnd = now + 60s`, `windowStart = now - 4*60s` (5-min overlap window).
2. For each row in `users` where `paused = false`:
   - Compute `todayLocal = formatInTimeZone(now, tz, 'yyyy-MM-dd')`.
   - Compute `morningAt = zonedTimeToUtc(todayLocal + 'T' + morning_time, tz)`.
   - Compute `eveningAt = zonedTimeToUtc(todayLocal + 'T' + evening_time, tz)`.
   - If `morningAt ∈ [windowStart, windowEnd]` AND no `push_dispatch_log` row for `(user_id, todayLocal, 'morning')` AND `last_opened_at < todayLocal 00:00 local` → send morning push and log.
   - If `eveningAt ∈ [windowStart, windowEnd]` AND no `push_dispatch_log` row for `(user_id, todayLocal, 'evening')` AND no `reflections` row for `todayLocal` → send evening push and log.
3. For each `web-push` response with status `410 Gone` or `404`, `DELETE` the `push_subscriptions` row (endpoint is stale).

**Response (200):** `{ "scanned": 312, "sent_morning": 4, "sent_evening": 7, "pruned": 1 }`

**Errors:** `401 UNAUTHENTICATED` (missing/bad `CRON_SECRET`).

### Data Model & Migrations

Migration file: `supabase/migrations/0005_push_subscriptions.sql`.

#### New table: `push_subscriptions`

| Field      | Type        | Constraints                                 | Description                          |
| ---------- | ----------- | ------------------------------------------- | ------------------------------------ |
| id         | uuid        | PK, default `gen_random_uuid()`             |                                      |
| user_id    | uuid        | FK `users(id)`, NOT NULL, ON DELETE CASCADE | Owner                                |
| endpoint   | text        | NOT NULL                                    | Browser push endpoint URL            |
| p256dh     | text        | NOT NULL                                    | Subscription public key (base64url)  |
| auth       | text        | NOT NULL                                    | Subscription auth secret (base64url) |
| user_agent | text        |                                             | For debugging multi-device users     |
| created_at | timestamptz | DEFAULT `now()`                             |                                      |
|            |             | `UNIQUE(user_id, endpoint)`                 | Enforces idempotent subscribe        |

RLS: `user_id = auth.uid()` for SELECT/DELETE; no public INSERT (only via authenticated route handler).

#### New table: `push_dispatch_log`

Prevents double-send when the 5-min window overlaps a previous run.

| Field      | Type        | Constraints                               | Description       |
| ---------- | ----------- | ----------------------------------------- | ----------------- |
| id         | uuid        | PK                                        |                   |
| user_id    | uuid        | FK `users(id)`, NOT NULL                  |                   |
| local_date | date        | NOT NULL                                  | User's local date |
| kind       | text        | NOT NULL, CHECK in (`morning`, `evening`) |                   |
| sent_at    | timestamptz | DEFAULT `now()`                           |                   |
|            |             | `UNIQUE(user_id, local_date, kind)`       | Primary dedup key |

#### `users` — ADD columns

```sql
ALTER TABLE users
  ADD COLUMN paused boolean NOT NULL DEFAULT false,
  ADD COLUMN tz text NOT NULL DEFAULT 'UTC',
  ADD COLUMN morning_time text NOT NULL DEFAULT '08:00',
  ADD COLUMN evening_time text NOT NULL DEFAULT '21:00',
  ADD COLUMN translation_id text NOT NULL DEFAULT '131',
  ADD COLUMN last_opened_at timestamptz;
```

(`morning_time`, `evening_time`, `translation_id` are mentioned here because onboarding writes them; this story edits them. If `spec-onboarding.md` Task 1 already adds them, this migration should guard with `ADD COLUMN IF NOT EXISTS` — coordinate with onboarding Task 1.)

#### Migration notes

- Default `tz='UTC'` ensures existing users (if any) don't break; the client re-writes it on next open.
- No backfill required at submission time (pre-pilot — no real users yet).
- No downtime — all additive.

### UI/Frontend Requirements

**Page:** `app/(app)/settings/page.tsx` — server component for initial load, with client components for interactive controls.

#### Components

**`NotificationTimePicker`** — `components/settings/NotificationTimePicker.tsx`

- **Type:** New, client component.
- **Purpose:** Edit `morning_time` or `evening_time`. HH:MM via native `<input type="time">` for platform-consistent UX.
- **Props:**
  ```typescript
  interface Props {
    label: "Morning" | "Evening";
    value: string; // "HH:MM"
    onSave: (next: string) => Promise<void>;
  }
  ```

**`TranslationSelector`** — `components/settings/TranslationSelector.tsx`

- **Type:** New, client.
- **Purpose:** Radio group of whitelisted translations; on change calls `/api/settings` with `translation_id`.

**`PauseToggle`** — `components/settings/PauseToggle.tsx`

- **Type:** New, client.
- **Purpose:** Boolean switch. When flipped on, shows gentle rukhsa copy (see business content). On change calls `/api/settings` with `paused`.

**`PermissionStatus`** — `components/settings/PermissionStatus.tsx`

- **Type:** New, client.
- **Purpose:** Reads `Notification.permission` and `'PushManager' in window`. Renders one of: `granted` / `denied` / `default` (prompt) / `unsupported`. On `default`, exposes an "Enable reminders" button that triggers the subscribe flow.

**`SignOutButton`** — `components/settings/SignOutButton.tsx`

- **Type:** New, client.
- **Purpose:** Calls `DELETE /api/push/subscribe` for the current subscription, then `POST /api/auth/signout`, then redirects to `/`.

#### Client subscribe flow (on first toggle-on of pushes)

```typescript
const reg = await navigator.serviceWorker.getRegistration();
const sub = await reg!.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: urlBase64ToUint8Array(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
  ),
});
await fetch("/api/push/subscribe", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(sub.toJSON()),
});
```

#### States

- **Loading:** Skeleton rows while initial `GET /api/settings` (or server-side load) resolves.
- **Saving:** Each control shows an inline spinner + optimistic value; revert on error with a toast.
- **Permission denied:** `PermissionStatus` shows the non-scolding explanation text; all other controls remain enabled.
- **Unsupported:** `PermissionStatus` shows the unsupported message; no subscribe attempt.
- **Error:** Inline error under the offending control plus a toast.

### Architecture Notes

- **`web-push` npm library** — used for VAPID signing and envelope encryption. Initialised once at module load in `lib/push.ts`:
  ```typescript
  import webpush from "web-push";
  webpush.setVapidDetails(
    "mailto:hello@example.com",
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  ```
- **VAPID keys** — generated once with `npx web-push generate-vapid-keys`, stored as Vercel env vars:
  - `VAPID_PUBLIC_KEY` + `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (both mirror the same value — public key is safe to expose).
  - `VAPID_PRIVATE_KEY` (server-only).
- **Service worker.** Registered by `next-pwa` at `/sw.js`. We supplement the default SW with a custom push listener in `public/sw-custom.js`, merged via `next-pwa` config (`sw: 'sw.js', swSrc: 'public/sw-custom.js'` — verify the exact option name against the `next-pwa` version pinned in `package.json`).
- **Vercel Cron schedule.** `* * * * *` (every minute) configured in `vercel.json`. The dispatcher scans a rolling 5-minute window for resilience (if one minute's invocation fails, the next minute still catches the window).
  ```json
  { "crons": [{ "path": "/api/cron/push-dispatch", "schedule": "* * * * *" }] }
  ```
- **Time-zone math.** Use `date-fns-tz` (`formatInTimeZone`, `zonedTimeToUtc`). Do NOT use native `Date` arithmetic for tz-aware scheduling — it is the single most common source of bugs in this class of code.
- **No new global deps beyond** `web-push` and `date-fns-tz`.

### Exemplar Files

- **MDN Push API:** <https://developer.mozilla.org/en-US/docs/Web/API/Push_API> — subscription lifecycle, payload encryption model, and the `410 Gone` stale-endpoint convention we act on.
- **`web-push` library README:** <https://github.com/web-push-libs/web-push#readme> — VAPID setup, `sendNotification(subscription, payload, options)` signature, and error-code table we rely on for pruning stale rows.
- **Project internal:** `lib/qf/client.ts` (from `spec-onboarding.md`) — fetch-wrapper pattern for route handlers, error logging to `qf_api_errors`.
- **Project internal:** `app/api/auth/signout/route.ts` (from `spec-onboarding.md`) — session-cookie clearing pattern.

### Implementation Plan

#### Sub-tasks

**Task 1: Migration + `users` column updates** — _small_ (<100 LOC)

- Files: `supabase/migrations/0005_push_subscriptions.sql`
- SEQUENTIAL — depends on `spec-onboarding.md` Task 1 (initial `users` table creation). Uses `ADD COLUMN IF NOT EXISTS` to tolerate overlap.

**Task 2: `lib/push.ts` — web-push wrapper** — _medium_ (100–300 LOC)

- Files: `lib/push.ts`, `lib/push.test.ts` (Vitest)
- Covers: VAPID init, `serializeSubscription(row) → PushSubscription`, `sendNotification(sub, payload)` helper with `410`/`404` classification, `buildMorningPayload()` / `buildEveningPayload()` builders that enforce the no-PII rule.
- INDEPENDENT — can start immediately.

**Task 3: `app/api/push/subscribe/route.ts` (POST + DELETE)** — _small_

- Files: `app/api/push/subscribe/route.ts`
- SEQUENTIAL — depends on Task 1 (table) and Task 2 (serializer).

**Task 4: Service-worker push listener** — _medium_

- Files: `public/sw-custom.js`, `next.config.js` (or `next-pwa` options), `app/layout.tsx` (ensure SW registered)
- Covers: `self.addEventListener('push', …)` that calls `self.registration.showNotification(title, { body, data: { url } })`; `notificationclick` handler that `clients.openWindow(event.notification.data.url)`.
- SEQUENTIAL — depends on Task 3 (so subscribe works end-to-end during manual test).

**Task 5: `app/api/settings/route.ts` with QF preferences mirror** — _medium_

- Files: `app/api/settings/route.ts`, `lib/qf/user.ts` (extend with `postPreferences()`)
- Validates all fields per rules above; updates `users` row in a single transaction; fires-and-logs the QF `POST /preferences` mirror (scope `preference`).
- SEQUENTIAL — depends on Task 1.

**Task 6: Settings page + client subscribe flow** — _medium_

- Files: `app/(app)/settings/page.tsx`, `components/settings/NotificationTimePicker.tsx`, `components/settings/TranslationSelector.tsx`, `components/settings/PauseToggle.tsx`, `components/settings/PermissionStatus.tsx`, `components/settings/SignOutButton.tsx`, `lib/client/push.ts` (urlBase64ToUint8Array + subscribe helper)
- SEQUENTIAL — depends on Task 5 (API) and Task 4 (SW must exist so `pushManager.subscribe` succeeds).

**Task 7: Cron dispatcher + `vercel.json`** — _medium_

- Files: `app/api/cron/push-dispatch/route.ts`, `vercel.json`, `lib/push/dispatcher.ts` (the window-scan + suppression logic), `lib/push/dispatcher.test.ts`
- SEQUENTIAL — depends on Task 2 (push helper) and Task 3 (stale-endpoint delete mirrors its semantics).

#### Negative Constraints

- Do NOT include ayah content, translation text, tafsir, mission text, reflection text, user email, user name, or any QF `verse_key` in push payloads.
- Do NOT send a push when `users.paused = true`, even if all other conditions match.
- Do NOT send a morning push when `users.last_opened_at` is on the current local date.
- Do NOT send an evening push when a `reflections` row exists for the current local date.
- Do NOT cache user-specific data in the cron dispatcher between runs — every run reads fresh from Postgres (per the global negative constraint in `spec.md`).
- Do NOT store VAPID private key in any `NEXT_PUBLIC_` env var.
- Do NOT use native `Date` / `toLocaleString` for scheduling math — use `date-fns-tz` only.
- Do NOT implement prayer-time-based scheduling (out of submission scope).

### Test Scenarios

**Test 1: Morning push fires at user's local 07:15**

- Setup: Aisha, `tz=America/New_York`, `morning_time=07:15`, `paused=false`, `last_opened_at=NULL`, no `reflections` row. Mock clock to 07:14:30 EST; invoke cron.
- Action: `GET /api/cron/push-dispatch` (authorised).
- Expected: `web-push` `sendNotification` called once with the Aisha subscription and a generic morning payload; `push_dispatch_log` row inserted for `(aisha.id, 2026-05-02, 'morning')`; response `sent_morning >= 1`.

**Test 2: Morning push suppressed when user already opened the app today**

- Setup: Same as Test 1 but `users.last_opened_at = 2026-05-02 07:05 EST`.
- Action: Same.
- Expected: Dispatcher does NOT call `sendNotification` for Aisha; no new `push_dispatch_log` row; response `sent_morning == 0`.

**Test 3: Permission denied → graceful fallback**

- Setup: `Notification.permission === 'denied'` in the browser; user opens `/settings`.
- Action: Render the page.
- Expected: `PermissionStatus` renders the denied message; no `pushManager.subscribe` call is made; `NotificationTimePicker`, `TranslationSelector`, `PauseToggle`, `SignOutButton` remain interactive; saving changes still succeeds.

**Test 4: Time-zone change on travel**

- Setup: Aisha was in `America/New_York`; on Wednesday she opens the app in London and the client detects `Europe/London`. Client POSTs `{ tz: 'Europe/London' }` to `/api/settings`. `morning_time=07:15` unchanged.
- Action: Next cron run at 06:14 GMT on Thursday (= 07:14 BST).
- Expected: Aisha's `users.tz` is now `Europe/London`; the dispatcher computes `morningAt = 07:15 BST` and the morning push fires at London 07:15. No setting change was required from Aisha. (The BST→GMT offset is handled by IANA zone, not a fixed offset.)

**Test 5: Pause toggle stops pushes**

- Setup: Fatima, `paused=false`, `morning_time=08:00`, `tz=America/New_York`. She POSTs `/api/settings { paused: true }`.
- Action: Next cron tick crosses 08:00 EST.
- Expected: Dispatcher skips Fatima in the `paused=false` filter; zero pushes; no `push_dispatch_log` row. When she toggles back off, next-day 08:00 fires as normal.

**Test 6: Stale subscription (`410 Gone`) is pruned**

- Setup: Yusuf has a `push_subscriptions` row whose endpoint now returns `410 Gone` (he cleared browser data). Cron reaches his morning window.
- Action: Dispatcher calls `sendNotification`, receives `410`.
- Expected: That `push_subscriptions` row is DELETEd; next run for Yusuf does not attempt delivery; response `pruned >= 1`. Any other subscription rows Yusuf owns on other devices are unaffected.

**Test 7: Idempotent subscribe**

- Setup: Aisha's browser calls `POST /api/push/subscribe` with the same subscription JSON twice in a row (e.g., re-render bug).
- Action: Two POSTs.
- Expected: First inserts, second is a no-op (`UNIQUE(user_id, endpoint)` upsert); only one row in `push_subscriptions`; both responses are `200`.

**Test 8: Invalid settings payload**

- Setup: Aisha POSTs `{ morning_time: "25:00", evening_time: "22:00" }`.
- Action: `POST /api/settings`.
- Expected: `400 INVALID_TIME`; `users` row unchanged.

### Acceptance Criteria

- [ ] `push_subscriptions` table, `push_dispatch_log` table, and `users` column additions migrate cleanly on a fresh Supabase project.
- [ ] `POST /api/push/subscribe` idempotently upserts a subscription for the authenticated user.
- [ ] `DELETE /api/push/subscribe` removes the subscription and is safe to call when already absent (idempotent delete returns `404` cleanly or `200` — pick one and enforce).
- [ ] `POST /api/settings` validates all five fields per rules, mirrors `translation_id` to QF `POST /preferences` (scope `preference`), and returns the updated values.
- [ ] `GET /api/cron/push-dispatch` requires `CRON_SECRET`; scans a rolling 5-minute window; applies morning + evening suppression; prunes `410 Gone` / `404` subscriptions.
- [ ] Service worker shows a notification on `push` events and opens the correct URL on `notificationclick`.
- [ ] Settings page renders all five controls, handles `denied` / `default` / `granted` / `unsupported` permission states.
- [ ] Time-zone recapture fires on every authenticated app open when the client's detected `tz` differs from the stored value.
- [ ] No push payload ever contains ayah content, translation text, tafsir, mission text, reflection text, or user PII.
- [ ] When `paused=true`, zero pushes are emitted for that user regardless of time/window/suppression.
- [ ] All new code passes Vitest, typecheck, and lint; the `did-workflow:verifier` skill reports clean.

### Verification

#### Unit tests (Vitest)

| Target                                                                                                                                                                      | File                             |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Schedule-window math: `isInWindow(morningAt, now, 5min)` handles DST spring-forward and fall-back                                                                           | `lib/push/dispatcher.test.ts`    |
| Push-payload builder: `buildMorningPayload()` / `buildEveningPayload()` contain only generic copy + a path — round-trip via `JSON.stringify` and assert no PII keys present | `lib/push.test.ts`               |
| Suppression predicates: `shouldSkipMorning(user, now)` / `shouldSkipEvening(user, now, reflections)`                                                                        | `lib/push/dispatcher.test.ts`    |
| Settings validators: `morning < evening`, tz validity, translation whitelist                                                                                                | `app/api/settings/route.test.ts` |
| Stale-endpoint handling: `410`/`404` responses from `web-push` trigger row deletion                                                                                         | `lib/push.test.ts`               |

#### Browser / UI walkthrough (manual — push delivery cannot be Playwright-automated)

1. Credentials: use a real pilot Gmail account via QF auth in the preview environment.
2. Open `/settings`; verify initial state matches the `users` row.
3. On a browser with `Notification.permission === 'default'`, click "Enable reminders" — verify the native prompt appears and, on grant, a row is inserted in `push_subscriptions` (check via Supabase dashboard).
4. Set `morning_time` to 2 minutes from now; wait for the cron tick; verify the push arrives with generic copy and tapping it opens `/today`.
5. Submit a reflection, then set `evening_time` to 2 minutes from now; verify the evening push is suppressed.
6. Toggle pause on, set a time 2 minutes out, and verify no push arrives.
7. Deny notifications in browser settings, reload `/settings`; verify `PermissionStatus` shows the denied message and other controls still save correctly.

#### E2E tests (Playwright — settings-screen scenarios only)

Push _delivery_ cannot be end-to-end tested in Playwright because it requires a real browser-vendor push service and a clock that crosses a real minute boundary. We cover push delivery via Vitest + manual walkthrough. Playwright covers the settings-screen interactions only.

| Key Scenario                                                                                                                           | Test file                                           | Assigned sub-task |
| -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------- |
| Editing the evening time takes effect on the next cycle (UI half)                                                                      | `tests/e2e/notifications-edit-time.spec.ts`         | Task 6            |
| Pausing notifications suppresses all future pushes (UI toggle + confirmation copy)                                                     | `tests/e2e/notifications-pause.spec.ts`             | Task 6            |
| Browser notification permission was denied (UI fallback copy)                                                                          | `tests/e2e/notifications-permission-denied.spec.ts` | Task 6            |
| Changing translation preference from Settings                                                                                          | `tests/e2e/notifications-translation.spec.ts`       | Task 6            |
| Signing out from Settings                                                                                                              | `tests/e2e/notifications-signout.spec.ts`           | Task 6            |
| First reminder after onboarding uses the times chosen during onboarding (UI half — verifies settings screen displays onboarding times) | `tests/e2e/notifications-first-reminder.spec.ts`    | Task 6            |

**Locator strategies:** use `data-testid` attributes — `settings-morning-time`, `settings-evening-time`, `settings-translation`, `settings-pause-toggle`, `settings-permission-status`, `settings-signout`. Avoid brittle text selectors because product-owner copy is still in flux (see Open Questions).

**Note on push delivery testing:** Playwright cannot intercept OS-level push notifications. The E2E suite asserts only that the settings UI saves correctly and that the next-cycle cron would fire — actual delivery is verified manually per the walkthrough above and via Vitest coverage of `dispatcher.ts` and `push.ts`.
