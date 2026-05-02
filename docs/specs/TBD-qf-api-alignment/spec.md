# Quran Foundation API Alignment Audit

**Ticket:** TBD
**Type:** Technical — Audit & Alignment

Verify every Quran Foundation API integration in the Ghars codebase against the authoritative QF documentation at https://api-docs.quran.foundation/. Replace any assumed endpoint paths, base URLs, authentication methods, scopes, or response shapes with values the docs state explicitly. Document the ground truth in one place so future work does not re-drift.

## Motivation

Over the course of the build we hit a sequence of QF integration failures — each caused by the code making a reasonable-looking assumption about the API rather than confirming it in the docs. These assumptions silently shipped together and surfaced only under real traffic. Examples we already paid for:

- Assumed OAuth2 authorize path was `/oauth2/authorize` — actual path is `/oauth2/auth`. Caused every sign-in to 404 on the QF auth server.
- Assumed the token endpoint accepts `client_secret` in the POST body (`client_secret_post`) — QF only supports `client_secret_basic` (Authorization header). Caused every token exchange to return 401 `invalid_client`.
- Assumed content APIs lived at `apis.quran.foundation/content/api/v4` — content APIs are actually served by `api.quran.com/api/v4`. Caused every verse, translation, and audio request to 404.
- Assumed User APIs lived at `apis.quran.foundation/content/api/user/v1` — actual base path is `/auth/v1`. Would have caused every bookmark, note, and streak request to fail once we connected them.
- Assumed single-verse translation used `/quran/translations/{id}?verse_key={key}` — that endpoint returns `translations: []` even with valid auth. Correct path is `/verses/by_key/{key}?translations={id}`. Caused the translation to render blank on the today screen.

**Current state:** Six confirmed integration bugs have been found and fixed through trial-and-error during dev-server testing. We cannot confirm the remaining integrations (notes, bookmarks, streaks, goals, activity days, preferences, collections, full tafsir) are correct because they have not yet been exercised against a live account. Several are wrapped in `try/catch` blocks that silently return empty defaults — so a failed API call looks indistinguishable from "user has no data."

**Desired state:** Every QF endpoint called by our code is present in the QF docs with the exact path, method, headers, body shape, response shape, and required scope that our code assumes. A single alignment document in the repo records every endpoint we call and the doc URL that confirms it. Silent `try/catch` fallbacks that mask API errors are removed or converted to explicit, observable error states. A smoke-test script exercises every integration against the prelive environment and reports pass/fail.

**Trigger:** The hackathon submission is on 2026-05-20 (18 days away). Judges will exercise the full loop — morning commit → evening reflection → grove → weekly review — in a single demo session. Any silent integration failure during that session directly costs points on the "API integration quality" criterion (15 points, second-highest weighted). We cannot ship with integrations we have not personally verified.

## Scope

**In scope:**

- Audit all 12 QF endpoints currently called by `lib/qf/`:
  - OAuth2: authorize URL, token exchange (authorization code + PKCE), token refresh, client credentials
  - Content: get verse, list translation, list tafsir, ayah audio
  - User: add note, add activity day, get current streak, add/list/delete bookmarks
- Verify base URLs for each API family (Content, User, OAuth2) in both prelive and production environments
- Verify required OAuth2 scopes for each endpoint we call
- Verify authentication method for token endpoint (confirm `client_secret_basic`)
- Verify required and optional query/body parameters for each endpoint
- Verify response shape for each endpoint (especially error responses)
- Write a single authoritative reference document at `docs/qf-api-reference.md` that records every endpoint we use, the doc URL that confirms it, and the exact request/response shape
- Replace silent `try/catch` fallbacks on user API calls with explicit error logging to `qf_api_errors` table so failures are visible
- Write a smoke-test script that exercises every endpoint against the prelive environment and reports pass/fail per endpoint
- Fix any misalignments discovered during the audit

**Out of scope:**

- Adding new QF API integrations (e.g., collections, goals, reading sessions, preferences) that the app does not currently use
- Changing the app's UX or data model to accommodate richer QF capabilities
- Building a QF SDK wrapper (the official `@quranjs/api` is already a dependency but not used; whether to adopt it is deferred)
- Performance optimization of QF calls (caching, batching, connection pooling)
- Handling QF API rate limiting (deferred — we are well under any reasonable threshold at hackathon scale)
- Search API alignment (we do not use Search API in the submission)
- Quran Reflect API alignment (out of scope per submission policy — no social features)

## Goals

