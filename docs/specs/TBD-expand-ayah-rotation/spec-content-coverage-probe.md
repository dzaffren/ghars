# Quran Reflect gateway and content coverage probe

**Ticket:** TBD
**Type:** Technical — Infrastructure / Research

**Discovery Brief:** ../../discovery/expand-ayah-rotation/brief.md
**Epic Overview:** ./spec.md

This story is the gate for the Expand Ayah Rotation epic. It extends the app's existing connection to the Quran Foundation content platform so it can reach two additional content pools — community reflection posts and scholar ayah-answers — and then runs a one-off coverage probe against a founder-picked shortlist of 20 candidate ayahs. The probe's output is a per-ayah coverage report that decides whether the rest of the epic proceeds or is sent back to discovery.

## Motivation

The epic's plan to grow the rotation from 10 to 30 ayahs leans on external content filling two-thirds of the new slots. That plan only works if the community-reflection pool and the scholar ayah-answers pool actually contain approved, published material for the ayahs the founder wants to include. Today, the app has no way to see inside those pools — its content connection is scoped only to verses, translations, tafsir, and audio. Before any user-facing work begins, the team needs evidence that the external pools can carry the load.

**Current state:** The app reaches the Quran Foundation content platform for verse text, translation, tafsir, and audio only. Community-reflection posts and scholar ayah-answers are on the same platform but sit behind different access scopes the app has never requested. Coverage for the founder's shortlist of 20 candidate ayahs is unknown — the assumption that external content can carry twenty of the thirty slots is untested.

**Desired state:** The app is provisioned for the two additional content pools and can reach them using the same authentication scheme it already uses for verse content. A written report exists that shows, for each of the 20 shortlist ayahs, how much approved community-reflection content and how much published scholar-answer content is available, with a short excerpt of the top item from each pool where present. A go/no-go decision on the rest of the epic has been recorded against that report.

**Trigger:** The epic's rollout strategy treats this probe as a hard gate. Story 2 (the user-facing card variants) cannot begin until the probe confirms the external pools are deep enough to carry roughly two-thirds of the rotation.

## Scope

- **In scope:**
  - Requesting and receiving the additional access scope from the content partner for community-reflection posts and for scholar ayah-answers.
  - Extending the app's existing content connection so it can fetch from both new pools alongside the verse, translation, tafsir, and audio pools it already uses.
  - Running a one-off coverage probe against the founder-picked shortlist of 20 candidate ayahs.
  - Producing a written per-ayah report showing counts from each pool and a short excerpt of the top item from each pool where one exists.
  - Recording the gate decision (proceed or pause) and communicating it to the product owner.
- **Out of scope:**
  - Any user-facing surface that displays community-reflection or scholar-answer content. That is Story 2.
  - Selecting or locking the final 30 ayahs for launch. That is Story 3.
  - Caching, daily assignment, or "same user same card same day" behaviour. That is Story 2.
  - Attribution rendering rules on cards. Story 2 owns the attribution surface; this story only flags the open question to the content partner.
  - Any change to how verse text, translation, tafsir, or audio are fetched today.

## Goals

- The app is authorised to reach the community-reflection pool and the scholar ayah-answers pool on the Quran Foundation content platform.
- A coverage report exists covering all 20 ayahs on the founder's shortlist, with counts from each pool and sample excerpts.
- A recorded go/no-go decision is in the product owner's hands before any Story 2 work begins.
- The team avoids investing further epic effort if the external pools cannot support the model.

## Non-Goals

- This story does not ship any change that a user on Today, the journal, the grove, the weekly review, or any other surface could perceive. The probe is operational work.
- This story does not decide which 20 ayahs are on the shortlist — the founder provides that list.
- This story does not select the final mix of action, reflection, and Q&A cards. It only provides the evidence the later stories use to decide.

## Success Criteria

- The app can reach both new content pools using the same authentication scheme it already uses for verses, translations, tafsir, and audio — differing only by the expanded access scope.
- The probe produces a report covering every one of the 20 ayahs on the founder's shortlist. No ayah is missing, no row is blank.
- Each row in the report shows: the ayah reference, the count of approved community-reflection posts found, the count of published scholar answers found, and — where at least one item exists in a pool — a short excerpt of the top item from that pool.
- The gate rule is applied in writing: if fifteen or more of the twenty ayahs return at least one usable item from either pool, the report is marked "proceed to Story 2". If fewer than fifteen do, the report is marked "pause epic and reopen discovery".
- The product owner receives the report and the gate decision before any Story 2 work starts.

