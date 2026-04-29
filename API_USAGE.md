# Quran Foundation API Usage

Ghars integrates **both** QF API families required by the hackathon brief:
Content APIs (verses, tafsir, audio, recitations, chapters) and User APIs
(bookmarks, streaks, goals, activities). Integration is **deep**, not
surface-level — every user-facing feature touches at least one QF endpoint,
and three endpoints are written to, not just read.

## Endpoint map

| QF endpoint                                                                  | Method   | Feature in Ghars                                                                                                                                          | Code path                                                                                   |
| ---------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Content API**                                                              |          |                                                                                                                                                           |
| `/verses/by_key/{key}` (with `words=true`, `translations=20`, `tafsirs=169`) | GET      | Daily mission verse: Arabic, Saheeh International translation, Ibn Kathir tafsir snippet, and word-by-word breakdown for tap-to-look-up                   | `lib/qf/content-client.ts:102` (`fetchVerse`) and `:150` (`fetchVerseWords`)                |
| `/recitations/{id}/by_ayah/{key}`                                            | GET      | In-app ayah audio playback on /today and in the verse sheet                                                                                               | `lib/qf/content-client.ts:124`                                                              |
| `/verses/random`                                                             | GET      | Random-verse helper (fallback mission generation when focus-area search returns empty)                                                                    | `lib/qf/content-client.ts:178`                                                              |
| `/resources/recitations`                                                     | GET      | Reciter list for audio selection                                                                                                                          | `lib/qf/content-client.ts:188`                                                              |
| `/chapters`                                                                  | GET      | Chapter list for the surah reader                                                                                                                         | `lib/qf/content-client.ts:192`                                                              |
| `/chapters/{id}/verses` (paginated, `per_page=300`)                          | GET      | Full surah view, used when a user opens a bookmarked verse in context                                                                                     | `lib/qf/content-client.ts:227`                                                              |
| Content OAuth2 `POST /oauth2/token` (client-credentials)                     | POST     | Service-to-service auth for all Content API calls; in-memory token cache with TTL                                                                         | `lib/qf/content-client.ts:33`                                                               |
| **User API**                                                                 |          |                                                                                                                                                           |
| `/bookmarks`                                                                 | POST     | When the user taps the bookmark icon on /today, Ghars writes the verse to their QF library                                                                | `lib/qf/user-client.ts:27` (`addBookmark`) → `app/api/bookmarks/route.ts:40`                |
| `/bookmarks?first=20`                                                        | GET      | Bookmarks page reads from QF, not from local DB — the QF library is the source of truth                                                                   | `lib/qf/user-client.ts:45` (`getBookmarks`)                                                 |
| `/streaks`                                                                   | GET      | QF platform streak is displayed alongside Ghars local streak on /history, so users see unified reading+reflection progress across the ecosystem           | `lib/qf/user-client.ts:52` (`getStreaks`) → `app/history/page.tsx:77`                       |
| `/goals`                                                                     | POST     | On onboarding, Ghars creates a persistent "Daily Quran Mission" goal on QF tied to each user                                                              | `lib/qf/user-client.ts:67` (`createDailyReflectionGoal`) → `app/api/onboarding/route.ts:42` |
| `/goals/{id}/activities`                                                     | POST     | Every accepted reflection logs an activity back to the QF goal, so progress shows in the QF platform too                                                  | `lib/qf/user-client.ts:94` (`logGoalActivity`) → `lib/mission/judge.ts:97`                  |
| **User OAuth (PKCE)**                                                        |          |                                                                                                                                                           |
| `/oauth2/auth`                                                               | Redirect | Sign-in flow redirects to QF for user auth with PKCE + nonce                                                                                              | `lib/auth/qf-oauth.ts:29` (`buildAuthUrl`)                                                  |
| `/oauth2/token` (code grant)                                                 | POST     | Exchange authorization code for access+refresh+id tokens on the callback                                                                                  | `lib/auth/qf-oauth.ts:46` (`exchangeCodeForTokens`)                                         |
| `/oauth2/token` (refresh grant)                                              | POST     | Transparent refresh — any server-side QF call that finds an access token within 60s of expiry triggers an automatic refresh, keeping the UX uninterrupted | `lib/auth/qf-oauth.ts:70` + `:94` (`getValidQfAccessToken`)                                 |

## Write operations (not just reads)

Many hackathon submissions will _read_ QF content (verses, audio). Ghars also
**writes** to three User API endpoints, making it a first-class citizen of the
QF platform:

1. **Bookmarks** — `POST /bookmarks` on user intent.
2. **Goal creation** — `POST /goals` on onboarding; goal id persisted to
   `users.qf_goal_id` for lifetime of the account.
3. **Activity logging** — `POST /goals/{id}/activities` on every accepted
   reflection; non-fatal if the QF endpoint is unavailable (we fall back to a
   local `activity_log` table), but the integration is always attempted and
   any failure is logged under a `[qf-goal-activity]` tag for auditability.

## How QF data is woven into core mechanics

- **Arabic word SRS**: the word breakdown from `/verses/by_key?words=true`
  feeds the spaced-repetition vocabulary deck (see `lib/words/sm2.ts`). Each
  word carries its QF root id, which drives the species-unlock system
  (olive/palm/fig/pomegranate in `data/root-to-species.json`).
- **Tafsir on demand**: the Ibn Kathir tafsir snippet from the `tafsirs=169`
  include is displayed inline under the verse — judges can verify this on
  /today by tapping "See tafsir" on any mission.
- **Verse-level audio**: every mission renders a QF recitation from
  `/recitations/{id}/by_ayah/{key}`, with graceful fallback if the reciter
  endpoint returns no audio for that ayah.

## Auth architecture

Ghars uses **two** OAuth flows simultaneously — an uncommon but required
pattern for hackathon submissions that need both content and user data:

- **Content API** uses client-credentials OAuth against production
  `oauth2.quran.foundation`, with an in-memory token cache.
- **User API** uses authorization-code + PKCE against the pre-live environment
  `apis.quran.foundation/apis-prelive/auth/v1`, with per-user refresh tokens
  persisted in `users.qf_refresh_token` and automatic refresh on any access
  within 60s of expiry.

This separation is deliberate: content calls don't need a user token and
shouldn't consume user quota; user calls must be scoped to the signed-in
person.

## Environment variables

| Variable                                            | Used for                                                  |
| --------------------------------------------------- | --------------------------------------------------------- |
| `QF_BASE_URL`                                       | Content API base URL                                      |
| `QF_CONTENT_CLIENT_ID` / `QF_CONTENT_CLIENT_SECRET` | Content API client credentials                            |
| `QF_CONTENT_OAUTH_URL`                              | Content API OAuth (defaults to `oauth2.quran.foundation`) |
| `QF_USER_BASE_URL`                                  | User API base (defaults to pre-live)                      |
| `QF_OAUTH_URL`                                      | User OAuth base (PKCE flow)                               |
| `QF_AUTH_CLIENT_ID` / `QF_AUTH_CLIENT_SECRET`       | User OAuth credentials                                    |
| `QF_CLIENT_ID` / `QF_CLIENT_SECRET`                 | Shared fallback for either flow in local dev              |
