# Reflection Judge v2 — Five-Marker Application Rubric

**Ticket:** TBD

**Epic:** [Reading Becomes Doing](spec.md)

This feature replaces the current single "depth" score on evening reflections with a visible five-marker rubric that rewards evidence of actually living the verse. When a user submits a reflection, five application markers animate in one by one with quoted phrases from the user's own words; missing markers surface a short encouraging prompt for next time. Every reflection is accepted, the plant still grows, and the mechanism a hackathon judge sees on camera is now true to the app's promise: read, then do.

## User Story

As a practicing Muslim who read the Quran during Ramadan and wants to keep the habit year-round, I want my evening reflection to be rewarded for what I actually did today — not for how thoughtfully I wrote about it — so that the app genuinely helps me live the verses rather than merely contemplate them.

## Background & Context

**Current state:**

- Every evening the user writes a free-text reflection on the day's verse and mission.
- A judge scores the reflection on a single "depth" dimension from 1 to 5 and either accepts it (plant grows) or returns a soft nudge asking the user to try again.
- A reflection such as "patience is a beautiful virtue that all believers should cultivate" can score a 4 or a 5 on depth.
- A reflection such as "my younger brother interrupted me at iftar and I took a breath instead of snapping" can score the same or lower.

**Problem:**

- The current score rewards thoughtful writing, not evidence of application. The app's stated promise is that the user will actually live the verses — but the feedback loop does not measure or reinforce that behavior.
- Users who wrote a blunt, honest, applied reflection can walk away feeling under-rewarded, while users who wrote a spiritual-sounding paragraph with no action in it feel over-rewarded. Over time this teaches the user that the app wants eloquence, and the habit collapses the moment Ramadan's external structure disappears.
- On camera, a demo judge watching a thoughtful-but-inactive reflection score a 5 out of 5 reasonably asks, "where is the application?" — a gap that directly undermines scoring on the largest rubric axis of the hackathon.

## Target User & Persona

- **Who:** A practicing Muslim who has completed onboarding, has already received at least one daily verse and mission, and is the intended year-round user of Ghars.
- **Context:** Evening, after the day is done. The user opens the day's screen, taps the reflection form, and has roughly 30 to 90 seconds of attention to write what happened.
- **Current workaround:** The user either writes something genuine and feels flatly scored, writes something performatively spiritual to "earn" a good score, or stops opening the app because the feedback does not feel like it sees them.

## Goals

- Reward reflections that demonstrate application over reflections that merely sound thoughtful, by scoring against five explicit markers.
- Make the mechanism visible: the user (and any observer over their shoulder) can see exactly which markers were present, which were missing, and why — no hidden grading.
- Keep the experience encouraging. A reflection with zero markers still grows the plant, still continues the streak, and receives coaching phrased as an invitation rather than a correction.
- Keep old journal entries coherent with the new rubric, so the user's history reads as a single consistent practice rather than a scale change.
- Survive an outage of the scoring service gracefully — the user never gets blocked from reflecting.

## Non-Goals

- Changing how the day's verse or mission is generated.
- Introducing the morning intention field (delivered by the sibling story in this epic). This story must correctly handle both the case where an intention exists and the case where it does not, but it does not build the intention input itself.
- Supporting more than one reflection per day.
- Adding voice, photo, or structured per-marker inputs. The reflection remains a single free-text field.
- Showing a numeric 1-to-5 grade anywhere in the product.
- Using the five markers inside garden-circle sharing.

## User Workflow

1. **Evening — open the day's screen.** The user opens the day's screen and sees the verse, the day's mission, and a reflection prompt. If a morning intention was set, the prompt reads "You planned to {intention}. What happened?" If no morning intention was set, the prompt reads "What happened today that connected to this verse?"
2. **Write.** The user types a reflection into a single free-text field. Length is not constrained; a one-sentence reflection is valid.
3. **Submit.** The user taps submit. The reflection is saved immediately — it cannot be lost even if scoring is slow.
4. **Watch the markers animate in.** One by one, each of the five application markers appears. Each present marker shows a checkmark next to its name and the short phrase from the user's own reflection that triggered it. Each missing marker shows a greyed-out state with a one-line encouraging prompt for next time.
5. **See the total and the growth.** After the five markers have animated in, the user sees a summary line reading "X of 5 markers present" and watches the plant grow. The streak continues.
6. **Revisit in the journal.** When the user later opens the journal view, every reflection — including ones written before the new rubric shipped — shows its marker count. Tapping any entry reveals the per-marker breakdown with the original triggering phrases for present markers and the coaching prompts for missing markers.

## The Five Markers

Each reflection is evaluated against these five markers. Connection to the specific verse of the day is not required for any marker.

1. **Specific moment** — the reflection names a particular situation, person, or time from today (not abstract virtue-talk).
2. **Behavioral change** — the reflection describes something the user did or did not do, not only what they felt.
3. **Temporal anchor** — the reflection is grounded in today, or in the time since the last reflection.
4. **Honest friction** — the reflection admits struggle, failure, a partial attempt, or an imperfect outcome.
5. **Next step** — the reflection names what the user will try tomorrow or in the next similar situation.

A reflection may earn any subset of markers from zero to five. The marker count is displayed as "X of 5"; a numeric 1-to-5 grade is never displayed.

## Acceptance Criteria

### Scenario: Reflection with all five markers hits the maximum

```gherkin
Given I have today's verse and mission open on my phone in the evening
  And no morning intention was set for today
When I submit the reflection "At Maghrib my sister snapped at me about the dishes. I almost snapped back but I paused, said 'you're right, I forgot,' and did them. It felt hard not to defend myself. Tomorrow when she gets home from work I'll just do the dishes before she has to ask."
Then I see the prompt "What happened today that connected to this verse?" above my submitted reflection
  And I see five markers animate in one after another
  And I see a checkmark next to "Specific moment" with the phrase "At Maghrib my sister snapped at me about the dishes"
  And I see a checkmark next to "Behavioral change" with the phrase "I paused, said 'you're right, I forgot,' and did them"
  And I see a checkmark next to "Temporal anchor" with the phrase "At Maghrib"
  And I see a checkmark next to "Honest friction" with the phrase "It felt hard not to defend myself"
  And I see a checkmark next to "Next step" with the phrase "Tomorrow when she gets home from work I'll just do the dishes before she has to ask"
  And I see a summary line reading "5 of 5 markers present"
  And I see my plant grow by the maximum amount
  And my streak continues
  And no numeric grade from 1 to 5 appears anywhere on the screen
```