## Acceptance Criteria

### Scenario: Gateway access reaches both new content pools

```gherkin
Given the content partner has provisioned access to the community-reflection pool and the scholar-answers pool for this app
  And the app is configured with the expanded access scope
When the app requests content for an ayah such as "Al-Baqarah 2:153" from the community-reflection pool
  And the app requests content for the same ayah from the scholar-answers pool
Then both requests return a result from the content partner
  And both results are retrieved using the same authentication scheme the app already uses for verses, translations, tafsir, and audio
```

### Scenario: Coverage probe produces a complete per-ayah report

```gherkin
Given the founder has supplied a shortlist of twenty candidate ayahs
  And the gateway access to both new pools is in place
When the coverage probe is run once against the shortlist
Then a written report is produced
  And the report contains one row for each of the twenty ayahs with no rows missing
  And every row shows the ayah reference, the count of approved community-reflection posts, and the count of published scholar answers
  And every row that has at least one item in a pool also shows a short excerpt of the top item from that pool
```

### Scenario: Example report row for a well-covered ayah

```gherkin
Given the shortlist includes "Ar-Ra'd 13:28"
  And the community-reflection pool contains at least one approved post about remembrance of Allah bringing the heart to rest
  And the scholar-answers pool contains at least one published answer discussing the same ayah
When the coverage probe is run
Then the report row for "Ar-Ra'd 13:28" shows a non-zero count of approved community-reflection posts
  And the report row for "Ar-Ra'd 13:28" shows a non-zero count of published scholar answers
  And the report row for "Ar-Ra'd 13:28" shows a short excerpt drawn from the top community-reflection post
  And the report row for "Ar-Ra'd 13:28" shows a short excerpt drawn from the top scholar answer
```

### Scenario: Example report row for an ayah with partial coverage

```gherkin
Given the shortlist includes "At-Taghabun 64:11"
  And the community-reflection pool contains no approved posts for that ayah
  And the scholar-answers pool contains two published answers for that ayah
When the coverage probe is run
Then the report row for "At-Taghabun 64:11" shows a zero count for approved community-reflection posts
  And the report row for "At-Taghabun 64:11" shows a count of two published scholar answers
  And the report row for "At-Taghabun 64:11" shows a short excerpt drawn from the top scholar answer
  And the report row for "At-Taghabun 64:11" does not show an excerpt for the community-reflection pool
```

### Scenario: Example report row for an ayah with no coverage in either pool

```gherkin
Given the shortlist includes a candidate ayah such as "Al-Hujurat 49:12"
  And neither the community-reflection pool nor the scholar-answers pool contains approved, published content for that ayah
When the coverage probe is run
Then the report row for "Al-Hujurat 49:12" shows a zero count for approved community-reflection posts
  And the report row for "Al-Hujurat 49:12" shows a zero count for published scholar answers
  And the report row for "Al-Hujurat 49:12" shows no excerpt for either pool
  And the row is visibly flagged as a "no coverage" row so the founder can spot it at a glance
```

### Scenario: Gate decision — proceed to Story 2

```gherkin
Given the coverage probe has completed
  And fifteen or more of the twenty shortlist ayahs returned at least one usable item from either the community-reflection pool or the scholar-answers pool
When the gate rule is applied to the report
Then the report is marked "proceed to Story 2"
  And the product owner is notified in writing that the epic may continue
  And the decision and the supporting counts are recorded alongside the report
```

### Scenario: Gate decision — pause epic and reopen discovery

```gherkin
Given the coverage probe has completed
  And fewer than fifteen of the twenty shortlist ayahs returned at least one usable item from either pool
When the gate rule is applied to the report
Then the report is marked "pause epic and reopen discovery"
  And the product owner is notified in writing that Story 2 must not start
  And the decision and the supporting counts are recorded alongside the report
  And the founder is prompted to revisit the shortlist or the rotation model before the epic resumes
```

### Scenario: Access scope not yet granted by the content partner

