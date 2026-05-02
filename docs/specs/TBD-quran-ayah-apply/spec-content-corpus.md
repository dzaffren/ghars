# Ayah Corpus Curation & Demo-Mode Seed Data

**Ticket:** TBD
**Type:** Technical — Content / Data Seeding
**Discovery Brief:** `docs/discovery/quran-ayah-apply/brief.md`
**Epic Overview:** `docs/specs/TBD-quran-ayah-apply/spec.md`

This work produces the curated ayah corpus that is the substance the rest of the product arranges around — at least 60 ayat with two human-edited action prompts each, spread across eight thematic areas — plus a demo-mode seed that pre-populates a fresh demo account with seven days of simulated reflection history so judges can experience the cumulative grove and weekly review from first open. It unblocks every user-facing story by giving them real content to display, and it protects the product's theological integrity by enforcing that no unedited AI-generated text ever reaches a user.

## Motivation

Content is the single largest delivery risk of this sprint and the single largest lever on the highest-weighted judging criterion. The hackathon awards 30 of 100 points for _Impact on Quran engagement_ — depth and care of curated content is the most visible signal of that impact to a judge — and a further 15 points for _API integration quality_, which rewards live, load-bearing use of the Quran Foundation Content APIs rather than hardcoded text. A sparse, repetitive, or AI-smelling corpus would lose both sets of points simultaneously.

Judges evaluate in short, often single-session windows. Without demo-mode seeding, a fresh evaluator opening the app sees an empty grove, a zero cumulative counter, and no weekly review to enter — the parts of the product that express the core insight (cumulative meaningful engagement over streak anxiety) would be invisible. Demo mode makes those screens reviewable from the first tap.

Finally, the editorial workload is non-trivial: sixty ayat at roughly five to ten minutes of human editing each is five to ten hours of focused writing on top of a full development workload. Treating it as its own tracked workstream, running in parallel with development from sprint day one, is the only way it lands by the submission deadline.

**Current state:** No curated content exists. Any ayah shown to a user today would come from an unvetted source — either hardcoded samples committed during development or AI-generated strings surfaced directly to users — neither of which is acceptable for a theology-sensitive product nor for a judging panel looking for editorial depth. The grove home screen, weekly review, and month counter would all present as empty to a fresh evaluator, making the product's core differentiation invisible in a short judging session.

**Desired state:** At least 60 carefully curated ayat, each with two human-reviewed action prompts, spread across eight thematic areas (character, worship, family, patience, dhikr, gratitude, trust in Allah, justice) with at least five ayat per theme. Every action prompt carries a human-review stamp; no unedited AI output ships. Ayah text, translation, condensed tafsir, and audio are fetched live from the Quran Foundation Content APIs at display time — the corpus itself stores only the ayah reference and the two action prompts. A demo-mode account seeded with seven days of reflection history across seven different ayat from the corpus is reachable by a "Try with sample data" entry point and by a direct demo URL, so a judge sees a populated grove, a cumulative count of seven, and a reviewable week within one tap.

**Trigger:** Hackathon submission deadline 2026-05-20. _Impact on Quran engagement_ is the top-weighted criterion; _API integration quality_ is the second load-bearing criterion; both are directly exposed by the quality, breadth, and liveness of the corpus pipeline.

## Scope

- **In scope:**
  - Production of a curated corpus of at least 60 ayat by submission date, each with two human-edited action prompts, covering eight thematic areas (character, worship, family, patience, dhikr, gratitude, trust in Allah, justice) with at least five ayat per theme.
  - An editorial pipeline where AI drafts a first pass of action prompts and the product owner personally reviews and edits every prompt before it is marked shippable. Every shipped prompt carries a human-review stamp.
  - Live runtime integration with the Quran Foundation Content APIs so that ayah text, translation (default: The Clear Quran by Mustafa Khattab), condensed tafsir (default: Ibn Kathir), and audio are fetched on demand when a user views an ayah. The stored corpus contains only ayah references and the two action prompts.
  - A demo-mode seed that, when activated, provisions a fresh demo account pre-populated with seven days of completed reflection history covering seven different ayat drawn from the corpus. Each of the seven demo reflections uses a realistic ayah reference and realistic reflection text authored by the product owner.
  - Two entry paths into demo mode: the "Try with sample data" action on the welcome screen (whose UI is owned by the onboarding story; this story delivers the data flow behind it) and a demo query parameter on the app URL for direct judge links.
  - Best-effort editorial spot-check by a knowledgeable reviewer on the evening before submission if one is available; otherwise the AI-draft-then-human-edit pipeline is the sole control.
  - The ability to re-run the content pipeline and refresh the corpus at any point up to the submission deadline.