### Scenario: Reflection with three markers grows the plant by a middle amount

```gherkin
Given I have today's verse and mission open on my phone in the evening
  And this morning I set the intention "At lunch, practice patience with the colleague who always interrupts"
When I submit the reflection "Today at the standup Rachel cut me off twice while I was explaining the migration plan. I felt my chest tighten but I just waited and finished my sentence after she was done."
Then I see the prompt "You planned to practice patience with the colleague who always interrupts. What happened?" above my submitted reflection
  And I see a checkmark next to "Specific moment" with the phrase "At the standup Rachel cut me off twice"
  And I see a checkmark next to "Behavioral change" with the phrase "I just waited and finished my sentence after she was done"
  And I see a checkmark next to "Temporal anchor" with the phrase "Today at the standup"
  And I see a greyed-out state next to "Honest friction" with the coaching prompt "Next time, try naming what made it hard — the struggle counts"
  And I see a greyed-out state next to "Next step" with the coaching prompt "Next time, try writing one small thing you'll do tomorrow"
  And I see a summary line reading "3 of 5 markers present"
  And I see my plant grow by a middle amount
  And my streak continues
```

### Scenario: Reflection with zero markers still grows the plant

```gherkin
Given I have today's verse and mission open on my phone in the evening
When I submit the reflection "Patience is a virtue we should all practice."
Then I see all five markers in a greyed-out state
  And each missing marker has a short encouraging coaching prompt next to it
  And I see a summary line reading "0 of 5 markers present"
  And the summary is framed as encouragement rather than rejection
  And I see my plant grow by the minimum amount
  And my streak continues
  And I am not asked to rewrite or resubmit the reflection
```

### Scenario: A one-sentence reflection is scored fairly

```gherkin
Given I have today's verse and mission open on my phone in the evening
When I submit the reflection "My brother annoyed me at dinner tonight and I took a breath instead of snapping."
Then I see a checkmark next to "Specific moment" with the phrase "at dinner tonight"
  And I see a checkmark next to "Behavioral change" with the phrase "I took a breath instead of snapping"
  And I see a checkmark next to "Temporal anchor" with the phrase "tonight"
  And I see a greyed-out state next to "Honest friction"
  And I see a greyed-out state next to "Next step"
  And I see a summary line reading "3 of 5 markers present"
  And the shortness of my reflection does not lower my marker count
```

### Scenario: A verse-echo reflection without application earns few markers

```gherkin
Given today's verse is about patience in the face of difficulty
  And the mission for today asks me to pause once before reacting
When I submit the reflection "Allah commands the believers to be patient and promises a great reward for those who are steadfast. Patience is the key to success in this life and the next."
Then I see a greyed-out state next to "Specific moment" with a coaching prompt inviting me to name a moment from today
  And I see a greyed-out state next to "Behavioral change" with a coaching prompt inviting me to name something I did
  And I see a greyed-out state next to "Temporal anchor" with a coaching prompt inviting me to ground the reflection in today
  And I see a greyed-out state next to "Honest friction"
  And I see a greyed-out state next to "Next step"
  And I see a summary line reading "0 of 5 markers present"
  And I see my plant grow by the minimum amount
  And the feedback does not praise me for quoting or paraphrasing the verse
```

### Scenario: Copying the verse text verbatim does not auto-award markers

```gherkin
Given today's verse translation reads "And be patient, for indeed Allah does not allow to be lost the reward of those who do good"
When I submit the reflection "And be patient, for indeed Allah does not allow to be lost the reward of those who do good."
Then I see zero markers awarded on the basis of matching the verse text
  And I see a summary line reading "0 of 5 markers present"
  And I see my plant grow by the minimum amount
```

### Scenario: The evening prompt reflects whether a morning intention was set

```gherkin
Given I have today's verse and mission open on my phone in the evening
When I look at the reflection form
Then the prompt I see is determined by whether a morning intention exists

Examples:
  | morning intention set today                               | prompt I see                                                           |
  | "At lunch, practice patience with the colleague who always interrupts" | "You planned to practice patience with the colleague who always interrupts. What happened?" |
  | "Call my mother before Maghrib"                            | "You planned to call my mother before Maghrib. What happened?"          |
  | no intention was set                                       | "What happened today that connected to this verse?"                    |
  | intention was skipped deliberately this morning            | "What happened today that connected to this verse?"                    |
```

### Scenario: The scoring service is unavailable when I submit

```gherkin
Given I have today's verse and mission open on my phone in the evening
  And the service that scores my reflection is temporarily unavailable
When I submit the reflection "At Asr I snapped at my son for no reason and apologized ten minutes later. Tomorrow I'll try to breathe before I speak when I'm tired."
Then I see a neutral message reading "5 markers pending — we'll score this when we're back online"
  And I do not see any markers awarded yet
  And I see my plant grow by the minimum amount
  And my streak continues
  And my reflection is saved so that nothing I wrote is lost
  And I am not blocked from closing the app or continuing with my evening
```

### Scenario: A reflection pending re-scoring catches up when the service returns

```gherkin
Given I submitted a reflection yesterday evening while the scoring service was unavailable
  And the reflection currently shows the neutral "pending" message
When I open the journal view after the scoring service is back online
Then the reflection shows its final marker count
  And the per-marker breakdown is visible when I tap the entry
  And no additional growth is added to the plant — the minimum growth from yesterday is preserved and not topped up
```

### Scenario: Historical reflections are re-scored against the new rubric

```gherkin
Given I have reflections in my journal from before the new rubric was introduced
  And those reflections previously showed a 1-to-5 depth score
When I open the journal view for the first time after the new rubric ships
Then every historical reflection shows a marker count in the form "X of 5 markers present"
  And no historical reflection shows a 1-to-5 numeric grade
  And tapping any historical reflection reveals the per-marker breakdown
  And the per-marker breakdown shows the triggering phrase for each present marker from my own original words
  And the breakdown shows coaching prompts for each missing marker
```

### Scenario Outline: Growth points scale with marker count within the cap

```gherkin
Given I submit a reflection in the evening
When the reflection is scored against the five markers
Then my plant grows by the amount tied to my marker count

Examples:
  | marker count | plant growth                        |
  | 0 of 5       | minimum amount (the floor)          |
  | 1 of 5       | minimum amount (the floor)          |
  | 2 of 5       | minimum amount (the floor)          |
  | 3 of 5       | one step above the floor            |
  | 4 of 5       | two steps above the floor           |
  | 5 of 5       | maximum amount (the cap)            |
```

### Scenario: Missing markers never block growth or the streak