- Reduce QF-originated integration errors in the user-facing flows to zero across a full demo session (morning commit → evening reflection → grove → weekly review) against the prelive environment.
- Produce a single authoritative QF reference document so future contributors do not need to rediscover endpoint paths, auth methods, or scopes.
- Make every QF call observable — no silent fallbacks that mask integration failures.

## Non-Goals

- Reaching parity with the full QF API surface.
- Adding automated regression tests against the live QF API (out of scope for hackathon timeline; smoke-test script is sufficient).
- Documenting every QF endpoint — only the ones we use.

## Success Criteria

- A full sign-in → today → commit → reflect → grove journey completed against the prelive QF environment with no 4xx/5xx responses from any QF endpoint.
- Every QF endpoint called by the code has a row in `docs/qf-api-reference.md` with: endpoint path, HTTP method, required scope, base URL, doc URL, example request, example response.
- A smoke-test script (`scripts/qf-smoke-test.ts`) runs every integration against prelive and prints pass/fail per endpoint.
- The `qf_api_errors` table contains zero rows after a full demo journey completes cleanly.
- If an endpoint we currently call is absent from the QF docs, it is explicitly flagged in `docs/qf-api-reference.md` with the fallback strategy we rely on.

## Acceptance Criteria

### Scenario: Authorize URL matches QF docs

```gherkin
Given the QF docs state the authorize endpoint is {oauth_base}/oauth2/auth
When the code generates the QF sign-in redirect URL
Then the path segment is exactly /oauth2/auth
  And the URL includes response_type=code, code_challenge, code_challenge_method=S256, state, and the full scope list
  And the scope list includes every scope required by any User API we call
```

### Scenario: Token exchange uses the auth method the docs require

```gherkin
Given the QF docs state the token endpoint requires client_secret_basic for confidential clients
When the code exchanges an authorization code for tokens
Then the credentials are sent in the Authorization: Basic header
  And client_id and client_secret are not sent in the POST body
  And the response contains access_token, refresh_token, expires_in, and id_token
```

### Scenario: Content endpoints resolve at the base URL the docs state

```gherkin
Given the QF docs state the Content API base URL
When the code fetches a verse, translation, tafsir, or audio URL
Then the full URL matches the docs example
  And the response returns HTTP 200 with a non-empty payload for a valid verse key like "103:1"
```

### Scenario: User API endpoints resolve at the /auth/v1 base

```gherkin
Given the QF docs state the User API base path is {api_base}/auth/v1
When the code calls any User API (bookmarks, notes, streaks, activity)
Then the full URL starts with {api_base}/auth/v1
  And the request includes x-auth-token and x-client-id headers
  And the response returns HTTP 2xx for valid input
```

### Scenario: Silent User API failures become observable

```gherkin
Given a User API call fails (network error, 4xx, 5xx)
When the failure is caught in application code
Then the failure is logged to the qf_api_errors table with endpoint, status code, and request body
  And the user sees an appropriate UI signal (e.g., "saved locally — we'll sync shortly")
  And the app does not render empty data as if the user has no records
```

### Scenario: Smoke-test script exercises every integration

```gherkin
Given a demo user with a valid QF session in the prelive environment
When scripts/qf-smoke-test.ts is run
Then the script calls every QF endpoint our app uses (12 endpoints total)
  And each call returns a 2xx response
  And the script prints a pass/fail summary per endpoint
  And the script exits with code 0 on all pass, code 1 on any fail
```

### Scenario: QF reference doc records every endpoint we use

```gherkin
Given the alignment audit is complete
When a reviewer opens docs/qf-api-reference.md
Then every endpoint in lib/qf/ has a row in the doc
  And each row lists HTTP method, path, base URL, required scope, doc URL, request shape, response shape
  And rows for endpoints not found in the QF docs are explicitly flagged with the fallback strategy
```

### Scenario: Translation endpoint returns non-empty text

```gherkin
Given a verse key like "103:1" and translation_id 131 (The Clear Quran)
When the code requests the translation through its current path
Then the response includes a non-empty translation text
  And the app renders the translation on the today screen
  And no blank translation is ever shown to the user in the happy path
```

### Scenario: Audit catches a misalignment before shipping

```gherkin
Given the alignment audit is in progress
When a discrepancy between code and docs is found (e.g., wrong path, wrong auth method, missing scope)
Then the discrepancy is recorded in docs/qf-api-reference.md with the correct value
  And the code is updated to match the docs
  And the smoke-test script is re-run to confirm the fix
  And the issue is added to docs/learnings/ as a blocker entry
```

### Scenario: Endpoints absent from the QF docs are flagged