- **Out of scope:**
  - Coverage of the entire Quran — the corpus is deliberately curated, not comprehensive.
  - User-contributed content, crowdsourced action prompts, or scholar-sourced variants.
  - Any language other than English for action prompts in the submission corpus.
  - Automated content-quality gates beyond human editorial review.
  - Prayer-time-based or context-aware ayah selection — the selection logic for which ayah a user sees on a given day belongs to the morning-loop story, not this one.
  - A post-submission content update pipeline — the 60+ ayat shipped at submission are the submission corpus.
  - The UI for the "Try with sample data" button on the welcome screen itself (owned by the onboarding story). This story supplies the seeded demo data it activates.

## Goals

- At least 60 distinct ayat in the shipped corpus by submission, each with two human-edited action prompts.
- Thematic spread of at least five ayat per theme across all eight themes, so that in any rolling fourteen-day window a user does not see the same theme more than twice in a row.
- Zero user-visible strings in the corpus are unedited AI output — 100 percent of action prompts carry a human-review stamp at ship time.
- Demo-mode account provisioning is perceptibly instantaneous from the entry tap — under one second to a seeded home screen showing seven trees.
- When a user views any ayah in the app, translation and tafsir are served by the Quran Foundation Content APIs rather than from strings stored locally alongside the corpus.

## Non-Goals

- Completeness of Quranic coverage — submission deliberately ships a curated 60+, not the full Quran.
- Multilingual action prompts — English only at submission.
- A live content management UI — the pipeline is author-operated, not end-user-operated.
- Algorithmic ayah selection personalisation — ayat are served in a curated order defined by the corpus itself.

## Success Criteria

- A judge landing on the demo-mode URL sees, within one second of first paint, a populated grove home screen showing seven trees, a cumulative-month counter reading seven, and a reachable weekly review containing seven ayat and seven reflections.
- Opening any ayah in the app — whether in demo mode or a regular account — shows the correct Arabic text, the chosen translation (The Clear Quran by default), a condensed one-to-two-sentence tafsir extract (Ibn Kathir by default), working audio playback, and the two curated action prompts for that ayah.
- Within the first sixty days of use, no user encounters a blank ayah screen, a missing translation, a missing tafsir, or a missing action prompt under normal operation.
- The shipped corpus contains at least sixty distinct ayah references, with at least five ayat per each of the eight themes, and every action prompt is stamped as human-reviewed.
- The product owner can re-run the content pipeline and refresh the shipped corpus up to the evening before the submission deadline.

## Acceptance Criteria

> Operational scenarios, written from the perspective of observable system and content behaviour.
> See `bdd-format.md` for Gherkin rules.

### Scenario: Corpus size and thematic spread at ship time

```gherkin
Given the curated corpus is loaded at the point of submission
When the corpus is inspected for size and thematic coverage
Then it contains at least sixty distinct ayah references
  And each ayah reference has exactly two action prompts
  And every action prompt is marked as human-reviewed
  And the eight themes character, worship, family, patience, dhikr, gratitude, trust in Allah, and justice each have at least five ayat assigned to them
```

### Scenario: A real ayah displayed to a user pulls live content from the APIs

```gherkin
Given the corpus contains the reference Surah Al-Asr 103:1-3 with two human-edited action prompts
  And the user's selected translation is The Clear Quran
  And the user's selected tafsir is Ibn Kathir
When the user opens today's ayah and it is Surah Al-Asr 103:1-3
Then the Arabic ayah text is served from the Quran Foundation Content API
  And the English translation is served from the Quran Foundation Content API as The Clear Quran rendering
  And the condensed one-to-two-sentence tafsir extract is served from the Quran Foundation Content API as Ibn Kathir
  And audio playback streams from the Quran Foundation Content API
  And the two curated action prompts come from the corpus exactly as the product owner edited them
  And no translation or tafsir text is sourced from a local hardcoded copy of the ayah
```

### Scenario: Example corpus entries — three realistic ayat with their curated prompts

```gherkin
Given the corpus contains the following curated entries
  | Ayah reference                | Theme            | Action prompt 1                                                                            | Action prompt 2                                                                           |
  | Surah Al-Asr 103:1-3          | character        | Notice one minute today that you spent without purpose, and redirect it                    | Remind someone you love about the value of time in light of Al-Asr                        |
  | Surah Al-Baqarah 2:153        | patience         | When you feel rushed today, pause for ten seconds and say "Ya Sabur" before responding     | Write down one situation this week where patience changed the outcome for you             |
  | Surah Ibrahim 14:7            | gratitude        | Name three specific blessings from today out loud to someone you live with                 | Send a short thank-you message to a person whose kindness you have never acknowledged     |
When a user is served any of these ayat as today's ayah
Then the two action prompts shown to the user are exactly the human-edited text above
  And the ayah's theme tag is the one shown above
  And each prompt's human-review stamp is present
```