```gherkin
Given I submit any reflection, no matter how short, shallow, or off-topic
When the reflection is scored
Then my plant grows by at least the minimum amount
  And my streak continues
  And I am never asked to rewrite or resubmit the reflection
  And I never see a rejection message
```

### Scenario: Missing-marker coaching is phrased as encouragement

```gherkin
Given my reflection earned fewer than five markers
When I look at the coaching prompts next to the missing markers
Then each prompt begins with language like "Next time, try…" or "For tomorrow, consider…"
  And no prompt uses language like "You failed to…" or "Your reflection is missing…" in a blaming tone
  And no prompt implies my reflection was wrong
```

### Scenario: Journal entry detail shows per-marker breakdown with my own words

```gherkin
Given I have a reflection in my journal that earned 4 of 5 markers
When I tap that journal entry
Then I see the original reflection text exactly as I wrote it
  And I see the date the reflection was written
  And I see the four present markers each with the triggering phrase from my reflection
  And I see the one missing marker with its coaching prompt for next time
  And I see the summary "4 of 5 markers present"
  And I do not see a numeric 1-to-5 grade
```

### Scenario: The marker animation plays once per submission

```gherkin
Given I have just submitted a reflection
When the markers animate in one by one
Then each marker appears in sequence rather than all at once
  And I see the summary count after the last marker has appeared
When I later revisit the same reflection in the journal view
Then I see the final marker breakdown directly without the animation replaying
```

### Scenario: Connection to the day's verse is not required to earn markers

```gherkin
Given today's verse is about truthfulness in speech
  And the mission asks me to avoid one small exaggeration today
When I submit the reflection "On the train this morning I gave up my seat to a pregnant woman even though I was exhausted after night shift. It was hard and I felt a little resentful at first. Tomorrow I'll try to offer without waiting for eye contact."
Then I see a checkmark next to "Specific moment" with the phrase "On the train this morning"
  And I see a checkmark next to "Behavioral change" with the phrase "I gave up my seat to a pregnant woman"
  And I see a checkmark next to "Temporal anchor" with the phrase "this morning"
  And I see a checkmark next to "Honest friction" with the phrase "It was hard and I felt a little resentful at first"
  And I see a checkmark next to "Next step" with the phrase "Tomorrow I'll try to offer without waiting for eye contact"
  And I see "5 of 5 markers present"
  And I am not penalised for the reflection being about kindness rather than truthfulness
```

### Scenario: Only one reflection per day is accepted

```gherkin
Given I have already submitted my reflection for today
When I revisit the day's screen later in the evening
Then I see my submitted reflection with its marker breakdown
  And I do not see a new empty reflection form for today
  And I cannot overwrite today's reflection with a new one
```

## Business Rules & Constraints

- **Every reflection is accepted.** No reflection is ever rejected, marked invalid, or bounced back to the user for rewriting — regardless of marker count, length, or content.
- **Score display uses marker count only.** Every user-visible surface shows "X of 5 markers present"; a numeric 1-to-5 grade is never displayed anywhere in the product, including the journal view and any historical entry.
- **Growth scales within a hard cap.** The minimum plant growth per accepted reflection is 2 points. The maximum is 5 points. A reflection with 0, 1, or 2 markers earns the minimum; each additional marker above 2 adds roughly one point, up to the cap. The existing streak bonus (applied by the streak system) is preserved independently and is out of scope for this story.
- **Connection to the day's verse is not required.** A reflection may earn all five markers without ever referencing the day's verse. Textual fidelity to the verse is not a marker.
- **Copying the verse text verbatim earns no markers on that basis.** The judge must reward application, not quotation.
- **Missing markers are coaching, not a gate.** They never prevent growth, break a streak, or return a rejection. Coaching language must be encouraging and forward-looking.
- **Evening prompt personalises from the morning intention when one exists.** If a morning intention was set, the prompt reads "You planned to {intention}. What happened?" If not, the prompt reads "What happened today that connected to this verse?" The intention input field itself is delivered by the sibling story; this story reads whatever value exists (or its absence) and displays the correct prompt.
- **Old reflections are re-scored on the new rubric at launch.** When the new rubric ships, all historical reflections already in the user's journal are re-evaluated and their marker counts are backfilled. The journal must never show a mixed display of old 1-to-5 grades alongside new marker counts.
- **Scoring outage fallback.** When the scoring service is unavailable, the reflection is accepted with the neutral message "5 markers pending — we'll score this when we're back online", the plant grows by the minimum amount, the streak continues, and the reflection is eligible for re-scoring once the service is back. No additional growth is applied when the delayed score comes in — the minimum growth already awarded stands.
- **One reflection per day.** Users cannot submit multiple reflections for the same day; the day's submission is final once made.
- **Triggering phrase must be drawn from the user's own words.** For each present marker, the phrase shown next to the checkmark must come from the submitted reflection itself — not a paraphrase, not a generic sentence.

## Success Metrics

- **Evidence-over-eloquence ranking.** On the 15-sample paired-reflections test set from the discovery brief, the new judge's ranking of reflections correlates with ground truth at Spearman ρ ≥ 0.7, and reflections in the "applied but inelegant" subset score at least one marker higher than they did under the previous depth score.
- **Correct marker attribution.** In the same 15-sample set, the markers named as present or missing match the tester's own judgement in at least 12 of 15 reflections.
- **Encouraging feel.** In the hallway UX test with 2 to 3 practicing Muslim testers, at least two of three describe the feedback as "helpful," "encouraging," or "makes me want to try again tomorrow" rather than "harsh" or "like being graded."
- **On-camera clarity.** A non-Muslim, non-technical viewer watching the demo video can state in one sentence what Ghars rewards and why, after seeing the markers animate in.
- **Judge axis impact.** The hackathon's 30-point "Impact on Quran Engagement" rubric axis scores at least 24.

## Dependencies

- **The scoring service must be available for real-time marker attribution.** The fallback described above covers the unavailability case, but the happy path depends on this service.
- **The sibling story "Morning intention field on the mission card" is not a dependency.** This story must correctly handle both the "intention present" and "no intention" cases on its own — the intention field may be present in the product or not, and this story works either way.
- **Pre-implementation experiments from the discovery brief must complete first.** The paired-reflections prompt-evaluation (Experiment A) and the hallway UX test (Experiment C) must pass their success criteria before the full story is built. Failing Experiment A forces a prompt iteration before the UI is wired up.
- **Demo video re-record.** The existing demo was recorded against the old depth score; it must be re-recorded against the new marker feedback before hackathon submission. This is a deliverable adjacent to this story, not part of it.