```gherkin
Given an endpoint we call that does not appear in the public QF docs
When the audit reviews that endpoint
Then the reference doc marks it as "undocumented — verified empirically via prelive smoke test"
  And the team has an explicit record that this endpoint may change without notice
  And the smoke test exercises it so breakage is caught early
```

## Constraints

- **Backwards compatibility:** N/A — no external consumers of our code; we are free to refactor internal calls.
- **Downtime:** N/A — dev-stage product with no production users yet.
- **Compliance:** All changes must preserve the "backend-only secrets" rule from the QF quickstart: `CLIENT_SECRET` must never reach a browser, and all QF calls remain server-side.
- **Rollback:** Each code change is independently revertible via git. The reference doc itself is additive.

## Dependencies

- Working prelive credentials (client ID and secret) — already obtained.
- A seeded demo account in Supabase capable of completing the full journey locally — already present.
- Access to https://api-docs.quran.foundation/ (public).
- QF Notes API, Activity API, Streaks API, Bookmarks API each needing one successful live call to confirm response shape.

## Open Questions

- [x] ~~Do we need to adopt the official `@quranjs/api` SDK?~~ — **Deferred (non-blocking):** The SDK is a dev dependency but never imported. Evaluating replacement is out of scope for this audit; a follow-up task after the hackathon can consider adoption if it would reduce ongoing maintenance.
- [x] ~~Should the smoke-test script run in CI?~~ — **Resolved:** No for the hackathon timeline. The script is for manual use before a demo. CI integration is a post-submission hardening task.
- [x] ~~Does the audit cover Quran Reflect APIs?~~ — **Resolved:** No — social features are explicitly out of scope per the epic spec.
- [x] ~~How do we handle endpoints missing from the public docs?~~ — **Resolved:** Flag them in the reference doc as "undocumented — verified empirically" and exercise them in the smoke test so breakage is caught.
- [ ] Can we get access to the full OpenAPI spec for QF APIs from `developers@quran.com`? — **Deferred (non-blocking):** The audit proceeds against the public docs plus empirical testing. If a spec becomes available mid-audit it can be cross-referenced, but we do not block on it.

---

## Functional Requirements

- **Single source of truth.** Every QF endpoint used by the app must appear in `docs/qf-api-reference.md` exactly once. No endpoint path may be hardcoded in two places without matching the reference doc.
- **Environment-driven base URLs.** Base URLs (Content, User, OAuth2) must come from env vars only — `QF_CONTENT_BASE`, `QF_USER_BASE`, `QF_OAUTH_BASE`. No base URL may appear hardcoded outside `lib/qf/client.ts` and `lib/qf/oauth.ts`.
- **Confidential client posture.** All token requests use HTTP Basic Auth (`Authorization: Basic base64(client_id:client_secret)`), never `client_secret_post`. `CLIENT_SECRET` never appears in any browser-shipped bundle.
- **Observable failures.** Every QF API call logs non-2xx responses to the `qf_api_errors` table with endpoint path, status code, truncated response body, and timestamp. Silent `try/catch` that returns `{ ok: false }` without logging is prohibited in User API wrappers.
- **Idempotency.** The smoke-test script must be safely re-runnable: it writes nothing to the prelive account that cannot be cleaned up (or targets a dedicated smoke-test user whose data is disposable).
- **Bookmark round-trip.** The smoke test must create a bookmark, confirm its ID, list bookmarks and find the new ID, then delete it and confirm deletion. Same for notes.
- **Scope completeness.** The OAuth2 authorize URL scope string must include every scope required by any User API endpoint the app calls (`openid offline_access user bookmark collection streak preference goal activity_day note`).

## Permissions & Security

- **Scope enforcement.** The app requests the union of scopes needed by all User API endpoints it calls. If a new endpoint is added later that requires a new scope, that scope must be added to `buildAuthorizeUrl` default and documented in the reference doc.
- **Token exposure.** No QF access token, refresh token, or client secret may reach the browser. The smoke-test script runs server-side only (`tsx` via Node), not in the app's client bundle.
- **Authorization header construction.** `Authorization: Basic ${Buffer.from(\`${client_id}:${client_secret}\`).toString("base64")}` is the only accepted form. No URL-encoding applied to the credentials before base64 (QF docs state raw concatenation).
- **Error body handling.** When logging QF error responses, truncate the body to 1024 chars and scrub any header values (tokens, client IDs) that might appear in error text. Never log the `Authorization` header value.
- **CLIENT_SECRET storage.** Read from `process.env.QF_CLIENT_SECRET` only. Never committed to git. Present in `.env.local` (dev) and Vercel env vars (production + preview).