### Scenario: Demo-mode entry via the "Try with sample data" action on the welcome screen

```gherkin
Given a fresh visitor arrives on the welcome screen
  And the welcome screen offers a "Try with sample data" action
When the visitor taps "Try with sample data"
Then a demo account is provisioned within one second
  And the demo account contains seven days of completed reflection history across seven different ayat drawn from the corpus
  And the visitor lands on the grove home screen
  And the grove home screen shows seven trees
  And the cumulative-month counter reads seven
  And the weekly review is reachable and contains the seven demo ayat with their seven demo reflections
```

### Scenario: Demo-mode entry via a direct judge link

```gherkin
Given a judge opens the app with the demo query parameter present in the URL
When the app finishes loading
Then a demo account is provisioned within one second
  And the judge lands on the grove home screen already signed into the demo account
  And the grove home screen shows seven trees
  And the cumulative-month counter reads seven
  And the weekly review is reachable and populated with the seven demo ayat and seven demo reflections
```

### Scenario: The seven demo reflections use real ayat and realistic product-owner-authored text

```gherkin
Given the demo-mode seed is defined
When the seven pre-completed days are inspected
Then each of the seven days maps to a distinct ayah reference taken from the curated corpus
  And each reflection is at least forty characters long
  And each reflection reads as realistic first-person text authored by the product owner
  And no reflection is lorem ipsum, placeholder copy, or generic template text
  And the seven ayat span at least four different themes
```

### Scenario Outline: Each of the eight themes is represented in the corpus

```gherkin
Given the shipped corpus is loaded
When the ayat assigned to each theme are counted
Then each theme has at least the minimum required number of ayat

  Examples:
    | theme           | minimum ayat |
    | character       | 5            |
    | worship         | 5            |
    | family          | 5            |
    | patience        | 5            |
    | dhikr           | 5            |
    | gratitude       | 5            |
    | trust in Allah  | 5            |
    | justice         | 5            |
```

### Scenario: Human-review enforcement — an un-reviewed prompt cannot ship

```gherkin
Given an AI-drafted first pass has produced action prompts for a candidate ayah
  And the product owner has not yet reviewed those prompts
When the corpus is prepared for shipping
Then the un-reviewed prompts are excluded from the shipped corpus
  And the corresponding ayah does not appear in the shipped corpus until its prompts carry a human-review stamp
```

### Scenario: Corpus refresh up to the submission deadline

```gherkin
Given the product owner has edited or added action prompts on the evening before submission
When the content pipeline is re-run
Then the updated corpus replaces the previously shipped corpus
  And all newly edited prompts carry a fresh human-review stamp
  And no previously shipped ayah disappears unless the product owner has explicitly removed it
```

### Scenario: A reverted corpus entry is removed cleanly

```gherkin
Given the product owner flags a single corpus entry for revert after a late review concern
When the content pipeline is re-run with that entry removed
Then the entry no longer appears in the shipped corpus
  And the remaining corpus still contains at least sixty ayat
  And the remaining corpus still satisfies the five-ayat-per-theme spread
  And no other corpus entry is affected
```

### Scenario: A fresh non-demo account sees a real ayah on first open

```gherkin
Given a new non-demo user completes onboarding
  And the user has selected The Clear Quran and Ibn Kathir
When the user lands on today's ayah for the first time
Then the ayah shown is drawn from the curated corpus
  And the Arabic text, translation, condensed tafsir, and audio are served live from the Quran Foundation Content APIs
  And the two action prompts are the human-edited prompts from the corpus entry
  And the user does not see any missing-content, blank, or placeholder state
```

### Scenario: Content-API unavailability during ayah display

```gherkin
Given the corpus entry for today's ayah is Surah Ibrahim 14:7
  And the Quran Foundation Content APIs are temporarily unreachable at the moment the user opens the app
When the user opens today's ayah
Then the app surfaces a clear "content temporarily unavailable, try again in a moment" state
  And the two curated action prompts from the corpus are still visible so the user understands what today's mission is about
  And the app does not fabricate translation or tafsir text
  And when the APIs become reachable again and the user retries, the full ayah display loads correctly
```

## Constraints

- **Backwards compatibility:** Not applicable — this is the initial content corpus. No prior corpus exists to preserve.
- **Downtime:** Not applicable — corpus authoring and seeding happen offline, before the app is opened by users. Re-running the pipeline does not require taking the running app down.
- **Compliance:** No external regulatory requirement, but theological integrity is a non-negotiable product constraint. The control that enforces it is the human-edit rule: every action prompt is reviewed and edited by the product owner before it is marked shippable, and no unedited AI string is ever surfaced to a user.
- **Rollback:** Each corpus entry is independently revertable. If a specific ayah's prompts are flagged as problematic late in the sprint, that single entry can be removed without affecting any other entry, provided the remaining corpus still meets the sixty-ayat and five-per-theme minimums.