## Rollout Considerations

- **User base is one test account.** No migration of real users is at stake; all historical reflections on the test account are re-scored on deployment per the shared business rule in the epic overview.
- **Single-shot launch.** The new rubric replaces the old depth score in a single release; the two do not coexist.
- **Communication.** A short release note in the project README and a single sentence in the demo video voice-over are sufficient. No in-app announcement is required.

## Open Questions

All product questions for this story were resolved in the epic overview and the discovery brief.

- [x] ~~Score display — numeric, marker count, or hidden?~~ — **Resolved:** Marker count only; the numeric 1-to-5 grade is never shown.
- [x] ~~How many markers before the plant grows?~~ — **Resolved:** Every reflection grows the plant; markers are coaching, not a gate.
- [x] ~~Do more markers earn more growth?~~ — **Resolved:** Yes, between a floor of 2 and a cap of 5, roughly one additional point per marker above the first two.
- [x] ~~Historical reflections in the journal when the rubric changes?~~ — **Resolved:** All historical reflections are re-scored on the new rubric at launch.
- [x] ~~Must the reflection connect to the specific verse of the day?~~ — **Resolved:** No. Rubric rewards application, not textual fidelity.
- [x] ~~Marker reveal — all at once, or one by one?~~ — **Resolved:** One by one, so the mechanism is visible on camera and in use.
- [x] ~~Fallback when the scoring service is unavailable?~~ — **Resolved:** Accept the reflection, show the neutral "5 markers pending" message, award minimum growth, continue the streak, re-score when the service returns.

---

## Functional Requirements

- **Judge contract:** Claude Sonnet 4.6 scores each reflection against the five markers. The judge returns a `markers` object with five booleans and, for each `true`, the `triggering_phrase` drawn verbatim from the user's reflection. For each `false`, the judge returns a short `coaching_prompt` (≤ 12 words, encouraging, starts with "Next time" or "For tomorrow").
- **Marker count:** `marker_count = Object.values(markers).filter(Boolean).length`, integer in `[0, 5]`.
- **Verdict replacement:** The existing `verdict: 'accepted' | 'soft_nudge'` field is retired. Every reflection is accepted. The `soft_nudge` code path is removed from `lib/mission/judge.ts`, `app/api/reflection/route.ts`, and `components/ReflectionForm.tsx`.
- **Growth-point formula:** `points = max(2, min(5, 2 + max(0, markerCount - 2)))` rounded to integer. Plus streak bonus `(newStreak > 1 ? 1 : 0)` unchanged.
  - 0 markers → 2 pts
  - 1 marker → 2 pts
  - 2 markers → 2 pts
  - 3 markers → 3 pts
  - 4 markers → 4 pts
  - 5 markers → 5 pts
- **Idempotency:** Submitting the same `missionId` twice returns a conflict (existing behaviour preserved; see `app/api/reflection/route.ts:47-49`). The retry path for `pending` rescoring is a separate endpoint (see API Design below).
- **Atomicity:** Reflection save, marker save, garden update, and activity log all run sequentially in the submission handler. If the garden update fails after the reflection has been stored, the reflection stays stored — the `pending` re-score path will handle recovery if the failure was transient. No global transaction wrapper; follow existing pattern.
- **Historical re-score:** A one-time backfill migration re-runs every existing reflection through the new judge at deploy time. The migration invokes an Edge-free script (`scripts/backfill-markers.ts`) that iterates `reflections` rows with `marker_count IS NULL`, calls Sonnet for each, and writes the result. The script is safe to re-run (idempotent on `marker_count IS NULL`).
- **Fallback on judge outage:** If `judgeReflection` throws, persist the reflection with `marker_count = NULL`, `markers_json = NULL`, `status = 'pending'`. Return `{status: 'pending', pendingMessage: "5 markers pending — we'll score this when we're back online", growthPoints: +2}`. Client renders the neutral pending banner; markers do not animate.
- **Pending reconciliation:** When the journal page loads, any `status = 'pending'` reflection triggers a lazy re-score via `POST /api/reflection/:id/rescore` (fire-and-forget from the client; server guards against double-scoring with `status = 'pending'` check).

### Validation & Business Rules

- `reflection_text` trimmed length must be `≥ 1` character (unchanged from existing endpoint). Error: `400 EMPTY_REFLECTION "Reflection text is required"`.
- `marker_count` must be an integer `[0, 5]`; enforced by DB check constraint.
- `markers_json` must validate the schema `{ specific_moment: Marker, behavioral_change: Marker, temporal_anchor: Marker, honest_friction: Marker, next_step: Marker }` where `Marker = { present: boolean, triggering_phrase?: string, coaching_prompt?: string }`. Validation done server-side; the DB stores it as `jsonb` without a constraint (keep the column flexible for schema evolution).
- **Triggering-phrase integrity:** The API handler checks that each `triggering_phrase` returned by Sonnet is a case-insensitive substring of `reflectionText`. If any phrase fails this check, that marker flips to `present: false` with a generic coaching prompt, and a warning is logged via `logEvent('judge_phrase_mismatch', ...)`. This guards against hallucinated quotes on camera.
- **One reflection per mission** (unchanged): the unique constraint `reflections.mission_id` already enforces this.

## Permissions & Security

- **Scope:** Authenticated user-only API. Session via `getRequiredSession()` from `lib/auth/session.ts` (iron-session).
- **Authorization:** Every read/write is scoped to `session.userId`. The `daily_missions` lookup already filters by `user_id`; do not weaken this.
- **Row-Level Security:** The existing `0004_rls.sql` policies on `reflections` remain sufficient. No new RLS needed for the new columns.
- **Input validation:** Cap `reflection_text` at 4,000 characters server-side (new limit — current endpoint has no cap). Reject with `400 REFLECTION_TOO_LONG "Reflection must be under 4000 characters"`. Trim whitespace before persistence.
- **Prompt-injection posture:** The reflection text is user-controlled and flows verbatim into the Sonnet prompt. Accept this risk — the attack surface is a single-user account with no downstream consequences of a manipulated marker score. Do NOT strip or sanitise the reflection text, because the triggering-phrase check relies on exact substring match.

## API Design

### `POST /api/reflection`

**Purpose:** Submit an evening reflection and score it against the five-marker rubric. Existing endpoint — modified response shape.

**Request:**

```json
{
  "missionId": "a1b2c3d4-5e6f-7890-abcd-ef1234567890",
  "reflectionText": "At Maghrib my sister snapped at me about the dishes. I almost snapped back but I paused, said 'you're right, I forgot,' and did them. It felt hard not to defend myself. Tomorrow when she gets home from work I'll just do the dishes before she has to ask.",
  "photoPath": null
}
```

