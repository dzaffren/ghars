# Scale Rotation to 30 Ayahs

**Ticket:** TBD
**Type:** Technical — Content / Data Seeding
**Discovery Brief:** ../../discovery/expand-ayah-rotation/brief.md
**Epic Overview:** ./spec.md

Grow the daily ayah rotation from its current 10 curated ayahs to 30 before launch, using the three card types (action, reflection, Q&A) delivered by the preceding card-variants story so that external content carries roughly two-thirds of the new slots and the founder only authors new action-card material where it is needed to preserve the behavioural anchor.

## Motivation

**Current state:** The rotation holds 10 curated ayahs. Each one is a founder-authored action card with a tafsir extract, two action prompts, a theme tag, and a human-review stamp. A pre-launch user cycling through the app on consecutive days exhausts the rotation inside a fortnight, which is visibly repetitive in staging.

**Desired state:** 30 ayahs are in rotation. Each ayah is tagged as exactly one of action, reflection, or Q&A. At least one-third are action cards so the app keeps its behavioural identity. The remaining ayahs draw their body content from Quran Reflect posts or scholar ayah-answers, sourced through the card-variants work. A pre-launch user cycling through the app cannot see the same ayah twice within a 30-day window.

**Trigger:** Launch is gated on reaching a rotation size that clears the one-month repetition window. Scaling by hand-authoring 20 new action cards is the bottleneck that the card-variants work was designed to remove; this story is the point at which that plan is cashed in.

## Scope

- **In scope:**
  - Assigning exactly one card type (action, reflection, or Q&A) to every ayah in the rotation, guided by the coverage probe output from the first story of this epic.
  - Keeping the existing 10 ayahs as action cards unless the probe shows a specific ayah is a stronger fit as a reflection or Q&A card.
  - Authoring any additional action cards required to keep the action share at or above one-third of the 30 ayahs, using the existing founder review process and human-review stamp.
  - Adding the remaining ayahs as reflection- or Q&A-tagged entries, drawing their body content from the external sources shipped by the card-variants story.
  - A launch-day verification pass that confirms the rotation size, the type mix, and that every reflection- or Q&A-tagged ayah has at least one usable external item currently available.
- **Out of scope:**
  - Any change to how cards render, what a card looks like, or the shape of data served to the browser. All rendering behaviour, including the silent-degradation rule when external content is missing, is owned by the card-variants story.
  - Any change to how action cards are authored, reviewed, or stamped. The existing review flow continues to apply.
  - Post-launch expansion beyond 30 ayahs. This story closes at 30.
  - Editorial rationale for which ayahs are chosen. The rotation works off a founder-picked shortlist.
  - Language support beyond English for reflection or Q&A bodies at launch.

## Goals

- Reach exactly 30 ayahs in rotation before launch.
- Keep the share of founder-authored new content to roughly one-third (the action cards), so the founder does not hand-author 20 new cards.
- Preserve the behavioural identity of the app by tagging at least one-third of the 30 ayahs as action cards.
- Ensure that on launch day, every reflection- or Q&A-tagged ayah has at least one usable external item currently available, so the first wave of users does not encounter silent degradation on day one.

## Non-Goals

- Building, changing, or styling any card type. That work lives in the card-variants story.
- Building the content gateway, coverage probe, or silent-degradation behaviour. Those live in earlier stories of this epic.
- Locking the card-type mix to exact counts. The planning target is roughly 10 action / 10 reflection / 10 Q&A, but the true mix is decided by the probe evidence and may shift within the one-third action floor.
- Guaranteeing external content availability forever. The launch-day check confirms availability at the moment of launch; ongoing availability is handled by the silent-degradation rule already shipped in the card-variants story.

## Success Criteria

- The rotation contains exactly 30 ayahs on launch day.
- Every ayah in the rotation carries exactly one card-type tag.
- At least one-third of the 30 ayahs (that is, at least 10) are tagged as action cards.
- Every newly authored action card carries the existing human-review stamp.
- The launch-morning sample check shows every reflection-tagged ayah has at least one verified community post currently available, and every Q&A-tagged ayah has at least one published scholar answer currently available.
- Zero launch-day empty-card incidents traceable to a reflection or Q&A ayah being tagged without any usable external item.

## Examples

The table below shows three representative ayahs from the planned rotation and how each would be tagged. These are illustrative of the tagging decision, not the final list (which is driven by the coverage probe output from the first story of this epic).

