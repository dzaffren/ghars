# Expand Ayah Rotation — Overview

**Discovery Brief:** [docs/discovery/expand-ayah-rotation/brief.md](../../discovery/expand-ayah-rotation/brief.md)

## Summary

Grow the app's ayah rotation from 10 to 30 before launch without the founder hand-writing every extract and prompt. The single-format card (always a "tafsir extract + two action prompts") is loosened into three card types — action (founder-authored), reflection (Quran Reflect community content), and Q&A (scholar answer) — so external content sources carry roughly two-thirds of the slots while the founder stays the author where it uniquely matters.

## Background & Context

**Current state:**

- 10 curated ayahs drive the entire rotation. Each is authored by hand: a short tafsir extract, two behavioural action prompts, a theme tag, and a human-review stamp.
- Ayah, Arabic text, translation, tafsir, and audio are already fetched live from the Quran Foundation content APIs. The founder-authored material — extract and prompts — is the part that does not scale.
- Pre-launch traffic is small, and there are no users yet cycling through the rotation; the repetition risk is observed in staging, not in production data.

**Problem:**

- To scale from 10 to 30 ayahs under the current model, the founder must personally write 20 new extracts and 40 new action prompts. That is the bottleneck.
- Forcing a behavioural prompt onto every ayah produces weak prompts for material that reads more naturally as contemplation or scholarly clarification.
- Launch is blocked until the rotation feels varied enough that pre-launch users do not see the same card within a month of daily use.

## Goals

- Reach a rotation of 30 ayahs before launch without the founder writing more than roughly one-third of the new cards from scratch.
- Introduce two new card formats — reflection and Q&A — that draw their body content from Quran Reflect community posts and scholar ayah-answers respectively.
- Preserve the daily ritual shape: every card still opens with the ayah reference, Arabic text, translation, and the Reflect call to action, regardless of card type.
- Preserve the app's behavioural identity by keeping action cards as a meaningful share of the rotation.

## Non-Goals

- Full-corpus coverage. This epic targets 30 ayahs; broader coverage is deferred to post-launch.
- Editorial selection rubric. How future ayahs are chosen is out of scope; this epic works off a founder-picked shortlist.
- Crowdsourced, user-contributed, or in-app-authored card content. Reflection and Q&A bodies come from Quran Reflect and the ayah-answers service only.
- Languages other than English for reflection and Q&A card bodies at launch.
- Any change to how action card prompts are authored, reviewed, or stamped today. The existing review flow continues to apply to action cards.

## Story Index

| Ticket | Story                                            | Spec                                                             | Type        | Status      | Dependencies |
| ------ | ------------------------------------------------ | ---------------------------------------------------------------- | ----------- | ----------- | ------------ |
| TBD    | Quran Reflect gateway and content coverage probe | [spec-content-coverage-probe.md](spec-content-coverage-probe.md) | Technical   | Not Started | —            |
| TBD    | Reflection and Q&A card variants (end-to-end)    | [spec-card-variants.md](spec-card-variants.md)                   | User-facing | Not Started | Story 1      |
| TBD    | Scale rotation to 30 ayahs                       | [spec-scale-to-30.md](spec-scale-to-30.md)                       | Technical   | Not Started | Story 2      |

## Shared Business Rules

- **Three card types.** Every ayah in the rotation is tagged as exactly one of `action`, `reflection`, or `qa`. The type determines where the card's body content comes from.
- **Anchored by action.** At least one-third of the 30 ayahs in the rotation are `action` cards. This keeps the app's behavioural character intact.
- **Constant card frame.** Every card, regardless of type, displays the ayah reference, Arabic text, translation, and the Reflect call to action in the same positions. Only the body block differs.
- **Same user, same card, same day.** Once a user is served a reflection or Q&A card for a given day, refreshing or reopening the app on that day shows the same underlying post or answer. A different day picks fresh content.
- **Never an empty slot.** If a reflection or Q&A ayah temporarily has no usable external content on the assign-day, the app degrades silently to a plain ayah card (reference + Arabic + translation + Reflect CTA). The user never sees an error, a blank body, or a "content unavailable" message.
- **Attribution for reflection cards.** Reflection cards carry the line "Shared on Quran Reflect" beneath the body. No author name or username is shown.
- **Approved content only.** Reflection cards pull only from verified Quran Reflect posts; Q&A cards pull only from published ayah answers. Unverified posts and draft answers are never served to users.
- **Sanitisation.** Any externally-sourced body content is sanitised server-side before it reaches the browser, reusing the existing tafsir-sanitisation convention.
- **Action cards are unchanged.** Action cards continue to carry a founder-authored tafsir extract and two founder-authored action prompts, with the existing human-review stamp, exactly as they do today.