## Dependencies

- The Quran Foundation Content APIs (Quran text, Translation, Tafsir, Audio) must be reachable from the running app so that ayah text, translation, tafsir, and audio are served live rather than stored locally.
- Editorial time from the product owner — a tracked workstream running in parallel with the development workload for the first twelve days of the sprint, targeted at roughly thirty ayat fully edited by sprint day five and the full sixty-plus by sprint day twelve.
- Best-effort availability of a knowledgeable reviewer on the evening before submission for a late spot-check of the corpus. Not a hard dependency; the AI-draft-then-human-edit pipeline remains the primary control if no reviewer is available.
- Fit with the demo-mode entry point on the welcome screen, which is delivered by the onboarding story. This story provides the seeded data that the onboarding-owned button activates.

## Open Questions

- [x] ~~Who curates the 60+ action prompts and when?~~ — **Resolved:** The product owner personally edits every action prompt, working in parallel with development across the first twelve days of the sprint. AI drafts a first pass; 100 percent of the drafts are human-edited before ship.
- [x] ~~Selection criteria for the sixty ayat?~~ — **Resolved:** Thematic spread across eight themes — character, worship, family, patience, dhikr, gratitude, trust in Allah, justice — with at least five ayat per theme, selected for actionability (the ayah naturally suggests a concrete daily action) rather than comprehensiveness.
- [x] ~~How do judges experience cumulative depth in a short evaluation session?~~ — **Resolved:** A demo-mode seed pre-populates a fresh demo account with seven days of completed reflection history covering seven ayat from the corpus. Demo mode is reachable via a "Try with sample data" action on the welcome screen and via a demo query parameter on the app URL.
- [x] ~~Second set of eyes on the corpus before submission?~~ — **Resolved:** Best effort. If a knowledgeable reviewer is available the evening before submission they spot-check the corpus; otherwise the AI-draft-then-human-edit process is the sole control. Risk accepted and documented.
- [x] ~~Is ayah text, translation, and tafsir stored in the corpus or fetched live?~~ — **Resolved:** Fetched live from the Quran Foundation Content APIs at display time. The corpus stores only the ayah reference and the two action prompts. This both keeps the corpus small and makes the API integration load-bearing for the judging criterion.
- [ ] Which specific tafsir(s) the Tafsir API exposes and the exact condensation rule for surfacing a one-to-two-sentence extract — **Deferred (non-blocking):** Resolved during the first hour of technical refinement once the API is explored in detail. Default intent is Ibn Kathir, condensed to a one-to-two sentence lead. Product behaviour — that a short tafsir extract appears on the ayah screen with a "read the full tafsir" expansion — is the same regardless of the condensation mechanism chosen.
- [ ] Whether the seven demo-mode reflections ship via the Activity/Goals User API or via a lightweight own storage path — **Deferred (non-blocking):** Resolved in technical refinement alongside the equivalent decision for real-user reflections. The user-visible behaviour of demo mode — seven trees, cumulative count of seven, reviewable week — is the same regardless of storage path.

---

## Solution Design

The corpus pipeline is a **two-phase, human-gated** system. Phase A produces an AI first draft; Phase B is a required human edit. Nothing serves to users until Phase B stamps `human_reviewed_at`. The database enforces that rule via RLS so the control cannot be bypassed by a bug in app-layer code.

### Phase A — AI draft (offline, script-driven)

For each `verse_key` in the curator's shortlist (`data/corpus-shortlist.json`), `scripts/seed-corpus.ts` runs the following per row:

1. **Fetch source material via MCP.** The script connects to the Quran Foundation MCP server at `https://mcp.quran.ai` using `@modelcontextprotocol/sdk`. MCP is used **only** in this offline draft-authoring context because it gives Claude structured tool access to ayah text, translation, and the full Ibn Kathir tafsir for the authoring prompt. Runtime user-facing traffic never touches MCP — it uses the REST Content APIs defined in the shared architecture notes.
2. **Call Claude Opus 4.7** via `@anthropic-ai/sdk` with a structured prompt that pins it to return strict JSON of shape `{ tafsir_extract: string, action_prompt_1: string, action_prompt_2: string }`. The tafsir extract is constrained to ≤200 characters; the action prompts are constrained to the "concrete, today-doable, single-sentence" shape described in the curator brief.
3. **Upsert into `corpus_entries`** keyed by `verse_key`, with `human_reviewed_at = NULL`. Idempotent: re-running on the same `verse_key` replaces the draft fields but never stamps the review flag.