| Ayah reference                                     | Planned tag | Why this tag                                                                                                                                                                                                               |
| -------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Al-Baqarah 2:153 (patience and prayer)             | Action      | Strong behavioural fit ("turn to patience and prayer"); the existing card is already authored with two action prompts and a human-review stamp. Stays as-is.                                                               |
| Al-Hashr 59:21 (the mountain humbled by the Quran) | Reflection  | The coverage probe finds multiple verified Quran Reflect community posts on this ayah with short, self-contained contemplative paragraphs. External content carries the body; no new action prompts are authored.          |
| An-Nisa 4:34 (authority and household conduct)     | Q&A         | The coverage probe finds at least one published scholar ayah-answer addressing common questions about this ayah. A scholarly clarification is a stronger fit than a behavioural prompt; external content carries the body. |

A fourth illustrative example, to show action-card authoring in this story: if the probe shows that Al-Asr 103:1–3 has weak external content but is a natural fit for a short daily practice, the ayah is tagged action and a new action card is authored (short tafsir extract plus two action prompts), stamped via the existing human-review flow, and added to the rotation to help hold the action share at or above one-third.

## Acceptance Criteria

### Scenario: Rotation reaches 30 ayahs at launch

```gherkin
Given the rotation is being prepared for launch
When the launch-day verification is run
Then the rotation contains exactly 30 ayahs
  And each of those 30 ayahs is part of the pool the app can assign to a user on any given day
```

### Scenario: Every ayah carries exactly one card-type tag

```gherkin
Given the rotation contains 30 ayahs
When each ayah is inspected
Then each ayah is tagged as exactly one of action, reflection, or Q&A
  And no ayah is untagged
  And no ayah carries more than one tag
```

### Scenario: Action cards hold at least one-third of the rotation

```gherkin
Given the rotation contains 30 ayahs tagged by card type
When the counts by tag are compared
Then the count of action-tagged ayahs is at least 10
  And the action-tagged share is the largest single share, or tied for largest
```

### Scenario: Existing ten ayahs are preserved as action cards by default

```gherkin
Given the current rotation of 10 founder-authored action cards
When the 30-ayah rotation is assembled
Then each of the original 10 ayahs remains tagged as an action card by default
  And an original ayah is only retagged as reflection or Q&A if the coverage probe shows a clearly stronger fit for the new tag
```

### Scenario: Newly authored action cards carry the human-review stamp

```gherkin
Given a new action card is being added to the rotation to hold the action-share floor
When that card is readied for launch
Then it carries a founder-authored tafsir extract
  And it carries two founder-authored action prompts
  And it carries the existing human-review stamp
  And it is indistinguishable in format from the original 10 action cards
```

### Scenario: Launch-morning availability check for reflection ayahs

```gherkin
Given the rotation contains a number of reflection-tagged ayahs
When the launch-morning sample check runs against each reflection-tagged ayah
Then every reflection-tagged ayah has at least one verified community post currently available
  And no reflection-tagged ayah ships to launch with zero usable posts at the time of the check
```

### Scenario: Launch-morning availability check for Q&A ayahs

```gherkin
Given the rotation contains a number of Q&A-tagged ayahs
When the launch-morning sample check runs against each Q&A-tagged ayah
Then every Q&A-tagged ayah has at least one published scholar answer currently available
  And no Q&A-tagged ayah ships to launch with zero usable answers at the time of the check
```

### Scenario: Ayah becomes unshippable late in preparation

```gherkin
Given an ayah is tagged reflection or Q&A during rotation preparation
  And the launch-morning check finds no usable external item for that ayah
When the rotation is finalised for launch
Then that ayah is either retagged (for example to action, with a newly authored and stamped action card) or removed from the rotation
  And a replacement is either tagged or authored so the total returns to exactly 30
  And the action-tagged share still holds at or above one-third after the change
```

### Scenario Outline: Ayah tagging decision follows coverage probe output

```gherkin
Given an ayah is being considered for the rotation
  And the coverage probe reports its external-content strength
When the founder assigns a card type
Then the card type assigned is <chosen tag>

Examples:
  | probe finding                                                                      | chosen tag  |
  | multiple verified community posts, weak behavioural fit                            | reflection  |
  | at least one published scholar answer, weak behavioural fit                        | Q&A         |
  | weak or no external content, strong behavioural fit                                | action      |
  | strong external content across both sources and strong behavioural fit             | action      |
```

Note on the last row: where an ayah has both strong external content and strong behavioural fit, the tie-breaker favours action, because action cards are the anchor of the rotation and the share rule requires at least one-third of the 30 ayahs to be action cards.

### Scenario: External content disappears after launch