## User Journey Map

1. **Pre-launch user opens the app on any given day.** They land on Today and see a card for the assigned ayah. _(Story: card variants, scale to 30)_
2. **The card's frame looks familiar.** The ayah reference, Arabic text, translation, and Reflect button sit exactly where they always have. _(Shared across all stories.)_
3. **The body of the card varies by day.** One day it is a behavioural "try this today" prompt (action); another day it is a short contemplative paragraph from Quran Reflect (reflection); another day it is a scholar's answer to a question about the ayah (Q&A). _(Story: card variants.)_
4. **If the user refreshes or returns later the same day, the card is unchanged.** The same reflection or answer is shown, so the ritual feels stable. _(Story: card variants.)_
5. **The user reflects and moves on.** The Reflect call to action, the journal entry, and the grove downstream behave identically regardless of the card type that prompted the reflection. _(Unchanged — not owned by this epic.)_
6. **Over a month of use, the user does not see the same ayah twice.** The rotation has grown to 30 ayahs and no single ayah repeats within the 30-day window. _(Story: scale to 30.)_

## Success Metrics

- Rotation size reaches 30 ayahs before launch.
- No more than roughly one-third of the 30 ayahs require new founder-authored action prompts; the remainder are served by reflection or Q&A cards drawn from external content.
- Across a rolling 30-day window in staging, no pre-launch user sees the same ayah twice.
- Zero user-facing "content unavailable" or blank-body states on Today over the first 30 days of post-launch use.
- Card-type mix across the 30 ayahs is roughly balanced, with action cards the single largest share so the app's behavioural identity is preserved.

## Dependencies

- Access to Quran Reflect on the Quran Foundation content platform must be provisioned for this app's existing content client. The current client is scoped to the verse, translation, tafsir, and audio endpoints only; posts and comments access is a new scope that must be requested and approved before Story 1 can start.
- Access to the ayah-answers service on the same platform must be provisioned on the same client.
- Confirmation from the Quran Foundation of the attribution text and any link requirement for posts consumed through this access. The working assumption is "Shared on Quran Reflect" with no link.
- Continued availability of the verse, translation, tafsir, and audio endpoints already in use. No change to those flows.

## Rollout Strategy

- Stories deliver strictly in order. Story 1 is a gate: if the coverage probe shows the external content pool cannot support the model, the epic pauses and discovery is reopened.
- No feature flag. The new card types replace the single card format in one switchover once Story 2 ships, because the card frame (reference, Arabic, translation, Reflect button) is unchanged and the user experience degrades gracefully for any ayah that cannot be served by its tagged type.
- Launch is gated on Story 3 completing with 30 approved ayahs in rotation and the card-type mix meeting the "action-anchored" rule in Shared Business Rules.

## Open Questions