The script does not invent `verse_key` values — it reads them exclusively from `data/corpus-shortlist.json`, where each entry carries `{ verse_key, theme }`. This keeps the curator in control of which ayat enter the pipeline.

### Phase B — Human edit (in-app admin UI)

The curator reviews each drafted row in a Next.js admin view:

- `/admin/corpus` — list view of all draft rows with "reviewed / pending" state and theme filter.
- `/admin/corpus/:id` — edit form with four editable fields (`tafsir_extract`, `action_prompt_1`, `action_prompt_2`, `theme`) and an **Approve** button that saves edits and stamps `human_reviewed_at = now()`.

Access to both pages is gated on the `is_curator` flag on `users`. Non-curator users who hit any `/admin/*` route receive a 403.

### Serving rule enforced in the database

`corpus_entries` carries an RLS policy that restricts `SELECT` for non-curator readers to rows where `human_reviewed_at IS NOT NULL`. This means a bug in an app route that forgot to filter cannot leak an unreviewed row — the database itself refuses to return it.

### Demo-mode seeding

`scripts/seed-demo.ts` is invoked in two contexts: as a CLI (`tsx scripts/seed-demo.ts`) and from the `POST /api/demo/start` route (owned by the onboarding story). In both cases it executes the same transaction:

1. Insert a new `users` row with `is_demo = true`, a generated `qf_user_id` prefixed `demo-`, and a display name like "Sample Reviewer".
2. Insert 7 `daily_assignments` for local dates `today-6 .. today`, each pointing to a distinct approved `corpus_entries` row drawn from the corpus, chosen to span at least four of the eight themes.
3. Insert 7 `missions`, one per assignment, selecting the first action prompt from the corpus entry.
4. Insert 7 `reflections`, one per mission, using the pre-authored reflection text from `data/demo-reflections.json`. Each reflection has `did_apply` varied realistically across `yes_fully`, `partly`, and one `not_today`; each reflection text is ≥80 characters and reads as first-person narrative.

The `is_demo=true` flag means demo accounts are invisible to any aggregation that scopes over real users — they do not pollute streaks, metrics, or content analytics.

## Changes

- `scripts/seed-corpus.ts` — batch runner for Phase A. Reads `data/corpus-shortlist.json`, fetches source material via MCP, calls Claude to draft, upserts draft rows into Supabase keyed by `verse_key`.
- `app/(app)/admin/corpus/page.tsx` — curator list view of all corpus entries with pending/reviewed status and theme filter.
- `app/(app)/admin/corpus/[id]/page.tsx` — curator edit form for a single entry (tafsir extract + both action prompts + theme).
- `app/api/admin/corpus/[id]/route.ts` — `PATCH` handler: saves curator edits and stamps `human_reviewed_at = now()` on approve. Authorises on `is_curator`.
- `scripts/seed-demo.ts` — demo account seeder. Exposes a single `seedDemoAccount()` function used by both the CLI invocation and the `POST /api/demo/start` route.
- `supabase/migrations/0001_initial.sql` — owns the definition of `corpus_entries` (table + CHECK constraints + RLS policy) and adds `is_curator boolean DEFAULT false` to `users`. Cross-reference: this migration file is shared with onboarding's story; this story owns the corpus-specific portions.
- `data/corpus-shortlist.json` — curator-assembled list of 60+ `{ verse_key, theme }` objects across the eight themes. Consumed by `seed-corpus.ts`.
- `data/demo-reflections.json` — 7 pre-authored reflection texts with `{ verse_key, did_apply, text }` shape. Consumed by `seed-demo.ts`.

## Data Model & Migrations

The `corpus_entries` table shape is defined in the epic shared model (see `spec.md`). This story owns the migration that creates it. Full restatement of the constraints this migration installs:

```sql
CREATE TABLE corpus_entries (
  id              SERIAL PRIMARY KEY,
  verse_key       TEXT UNIQUE NOT NULL,
  theme           TEXT NOT NULL,
  tafsir_extract  TEXT NOT NULL,
  action_prompt_1 TEXT NOT NULL,
  action_prompt_2 TEXT NOT NULL,
  human_reviewed_at TIMESTAMPTZ,
  CHECK (char_length(tafsir_extract) <= 200),
  CHECK (char_length(action_prompt_1) BETWEEN 10 AND 240),
  CHECK (char_length(action_prompt_2) BETWEEN 10 AND 240),
  CHECK (theme IN ('character','worship','family','patience','dhikr','gratitude','trust','justice'))
);

ALTER TABLE users ADD COLUMN is_curator BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE corpus_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY corpus_read_reviewed ON corpus_entries
  FOR SELECT
  USING (human_reviewed_at IS NOT NULL OR auth.jwt() ->> 'is_curator' = 'true');

CREATE POLICY corpus_write_curator ON corpus_entries
  FOR ALL
  USING (auth.jwt() ->> 'is_curator' = 'true')
  WITH CHECK (auth.jwt() ->> 'is_curator' = 'true');
```