```gherkin
Given the rotation has shipped with 30 ayahs
  And an ayah was tagged reflection or Q&A at launch with usable external content
  And after launch the external content for that ayah becomes unavailable
When a user is assigned that ayah on a given day
Then the app shows a plain ayah card as defined by the card-variants story
  And no error, blank body, or "content unavailable" message is shown
  And the incident is visible to the founder through the monitoring defined in the card-variants story
  And no code change or new rotation edit is required for the user-facing behaviour to remain correct
```

## Constraints

- **Backwards compatibility:** The rotation before launch can be edited freely. Individual ayahs can be added, removed, retagged, or replaced at any time up to launch and after launch, with the conditions that the total stays at 30 (or at least 28 as a soft floor, with the intent to re-add) and that the action-share rule continues to hold.
- **Downtime:** None. Tagging and content growth happen offline relative to user traffic; there is no switchover event beyond the one already shipped with the card-variants story.
- **Rollback:** Reversible. If any single ayah turns out to be unshippable, it is removed or retagged without touching the rest of the rotation. If the whole expansion needs to be walked back, the original 10 ayahs are preserved throughout this work and remain valid on their own.

## Dependencies

- The card-variants story must be fully shipped and live. Without it, reflection- and Q&A-tagged ayahs render the wrong body content (or no body content correctly) and users on newly added ayahs would see broken cards.
- The coverage probe output from the first story of this epic must be available, so tagging decisions are evidence-backed rather than guessed.
- The founder review process for new action cards must be available so any newly authored action cards can be stamped before launch.
- The monitoring shipped with the card-variants story (for silent degradation) is the mechanism by which post-launch availability problems are surfaced; this story depends on it being in place but does not extend it.

## Open Questions

- [ ] Exact card-type mix across the 30 ayahs — **Deferred (non-blocking):** Driven by the coverage probe output from the first story of this epic. Planning assumption is roughly 10 action / 10 reflection / 10 Q&A, with a hard floor of at least 10 action cards to satisfy the action-anchored rule.

---

## Solution Design

This story is content/data work on top of the schema and runtime behaviour shipped by Stories 1 and 2. No new code pathways are introduced; a small admin/CLI helper is added to make the tagging and verification mechanical.

### Changes

- `data/corpus-shortlist.json` — grow from 10 to 30 `{ verse_key, theme, card_type }` entries. `card_type` is the new field; existing 10 entries default to `"action"`.
- `data/corpus-shortlist.json` → consumed by an extended `scripts/seed-corpus.ts` that now also writes `card_type` onto the upserted `corpus_entries` row.
- `scripts/seed-corpus.ts` (modify) — reads the new `card_type` field. For `reflection` / `qa` entries, skips the AI tafsir-extract and action-prompt drafting path entirely (since the body comes from QF at runtime) and upserts with `tafsir_extract = ''`, `action_prompt_1 = ''`, `action_prompt_2 = ''`, and `card_type = 'reflection' | 'qa'`. For `action` entries the existing drafting path is unchanged.
- `supabase/migrations/0009_card_type_empty_prompts.sql` — relaxes the current non-null / min-length checks on `tafsir_extract`, `action_prompt_1`, `action_prompt_2` so that reflection/Q&A entries may have empty strings. Keeps the `human_reviewed_at NOT NULL` constraint — reflection/Q&A rows are still "reviewed" by the founder when the tag is set.
- `scripts/launch-availability-check.ts` — new. One-off CLI that iterates every rotation ayah; for each `reflection`-tagged row calls `listReflectPostsForAyah(verse_key, { limit: 1 })`; for each `qa`-tagged row calls `listAyahAnswers(verse_key, { pageSize: 1 })`. Prints a per-ayah status and exits non-zero if any row returns zero usable items.
- `docs/discovery/expand-ayah-rotation/launch-check.md` — captured launch-morning report; committed so the decision is auditable.

### Data Model & Migrations

Migration `supabase/migrations/0009_card_type_empty_prompts.sql`:

```sql
-- Reflection and Q&A cards have no founder-authored tafsir extract or prompts.
-- The existing CHECKs on tafsir_extract length and non-empty prompts were written
-- for action cards only. Relax them conditionally on card_type.

alter table corpus_entries
  drop constraint if exists corpus_entries_tafsir_extract_check;

alter table corpus_entries
  add constraint corpus_entries_action_fields_check
  check (
    (card_type = 'action' and char_length(tafsir_extract) between 1 and 200
      and char_length(action_prompt_1) between 1 and 240
      and char_length(action_prompt_2) between 1 and 240)
    or (card_type in ('reflection','qa'))
  );
```

**Migration notes:**