- [x] ~~Is the observed problem pre-launch or post-launch?~~ — **Resolved:** Pre-launch risk, no existing users cycling through content. Target rotation size of 30 is chosen to clear a one-month repetition window at daily use.
- [x] ~~Should action prompts also be sourced externally?~~ — **Resolved:** No. External content maps cleanly to reflection and Q&A card types but not to behavioural prompts; action cards remain founder-authored.
- [x] ~~Attribution on reflection cards?~~ — **Resolved:** Display the line "Shared on Quran Reflect" under the body; no author name.
- [x] ~~Card stability within the same day?~~ — **Resolved:** The chosen external post or answer is cached against the user's daily assignment; refreshing or reopening the app on the same day shows the same item.
- [x] ~~What if external content is unavailable for a reflection or Q&A ayah on its assign-day?~~ — **Resolved:** Degrade silently to a plain ayah card (reference + Arabic + translation + Reflect CTA). Never show an error, a blank body, or a placeholder.
- [x] ~~How many stories?~~ — **Resolved:** Three. (1) content gateway + probe; (2) card variants end-to-end; (3) scale to 30 ayahs. Each delivers independent value and maps to one ticket.
- [x] ~~How are stories ordered?~~ — **Resolved:** Strictly sequential. Story 1 gates the epic; Story 2 delivers the user-visible change; Story 3 closes out at 30 ayahs.
- [ ] Whether the content platform requires a visible link back to Quran Reflect (not just text attribution) — **Status:** Awaiting confirmation from the content partner. ← BLOCKS IMPLEMENTATION of Story 2 if linkage is required.
- [ ] Exact tagging of the 30 ayahs by card type — **Deferred (non-blocking):** Owned by Story 3; gated by Story 1's coverage probe output. A working assumption of roughly 10 action / 10 reflection / 10 Q&A is used for planning and will be refined by probe evidence.

---

## Shared Architecture Notes

Cross-cutting concerns referenced by more than one story. Per-story detail lives in each story spec.

### QF gateways and scopes

- **Existing content gateway** — `QF_CONTENT_BASE = https://api.quran.com/api/v4`, scope `content`. Wrapped by `qfContentFetch` in `lib/qf/client.ts`. Used for verses, translations, tafsir, audio. **Unchanged** by this epic.
- **New reflect gateway** — `QF_REFLECT_BASE = https://apis.quran.foundation`, scopes `post.read comment.read`. Wrapped by a new `qfReflectFetch` added in Story 1. Used for community reflection posts (`/quran-reflect/v1/posts/*`) and scholar ayah-answers (`/content/api/v4/ayah-answers` — exact path verified at probe run time).
- Token caches are independent: `_contentToken` remains untouched; `_reflectToken` is added alongside it. Both are minted by `getClientCredentialsToken(scope)` in `lib/qf/oauth.ts`, which already accepts a scope argument.
- Env vars: `QF_REFLECT_BASE` (new, default applies if unset). `QF_CLIENT_ID` and `QF_CLIENT_SECRET` are reused.

### Migration order

- `0008_card_types.sql` — Story 2. Adds `corpus_entries.card_type` (default `action`) and four `chosen_*` columns on `daily_assignments`.
- `0009_card_type_empty_prompts.sql` — Story 3. Relaxes the action-only length CHECKs to apply only when `card_type = 'action'` so reflection/qa rows can carry empty content fields.

Story 2's migration must ship before Story 3's shortlist growth; Story 1's work is read-only and has no migration.

### Sanitization convention

All externally-sourced HTML (reflection post bodies, Q&A answer bodies, coverage probe excerpts) passes through `DOMPurify.sanitize()` with `ALLOWED_TAGS` and `ALLOWED_ATTR` imported from — or replicated exactly from — `app/api/content/tafsir/[key]/route.ts`. Do not invent a new allow-list; the tafsir convention is authoritative (see `convention-tafsir-html-sanitized`).

### Same-user-same-day stability

Enforced by persisting `daily_assignments.chosen_reflect_post_id` (bigint) or `chosen_answer_id` (text) plus `chosen_at` on first resolution, via a `UPDATE ... WHERE chosen_* IS NULL` atomic guard. Subsequent reads for the same `(user_id, local_date)` fetch the persisted item by id; the feed-list endpoints are called at most once per `(user, day, card_type)` pair.

### Silent-degradation contract

`/api/today` never returns a 5xx for reflect/answer failures. Instead, the response includes `reflection_body: { degraded: true }` or `qa_body: { degraded: true }`; the client omits the body block and renders the plain ayah frame. Verse/translation/audio failures keep their existing `503 QF_CONTENT_UNAVAILABLE` behaviour.

### Story ordering (invariant)

Story 1 → Story 2 → Story 3. Story 2 depends on `qfReflectFetch` from Story 1. Story 3 depends on `card_type` schema from Story 2. Merging out of order breaks runtime assumptions.
