# Reading Becomes Doing — Overview

**Discovery Brief:** [docs/discovery/ramadan-to-year-round/brief.md](../../discovery/ramadan-to-year-round/brief.md)

## Summary

This epic sharpens Ghars's core habit loop so that daily reflections are rewarded for _evidence of living the verse_, not for eloquence. A visible five-marker application rubric replaces the single "depth" score, and an optional morning intention field is added to the mission card so that the evening reflection has something specific to report against. Together these changes make Ghars's central promise — "your Quran practice survives Ramadan because you're actually living the verses" — true to the mechanism, not just the marketing.

## Background & Context

**Current state:**

- Every day, Ghars picks a verse and generates a one-sentence mission the user can try that day.
- In the evening, the user writes a free-text reflection. Claude scores it 1–5 on "depth" and either accepts it (plant grows) or returns a soft nudge.
- A reflection of "patience is a virtue we should all practice" can score high on depth. A reflection of "my brother annoyed me at dinner and I took a breath instead of snapping" can score the same or lower.

**Problem:**

- The current "depth" score rewards _thoughtful writing_, not _evidence of application_. This was confirmed by the Ghars team in discovery.
- The app's stated promise is that users will actually live the Quran daily — but the feedback loop doesn't measure or reinforce that behavior.
- The hackathon rubric awards 30 out of 100 points for "Impact on Quran Engagement." A judge watching the demo video will see a contemplative reflection score highly and reasonably ask "where is the application?" That gap undermines the entire thesis.
- Reflection alone, without a morning anchor, invites users to sit down at 9pm with a blank page and write something vaguely spiritual. There is no structure that connects the morning's mission to the evening's answer.

## Goals

- Reward reflections that show evidence of application (specific moment, behavioral change, temporal anchor, honest friction, next step) over reflections that merely sound thoughtful.
- Give the user a lightweight way in the morning to pre-commit to _where_ or _when_ they will try the day's mission, so the evening reflection can respond to something concrete.
- Produce a feedback experience that feels encouraging and growth-oriented, not like being graded.
- Make the mechanism visible on camera so a hackathon judge can see, in the 2:30 demo video, exactly what Ghars rewards and why.

## Non-Goals

- Changing how daily missions are generated (the verse-picking and mission-writing logic is unchanged).
- Supporting multiple reflections per day.
- Adding voice or photo as primary reflection inputs.
- Introducing push notifications or reminders specifically for the morning intention.
- Integrating the five-marker rubric into garden-circle sharing.
- Temporal/contextual features such as a dedicated "Shawwal Mode" — deferred, per the discovery brief.

## Story Index

| Ticket | Story                                                | Spec                                                       | Type        | Status      | Dependencies |
| ------ | ---------------------------------------------------- | ---------------------------------------------------------- | ----------- | ----------- | ------------ |
| TBD    | Reflection judge v2 — five-marker application rubric | [spec-reflection-judge-v2.md](spec-reflection-judge-v2.md) | User-facing | Not Started | —            |
| TBD    | Morning intention field on the mission card          | [spec-morning-intention.md](spec-morning-intention.md)     | User-facing | Not Started | —            |

Both stories are independently shippable. The rubric can live without the morning intention; the intention field can live with either the old or new judge. When both are present, the evening prompt is personalized by the morning intention and the judge scores the reflection against both the intention and the five markers.

## Shared Business Rules

- **The five markers of application** — every reflection is evaluated against these five markers:
  1. **Specific moment** — a named situation, person, or time today (not abstract).
  2. **Behavioral change** — something the user did or did not do (not only felt).
  3. **Temporal anchor** — happened today, or since the last reflection.
  4. **Honest friction** — includes struggle, failure, or a partial attempt.
  5. **Next step** — what the user will try tomorrow or on the next similar situation.