```gherkin
Given the content partner has not yet provisioned the expanded access scope for this app
When the team attempts to run the coverage probe
Then the probe does not produce a partial or misleading report
  And the situation is recorded as "blocked: awaiting content-partner access"
  And the product owner is notified that the gate cannot be evaluated until access is provisioned
  And no Story 2 work begins
```

### Scenario: Probe has no effect on any user-facing surface

```gherkin
Given the probe is being run by the team
When a pre-launch user opens the app on Today, the journal, the grove, the weekly review, or any other surface during the probe run
Then the user sees exactly what they would have seen with no probe in progress
  And no new card type, no new badge, and no new message appears anywhere in the app
```

## Constraints

- **Backwards compatibility:** Must maintain. The existing flows for verse, translation, tafsir, and audio content continue to work unchanged. Extending the connection to reach two additional pools must not disturb the four pools already in use.
- **Downtime:** Zero-downtime required. The probe is read-only operational work and runs alongside normal app use without affecting any user surface.
- **Compliance:** The access scope for community-reflection posts may come with partner-imposed attribution or link-back requirements. Any such requirement must be surfaced in the scope request and passed to Story 2, which owns the attribution surface.
- **Rollback:** Not applicable. The probe is read-only; there is nothing to roll back. If the gate decision is "pause and reopen discovery", the work already done (scope provisioning, gateway extension) remains in place and is reused when the epic resumes.

## Dependencies

- The content partner must provision the expanded access scope covering both the community-reflection pool and the scholar ayah-answers pool before the probe can be run. This is a blocking dependency.
- The founder must supply the shortlist of twenty candidate ayahs before the probe can be run.
- The app's existing connection to the Quran Foundation content platform for verses, translations, tafsir, and audio must remain available throughout. No change to those flows is expected.
- The product owner must be available to receive the report and record the gate decision before Story 2 is planned.

## Open Questions

- [x] ~~Does the probe need to cover languages other than English?~~ — **Resolved:** No. The epic scopes reflection and Q&A card bodies to English only at launch, so the probe only counts English-language approved posts and published answers.
- [x] ~~Does the probe itself need to be re-runnable on a schedule?~~ — **Resolved:** No. The probe is a one-off operational check that informs the gate decision. Ongoing coverage monitoring is a post-launch concern and is explicitly out of scope.
- [ ] Whether the content partner requires a visible link back to the community-reflection source on any consumer surface (not just the "Shared on Quran Reflect" text attribution) — **Deferred (non-blocking):** Owned by Story 2 at card-render time. Flagged here so the scope request to the content partner explicitly asks for clarification; the answer feeds Story 2's attribution rules.

---

## Solution Design

The repo already has `lib/qf/client.ts` → `qfContentFetch(path)` against `QF_CONTENT_BASE = https://api.quran.com/api/v4` using the `content` scope. Reflect and ayah-answers live on a **different host** (`apis.quran.foundation`) and require **different scopes** (`post.read` and `comment.read`). So this story adds a parallel fetch path alongside the existing one.

### Gateway additions (parallel to existing content client)

- New env var `QF_REFLECT_BASE` (default `https://apis.quran.foundation`) — the reflect/answers gateway base URL.
- New token cache in `lib/qf/client.ts`: `_reflectToken` / `_reflectTokenExpiry`, mirroring the existing `_contentToken` cache. Token fetch reuses `getClientCredentialsToken(scope)` — that function already accepts a scope argument.
- New wrapper `qfReflectFetch(path, revalidate = 3600)` in `lib/qf/client.ts` — same shape as `qfContentFetch`, but hits `QF_REFLECT_BASE` and passes `scope = "post.read comment.read"` when minting a token. Same header convention (`x-auth-token`, `x-client-id`).
- New module `lib/qf/reflect.ts` exports two thin functions:
  - `listReflectPostsForAyah(verseKey, opts?): Promise<{ total: number; posts: ReflectPost[] }>` — calls `GET /quran-reflect/v1/posts/feed?filter[references][0][chapterId]={ch}&filter[references][0][from]={ayah}&filter[verified]=true&filter[languages]=en&sort=featured&limit={n}`.
  - `listAyahAnswers(verseKey, opts?): Promise<{ total: number; answers: AyahAnswer[] }>` — calls `GET /content/api/v4/ayah-answers?ayah_key={key}&status=Published&language=en&pageSize={n}` (exact path verified against QF docs at probe run time; see open question in the research report).
