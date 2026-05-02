# Quran Foundation API Reference (Canonical)

Single source of truth for every Quran Foundation endpoint used by this app. When you add, change, or debug a QF integration, this file is the reference — not guesswork, not agent memory.

Every row is one of:

- **[confirmed]** — path and shape verified against the QF docs URL shown, AND against a live prelive smoke test.
- **[docs-only]** — path stated in QF public docs but not yet round-tripped in our smoke test.
- **[empirical]** — path not present in the public QF docs; verified by direct HTTP probe only. May change without notice.

---

## Base URLs

| Env        | `QF_OAUTH_BASE`                           | `QF_CONTENT_BASE`              | `QF_USER_BASE`                                  |
| ---------- | ----------------------------------------- | ------------------------------ | ----------------------------------------------- |
| Prelive    | `https://prelive-oauth2.quran.foundation` | `https://api.quran.com/api/v4` | `https://apis-prelive.quran.foundation/auth/v1` |
| Production | `https://oauth2.quran.foundation`         | `https://api.quran.com/api/v4` | `https://apis.quran.foundation/auth/v1`         |

**Notes:**

- `QF_CONTENT_BASE` is `api.quran.com`, not `apis.quran.foundation`. Content APIs are served by the public Quran.com v4 API. The prelive/production split does NOT apply to content. [blocker](learnings/blocker-qf-content-base-url.md)
- `QF_USER_BASE` path is `/auth/v1` (not `/content/api/user/v1`). [blocker](learnings/blocker-qf-user-api-base.md)
- OAuth2 hosts differ between prelive and production. Always match the User API environment to the OAuth2 environment — mixing breaks tokens.

## Authentication

### Content APIs (scope-bound service token)

`client_credentials` grant with scope `content`. Token cached in-process for 1 hour. Every request carries:

```
x-auth-token: <access_token>
x-client-id: <QF_CLIENT_ID>
```

### User APIs (per-user access token)

`authorization_code` grant with PKCE (S256). Access token persisted in `qf_sessions`, refreshed before the 1-hour TTL. Every request carries the same two headers as content, but with the user's access token.

### Token endpoint auth method

**Always `client_secret_basic`.** Credentials in `Authorization: Basic base64(CLIENT_ID:CLIENT_SECRET)` header. Never in the POST body. QF rejects `client_secret_post` with `401 invalid_client`. [blocker](learnings/blocker-qf-token-auth-basic.md)

---

## Endpoint Inventory

### 1. Authorize (user sign-in redirect) [confirmed]

- **Method:** GET
- **URL:** `{QF_OAUTH_BASE}/oauth2/auth`
- **Caller:** `lib/qf/oauth.ts:buildAuthorizeUrl`
- **Doc:** https://api-docs.quran.foundation/docs/tutorials/oidc/getting-started-with-oauth2/

**Query params:**

- `response_type=code`
- `client_id={QF_CLIENT_ID}`
- `redirect_uri=http://localhost:3000/api/auth/callback`
- `scope=openid offline_access user bookmark collection streak preference goal activity_day note`
- `state={opaque random string}`
- `code_challenge={PKCE S256 challenge}`
- `code_challenge_method=S256`

**Response:** 302 redirect to registered `redirect_uri` with `?code=...&state=...` query params.

Path confirmed: `/oauth2/auth` not `/oauth2/authorize` — the latter returns 404. [blocker](learnings/blocker-qf-authorize-path.md)

---

### 2. Token exchange — authorization_code [confirmed]

- **Method:** POST
- **URL:** `{QF_OAUTH_BASE}/oauth2/token`
- **Caller:** `lib/qf/oauth.ts:exchangeCodeForTokens`

**Headers:**

```
Authorization: Basic base64(CLIENT_ID:CLIENT_SECRET)
Content-Type: application/x-www-form-urlencoded
```

**Body (URL-encoded):**

```
grant_type=authorization_code
code=ory_ac_abc123
redirect_uri=http://localhost:3000/api/auth/callback
code_verifier={PKCE verifier}
```

**Response 200:**

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

**Error 401:** `{"error":"invalid_client","error_description":"..."}` if Basic header wrong or credentials sent in body.

---

### 3. Token refresh [docs-only]

- **Method:** POST
- **URL:** `{QF_OAUTH_BASE}/oauth2/token`
- **Caller:** `lib/qf/oauth.ts:refreshAccessToken`

Same headers and response shape as #2. Body:

```
grant_type=refresh_token
refresh_token={previous refresh_token}
```

---

### 4. Client credentials token [confirmed]

- **Method:** POST
- **URL:** `{QF_OAUTH_BASE}/oauth2/token`
- **Caller:** `lib/qf/oauth.ts:getClientCredentialsToken`
- **Scope:** `content`

Same headers as #2. Body:

```
grant_type=client_credentials
scope=content
```

**Response 200:**

```json
{
  "access_token": "eyJ...",
  "expires_in": 3600,
  "token_type": "bearer",
  "scope": "content"
}
```

---

### 5. Get verse (Arabic Uthmani script) [confirmed]

- **Method:** GET
- **URL:** `{QF_CONTENT_BASE}/verses/by_key/{verse_key}?fields=text_uthmani,verse_key,verse_number`
- **Caller:** `lib/qf/content.ts:getVerseByKey`
- **Scope:** `content`

Path segments include the colon literally — do NOT URL-encode `103:1` to `103%3A1`; the QF API rejects the encoded form.

**Response 200:**

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

---

### 6. Get verse translation [confirmed]

- **Method:** GET
- **URL:** `{QF_CONTENT_BASE}/verses/by_key/{verse_key}?translations={translation_id}&fields=text_uthmani`
- **Caller:** `lib/qf/content.ts:getTranslation`
- **Scope:** `content`