**Migration notes.**

- The `corpus_entries` table is empty after migration; `seed-corpus.ts` populates it in a later sub-task.
- The RLS policy makes unreviewed rows invisible to the app's runtime read path. User-facing routes (`/api/today`, `/api/week/...`) see only reviewed rows without needing to filter — belt-and-braces with app-level filters.
- `is_curator` is added to `users`; the curator flag is set manually via a one-off SQL update for the product owner's row and propagated into the JWT via a Supabase custom claim (see Supabase docs: "Custom Claims & Role-based Access Control").

## Architecture Notes

- **New dependencies.**
  - `@anthropic-ai/sdk` — Claude Opus 4.7 client, used only in `scripts/seed-corpus.ts`.
  - `@modelcontextprotocol/sdk` — MCP client for the offline draft-authoring context; talks to `https://mcp.quran.ai`.
  - `tsx` — runner for the TypeScript seed scripts (`tsx scripts/seed-corpus.ts`, `tsx scripts/seed-demo.ts`).
- **MCP is offline-only.** MCP is used exclusively at draft time to fetch source material for Claude. All runtime user-facing content fetches go through the REST Content APIs defined in `spec.md`. MCP URLs do not appear in any shipped route handler.
- **Secrets.** The Anthropic API key, the Quran Foundation client credentials used by the draft authoring context, and the Supabase service-role key all live in `.env.local` on the curator's machine. None of these are shipped to the browser — the seed scripts are run locally, and the browser bundle never imports from `scripts/`.
- **Integration.** The curator admin UI lives inside the existing `(app)` segment and reuses its Supabase session setup. The `POST /api/demo/start` route (owned by the onboarding story) imports `seedDemoAccount()` from `lib/demo.ts`, which wraps `scripts/seed-demo.ts`'s core logic for server-side use.

## Exemplar Files

- Anthropic SDK README — the JSON-mode / tool-use pattern for getting a structured object back from Claude is the pattern `seed-corpus.ts` follows. See `@anthropic-ai/sdk` npm docs for the canonical tool_use request shape.
- Supabase seed-pattern docs — the `supabase/seed.sql` + service-role-key seed pattern is the canonical shape `seed-corpus.ts` and `seed-demo.ts` follow (see Supabase docs: "Seeding your database").
- `lib/qf/client.ts` (defined in the shared architecture notes) — the QF fetch-wrapper pattern is reused by the draft authoring context's direct REST calls where MCP does not expose a tool.

## Implementation Plan

### Sub-tasks

**Task 1: Migration `0001_initial.sql` — corpus table + is_curator + RLS** — _small_

- Files: `supabase/migrations/0001_initial.sql`
- INDEPENDENT
- Adds `corpus_entries` table with CHECK constraints, `is_curator` column on `users`, and both RLS policies (`corpus_read_reviewed`, `corpus_write_curator`).
- This story owns the corpus-specific portions of the initial migration; overlap with the onboarding story's contributions is merged at file level, not duplicated.

**Task 2: Curator shortlist `data/corpus-shortlist.json`** — _medium_

- Files: `data/corpus-shortlist.json`
- INDEPENDENT
- 60+ `{ verse_key, theme }` entries spread across the eight themes (≥5 per theme). Purely content work; no code.

**Task 3: `scripts/seed-corpus.ts` — Phase A drafter** — _medium_

- Files: `scripts/seed-corpus.ts`
- SEQUENTIAL (depends on Task 1, Task 2)
- Reads the shortlist, for each entry fetches source material via MCP + REST fallback, calls Claude Opus 4.7 for a structured JSON draft, upserts into `corpus_entries` with `human_reviewed_at = NULL`. Idempotent by `verse_key`.

**Task 4: `app/api/admin/corpus/[id]/route.ts` — approve handler** — _small_

- Files: `app/api/admin/corpus/[id]/route.ts`
- SEQUENTIAL (depends on Task 3)
- `PATCH` receives edited field values, validates CHECK constraints, saves, and stamps `human_reviewed_at = now()`. Authorises via `is_curator`.

**Task 5: Curator UI `app/(app)/admin/corpus/*`** — _medium_