- The existing 10 rows all satisfy the action-branch condition, so the migration is safe on existing data.
- No backfill. `0008_card_types.sql` (from Story 2) already populates `card_type = 'action'` by default.
- Rollback: drop `corpus_entries_action_fields_check`, re-add the original `char_length(tafsir_extract) <= 200` constraint. If any reflection/qa rows exist with empty extracts they must be deleted before rollback succeeds — this is expected and acceptable at the "walk back the whole epic" level.

## Architecture Notes

- **New dependencies:** none. Reuses `lib/qf/reflect.ts` (Story 1) for the availability check.
- **Dependencies & integration:** Depends on `0008_card_types.sql` (Story 2). Depends on `lib/qf/reflect.ts` and the resolve-card helper (Stories 1, 2). Does NOT add or change any runtime route — purely offline content and verification work.

## Exemplar Files

- `scripts/seed-corpus.ts` (existing) — the upsert-by-verse_key + idempotent-rerun pattern. Extended here to branch on `card_type`.
- `scripts/qf-coverage-probe.ts` (Story 1) — the CLI shape for iterating a list and writing a per-row report.

## Implementation Plan

### Sub-tasks

**Task 1: Migration `0009_card_type_empty_prompts.sql`** — _small_

- Files: `supabase/migrations/0009_card_type_empty_prompts.sql`
- INDEPENDENT
- Relax tafsir-extract/prompt length checks for non-action card types.

**Task 2: Extend shortlist to 30 entries with `card_type`** — _medium_

- Files: `data/corpus-shortlist.json`
- SEQUENTIAL (depends on Story 1 probe output)
- Pure content work. Tag each of 30 entries based on probe evidence, respecting ≥10 action-tagged entries.

**Task 3: Extend `scripts/seed-corpus.ts` for card_type branching** — _small_

- Files: `scripts/seed-corpus.ts`
- SEQUENTIAL (depends on Tasks 1, 2)
- Branch on `card_type`: action entries go through the existing AI-draft path; reflection/qa entries skip drafting and upsert with empty content fields + `card_type` set.

**Task 4: Author additional action-card content where needed** — _medium_

- Files: `data/corpus-shortlist.json`, `corpus_entries` rows via admin review flow
- SEQUENTIAL (depends on Tasks 2, 3)
- Any newly-tagged `action` entries beyond the original 10 go through the existing curator review UI; each gets `human_reviewed_at` stamped. This is content work using the existing admin flow.

**Task 5: Launch-availability check script** — _small_

- Files: `scripts/launch-availability-check.ts`
- SEQUENTIAL (depends on Stories 1 & 2 plus Tasks 1–4)
- Iterate every `corpus_entries` row; for `reflection`/`qa` tags call the matching lister once; print a table; exit non-zero if any zero-usable row exists.

**Task 6: Commit launch-morning report** — _small_

- Files: `docs/discovery/expand-ayah-rotation/launch-check.md`
- SEQUENTIAL (depends on Task 5)
- Run the script the morning of launch; paste the output into this file; commit.

### Negative Constraints

- Do NOT add or change any runtime route, server component, or client component. All user-visible behaviour is owned by Story 2.
- Do NOT relax the `human_reviewed_at NOT NULL` constraint. Tagging an ayah is itself a review act — the founder sets `card_type` and stamps.
- Do NOT modify `resolveOrCreateAssignment` rotation logic.
- Do NOT author reflection or Q&A body text locally. Reflection/Q&A bodies MUST come from QF at runtime.
- Do NOT add rows to `corpus_entries` from outside `data/corpus-shortlist.json`. The shortlist is the single source of truth for what's in rotation.

## Test Scenarios

**Test 1: Migration preserves existing action rows**

- Setup: DB at 10 action rows before the migration.
- Action: Apply `0009_card_type_empty_prompts.sql`.
- Expected: All 10 rows survive unchanged. Queries against `corpus_entries` return the same data.

**Test 2: Seed script upserts a reflection entry with empty content**

- Setup: `data/corpus-shortlist.json` contains `{ verse_key: "2:153", theme: "patience", card_type: "reflection" }`. DB has no row for `2:153`.
- Action: `tsx scripts/seed-corpus.ts`.
- Expected: One row in `corpus_entries` for `2:153` with `card_type = 'reflection'`, `tafsir_extract = ''`, `action_prompt_1 = ''`, `action_prompt_2 = ''`, `human_reviewed_at IS NOT NULL`. The AI drafting path was NOT invoked for this row.

**Test 3: Seed script preserves action drafting path**