Default `translation_id=131` (The Clear Quran / Mustafa Khattab).

**Response 200:**

```json
{
  "verse": {
    "verse_key": "103:1",
    "text_uthmani": " وَٱلْعَصْرِ",
    "translations": [{ "id": 131, "text": "By time" }]
  }
}
```

The legacy `/quran/translations/{id}?verse_key={key}` endpoint returns `{"translations":[]}` regardless of auth. Do not use it. [blocker](learnings/blocker-qf-translation-endpoint.md)

---

### 7. Get verse audio [confirmed]

- **Method:** GET
- **URL:** `{QF_CONTENT_BASE}/recitations/{recitation_id}/by_ayah/{verse_key}`
- **Caller:** `lib/qf/content.ts:getAudioUrl`
- **Scope:** `content`

Default `recitation_id=7` (Alafasy).

**Response 200:**

```json
{
  "audio_files": [{ "url": "Alafasy/mp3/103001.mp3", "duration": 4000 }]
}
```

Audio URLs are relative. Prepend `https://audio.qurancdn.com/` when the returned URL does not start with `http`.

---

### 8. Get full tafsir [docs-only]

- **Method:** GET
- **URL:** `{QF_CONTENT_BASE}/quran/tafsirs/{tafsir_id}?verse_key={verse_key}`
- **Caller:** `lib/qf/content.ts:getFullTafsir`
- **Scope:** `content`

Default `tafsir_id=169` (Ibn Kathir English). Response shape similar to translation — a `tafsirs` array. Not yet verified via smoke test because the app uses a pre-authored short extract for the main card; the full tafsir drawer is a future enhancement.

---

### 9. Add note [empirical]

- **Method:** POST
- **URL:** `{QF_USER_BASE}/notes`
- **Caller:** `lib/qf/user.ts:addNote`
- **Scope:** `note.create`

**Body:**

```json
{ "verse_key": "103:1", "body": "Today I reflected on how I spend my time." }
```

**Expected response:**

```json
{ "id": "note_018f29c4b3" }
```

Response ID field name (`id` vs `note_id` vs `data.id`) needs live confirmation — our caller handles all three.

---

### 10. Add activity day [empirical — needs verification]

- **Method:** POST
- **URL:** `{QF_USER_BASE}/activity_days` **[verify against prelive]**
- **Caller:** `lib/qf/user.ts:addActivityDay`
- **Scope:** `activity_day.create`

**Body:**

```json
{ "date": "2026-05-02", "seconds_read": 60 }
```

The exact path is one of: `/activity_days`, `/activity/day`, `/activity-days`, `/activity/add-update`. Needs a curl probe against prelive to confirm. Current code uses `/activity/day`.

---

### 11. Get current streak [empirical — needs verification]

- **Method:** GET
- **URL:** `{QF_USER_BASE}/streaks/current` **[verify against prelive]**
- **Caller:** `lib/qf/user.ts:getCurrentStreak`
- **Scope:** `streak.read`

Exact path is one of: `/streaks/current`, `/streaks`, `/streaks/get-current-streak-days`. Needs a curl probe. Our caller tolerates multiple response shapes (`streak_count`, `current_streak`, `streak`).

---

### 12. Add bookmark [empirical]

- **Method:** POST
- **URL:** `{QF_USER_BASE}/bookmarks`
- **Caller:** `lib/qf/bookmarks.ts:addQFBookmark`
- **Scope:** `bookmark.create`

**Body:**

```json
{ "verse_key": "103:1" }
```

**Expected response:**

```json
{ "id": "bookmark_abc123" }
```

Needs live round-trip verification.

---

### 13. List bookmarks [empirical]

- **Method:** GET
- **URL:** `{QF_USER_BASE}/bookmarks`
- **Caller:** `lib/qf/bookmarks.ts:listQFBookmarks`
- **Scope:** `bookmark.read`

**Response shape:** either `{"bookmarks":[...]}` or a bare array. Our caller handles both.

---

### 14. Delete bookmark [empirical]

- **Method:** DELETE
- **URL:** `{QF_USER_BASE}/bookmarks/{bookmark_id}`
- **Caller:** `lib/qf/bookmarks.ts:removeQFBookmark`
- **Scope:** `bookmark.delete`

**Expected response:** 2xx empty body.

---

## Error Codes (app-level)

| Class   | HTTP | Code                 | Meaning                                                                |
| ------- | ---- | -------------------- | ---------------------------------------------------------------------- |
| Auth    | 401  | `QF_TOKEN_EXPIRED`   | Access token expired — caller must refresh and retry once              |
| Auth    | 401  | `QF_INVALID_CLIENT`  | Wrong credentials or wrong auth method (must be `client_secret_basic`) |
| Request | 400  | `QF_BAD_REQUEST`     | Body or query param invalid; do not retry                              |
| Request | 404  | `QF_NOT_FOUND`       | Path or resource wrong; do not retry                                   |
| Scope   | 403  | `QF_FORBIDDEN_SCOPE` | Token lacks a required scope; user must re-authorize                   |
| Rate    | 429  | `QF_RATE_LIMITED`    | Back off 30s then retry once                                           |
| Server  | 5xx  | `QF_SERVER_ERROR`    | Retry with exponential backoff, max 3 attempts                         |
| Timeout | —    | `QF_TIMEOUT`         | Network timeout (>10s); log + surface to user                          |

## Scope Reference

Scopes requested on sign-in (full set required by the app):

```
openid offline_access user bookmark collection streak preference goal activity_day note
```

Granular scopes (`.read`, `.create`, `.update`, `.delete`) exist per resource but our app requests the broad bundle above for simplicity. Future work may narrow this.

## Changelog

- 2026-05-02: Initial version. Consolidates six integration blockers captured in `docs/learnings/` during the build session.