## API Design

### Endpoint Inventory (canonical — copied to `docs/qf-api-reference.md`)

| #   | Purpose                    | Method | Base              | Path                                                              | Scope                 | Caller                                      |
| --- | -------------------------- | ------ | ----------------- | ----------------------------------------------------------------- | --------------------- | ------------------------------------------- |
| 1   | Authorize (sign-in)        | GET    | `QF_OAUTH_BASE`   | `/oauth2/auth`                                                    | (user grants)         | `lib/qf/oauth.ts:buildAuthorizeUrl`         |
| 2   | Token exchange (auth code) | POST   | `QF_OAUTH_BASE`   | `/oauth2/token`                                                   | n/a                   | `lib/qf/oauth.ts:exchangeCodeForTokens`     |
| 3   | Token refresh              | POST   | `QF_OAUTH_BASE`   | `/oauth2/token`                                                   | n/a                   | `lib/qf/oauth.ts:refreshAccessToken`        |
| 4   | Client credentials         | POST   | `QF_OAUTH_BASE`   | `/oauth2/token`                                                   | `content`             | `lib/qf/oauth.ts:getClientCredentialsToken` |
| 5   | Get verse (Arabic)         | GET    | `QF_CONTENT_BASE` | `/verses/by_key/{key}?fields=text_uthmani,verse_key,verse_number` | `content`             | `lib/qf/content.ts:getVerseByKey`           |
| 6   | Get verse translation      | GET    | `QF_CONTENT_BASE` | `/verses/by_key/{key}?translations={id}&fields=text_uthmani`      | `content`             | `lib/qf/content.ts:getTranslation`          |
| 7   | Get verse audio            | GET    | `QF_CONTENT_BASE` | `/recitations/{reciter_id}/by_ayah/{key}`                         | `content`             | `lib/qf/content.ts:getAudioUrl`             |
| 8   | Get full tafsir            | GET    | `QF_CONTENT_BASE` | `/quran/tafsirs/{tafsir_id}?verse_key={key}`                      | `content`             | `lib/qf/content.ts:getFullTafsir`           |
| 9   | Add note                   | POST   | `QF_USER_BASE`    | `/notes`                                                          | `note.create`         | `lib/qf/user.ts:addNote`                    |
| 10  | Add activity day           | POST   | `QF_USER_BASE`    | `/activity_days` **[verify]**                                     | `activity_day.create` | `lib/qf/user.ts:addActivityDay`             |
| 11  | Get current streak         | GET    | `QF_USER_BASE`    | `/streaks/current` **[verify]**                                   | `streak.read`         | `lib/qf/user.ts:getCurrentStreak`           |
| 12  | Add bookmark               | POST   | `QF_USER_BASE`    | `/bookmarks`                                                      | `bookmark.create`     | `lib/qf/bookmarks.ts:addQFBookmark`         |
| 13  | List bookmarks             | GET    | `QF_USER_BASE`    | `/bookmarks`                                                      | `bookmark.read`       | `lib/qf/bookmarks.ts:listQFBookmarks`       |
| 14  | Delete bookmark            | DELETE | `QF_USER_BASE`    | `/bookmarks/{id}`                                                 | `bookmark.delete`     | `lib/qf/bookmarks.ts:removeQFBookmark`      |

**Base URL reference:**

| Env        | `QF_OAUTH_BASE`                           | `QF_CONTENT_BASE`              | `QF_USER_BASE`                                  |
| ---------- | ----------------------------------------- | ------------------------------ | ----------------------------------------------- |
| Prelive    | `https://prelive-oauth2.quran.foundation` | `https://api.quran.com/api/v4` | `https://apis-prelive.quran.foundation/auth/v1` |
| Production | `https://oauth2.quran.foundation`         | `https://api.quran.com/api/v4` | `https://apis.quran.foundation/auth/v1`         |

**Notes on `[verify]` rows:**

- `/activity_days` vs `/activity/day` — the docs use the slug `add-update-activity-day` and reference an `activity_day` scope but do not show the full path. Our current code uses `/activity/day`. The audit must POST to both forms against prelive and record the one that returns 2xx.
- `/streaks/current` — QF docs reference `get-current-streak-days` as a sitemap slug. The actual path may be `/streaks/current` or `/streaks`. Audit must confirm.

### Example requests and responses

**Endpoint 2 — Token exchange (authorization_code):**

```http
POST /oauth2/token HTTP/1.1
Host: prelive-oauth2.quran.foundation
Authorization: Basic OTM2NzAwYTAtMjVkNy00ZmEyLThjZWYtNzg4YTcyNjU3NTYyOnNlY3JldA==
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=ory_ac_abc123&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback&code_verifier=dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk
```