**Response (200, judge succeeded):**

```json
{
  "status": "scored",
  "reflectionId": "r-9e8f-4321",
  "markerCount": 5,
  "markers": {
    "specific_moment": {
      "present": true,
      "triggering_phrase": "At Maghrib my sister snapped at me about the dishes"
    },
    "behavioral_change": {
      "present": true,
      "triggering_phrase": "I paused, said 'you're right, I forgot,' and did them"
    },
    "temporal_anchor": {
      "present": true,
      "triggering_phrase": "At Maghrib"
    },
    "honest_friction": {
      "present": true,
      "triggering_phrase": "It felt hard not to defend myself"
    },
    "next_step": {
      "present": true,
      "triggering_phrase": "Tomorrow when she gets home from work I'll just do the dishes before she has to ask"
    }
  },
  "growthPoints": 46,
  "currentStreak": 4,
  "pointsEarned": 6
}
```

**Response (200, judge unavailable):**

```json
{
  "status": "pending",
  "reflectionId": "r-9e8f-4322",
  "pendingMessage": "5 markers pending — we'll score this when we're back online",
  "growthPoints": 42,
  "currentStreak": 4,
  "pointsEarned": 2
}
```

**Errors:**

| Status | Code                  | Condition                                                           |
| ------ | --------------------- | ------------------------------------------------------------------- |
| 400    | `EMPTY_REFLECTION`    | `reflectionText` missing or whitespace-only after trim              |
| 400    | `REFLECTION_TOO_LONG` | `reflectionText` exceeds 4,000 characters                           |
| 400    | `MISSION_ID_REQUIRED` | `missionId` not provided                                            |
| 401    | `UNAUTHORIZED`        | No valid session                                                    |
| 404    | `MISSION_NOT_FOUND`   | `missionId` does not belong to the authenticated user               |
| 409    | `ALREADY_REFLECTED`   | A reflection already exists for this mission with `status='scored'` |
| 500    | `PROCESSING_FAILED`   | Unexpected server error; judge outage is NOT surfaced as 500        |

### `POST /api/reflection/:id/rescore`

**Purpose:** Re-run the judge on a `pending` reflection. Called lazily from the journal page when a pending entry is rendered.

**Request:** (empty body)

**Response (200):**

```json
{
  "status": "scored",
  "markerCount": 3,
  "markers": {
    "specific_moment": {
      "present": true,
      "triggering_phrase": "At the standup"
    },
    "behavioral_change": {
      "present": true,
      "triggering_phrase": "I just waited and finished my sentence"
    },
    "temporal_anchor": {
      "present": true,
      "triggering_phrase": "Today at the standup"
    },
    "honest_friction": {
      "present": false,
      "coaching_prompt": "Next time, try naming what made it hard"
    },
    "next_step": {
      "present": false,
      "coaching_prompt": "Next time, try one small thing for tomorrow"
    }
  }
}
```

**Errors:**

| Status | Code                   | Condition                                               |
| ------ | ---------------------- | ------------------------------------------------------- |
| 401    | `UNAUTHORIZED`         | No valid session                                        |
| 404    | `REFLECTION_NOT_FOUND` | Reflection id does not belong to the authenticated user |
| 409    | `ALREADY_SCORED`       | `status !== 'pending'`; nothing to do                   |
| 503    | `JUDGE_UNAVAILABLE`    | Judge still unavailable; reflection remains `pending`   |

**Important:** `/rescore` never re-applies growth points — the minimum 2 points were already awarded at submission time. It only populates `marker_count` and `markers_json`.

## Data Model & Migrations

### Modified Table: `reflections`

Existing table defined in `supabase/migrations/0001_init.sql:40-50`. Modify in new migration `supabase/migrations/0010_application_rubric.sql`.

| Field        | Type      | Constraints                                      | Description                                                  |
| ------------ | --------- | ------------------------------------------------ | ------------------------------------------------------------ |
| id           | uuid      | PK (unchanged)                                   | Unique identifier                                            |
| mission_id   | uuid      | unique, FK → daily_missions (unchanged)          | One reflection per mission                                   |
| user_id      | uuid      | FK → users (unchanged)                           | Owner                                                        |
| text         | text      | NOT NULL (unchanged)                             | Reflection text as submitted                                 |
| photo_path   | text      | nullable (unchanged)                             | Unused today; kept                                           |
| llm_feedback | text      | nullable (unchanged, repurposed)                 | Now stores the raw model feedback summary (optional)         |
| marker_count | int       | nullable, CHECK `marker_count BETWEEN 0 AND 5`   | Null while pending; integer 0-5 once scored                  |
| markers_json | jsonb     | nullable                                         | Full per-marker object; null while pending                   |
| status       | text      | NOT NULL, CHECK `status IN ('scored','pending')` | Defaults to `'pending'` if judge fails; `'scored'` otherwise |
| created_at   | timestamp | NOT NULL (unchanged)                             | Submission time                                              |

**Dropped columns (in same migration):**

- `llm_verdict` — retired; `status` replaces it but with different semantics.
- `depth_score` — retired.

Both columns are `DROP COLUMN` in the same migration. Any SELECT in the codebase that reads `depth_score` or `llm_verdict` is updated in the same commit. The journal page, which currently reads these (see `app/reflections/page.tsx:15-17`), is updated.

### New Migration: `0010_application_rubric.sql`

```sql
-- Story 1: application-rubric judge v2

alter table reflections drop column if exists llm_verdict;
alter table reflections drop column if exists depth_score;

alter table reflections add column marker_count int;
alter table reflections add column markers_json jsonb;
alter table reflections add column status text not null default 'pending';

alter table reflections
  add constraint reflections_marker_count_range
  check (marker_count is null or (marker_count between 0 and 5));

alter table reflections
  add constraint reflections_status_values
  check (status in ('scored', 'pending'));

-- Fast journal lookups by status
create index if not exists reflections_status_idx on reflections (user_id, status);
```

### Migration Notes

- **Backfill step:** Run `pnpm tsx scripts/backfill-markers.ts` once after applying the migration. The script selects `reflections WHERE marker_count IS NULL`, joins `daily_missions` for verse/mission context, calls the new judge for each, and writes `marker_count`, `markers_json`, `status='scored'`.
- **Downtime:** None. All reflections sit at `status='pending'` momentarily; the journal page gracefully renders "5 markers pending" for any not-yet-backfilled entry.
- **Reversal:** Not supported — dropping `depth_score` is destructive. Discovery brief acknowledges single test-account user base; no rollback need.