- The probe script `scripts/qf-coverage-probe.ts` imports those two functions, iterates over a shortlist, and writes a CSV.

### Changes

- `lib/qf/client.ts` — add `QF_REFLECT_BASE`, `_reflectToken`/`_reflectTokenExpiry`, and `qfReflectFetch(path, revalidate)`. No change to existing `qfContentFetch` or `qfUserFetch`.
- `lib/qf/reflect.ts` — new module. Exports `ReflectPost`, `AyahAnswer` types and the two list functions.
- `lib/qf/oauth.ts` — no change. `getClientCredentialsToken(scope)` already accepts the scope.
- `scripts/qf-coverage-probe.ts` — new. Reads a shortlist JSON, invokes both list functions per ayah, writes `docs/discovery/expand-ayah-rotation/probe-report.csv` + `.md`.
- `data/probe-shortlist.json` — new. Curator-provided list of 20 `{ verse_key }` entries. Committed to the repo so the probe run is reproducible.
- `docs/discovery/expand-ayah-rotation/probe-report.csv` / `.md` — probe output. Committed on the branch that ships Story 1 so the gate decision has an audit trail.
- `.env.example` — document `QF_REFLECT_BASE` env var (default applies if unset).

### Data Model & Migrations

None. This story is read-only against QF and writes only a CSV/Markdown report to the repo.

### Architecture Notes

- **New dependencies:** none. Uses built-in `fetch`, `AbortSignal.timeout`, and the existing `@anthropic-ai/sdk`-free QF flow.
- **Dependencies & integration:** Parallel to `qfContentFetch`; does not touch any existing route, DB query, or UI. The probe is a CLI-only invocation (`tsx scripts/qf-coverage-probe.ts`); no route handler or server component imports from `scripts/`.
- **Rate limits:** QF does not publish per-endpoint limits. The probe serialises per-ayah calls with a small concurrency cap (e.g. `p-limit(3)`) and respects any `429` by sleeping and retrying once. 20 ayahs × 2 endpoints = 40 requests total — well under any reasonable quota.
- **Error logging:** Reuse `logQfError` from `lib/qf/errors.ts` for any non-2xx response.

## Exemplar Files

- `lib/qf/client.ts` — the `qfContentFetch` wrapper pattern is exactly what `qfReflectFetch` follows (token cache + `x-auth-token`/`x-client-id` headers + `AbortSignal.timeout` + `logQfError` on non-2xx).
- `lib/qf/content.ts` — `getFullTafsir`, `getTranslation` show the "thin typed wrapper around a QF path" pattern that `listReflectPostsForAyah` and `listAyahAnswers` mirror.
- `scripts/qf-smoke-test.ts` (if present; see `.claude/worktrees/agent-a96d60d940f9963a4/scripts/qf-smoke-test.ts` for prior shape) — the CLI-script pattern for a one-off QF check.

## Implementation Plan

### Sub-tasks

**Task 1: Extend QF client with reflect gateway + token cache** — _small_

- Files: `lib/qf/client.ts`, `.env.example`
- INDEPENDENT
- Add `QF_REFLECT_BASE`, `_reflectToken`, `_reflectTokenExpiry`, `ensureReflectToken()`, and `qfReflectFetch(path, revalidate)`. Mint the token via `getClientCredentialsToken("post.read comment.read")`. Headers, timeout, error-logging are identical to `qfContentFetch`.

**Task 2: Add typed reflect/answers wrappers** — _small_

- Files: `lib/qf/reflect.ts`
- SEQUENTIAL (depends on Task 1)
- Export types `ReflectPost` (`id`, `body`, `verified`, `featuredAt`, `moderationStatus`, `languageName`, `likesCount`, `commentsCount`) and `AyahAnswer` (`id`, `type: 'TAFSIR' | 'CLARIFICATION'`, `body`, `status`, `language`, `answeredBy`). Export `listReflectPostsForAyah(verseKey, { limit = 5 } = {})` and `listAyahAnswers(verseKey, { pageSize = 5 } = {})`.