- Setup: `data/corpus-shortlist.json` contains `{ verse_key: "103:1-3", theme: "character", card_type: "action" }`. DB has no row.
- Action: `tsx scripts/seed-corpus.ts`.
- Expected: Row in `corpus_entries` for `103:1-3` with `card_type = 'action'`, non-empty `tafsir_extract` and both `action_prompt_*`, `human_reviewed_at IS NULL` (awaiting curator approval). The AI drafting path WAS invoked.

**Test 4: Seed is idempotent across card types**

- Setup: Run the seed once. Tweak the shortlist (no changes to `2:153`) and re-run.
- Action: Run `tsx scripts/seed-corpus.ts` twice.
- Expected: `corpus_entries` has no duplicate rows for `2:153`. `card_type` for `2:153` is still `'reflection'` and its content fields are still empty.

**Test 5: Launch-availability check — all usable**

- Setup: 30 corpus rows; mocked `listReflectPostsForAyah` and `listAyahAnswers` return ≥1 usable item for every reflection/qa row.
- Action: `tsx scripts/launch-availability-check.ts`.
- Expected: Process exits `0`. Output contains 30 rows, each marked `OK`.

**Test 6: Launch-availability check — one reflection row has zero usable posts**

- Setup: 30 rows; one reflection row for `49:12` returns 0 posts.
- Action: `tsx scripts/launch-availability-check.ts`.
- Expected: Process exits non-zero with a summary line like `BLOCKED: 1 ayah has zero usable external content`. The row for `49:12` is flagged `MISSING`.

**Test 7: Action-anchored invariant is enforced**

- Setup: Shortlist contains 9 action-tagged entries (1 short of the floor).
- Action: `tsx scripts/seed-corpus.ts`.
- Expected: Script exits non-zero with `VALIDATION: action-tagged count is 9; minimum required is 10`. No rows are inserted/updated.

**Test 8: Exactly 30 entries at launch**

- Setup: Shortlist contains 29 entries.
- Action: `tsx scripts/seed-corpus.ts`.
- Expected: Script exits non-zero with `VALIDATION: shortlist has 29 entries; exactly 30 required for launch`. No rows are inserted/updated.

## Acceptance Criteria

- [ ] `data/corpus-shortlist.json` contains exactly 30 `{ verse_key, theme, card_type }` entries with ≥10 `action` tags.
- [ ] `supabase/migrations/0009_card_type_empty_prompts.sql` relaxes the action-field CHECKs to apply only when `card_type = 'action'`.
- [ ] `scripts/seed-corpus.ts` branches on `card_type`; action entries go through AI drafting, reflection/qa entries upsert with empty content fields.
- [ ] `scripts/seed-corpus.ts` validates shortlist size (exactly 30) and action floor (≥10) before writing.
- [ ] Any newly-authored action entries beyond the original 10 carry `human_reviewed_at IS NOT NULL`.
- [ ] `scripts/launch-availability-check.ts` runs end-to-end, produces a per-ayah availability table, and exits non-zero if any reflection/qa row has zero usable items.
- [ ] `docs/discovery/expand-ayah-rotation/launch-check.md` is committed with the launch-morning output.
- [ ] No runtime route, server component, or client component is modified in this story.
- [ ] All existing tests still pass. No type errors or lint warnings.

## Verification

Run the `did-workflow:verifier` skill after implementation.

### Backend Tests

- `tests/unit/scripts/seed-corpus-card-types.test.ts` — Tests 2, 3, 4, 7, 8.
- `tests/unit/scripts/launch-availability-check.test.ts` — Tests 5, 6 with mocked `lib/qf/reflect.ts` helpers.
- `tests/integration/migrations/0009_card_type_check.test.ts` — Test 1 plus: inserting an action row with empty `tafsir_extract` fails the CHECK; inserting a reflection row with empty content fields succeeds; inserting a row with an invalid `card_type` ('other') fails.

### Manual Verification

- [ ] Run `tsx scripts/seed-corpus.ts` against a local Supabase seeded with the new 30-entry shortlist; confirm the expected count and mix by running `SELECT card_type, COUNT(*) FROM corpus_entries GROUP BY card_type`.
- [ ] Open `/today` as a demo user across 30 simulated consecutive days (by manually adjusting `local_date` or shifting the system date) and visually confirm ayahs do not repeat within the window.
- [ ] Run `tsx scripts/launch-availability-check.ts` immediately before launch and paste the output into `docs/discovery/expand-ayah-rotation/launch-check.md`.

### E2E Tests

Not applicable. All user-visible behaviour that this story unlocks (reflection/Q&A rendering, same-day stability, silent degradation) is covered by the E2E suite owned by Story 2. This story is content/tagging/verification work with no new user-facing path.