## Exemplar Files

- **`lib/mission/judge.ts`** — current submission orchestrator. The new version keeps the same shape (input struct → call provider → persist → return result), but swaps the `verdict`/`depthScore` triplet for `status`/`markerCount`/`markers`.
- **`lib/llm/anthropic.ts:175-220`** — pattern for tool-use + Sonnet call. Reuse the same tool-choice + `max_tokens: 512` pattern; expand the JUDGE_TOOL schema to cover the five marker fields.
- **`lib/llm/stub.ts:37-46`** — deterministic fallback used in CI / no-API-key local runs. Update to return a deterministic 3-of-5 marker payload so tests can assert against it.
- **`tests/garden.test.ts`** — Vitest pattern for unit-testing scoring/growth logic. Mirror this style for marker-count-to-points mapping tests.

## Architecture Notes

- **New dependencies:** none. Continues to use `@anthropic-ai/sdk` (already present, version `^0.91.0`).
- **Model choice:** `claude-sonnet-4-6` for the judge (unchanged from current). Prompt + tool schema rewritten; model unchanged.
- **Tool schema expansion:** `JUDGE_TOOL.input_schema` in `lib/llm/anthropic.ts` grows from the current 4-field flat schema to a nested object with 5 marker entries. Each marker entry is `{ present: boolean, triggering_phrase?: string, coaching_prompt?: string }`. Sonnet's tool-use mode enforces the schema, making schema-level validation sufficient; no post-parse repair needed beyond the substring integrity check.
- **Journal integration:** `app/reflections/page.tsx` needs to select the new columns (`marker_count, markers_json, status`) and drop the `depth_score, llm_verdict` selections. `ReflectionArchive.tsx`'s `DepthStars` component (currently at lines 44-58) is replaced with a `MarkerCountBadge` component rendering "3 of 5" instead of stars.
- **Reflection detail page** (`app/reflections/[id]/page.tsx`): new per-marker breakdown view reads `markers_json` and renders five rows — checkmark + quoted triggering phrase for present markers, greyed icon + coaching prompt for absent.
- **Activity log:** The existing `activity_log` write in `lib/mission/judge.ts:52-57` is preserved but updated to log `marker_count` and `status` instead of `verdict` and `depth_score`. Event name remains `'reflection_submitted'`; payload shape changes.

## Implementation Plan

### Sub-tasks

**Task 1: Judge v2 prompt, tool schema, and provider implementations** — _medium_ (100–300 LOC)

- Files:
  - `lib/llm/types.ts` — replace `JudgeReflectionResult` with `{ status: 'scored'|'pending', markerCount: number, markers: MarkerBundle }`; define `Marker` and `MarkerBundle`.
  - `lib/llm/prompts.ts` — rewrite `JUDGE_REFLECTION_SYSTEM` and `buildJudgeReflectionPrompt` around the five markers. Include explicit anti-hallucination instruction: "Only set `present: true` if a verbatim phrase from the user's reflection supports it."
  - `lib/llm/anthropic.ts` — rewrite `JUDGE_TOOL` schema; rewrite `judgeReflection` to return the new shape; strip the `Math.round(depthScore)` clamping.
  - `lib/llm/ollama.ts` — update to match new contract (degraded quality acceptable per README Step 8b; Ollama output may mis-attribute phrases, but the substring integrity check catches that).
  - `lib/llm/stub.ts` — deterministic 3-of-5 marker result for tests.
- INDEPENDENT

**Task 2: Migration + backfill script** — _small_ (<100 LOC)

- Files:
  - `supabase/migrations/0010_application_rubric.sql` — DROP `llm_verdict`, `depth_score`; ADD `marker_count`, `markers_json`, `status`; add check constraints and index.
  - `scripts/backfill-markers.ts` — standalone script; selects `reflections WHERE marker_count IS NULL`, rescores via the new judge, writes results. Idempotent. Logs progress.
- INDEPENDENT (migration SQL written; backfill script can be authored in parallel with Task 1 against the new `LLMProvider` contract types)

**Task 3: Submission orchestrator + API handler** — _medium_ (100–300 LOC)

- Files:
  - `lib/mission/judge.ts` — rewrite `submitReflection`: remove `verdict`-branch; compute `pointsEarned = Math.max(2, Math.min(5, 2 + Math.max(0, markerCount - 2)))`; handle the `pending` fallback when `judgeReflection` throws; add the triggering-phrase substring integrity check.
  - `app/api/reflection/route.ts` — update success response shape; add `REFLECTION_TOO_LONG` validation; update the existing `ALREADY_REFLECTED` check to look at `status='scored'` instead of `llm_verdict='accepted'`.
  - `app/api/reflection/[id]/rescore/route.ts` — NEW route for lazy re-scoring of `pending` reflections. Session-scoped; returns `ALREADY_SCORED` if status is already `scored`, `JUDGE_UNAVAILABLE` if Sonnet throws again.
- SEQUENTIAL (depends on Task 1 for the new types and provider contract; depends on Task 2 for the `status` column)

**Task 4: ReflectionForm + marker-reveal UI** — _medium_ (100–300 LOC)

- Files:
  - `components/ReflectionForm.tsx` — remove the `nudge`/`accepted` state dichotomy; replace with `idle | submitting | pending | scored`. On `scored`, render a new `<MarkerReveal>` component inline. On `pending`, render the neutral banner.
  - `components/MarkerReveal.tsx` — NEW component. Five marker rows animate in sequentially with Framer Motion (`motion.div` with `initial={{ opacity: 0, y: 6 }}`, staggered `delay: 0.15 * i`). Each row shows icon (checkmark or outline), marker name, and either the quoted triggering phrase or the coaching prompt. Summary line "X of 5 markers present" below. The component plays the animation once via `AnimatePresence`; on re-render (journal view), it renders static.
  - `app/today/TodayClient.tsx` — update `handleAccepted` → rename to `handleScored`; update callback signature to accept the new payload; pass `markerCount` through for the celebration duration.
- SEQUENTIAL (depends on Task 3 for the response shape)

**Task 5: Journal list + detail page updates** — _small_ (<100 LOC)

- Files:
  - `app/reflections/page.tsx` — change the SELECT to include `marker_count, markers_json, status` and drop `depth_score, llm_verdict`.
  - `app/reflections/ReflectionArchive.tsx` — replace `DepthStars` with a `MarkerCountBadge` component showing "3 of 5"; handle the `status='pending'` case by rendering a "pending" badge and triggering a fire-and-forget POST to `/api/reflection/:id/rescore`.
  - `app/reflections/[id]/page.tsx` — render the per-marker breakdown using the same `<MarkerReveal>` component in its static (non-animating) mode.
  - `lib/reflections/filter.ts` — update the `ReflectionLike` type to drop `depth_score, llm_verdict`.