- **Connection to the specific verse is not required.** The rubric rewards any evidence of lived application, even if it does not tie cleanly to the day's verse. This is deliberate: the app must ease users in, not demand they perform textual connection.
- **Score display uses marker count, not a 1–5 grade.** Every reflection shows "X of 5 markers present" with per-marker checkmarks for the ones present and a greyed-out state for the ones missing. A numeric 1–5 grade is never shown to the user.
- **Every reflection is accepted.** Missing markers never block the plant from growing or the streak from continuing. Markers are coaching, not a gate. The previous `soft_nudge` behavior is retired for reflections — feedback for low-marker reflections is framed as an encouraging suggestion for next time, not as a rejection.
- **Growth points scale with marker count, within a cap.** The plant grows more for reflections that show more markers, but the scale is compressed so that "wrote one sentence" still feels worthwhile and "wrote a novel" does not feel gamed. The formula is: minimum of 2 points for any accepted reflection, maximum of 5, roughly one additional point per marker hit above the first two.
- **Morning intentions, once set, cannot be edited.** The user may skip setting an intention, but if they set one, it is locked for that day. This preserves the honesty of "did you follow through on what you said you'd do?"
- **Old reflections are re-scored on the new rubric.** When the new rubric ships, all historical reflections in a user's journal are re-evaluated by the new judge and their marker counts are backfilled. This keeps the journal coherent and avoids mixed-scale displays on camera.

## User Journey Map

The epic plays out across a single day.

1. **Morning — mission arrives.** The user opens /today and sees the day's verse plus the one-sentence mission. Below the mission is an optional single-line intention field, pre-filled with a suggestion Claude generated from the mission itself (for example, "At lunch, practice patience with the colleague who always interrupts"). The user can accept the suggestion, edit it, write their own, or skip entirely. Whatever they set is then locked. _(Story: Morning intention field)_
2. **Throughout the day.** No app interaction required. The user goes about their day. If they want to glance at their intention, they can reopen /today.
3. **Evening — reflection.** The user opens /today again and taps the reflection form. If an intention was set, the prompt reads "You planned to {intention}. What happened?" — giving the user something specific to respond to. If no intention was set, the prompt reads "What happened today that connected to this verse?" — the default fallback. _(Story: Reflection judge v2)_
4. **Feedback reveal.** After submitting, the user sees the five markers animate in one by one. Markers present are shown as checkmarks with the phrase from their reflection that triggered each one; missing markers are greyed out with a single-line prompt for next time (for example, "Next time, try naming a specific moment"). _(Story: Reflection judge v2)_
5. **Growth.** The plant grows — more if more markers were present, but always at least a small amount. The streak continues. The reflection is saved to the journal, tagged with its marker count. _(Story: Reflection judge v2)_
6. **Journal view.** When the user opens /reflections later, every entry — including historical ones from before the rubric change — shows its marker count. Clicking any entry reveals the per-marker breakdown. _(Story: Reflection judge v2)_

## Success Metrics

- **Rubric score on "Impact on Quran Engagement"** — the hackathon judges award at least 24 of 30 on this axis. Measured by: submission is ranked in top 3 overall, and the Impact sub-score (if revealed in feedback) meets the threshold.
- **Prompt-evaluation test pass rate** — on the pre-implementation paired-reflections test set (Experiment A from the discovery brief), the new judge's ranking correlates with ground truth at Spearman ρ ≥ 0.7 and scores applied-but-inelegant reflections at least one marker-count higher than the current judge does.
- **Hallway-test acceptance** — in the pre-implementation UX test (Experiment C), at least two of three testers say they would fill in the morning intention at least three days a week, and at least two of three describe the feedback as encouraging rather than harsh.
- **On-camera clarity** — a non-Muslim, non-technical viewer watching the demo video can state, in one sentence, what Ghars rewards and why. Verified by showing the video to two such viewers before submission.

## Dependencies

- **Anthropic API availability.** The reflection judge depends on Claude for scoring. Fallback behavior for API outages is to accept every reflection with a neutral marker-count message; see story spec.
- **Experiments A and C must complete before full implementation.** The discovery brief commits to running an offline prompt-evaluation on a 15-sample paired set, and a hallway UX test with 2–3 practicing Muslim friends, before committing to the full build. Failing either experiment's success criteria forces a prompt iteration or a story cut (drop Morning Intention if the hallway test fails).
- **Demo video re-record.** The existing demo script was written against the old "depth" score. It must be rewritten and re-recorded against the new marker-based feedback before hackathon submission. This is a deliverable, not a story.

## Rollout Strategy