**Task 3: Author probe shortlist** — _small_

- Files: `data/probe-shortlist.json`
- INDEPENDENT
- 20 `{ verse_key }` entries provided by the founder. Pure content work.

**Task 4: Coverage probe script + report writer** — _medium_

- Files: `scripts/qf-coverage-probe.ts`, `docs/discovery/expand-ayah-rotation/probe-report.csv`, `docs/discovery/expand-ayah-rotation/probe-report.md`
- SEQUENTIAL (depends on Tasks 1, 2, 3)
- Reads shortlist, calls both list functions per ayah with `p-limit(3)` concurrency, builds a per-row record `{ verse_key, posts_total, answers_total, top_post_excerpt, top_answer_excerpt, usable }`. Excerpts are sanitised via the existing DOMPurify pattern, truncated to 200 chars. Writes a CSV for the spreadsheet view and a Markdown table for the PR body. Prints `proceed` / `pause` based on `usable_count >= 15`.

**Task 5: Record gate decision** — _small_

- Files: `docs/discovery/expand-ayah-rotation/brief.md`
- SEQUENTIAL (depends on Task 4)
- Append a "Probe Outcome" section to the discovery brief with the `usable` count, the `proceed`/`pause` verdict, and a link to `probe-report.md`. This is the written artifact referenced by the gate scenarios above.

### Negative Constraints

- Do NOT modify `qfContentFetch` or `qfUserFetch`. The reflect path is strictly additive.
- Do NOT call `qfReflectFetch` from any route handler, server component, or client component in this story. Runtime calls are introduced by Story 2.
- Do NOT change any existing QF scope or token cache. The content token (`scope=content`) remains untouched and is minted independently of the reflect token.
- Do NOT commit `.env.local`, `QF_CLIENT_SECRET`, or any raw QF bearer token. `.env.example` documents only the `QF_REFLECT_BASE` variable name and its default.

## Test Scenarios

**Test 1: `qfReflectFetch` mints and caches a `post.read` token**

- Setup: Clear the reflect token cache. Mock `getClientCredentialsToken("post.read comment.read")` to return `{ access_token: "rt_abc", expires_in: 3600 }`. Mock `fetch` for `${QF_REFLECT_BASE}/quran-reflect/v1/posts/feed?...` to return `200 { total: 0, data: [] }`.
- Action: Call `qfReflectFetch("/quran-reflect/v1/posts/feed?filter[references][0][chapterId]=2&filter[references][0][from]=153&filter[verified]=true&limit=5")` twice in succession.
- Expected: `getClientCredentialsToken` is invoked exactly once; the second call uses the cached token. Both fetch calls carry `x-auth-token: rt_abc` and `x-client-id: <QF_CLIENT_ID>`.

**Test 2: `listReflectPostsForAyah` returns only verified English posts**

- Setup: Mock `qfReflectFetch` to return `{ total: 3, data: [ { id: 48291, verified: true, languageName: "English", body: "<p>Patience paired with prayer...</p>", featuredAt: "2025-11-14T09:22:00Z", moderationStatus: "APPROVED" }, { id: 48200, verified: false, languageName: "English", body: "..." }, { id: 48100, verified: true, languageName: "Arabic", body: "..." } ] }`.
- Action: `await listReflectPostsForAyah("2:153", { limit: 5 })`.
- Expected: Returns `{ total: 1, posts: [{ id: 48291, ... }] }`. Unverified and non-English posts are dropped; only `verified && languageName === "English"` survive.

**Test 3: `listAyahAnswers` filters to Published + English**

- Setup: Mock `qfReflectFetch` to return `{ totalCount: 2, questions: [ { id: "q_1", answers: [ { id: "a_1", status: "Published", language: "English", body: "<p>The closing du'a...</p>", answeredBy: "Dr. Z" } ] }, { id: "q_2", answers: [ { id: "a_2", status: "Draft", language: "English", body: "..." } ] } ] }`.
- Action: `await listAyahAnswers("2:286")`.
- Expected: Returns `{ total: 1, answers: [{ id: "a_1", status: "Published", language: "English", ... }] }`. Draft answers are filtered out.

**Test 4: Probe produces a complete report with gate verdict `proceed`**