- SEQUENTIAL (depends on Tasks 2 and 3)

**Task 6: Experiment A — paired-reflections prompt-eval harness** — _small_ (<100 LOC)

- Files:
  - `tests/fixtures/reflections.json` — NEW fixture. 15 hand-written reflection samples, each with: `text`, `verseTranslation`, `mission`, `groundTruth.markers` (five booleans), `groundTruth.appliedButInelegant` (boolean flag). Cover the quality spectrum per the discovery brief's Experiment A design.
  - `scripts/eval-judge-v2.ts` — NEW script. Runs all 15 samples through the new judge and the current judge (pre-Task-1 version kept in a git stash or a renamed file `lib/llm/judge-v1.ts` for comparison), computes Spearman ρ against ground truth, prints the applied-but-inelegant delta, prints correct-attribution rate.
- INDEPENDENT (runs against Task 1's output; does NOT require Tasks 2–5 to be complete — this is the gate before Tasks 2–5 are built)

**Task 7: Experiment C — hallway UX test** — _non-code_

- Off-repo: 2–3 practicing Muslim friends; 15-minute session each; record whether the feedback feels encouraging vs. harsh.
- INDEPENDENT (human testing, runs against a running dev build of Task 4 once Task 4 is complete)

**Recommended sequencing:**

1. Tasks 1 and 6 in parallel → run Experiment A → iterate prompt in Task 1 if success criteria fail
2. Task 2 (migration + backfill)
3. Task 3 (API) → Task 4 (UI) → Task 5 (journal)
4. Task 7 (Experiment C) against a local dev build after Task 4; cut Story 2 if it fails

### Negative Constraints

- Do NOT modify `lib/mission/generate.ts` or any of `lib/mission/weekly-theme.ts`.
- Do NOT modify the QF Content or QF User API clients.
- Do NOT change the `daily_missions` schema.
- Do NOT retain the `llm_verdict` or `depth_score` columns "for compatibility" — drop them cleanly in the same migration.
- Do NOT add a feature flag or settings toggle for the rubric.
- Do NOT modify garden stage thresholds in `lib/garden/stages.ts` — the new point cap (5) still falls within the existing stage economy; no rebalance needed.
- Do NOT touch `MissionCelebration.tsx` beyond passing `markerCount` as a prop if needed for confetti intensity; leave the celebration's visual design untouched.

## Test Scenarios

**Test 1: All-five-marker reflection → scored, 5 points, all markers true**

- Setup: authenticated user with `userId='u-test-01'` and mission `m-today-01` (verse 2:153, mission "Practice patience with someone who frustrates you today"). No existing reflection for `m-today-01`. `ANTHROPIC_API_KEY` valid.
- Action: `POST /api/reflection` with body `{missionId: 'm-today-01', reflectionText: 'At Maghrib my sister snapped at me about the dishes. I almost snapped back but I paused, said "you\'re right, I forgot," and did them. It felt hard not to defend myself. Tomorrow when she gets home from work I\'ll just do the dishes before she has to ask.'}`
- Expected: `200` with `status='scored'`, `markerCount=5`, all five markers `present=true`, each `triggering_phrase` a substring of `reflectionText`, `pointsEarned=5` (+ 1 streak bonus if streak > 1), `growthPoints` incremented correctly. `reflections` row has `status='scored'`, `marker_count=5`, `markers_json` populated.

**Test 2: Zero-marker reflection → scored, 2 points (floor), all markers false**

- Setup: authenticated user, mission `m-today-02`, no existing reflection. `ANTHROPIC_API_KEY` valid.
- Action: `POST /api/reflection` with `reflectionText: 'Patience is a virtue we should all practice.'`
- Expected: `200` with `status='scored'`, `markerCount=0`, all five markers `present=false` with coaching prompts, `pointsEarned=2`. Plant still grows. Streak still continues. No rejection, no nudge text.

**Test 3: Judge outage → pending, 2 points awarded, retry succeeds on rescore**

- Setup: authenticated user, mission `m-today-03`. Mock `AnthropicLLM.judgeReflection` to throw `Error("503 Service Unavailable")` on first call, succeed on second call.
- Action: `POST /api/reflection` with a 3-marker reflection text.
- Expected (first call): `200` with `status='pending'`, `pendingMessage="5 markers pending — we'll score this when we're back online"`, `pointsEarned=2`. `reflections` row has `status='pending'`, `marker_count=NULL`.
- Action 2: `POST /api/reflection/:id/rescore` where `:id` is the returned `reflectionId`.
- Expected (second call): `200` with `status='scored'`, `markerCount=3`, markers populated. `reflections` row has `status='scored'`, `marker_count=3`. `growth_points` is **unchanged** — no top-up is applied beyond the original 2 awarded at submission.

**Test 4: Duplicate submission is rejected**

- Setup: authenticated user, mission `m-today-04`, already has a `status='scored'` reflection.
- Action: `POST /api/reflection` with the same `missionId` and new text.
- Expected: `409 ALREADY_REFLECTED "Already completed"`. No DB write. No judge call.

**Test 5: Triggering phrase not in reflection → marker flipped to false**

- Setup: mock the judge to return `specific_moment: {present: true, triggering_phrase: "yesterday morning"}` for a reflection text that does NOT contain the phrase "yesterday morning".
- Action: `POST /api/reflection` with the reflection.
- Expected: response shows `specific_moment: {present: false, coaching_prompt: <generic prompt>}`. `logEvent('judge_phrase_mismatch')` called once. `markerCount` reduced accordingly.

**Test 6: Reflection too long → rejected**

- Setup: authenticated user, mission `m-today-05`.
- Action: `POST /api/reflection` with `reflectionText` of length 4,001.
- Expected: `400 REFLECTION_TOO_LONG "Reflection must be under 4000 characters"`. No DB write.

**Test 7: Unauthorized request**

- Setup: no session cookie.
- Action: `POST /api/reflection` with valid body.
- Expected: `401 UNAUTHORIZED`.

**Test 8: Growth-formula mapping**

- Setup: unit test of the pure function `computePoints(markerCount: number): number` in `lib/mission/judge.ts`.
- Action: call with each of 0, 1, 2, 3, 4, 5.
- Expected: returns 2, 2, 2, 3, 4, 5 respectively.

**Test 9: Historical backfill is idempotent**

- Setup: run `pnpm tsx scripts/backfill-markers.ts` once against a seeded DB with 3 old reflections (`marker_count IS NULL`). All succeed.
- Action: run the same script a second time.
- Expected: second run processes 0 reflections and exits cleanly. No duplicate judge calls. No corrupted `markers_json`.

**Test 10: Rescore idempotency**

- Setup: reflection `r-100` with `status='scored'`, `marker_count=4`.
- Action: `POST /api/reflection/r-100/rescore`.
- Expected: `409 ALREADY_SCORED`. No judge call. `markers_json` unchanged.

**Test 11: Rescore continues to fail**

- Setup: reflection `r-101` with `status='pending'`. Mock `judgeReflection` to throw.
- Action: `POST /api/reflection/r-101/rescore`.
- Expected: `503 JUDGE_UNAVAILABLE`. Reflection remains `status='pending'`. No change to garden.

**Test 12: Stub provider in tests returns deterministic 3-of-5**

- Setup: `LLM_PROVIDER=stub` (or `ANTHROPIC_API_KEY` unset → auto-stub); run the submission orchestrator with any reflection text.
- Action: `submitReflection(...)` called directly.
- Expected: returns `markerCount=3` with a fixed marker payload. `pointsEarned=3`. Enables deterministic test assertions without mocking.

## Acceptance Criteria

- [ ] All unit tests in `tests/` pass (`pnpm test`).
- [ ] The 15-sample prompt-evaluation harness reports Spearman ρ ≥ 0.7 and ≥ +1 marker-count delta on the applied-but-inelegant subset.
- [ ] The new judge's marker attribution matches the tester's ground truth in ≥ 12 of 15 samples.
- [ ] No TypeScript errors (`pnpm build` succeeds).
- [ ] No `depth_score` or `llm_verdict` reads remain in the codebase (`grep -r "depth_score\|llm_verdict" app lib components` returns no matches).
- [ ] Reflection journal renders the new marker count on every entry, including historical, with no console errors.
- [ ] Submission during a simulated judge outage returns `status='pending'` and does not throw.
- [ ] Lazy rescore on journal page load converts `pending` entries to `scored` without double-awarding points.

## Verification

### Backend API Tests (Vitest)

- **`tests/judge-v2.test.ts`** (NEW) — unit test `computePoints` for each marker count 0–5; unit test the triggering-phrase substring check for positive and negative cases.
- **`tests/reflection-api.test.ts`** (NEW) — integration test the submission orchestrator using `StubLLM`: verify the happy-path response shape, the pending response shape, the `ALREADY_REFLECTED` conflict, and the `REFLECTION_TOO_LONG` validation. Mocks `createServerClient` with an in-memory Supabase stub.
- **`scripts/eval-judge-v2.ts`** — not a Vitest test, but must run clean to green before Tasks 2–5 start.

### Browser/UI Testing

- **URL:** `http://localhost:3000/today` (local dev via `pnpm dev`)
- **Credentials:** local test account (signed in via QF OAuth PKCE against prelive; see README Step 5).
- **Test 1 — Full marker animation:** Navigate to `/today` with no reflection yet for today. Write a reflection with all five markers (use the Maghrib sister/dishes example). Submit. Observe: five marker rows animate in one by one over ~750ms; summary "5 of 5 markers present" appears; plant stage indicator advances; no 1-to-5 grade visible anywhere.
- **Test 2 — Zero-marker encouragement:** Write "Patience is a virtue." Submit. Observe: all five markers show greyed state with coaching prompts starting with "Next time"; summary "0 of 5 markers present"; plant still grows by the minimum; no rejection or nudge UI.
- **Test 3 — Journal view with mixed history:** Navigate to `/reflections`. Observe: every entry shows its marker count badge (no stars). Click an entry; observe per-marker breakdown with quoted phrases for present markers.
- **Test 4 — Pending banner:** Set `ANTHROPIC_API_KEY` to an invalid value in `.env.local`; restart dev server. Submit any reflection. Observe: neutral "5 markers pending — we'll score this when we're back online" banner appears; plant still grows. Restore the key; reload `/reflections`; observe the pending entry resolves to a proper marker count within a few seconds.
- **Mobile viewport (375×812):** Repeat Test 1 — verify the marker rows fit within the viewport without horizontal scroll and the animation remains smooth.

### E2E Tests (Playwright)

| Key Scenario                                                | Test file                                | Assigned sub-task |
| ----------------------------------------------------------- | ---------------------------------------- | ----------------- |
| Reflection with all five markers hits the maximum           | `e2e/reflection-judge-v2.spec.ts`        | Task 4            |
| Reflection with three markers grows the plant               | `e2e/reflection-judge-v2.spec.ts`        | Task 4            |
| Reflection with zero markers still grows the plant          | `e2e/reflection-judge-v2.spec.ts`        | Task 4            |
| Missing-marker coaching is phrased as encouragement         | `e2e/reflection-judge-v2.spec.ts`        | Task 4            |
| The marker animation plays once per submission              | `e2e/reflection-judge-v2.spec.ts`        | Task 4            |
| The scoring service is unavailable when I submit            | `e2e/reflection-judge-v2-outage.spec.ts` | Task 4            |
| A reflection pending re-scoring catches up                  | `e2e/reflection-judge-v2-outage.spec.ts` | Task 5            |
| Historical reflections are re-scored against the new rubric | `e2e/reflection-journal-v2.spec.ts`      | Task 5            |
| Journal entry detail shows per-marker breakdown             | `e2e/reflection-journal-v2.spec.ts`      | Task 5            |
| Only one reflection per day is accepted                     | `e2e/reflection-judge-v2.spec.ts`        | Task 4            |

**Locator strategies:** use `data-testid` on the marker rows (`data-testid="marker-row-specific-moment"` etc.), the summary count (`data-testid="marker-summary"`), the pending banner (`data-testid="pending-banner"`), and the submit button. Use `page.route()` to mock `/api/reflection` for outage tests — intercept the POST and respond with a pre-baked `status='pending'` payload instead of monkey-patching Anthropic at the service level.

- **Scenarios not mapped to E2E** (covered by Test Scenarios above): duplicate submission rejection, reflection-too-long validation, unauthorized request, rescore idempotency, growth-formula mapping, stub provider determinism, triggering-phrase integrity, verse-echo-without-application, verbatim-verse-copy, one-sentence fairness, connection-to-verse-not-required, prompt-personalization-Outline. These are pure behavioural/data checks and do not need a browser.