Response:

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "WVHJVqgSIf8Vsqf0k71vGCbkjPaoP_w5BMu_ektC36c",
  "id_token": "eyJhbGciOiJSUzI1NiIs...",
  "expires_in": 3600,
  "token_type": "bearer",
  "scope": "openid offline_access user bookmark collection streak preference goal activity_day note",
  "expires_at": "2026-05-02T12:45:00.000Z"
}
```

**Endpoint 5 — Get verse:**

```http
GET /api/v4/verses/by_key/103:1?fields=text_uthmani,verse_key,verse_number HTTP/1.1
Host: api.quran.com
x-auth-token: eyJhbGciOiJSUzI1NiIs...
x-client-id: 936700a0-25d7-4fa2-8cef-788a72657562
```

Response:

```json
{
  "verse": {
    "id": 6177,
    "verse_number": 1,
    "verse_key": "103:1",
    "text_uthmani": " وَٱلْعَصْرِ"
  }
}
```

**Endpoint 9 — Add note:**

```http
POST /auth/v1/notes HTTP/1.1
Host: apis-prelive.quran.foundation
x-auth-token: eyJhbGciOiJSUzI1NiIs...
x-client-id: 936700a0-25d7-4fa2-8cef-788a72657562
Content-Type: application/json

{"verse_key":"103:1","body":"Today I reflected on how I spend my time."}
```

Response (expected):

```json
{ "id": "note_018f29c4b3" }
```

### Error table (unified)

| Class   | Status | Code (app-level)     | Meaning                                                                        |
| ------- | ------ | -------------------- | ------------------------------------------------------------------------------ |
| Auth    | 401    | `QF_TOKEN_EXPIRED`   | Access token expired — caller must refresh and retry once                      |
| Auth    | 401    | `QF_INVALID_CLIENT`  | Wrong client ID/secret, or wrong auth method (should be `client_secret_basic`) |
| Request | 400    | `QF_BAD_REQUEST`     | Body or query param invalid; do not retry                                      |
| Request | 404    | `QF_NOT_FOUND`       | Path or resource wrong; do not retry                                           |
| Scope   | 403    | `QF_FORBIDDEN_SCOPE` | Token lacks a required scope; user must re-authorize                           |
| Rate    | 429    | `QF_RATE_LIMITED`    | Back off 30s then retry once                                                   |
| Server  | 5xx    | `QF_SERVER_ERROR`    | Retry with exponential backoff, max 3 attempts                                 |
| Timeout | —      | `QF_TIMEOUT`         | Network timeout (>10s); log + surface to user                                  |

## Data Model & Migrations

No new tables. The existing `qf_api_errors` table (in `supabase/migrations/0001_initial.sql`) is reused:

| Field         | Type            | Purpose                                      |
| ------------- | --------------- | -------------------------------------------- |
| id            | uuid            | PK                                           |
| user_id       | uuid (nullable) | FK users — null for client_credentials calls |
| endpoint      | text            | Relative path, e.g. `/bookmarks`             |
| payload       | jsonb           | Request body (scrubbed of tokens)            |
| error_message | text            | Truncated response body, ≤1024 chars         |
| status_code   | int             | HTTP status                                  |
| retry_count   | int             | Retries attempted                            |
| next_retry_at | timestamptz     | When the retry worker should try again       |
| resolved_at   | timestamptz     | Null until resolved                          |
| created_at    | timestamptz     | Default now()                                |

No migration required — table exists.

## Architecture Notes

- **New dependencies:** none. The smoke-test script reuses `tsx` (already a dev dep) and the existing `lib/qf/` modules.
- **No SDK adoption.** The `@quranjs/api` npm package is listed in `package.json` but is not imported anywhere — leave it alone; adoption is a separate task.
- **Dependencies & integration:** changes touch `lib/qf/*`, `lib/supabase/server.ts` (if a logger helper is added), `app/api/auth/callback/route.ts` (scope string sanity check). A new `lib/qf/errors.ts` centralizes error-logging logic so every caller uses the same shape.
- **Test environment:** the smoke-test script uses a dedicated prelive smoke-test account. Its user ID is set via `QF_SMOKE_USER_ID` env var so the script can clean up its own records.

## Exemplar Files

- `lib/qf/bookmarks.ts` — correct pattern for a User API wrapper with round-trip behaviour; follow this shape for the new error logger but remove the silent fallback.
- `scripts/seed-corpus.ts` — exemplar for a `tsx`-run node script that reads env vars and writes to Supabase. Smoke-test script follows this structure.
- `lib/qf/content.ts:getVerseByKey` — correct pattern for a Content API call with scope-bounded client credentials token. No changes needed.

## Implementation Plan

### Sub-tasks

**Task 1: Write `docs/qf-api-reference.md` canonical reference** — _small_ (<100 LOC)

- Files: `docs/qf-api-reference.md` (new)
- Content: the endpoint inventory table above, base URL reference, example requests/responses for each endpoint, and a section per endpoint listing the doc URL that confirms it (or "undocumented — verified empirically" flag).
- INDEPENDENT

**Task 2: Centralize QF error logging in `lib/qf/errors.ts`** — _medium_ (100–300 LOC)

- Files: `lib/qf/errors.ts` (new), `lib/qf/client.ts` (modify — use logger)
- Exports: `logQfError({ userId, endpoint, status, body, payload })`, `isRetryable(status)`. Truncates body to 1024 chars, redacts bearer/basic auth headers, inserts into `qf_api_errors` via `createAdminSupabaseClient`.
- INDEPENDENT

**Task 3: Replace silent try/catch in User API wrappers with explicit logging** — _small_ (<100 LOC)

- Files: `lib/qf/user.ts`, `lib/qf/bookmarks.ts`
- For every function that currently returns `{ ok: false }`, `null`, or `[]` on error: call `logQfError(...)` before returning the fallback. Fallbacks remain — this task makes failures observable without changing UX.
- SEQUENTIAL (depends on Task 2)

**Task 4: Verify and fix activity day + streak endpoint paths** — _small_ (<100 LOC)

- Files: `lib/qf/user.ts`
- Use curl or a one-off node script to POST to `/activity/day`, `/activity_days`, `/activity-days`, `/activity/add-update` against prelive. Record which form returns 2xx. Do the same for `/streaks/current` vs `/streaks` vs `/streaks/get-current-streak-days`. Update `lib/qf/user.ts` paths to match; update `docs/qf-api-reference.md`.
- SEQUENTIAL (depends on Task 1 — reference doc must exist to update)

**Task 5: Verify and fix bookmarks endpoints** — _small_ (<100 LOC)

- Files: `lib/qf/bookmarks.ts`
- Round-trip against prelive: POST a bookmark, GET list, confirm new ID appears, DELETE it, GET list, confirm it's gone. Record the response shape for each call. If any path is wrong, update the code and reference doc.
- SEQUENTIAL (depends on Task 1, can run in parallel with Task 4)

**Task 6: Verify and fix notes endpoint** — _small_ (<100 LOC)

- Files: `lib/qf/user.ts`
- POST a note against prelive, record the returned ID key (`id`, `note_id`, `data.id`), update `addNote` to read the correct field. Update reference doc.
- SEQUENTIAL (depends on Task 1, can run in parallel with Tasks 4 and 5)

**Task 7: Write `scripts/qf-smoke-test.ts`** — _medium_ (100–300 LOC)

- Files: `scripts/qf-smoke-test.ts` (new), `package.json` (add `"qf:smoke": "node --env-file=.env.local node_modules/.bin/tsx scripts/qf-smoke-test.ts"` script)
- Reads `QF_SMOKE_USER_ID` and a pre-authorized prelive access token from env. For each of the 14 endpoints, performs the minimum viable call, asserts 2xx, prints `PASS: {endpoint}` or `FAIL: {endpoint} — {status} {body}`. Cleans up any records it creates (deletes its own bookmarks/notes at the end). Exits 0 on all pass, 1 on any fail.
- SEQUENTIAL (depends on Tasks 4, 5, 6 — script must call the corrected endpoints)

**Task 8: Run smoke test, fix any remaining misalignments, update reference doc** — _small_ (<100 LOC)

- Files: any `lib/qf/*` with a bug surfaced by the smoke test + `docs/qf-api-reference.md`
- Run `npm run qf:smoke`. For every FAIL, diagnose, fix, re-run. Update the reference doc to match reality. Capture each fix as a `/learn blocker-` entry.
- SEQUENTIAL (depends on Task 7)

### Negative Constraints

- Do NOT import or adopt the `@quranjs/api` SDK — leave it as a noop dependency.
- Do NOT add new QF endpoints beyond the 14 listed in the inventory. Goals, collections, preferences, reading sessions stay out until a later task explicitly adds them.
- Do NOT modify the `qf_api_errors` table schema.
- Do NOT run the smoke test against the production environment. Only prelive.
- Do NOT change the OAuth2 scope list without updating `buildAuthorizeUrl` AND the reference doc AND requiring users to re-authorize.
- Do NOT silently swallow QF errors in any new code. Always log.

## Test Scenarios

**Test 1: Reference doc completeness**

- Setup: `docs/qf-api-reference.md` written per Task 1
- Action: for each function in `lib/qf/content.ts`, `lib/qf/user.ts`, `lib/qf/bookmarks.ts`, `lib/qf/oauth.ts`, grep the doc for its name
- Expected: every exported async function has a matching row; 14 total endpoints documented; no orphan rows in the doc

**Test 2: Auth method verification — client_credentials**

- Setup: `QF_OAUTH_BASE=https://prelive-oauth2.quran.foundation`, valid `QF_CLIENT_ID` and `QF_CLIENT_SECRET` in env
- Action: call `getClientCredentialsToken("content")`
- Expected: response status 200; returns `{ access_token: <non-empty JWT>, expires_in: 3600 }`. Request inspection (via curl replay) confirms `Authorization: Basic ...` header present and POST body does NOT contain `client_id` or `client_secret`

**Test 3: Auth method failure — client_secret_post rejection**

- Setup: modified call that sends `client_id` and `client_secret` in body without Basic header
- Action: same token request as Test 2
- Expected: response status 401 with body containing `"error":"invalid_client"`; proves QF rejects `client_secret_post` and our Basic header is the only valid path

**Test 4: Content endpoint — verse, translation, audio, tafsir for 103:1**

- Setup: valid content token cached, `QF_CONTENT_BASE=https://api.quran.com/api/v4`
- Action: call `getVerseByKey("103:1")`, `getTranslation("103:1", "131")`, `getAudioUrl("103:1", "7")`, `getFullTafsir("103:1", "169")`
- Expected: all four return 200 with non-empty payloads. `getVerseByKey` returns `arabic: " وَٱلْعَصْرِ"`. `getTranslation` returns `text` containing "By time" (Clear Quran). `getAudioUrl` returns a URL matching `https://audio.qurancdn.com/...`. `getFullTafsir` returns `text` with non-empty HTML

**Test 5: User API round trip — bookmarks**

- Setup: prelive session with scopes `bookmark.create bookmark.read bookmark.delete`
- Action: `addQFBookmark(token, "103:1")` → returns `bookmarkId`. `listQFBookmarks(token)` → find entry with `verse_key="103:1"` and `id=bookmarkId`. `removeQFBookmark(token, bookmarkId)`. `listQFBookmarks(token)` again → entry absent.
- Expected: all four calls return 2xx. Round trip leaves prelive account in original state

**Test 6: User API — note creation**

- Setup: prelive session with scope `note.create`
- Action: `addNote({ accessToken, verseKey: "103:1", body: "Smoke test at 2026-05-02T12:00:00Z" })`
- Expected: response status 201 (or 200); returns `{ note_id: <non-empty string> }`; the note is retrievable via `GET /notes/by-verse/103:1` (smoke test verifies)

**Test 7: User API — activity day + streak**

- Setup: prelive session with scopes `activity_day.create streak.read`
- Action: `addActivityDay({ accessToken, date: "2026-05-02" })`, then `getCurrentStreak(accessToken)`
- Expected: activity POST returns 2xx; streak GET returns `{ current_streak_days: N }` where N ≥ 1 immediately after the activity insert

**Test 8: Observable failure — silent fallback removal**

- Setup: prelive session with an intentionally invalid access token (e.g., "invalid")
- Action: `addQFBookmark("invalid", "103:1")`
- Expected: function returns `null`; AND a row appears in `qf_api_errors` with `endpoint="/bookmarks"`, `status_code=401`, `error_message` containing "invalid_token" or similar. No silent success

**Test 9: Smoke-test script end-to-end**

- Setup: populated `.env.local` with `QF_SMOKE_USER_ID`, `QF_SMOKE_ACCESS_TOKEN` (pre-authorized prelive token with full scope set)
- Action: `npm run qf:smoke`
- Expected: exit code 0; stdout prints `PASS: <endpoint>` for each of the 14 endpoints; prelive bookmark/note records created during the run are deleted by script exit

**Test 10: Scope string regression — authorize URL**

- Setup: `QF_OAUTH_BASE=https://prelive-oauth2.quran.foundation`, `QF_CLIENT_ID=936700a0-25d7-4fa2-8cef-788a72657562`
- Action: `buildAuthorizeUrl({ redirectUri: "http://localhost:3000/api/auth/callback", state: "x", codeChallenge: "y" })`
- Expected: URL path is `/oauth2/auth`; `scope` param is exactly `openid offline_access user bookmark collection streak preference goal activity_day note`; `code_challenge_method=S256`; `response_type=code`

**Test 11: Env var missing — fail loud**

- Setup: unset `QF_CLIENT_SECRET`
- Action: call `getClientCredentialsToken()`
- Expected: request sent with empty string credentials; QF returns 401; our logger records the error; the app surfaces "QF configuration invalid" rather than silently degrading

## Acceptance Criteria

- [ ] `docs/qf-api-reference.md` exists and lists all 14 endpoints with method, base, path, scope, doc URL, request shape, response shape
- [ ] `lib/qf/errors.ts` exists and is used by every User API wrapper
- [ ] No function in `lib/qf/user.ts` or `lib/qf/bookmarks.ts` has a bare `catch {}` — every catch either rethrows or calls `logQfError`
- [ ] `scripts/qf-smoke-test.ts` exists and exits 0 when run against prelive with valid credentials
- [ ] `npm run qf:smoke` script is present in `package.json`
- [ ] All 14 endpoints return 2xx during a smoke-test run — no FAIL lines
- [ ] The existing health endpoint `/api/health` still returns 200 (no regression)
- [ ] `npx tsc --noEmit` passes
- [ ] `npx vitest run` passes (existing tests not broken)
- [ ] `/docs/learnings/` has a blocker entry for every endpoint path that had to be corrected during the audit
- [ ] No type errors or lint warnings
- [ ] A full sign-in → today → commit → reflect → grove flow in the local dev server completes with zero `qf_api_errors` rows written

## Verification

Run the verifier skill to confirm changes are clean.

### Backend Tests (integration)

- `lib/qf/errors.test.ts` — unit tests for `logQfError` truncation, scrubbing, and DB insert
- `lib/qf/user.test.ts` — extend existing tests to assert `qf_api_errors` is written on 4xx/5xx
- `lib/qf/bookmarks.test.ts` — extend to assert error logging and round-trip mocking
- `lib/qf/oauth.test.ts` — assert `Authorization: Basic` header is present on all three token functions and `client_id`/`client_secret` are absent from the body

### Manual Verification

- [ ] Run `npm run dev`, sign in via QF prelive, complete a full day loop (today → commit → reflect → grove). Confirm `qf_api_errors` table is empty via Supabase SQL editor.
- [ ] Run `npm run qf:smoke` against prelive. Confirm all 14 endpoints print `PASS`.
- [ ] Open `docs/qf-api-reference.md` and verify every endpoint in `lib/qf/` has a row.
- [ ] Sign out, sign in again with a fresh state, confirm new session works (token refresh not yet invoked — that's a separate manual test).
- [ ] Review `docs/learnings/` for any new blocker entries added during the audit.

### E2E Tests

No new E2E tests in this audit. Existing E2E tests in `e2e/today-flow.spec.ts` and `e2e/grove-journal.spec.ts` continue to pass — they exercise the user flow that depends on these integrations, so if an alignment regression slips in, they will catch the symptom at the UI level.

| Scenario                                                 | Test file                                | Assigned sub-task                               |
| -------------------------------------------------------- | ---------------------------------------- | ----------------------------------------------- |
| Existing E2E: today flow still passes after alignment    | `e2e/today-flow.spec.ts` (no changes)    | Task 8 (verify regression-free after all fixes) |
| Existing E2E: grove/journal still passes after alignment | `e2e/grove-journal.spec.ts` (no changes) | Task 8                                          |

## Open Questions

Additional technical open questions beyond those in the business section:

- [x] ~~Do we add QF call timeouts?~~ — **Resolved:** Yes, 10s default via `AbortSignal.timeout(10000)` on every `fetch`. Mapped to `QF_TIMEOUT` error code. Applied in Task 2.
- [x] ~~Does the smoke test run against production?~~ — **Resolved:** No. Prelive only. Hard-coded env check refuses to run if `QF_OAUTH_BASE` matches production URL.
- [x] ~~How do we obtain the `QF_SMOKE_ACCESS_TOKEN`?~~ — **Resolved:** Developer runs `npm run dev`, signs into prelive via the app once, then copies the access token from the `qf_sessions` table into `.env.local`. Token is good for 1 hour; re-sign if expired.
- [ ] Should we add a GitHub Action that runs the smoke test on a schedule? — **Deferred (non-blocking):** Post-hackathon hardening task.
- [ ] Should the error logger batch writes to reduce DB round-trips? — **Deferred (non-blocking):** At hackathon scale the volume is trivial; revisit if we see >100 errors/minute.