- Files: `app/(app)/admin/corpus/page.tsx`, `app/(app)/admin/corpus/[id]/page.tsx`
- SEQUENTIAL (depends on Task 4)
- List view + edit form. Server components that fetch via Supabase with the curator session. Approve button calls the Task 4 route handler.

**Task 6: `scripts/seed-demo.ts` + `data/demo-reflections.json`** — _medium_

- Files: `scripts/seed-demo.ts`, `data/demo-reflections.json`, `lib/demo.ts`
- SEQUENTIAL (depends on Task 1)
- Creates an `is_demo=true` user and inserts 7 assignments/missions/reflections mapped to approved corpus entries. Reflection text comes from `data/demo-reflections.json`.

**Task 7: Wire `POST /api/demo/start`** — _small_

- Files: coordination with `app/api/demo/start/route.ts` (owned by the onboarding story)
- SEQUENTIAL (depends on Task 6)
- Onboarding's demo-start route imports `seedDemoAccount()` from `lib/demo.ts` and returns the fresh demo session cookie. This sub-task is a thin import wiring, not a full route.

### Negative Constraints

- Do NOT allow any read path (API route, server component, or query) to return `corpus_entries` rows where `human_reviewed_at IS NULL` to a non-curator caller. The RLS policy is the primary guard; app-level filters are belt-and-braces.
- Do NOT hardcode Arabic, translation, or full tafsir strings in any file committed to the repo. The corpus stores only the human-authored tafsir extract and the two action prompts; everything else is fetched live from the QF Content APIs at runtime.
- Do NOT let demo seeding pollute real-user aggregates. Every `users` row inserted by `seed-demo.ts` must have `is_demo = true`; every aggregation query that powers user-facing metrics must filter `is_demo = false`.
- Do NOT call MCP from any route handler, server component, or client component. MCP imports may appear in `scripts/seed-corpus.ts` only.
- Do NOT commit `.env.local`, the Anthropic API key, or the Supabase service-role key.

## Test Scenarios

**Test 1: Unreviewed corpus rows are never served**

- Setup: Seed 60 rows into `corpus_entries` via `seed-corpus.ts`; do not approve any of them (`human_reviewed_at IS NULL` for all). Create one regular (non-curator) user with a daily assignment that would map to verse `96:1`.
- Action: The user hits `/api/today`.
- Expected: The response is a safe fallback ("no ayah today — content coming soon"); the actual ayah text is not returned. Database-level RLS refuses the `SELECT`, so even a direct query without app-level filters returns no rows for this user.

**Test 2: A curator-approved row becomes servable immediately**

- Setup: A draft row for `96:1` exists with `human_reviewed_at = NULL`. A regular user has a daily assignment to `96:1`.
- Action: The curator `PATCH`es `/api/admin/corpus/<id>` with edited fields and approve; then the user hits `/api/today`.
- Expected: The `PATCH` stamps `human_reviewed_at = now()`; the subsequent `/api/today` call returns the approved entry's `tafsir_extract` and action prompts.

**Test 3: Demo seed produces a reviewable 7-day grove**

- Setup: At least 7 approved rows exist in `corpus_entries` spanning ≥4 themes. No existing demo user.
- Action: Invoke `seedDemoAccount()` (via `POST /api/demo/start` or CLI).
- Expected: One new `users` row with `is_demo = true`; exactly 7 `daily_assignments` for dates `today-6 .. today`; exactly 7 `missions`, one per assignment; exactly 7 `reflections`, one per mission, each with text ≥40 chars; the 7 assignments reference distinct corpus entries spanning ≥4 themes.

**Test 4: `seed-corpus.ts` is idempotent on re-run**

- Setup: A row for `96:1` exists (drafted but not yet approved). The shortlist contains `96:1`.
- Action: Run `tsx scripts/seed-corpus.ts` twice in succession.
- Expected: No duplicate row is inserted (unique on `verse_key`). The draft fields may be overwritten by the second run, but `human_reviewed_at` remains `NULL` and no approved row ever has its `human_reviewed_at` cleared.

**Test 5: Non-curator cannot reach the admin UI**

- Setup: A regular (non-curator) user session.
- Action: The user navigates to `/admin/corpus` or `PATCH`es `/api/admin/corpus/1`.
- Expected: HTTP 403 Forbidden from the route handler; the server component redirects to the app home with an error flash. Database RLS also refuses the write path independently.

**Test 6: Example corpus entries round-trip correctly**