- Setup: `data/probe-shortlist.json` has 20 verse keys. Mock both list functions so 17 of 20 return at least one post or answer; the other 3 return zero from both pools.
- Action: `tsx scripts/qf-coverage-probe.ts` (with mocked fetch at the lowest level).
- Expected: `docs/discovery/expand-ayah-rotation/probe-report.csv` has 20 rows. `probe-report.md` contains a Markdown table with a final line `**Verdict:** proceed (17/20 usable)`. Process exits `0`.

**Test 5: Probe writes `pause` verdict when usable count is below threshold**

- Setup: Same as Test 4, but mocks so only 9 of 20 are usable.
- Action: `tsx scripts/qf-coverage-probe.ts`.
- Expected: `probe-report.md` contains `**Verdict:** pause — reopen discovery (9/20 usable)`. Process exits `1` so CI fails loudly if someone tries to proceed past the gate.

**Test 6: Unprovisioned scope surfaces as a clear failure, not a partial report**

- Setup: Mock `getClientCredentialsToken("post.read comment.read")` to reject with `new Error("Client credentials failed: 400 invalid_scope")`.
- Action: `tsx scripts/qf-coverage-probe.ts`.
- Expected: Script exits non-zero with message `BLOCKED: awaiting content-partner access (post.read scope not provisioned)`. No partial CSV/MD is written.

**Test 7: Excerpts are sanitised before being written to the report**

- Setup: Mock a post body of `"<p>Steady, and asking.</p><script>alert(1)</script>"`.
- Action: Run the probe for a single ayah.
- Expected: The report row's `top_post_excerpt` contains `"Steady, and asking."` only — no `<script>`, no HTML tags, no raw markup. DOMPurify (`ALLOWED_TAGS: []`, text-only mode) is invoked before truncation.

**Test 8: Probe is idempotent**

- Setup: A report already exists on disk from a prior run.
- Action: Re-run `tsx scripts/qf-coverage-probe.ts`.
- Expected: Old report is overwritten with the new contents. No merged or appended output.

## Acceptance Criteria

- [ ] `qfReflectFetch` exists in `lib/qf/client.ts` with its own token cache, mints via `getClientCredentialsToken("post.read comment.read")`, and carries `x-auth-token` + `x-client-id` headers.
- [ ] `lib/qf/reflect.ts` exports `listReflectPostsForAyah` and `listAyahAnswers`, both of which filter to `verified + English` and `Published + English` respectively.
- [ ] `data/probe-shortlist.json` contains 20 `{ verse_key }` entries.
- [ ] `scripts/qf-coverage-probe.ts` runs end-to-end against mocked fetch and produces both `probe-report.csv` and `probe-report.md` in `docs/discovery/expand-ayah-rotation/`.
- [ ] Report includes per-ayah counts and sanitised excerpts; scripts exit code is `0` for `proceed`, non-zero for `pause` or `BLOCKED`.
- [ ] The discovery brief gains a "Probe Outcome" section with the verdict, counts, and a link to `probe-report.md`.
- [ ] No route handler, server component, or client component imports from `scripts/` or calls `qfReflectFetch`.
- [ ] All existing tests still pass.
- [ ] No type errors or lint warnings.

## Verification

Run the `did-workflow:verifier` skill after implementation.

### Backend Tests

- `tests/unit/qf/reflect-client.test.ts` — Tests 1–3 and 7 (token caching, verified/English filter, published/English filter, sanitisation).
- `tests/unit/scripts/qf-coverage-probe.test.ts` — Tests 4, 5, 6, 8 (proceed verdict, pause verdict, unprovisioned scope, idempotency) using a mocked fetch and a temp report directory.

### Manual Verification

- [ ] Run `tsx scripts/qf-coverage-probe.ts` locally against a real provisioned QF client once `post.read` scope is granted; confirm the report's counts line up with spot checks on the Quran Reflect website.
- [ ] Inspect `docs/discovery/expand-ayah-rotation/probe-report.md` and confirm it is readable as a PR artifact.
- [ ] Confirm no user-facing surface has changed: open the app at `/today`, verify the card renders exactly as it did before this story's branch.

### E2E Tests

Not applicable. This story has zero user-facing impact and is fully exercised by backend unit tests plus the manual probe run.