- **Order:** Story 1 (Reflection judge v2) is built first, then Story 2 (Morning intention). If Experiment C (hallway test) fails its acceptance criteria, Story 2 is cut and Story 1 alone is shipped.
- **User base:** the app has a single test account today. No migration of real users is at stake. All historical reflections on the test account will be re-scored on deployment, per the shared business rule.
- **Communication:** none required — no production users. A release-note-style paragraph goes in the README and the demo video voice-over.

## Open Questions

All product questions raised in discovery and refinement have been resolved. No open items block implementation.

- [x] ~~Score display — numeric score, marker count, or hidden?~~ — **Resolved:** Marker count only, no 1–5 grade shown to users.
- [x] ~~Accepted threshold — how many markers before the plant grows?~~ — **Resolved:** Every reflection accepts; markers are coaching, not a gate.
- [x] ~~Intention pre-fill — LLM, template, or rotating seeds?~~ — **Resolved:** LLM-generated from today's mission.
- [x] ~~Can users edit the morning intention during the day?~~ — **Resolved:** No — locked after set.
- [x] ~~How are historical reflections handled?~~ — **Resolved:** Re-scored on the new rubric at deployment.
- [x] ~~Do more markers earn more growth points?~~ — **Resolved:** Yes, but capped — minimum 2 points, maximum 5 points per accepted reflection.
- [x] ~~Fallback when morning intention is skipped?~~ — **Resolved:** Evening prompt falls back to "What happened today that connected to this verse?" and the reflection is scored on the five markers alone.
- [x] ~~Connection to the specific verse — required?~~ — **Resolved:** No. Ease users in.

---

## Shared Architecture Notes

**Stack context:** Next.js 16 App Router + TypeScript. Server routes under `app/api/*/route.ts`. Supabase Postgres via `createServerClient()` in `lib/supabase/server.ts`. Anthropic SDK configured in `lib/llm/anthropic.ts` using `claude-sonnet-4-6` for the judge and `claude-haiku-4-5` for generative helpers. Client components under `components/` and `app/*/[ClientName].tsx`; server components fetch data and pass to client.

**Breaking-change contract (consumed by both stories):** The `LLMProvider.judgeReflection` interface in `lib/llm/types.ts` changes shape. The returned `depthScore: number` is replaced with a marker result object. All three provider implementations (`anthropic.ts`, `ollama.ts`, `stub.ts`) are updated together, plus every call site (`lib/mission/judge.ts`, `app/api/reflection/route.ts`, `components/ReflectionForm.tsx`, `app/today/TodayClient.tsx`, and the reflection journal pages). No coexistence with the old `depth_score` — a single migration pass renames/retires the column and backfills.

**Shared DB changes:** A new table `daily_intentions` stores morning intentions (Story 2). The `reflections` table gains marker columns and loses the `depth_score` / `llm_verdict` constraints in favour of a `marker_count` + `markers_json` pair (Story 1). Migration `0010_application_rubric.sql` owns Story 1's changes; migration `0011_daily_intentions.sql` owns Story 2's changes. They are independent and either may ship without the other — Story 1's migration is applied first if both ship in the same release.

**Shared feature flag:** None. The test account is the only live account; flag gating is unnecessary complexity for a 19-day hackathon window.

**Shared prompt-eval harness (Experiment A):** A new script `scripts/eval-judge-v2.ts` runs a hand-written 15-sample fixture at `tests/fixtures/reflections.json` through the new judge and prints a correlation + applied-but-inelegant comparison against the old judge. Run via `pnpm tsx scripts/eval-judge-v2.ts`. Produced once, committed under `tests/fixtures/`, and re-run after any prompt iteration. This harness is authored in Story 1 and consumed by Experiment A before full UI integration.

**Negative constraints shared across both stories:**

- Do NOT change the verse-picking or mission-generation logic in `lib/mission/generate.ts` or `lib/llm/prompts.ts`'s `PICK_MISSION_*` prompts.
- Do NOT modify circles, tasbih, word-garden, or bookmarks code paths.
- Do NOT touch PWA push / web-push code — the epic's "no notifications for the intention" rule is enforced by omission, not opt-out plumbing.
- Do NOT retain the `llm_verdict = 'soft_nudge'` code path at any call site. The new judge never rejects.
- Do NOT display the numeric 1-to-5 grade anywhere in the UI, including archival reflection views.