- Setup: Insert the three example entries below via `seed-corpus.ts` (as drafts) and approve each via the admin UI:
  - `{ verse_key: "96:1", theme: "knowledge"/"character", tafsir_extract: "Read — the first command of revelation. Learning is the foundation of connecting to Allah.", action_prompt_1: "Spend 15 minutes today learning something that brings you closer to Allah.", action_prompt_2: "Teach one thing you know to someone — even a single ayah's meaning." }`
  - `{ verse_key: "103:1-3", theme: "character", tafsir_extract: "By time, humanity is in loss — except those who believe, do good, and counsel truth and patience.", action_prompt_1: "Notice one minute today that you spent without purpose, and redirect it.", action_prompt_2: "Remind someone you love of the value of time in light of Al-Asr." }`
  - `{ verse_key: "2:286", theme: "trust", tafsir_extract: "Allah does not burden a soul beyond what it can bear. What it earns is for it; what it brings upon itself is against it.", action_prompt_1: "Identify one burden you're carrying; make du'a for strength and take one step.", action_prompt_2: "Check in with a friend who is struggling — just sit with them." }`
- Action: Fetch each entry via `/api/today` with a user assigned to that `verse_key`.
- Expected: The exact edited tafsir extract and action prompt text round-trip unchanged; live ayah text, translation, and audio are loaded from QF Content APIs and paired with the corpus fields.

## Acceptance Criteria

- [ ] `supabase/migrations/0001_initial.sql` creates `corpus_entries` with CHECK constraints on extract length and valid theme, and installs the `corpus_read_reviewed` + `corpus_write_curator` RLS policies.
- [ ] `is_curator` column exists on `users` with default `false`, and is surfaced into the Supabase JWT for use by the RLS policy.
- [ ] `data/corpus-shortlist.json` contains at least 60 `{ verse_key, theme }` entries with ≥5 entries per theme across all eight themes.
- [ ] `scripts/seed-corpus.ts` reads the shortlist, drafts each entry via Claude Opus 4.7 using source material fetched through MCP, and upserts rows into `corpus_entries` with `human_reviewed_at = NULL`; re-running is idempotent by `verse_key`.
- [ ] `app/(app)/admin/corpus/page.tsx` and `[id]/page.tsx` render a list view and edit form gated by `is_curator`; non-curator access returns 403.
- [ ] `app/api/admin/corpus/[id]/route.ts` accepts a `PATCH` from a curator, persists edits, and stamps `human_reviewed_at = now()` on approve.
- [ ] `scripts/seed-demo.ts` creates an `is_demo=true` user and inserts exactly 7 `daily_assignments` + 7 `missions` + 7 `reflections` drawn from approved corpus entries spanning ≥4 themes.
- [ ] `data/demo-reflections.json` contains 7 pre-authored reflections ≥40 chars each, reading as realistic first-person text.
- [ ] `POST /api/demo/start` (onboarding-owned) imports `seedDemoAccount()` from `lib/demo.ts` and returns a session cookie for the freshly seeded demo account.
- [ ] No route handler, server component, or client component imports from `@modelcontextprotocol/sdk`; MCP appears only in `scripts/seed-corpus.ts`.
- [ ] No hardcoded Arabic, translation, or full tafsir text is committed in any source file outside the test fixtures.
- [ ] All existing tests still pass.
- [ ] No type errors or lint warnings.

## Verification

Run the `did-workflow:verifier` skill to confirm changes are clean.

### Backend Tests

- `tests/unit/scripts/seed-corpus.test.ts` — verifies idempotency on `verse_key`, verifies JSON-shape validation on Claude responses, verifies it refuses to upsert a row that would fail the CHECK on `tafsir_extract` length.
- `tests/unit/scripts/seed-demo.test.ts` — verifies 7 assignments / 7 missions / 7 reflections are produced, verifies the demo user is `is_demo=true`, verifies ≥4 themes across the 7 entries.
- `tests/integration/admin-corpus-route.test.ts` — verifies `PATCH /api/admin/corpus/[id]` stamps `human_reviewed_at`, rejects non-curator callers with 403, and rejects inputs that violate CHECK constraints.
- `tests/integration/rls-corpus-read.test.ts` — with RLS enabled and a regular-user JWT, asserts that `SELECT * FROM corpus_entries WHERE human_reviewed_at IS NULL` returns zero rows; with a curator JWT, asserts it returns all matching rows.

### Manual Verification

- [ ] Run `tsx scripts/seed-corpus.ts` against a local Supabase and confirm rows land with `human_reviewed_at = NULL`.
- [ ] Log in as curator, open `/admin/corpus`, edit one row, click Approve, and confirm the row is now visible via `/api/today` for a user mapped to that `verse_key`.
- [ ] Run `tsx scripts/seed-demo.ts`, log in to the resulting demo account, and confirm the grove home shows 7 trees and the weekly review shows 7 ayat + 7 reflections.
- [ ] Confirm `grep -r "@modelcontextprotocol/sdk" app/ lib/` returns no matches (MCP must be offline-only).
