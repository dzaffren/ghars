# Reflect View Refresh

**Ticket:** TBD

A visual refresh of the three-block evening reflection flow on the Today screen. The refreshed view presents the mission reminder, the did-you-act question, and the reflection textarea as calm, spacious, considered surfaces, and redesigns the tree-growth moment that follows a successful submission. Every existing rule, flow, copy line, and API contract is preserved — this story changes only what the user sees and feels.

## User Story

As a Ghars user reflecting in the evening on the day's mission, I want each of the three blocks — the reminder, the did-you-act question, and the reflection textarea — to feel spacious and unhurried, so I can be honest without the screen feeling like a form.

## Background & Context

**Current state:**

- The reflect view sits beneath the mission card on the Today screen once the user has committed a mission for the day.
- The three blocks — reminder, did-you-act, and the textarea — render as flat white cards on a sand background.
- Native radio buttons are used for the three did-you-act options, and a plain browser textarea is used for the reflection body.
- The "N more characters needed" hint, the 0/2000 character count, and the submit button are rendered with inconsistent spacing and weight.
- The tree-growth moment after submission is a small emoji and a line of text, with no sense of occasion.
- Once a reflection exists for the day, the read-only rendering is functional but visually indistinguishable from the editable version, which has caused confusion.

**Problem:**

- The evening reflection is meant to be the most personal, slow, and intentional moment in the daily loop, but it currently looks and feels like a contact form.
- Users reading at night see a bright flat surface with no sense of atmosphere, which discourages the honest short answer the product is trying to invite.
- The tree-growth moment does not register as a reward, so the payoff for honest reflection is muted.
- The read-only state has been mistaken for an editable one, causing users to wonder why typing does nothing.

## Target User & Persona

- **Who:** Any Ghars user who has committed to the day's mission and is returning in the evening, or later in the day, to reflect on how it went.
- **Context:** Typically on a phone, often in low light, often with limited time and attention. The user is being asked to be honest about something personal.
- **Current workaround:** Users either submit a very short reflection to get past the screen, or skip the step entirely.

## Goals

- Make the three blocks feel spacious, considered, and visually distinct from the form layer of the rest of the app.
- Make the selected did-you-act option unmistakable, and make the other two recede without looking broken.
- Make the character-count feedback quiet but legible, and make the submit button feel like a deliberate act, not a form submission.
- Make the tree-growth moment feel like a small reward, while still resolving in at most 1.5 seconds before the redirect to the grove.
- Make the read-only state obviously non-editable at a glance, so no user wonders whether they can change their answer.
- Ship dark-theme-ready, reduced-motion-respecting, and keyboard-accessible from day one.

## Non-Goals

- No change to the 40-character minimum, the 2000-character maximum, or the three did-apply values ("Yes, fully", "Partly", "Not today").
- No change to the redirect to the grove after submission, or to the 1.5-second delay before that redirect.
- No change to any acceptance-critical copy line, including "Did you act on it?", "What happened?", "Your tree has grown.", "Honesty plants a sapling.", "Reflection submitted ✓", "Your mission:", "Submit reflection", "Saving…", "Saved locally — we'll sync when you're back online.", "Yes, fully", "Partly", "Not today", and the "What did you try? What did it feel like? What did you learn?" placeholder in the textarea.
- No rubric, marker, or scoring user interface — this story does not introduce the five-marker scorecard.
- No change to the server behaviour that enforces one reflection per mission, or to the sync-queued offline behaviour.
- No change to the window-closed state's copy — only its visual treatment.

## User Workflow

1. **Arriving at the reflect view** — After committing to the day's mission, the user scrolls below the mission card on the Today screen and sees three blocks stacked in order: a soft green-tinted reminder panel with the surah/ayah label and the mission the user committed to, a raised "Did you act on it?" card with three option rows, and a raised "What happened?" card with a textarea and a submit button.
2. **Answering the question** — The user taps one of the three option rows. The tapped row shows a clear selected state; the other two show an inactive state. Only one option can be selected at a time.
3. **Writing the reflection** — The user starts typing in the textarea. Below the textarea, a hint counts down ("40 more characters needed", "32 more characters needed", and so on). When the hint reaches zero, it fades out. A live character count sits alongside, showing the current length and the 2000 maximum.
4. **Submitting** — Once an option is selected and the textarea has at least 40 characters, the submit button becomes active. The user taps it. The button shows a "Saving…" label and an inline send icon, and stays in that state until the submission resolves.
5. **Tree-growth moment** — On success, the form blocks are replaced by a centred moment: a sprouting plant glyph with a gentle scale-in and upward drift, a headline underneath ("Your tree has grown." for "Yes, fully" and "Partly"; "Honesty plants a sapling." for "Not today"), and, if the submission was queued for later sync, a quiet helper line reading "Saved locally — we'll sync when you're back online."
6. **Redirect to the grove** — After 1.5 seconds, the user is taken to the Grove screen, where today's tree has appeared.
7. **Returning later the same day** — If the user reopens the Today screen after submitting, the reflect view renders as a single read-only card with a "Reflection submitted ✓" header, the surah/ayah label, the mission text, the did-apply choice shown as a quiet labelled value, and the reflection body with original line-breaks preserved. No textarea. No submit button.
8. **Reflecting past the window** — If the reflection window has closed, the three blocks are still visible with the existing copy, but the textarea and submit button are inactive and cannot be used.

## Acceptance Criteria

### Scenario: Reminder block shows the committed mission

```gherkin
Given I have committed to today's mission
  And the mission comes from Surah Al-Isra, ayah 23
  And the mission I committed to is "Speak gently to my mother today"
When I scroll below the mission card on the Today screen
Then I see a reminder panel at the top of the reflect view
  And the panel shows the label "Al-Isra · 17:23"
  And the panel shows the mission "Speak gently to my mother today"
```

### Scenario: Did-you-act block shows three selectable option rows

```gherkin
Given I am on the reflect view with no reflection submitted yet
When I look at the "Did you act on it?" card
Then I see three option rows labelled "Yes, fully", "Partly", and "Not today"
  And none of the options are selected
  And each option row is comfortable to tap on a phone
```

### Scenario: Selecting a did-you-act option shows a clear selected state

```gherkin
Given I am on the reflect view with no option selected
When I tap the "Yes, fully" option
Then the "Yes, fully" row shows a clear selected state
  And the "Partly" and "Not today" rows show an inactive state
```

### Scenario: Selecting a different option deselects the previous one

```gherkin
Given I have already selected "Yes, fully"
When I tap "Partly"
Then the "Partly" row shows a clear selected state
  And the "Yes, fully" row returns to an inactive state
  And the "Not today" row remains in an inactive state
```

### Scenario: The character-count hint counts down as the user types

```gherkin
Given I am on the reflect view with an empty textarea
When I type the 12-character sentence "It was hard."
Then I see the hint "28 more characters needed"
  And the live character count shows "12/2000"
```

### Scenario: The hint disappears once the minimum is reached

```gherkin
Given I have typed 39 characters and see "1 more characters needed"
When I type one more character, bringing the total to 40
Then the "more characters needed" hint fades away
  And the live character count shows "40/2000"
```

### Scenario: Submit is disabled until all conditions are met

```gherkin
Given I am on the reflect view with no option selected and an empty textarea
When I look at the submit button
Then the submit button is inactive
  And the submit button shows the label "Submit reflection"
```

### Scenario: Submit stays disabled with only a did-you-act option chosen

```gherkin
Given I have selected "Yes, fully"
  And the textarea is empty
When I look at the submit button
Then the submit button is still inactive
```

### Scenario: Submit stays disabled with only a long reflection written

```gherkin
Given no did-you-act option is selected
  And I have typed a 120-character reflection in the textarea
When I look at the submit button
Then the submit button is still inactive
```

### Scenario: Submit becomes active when all conditions are met

```gherkin
Given I have selected "Yes, fully"
  And I have typed a 50-character reflection
When I look at the submit button
Then the submit button is active
  And the submit button shows the label "Submit reflection"
```

### Scenario: Successful submission shows the tree-growth moment and redirects

```gherkin
Given I am Aisha
  And I committed to "Speak gently to my mother today"
  And I have selected "Yes, fully"
  And I have typed an 80-character reflection about how the conversation went
When I tap the submit button
Then the submit button changes to the label "Saving…"
  And on success the three blocks are replaced by a centred moment
  And the moment shows a sprouting plant glyph
  And the moment shows the headline "Your tree has grown."
  And after 1.5 seconds I am taken to the Grove screen
```

### Scenario: "Not today" produces the honesty headline

```gherkin
Given I am Yusuf
  And I committed to "Give sadaqah on my way to work"
  And I have selected "Not today"
  And I have typed a 50-character reflection about why I did not manage it
When I tap the submit button
Then on success the moment shows the headline "Honesty plants a sapling."
  And after 1.5 seconds I am taken to the Grove screen
```

### Scenario: Offline submission shows the saved-locally helper

```gherkin
Given I am on a flaky train connection
  And I have selected "Partly"
  And I have typed a 60-character reflection
When I tap the submit button
  And the submission is queued for later sync
Then the tree-growth moment shows the helper line "Saved locally — we'll sync when you're back online."
  And after 1.5 seconds I am taken to the Grove screen
```

### Scenario: Returning after submission shows the read-only state

```gherkin
Given I am Zainab
  And I submitted my reflection earlier today
  And I reopen the Today screen at 22:30
When I scroll to the reflect view
Then I see a single read-only card
  And the card shows the header "Reflection submitted ✓"
  And the card shows the surah/ayah label and the mission I committed to
  And the card shows the did-apply choice I made
  And the card shows the reflection body I wrote, with line-breaks preserved
  And there is no textarea
  And there is no submit button
```

### Scenario: Reflection window has closed

```gherkin
Given the reflection window for today has closed
  And I have not yet submitted a reflection
When I scroll to the reflect view
Then the three blocks are visible with the existing window-closed copy
  And the textarea is inactive
  And the submit button is inactive
```

### Scenario: Reduced-motion user sees a still moment

```gherkin
Given my device has "reduce motion" turned on
  And I have selected "Yes, fully"
  And I have typed a 60-character reflection
When I tap the submit button
  And the submission succeeds
Then the tree-growth moment shows without any scale-in or upward drift
  And the headline and plant glyph still appear
  And after 1.5 seconds I am still taken to the Grove screen
```

### Scenario: Dark-mode user sees a dark-tinted reminder panel

```gherkin
Given my app is in dark mode
When I scroll to the reflect view
Then the reminder panel shows as a green-tinted dark surface
  And no block in the reflect view appears as a bright white rectangle
  And the body text remains comfortable to read
```

### Scenario: Keyboard user can navigate the reflect view

```gherkin
Given I am using a keyboard to navigate
When I press Tab repeatedly starting from the mission card
Then focus moves to the first did-you-act option
  And then to the second and third did-you-act options in order
  And then into the textarea
  And then to the submit button
  And every focused element shows a visible focus ring
```

### Scenario: Character maximum is enforced at 2000

```gherkin
Given I have typed 2000 characters in the textarea
When I try to type one more character
Then no additional character is added
  And the live character count continues to show "2000/2000"
```

### Scenario Outline: Did-apply value maps to the correct headline

```gherkin
Given I have selected the "<option>" did-apply value
  And I have typed a 60-character reflection
When I tap the submit button
  And the submission succeeds
Then the tree-growth moment shows the headline "<headline>"
  And after 1.5 seconds I am taken to the Grove screen

Examples:
  | option     | headline                    |
  | Yes, fully | Your tree has grown.        |
  | Partly     | Your tree has grown.        |
  | Not today  | Honesty plants a sapling.   |
```

## Business Rules & Constraints

- The reflection textarea requires a minimum of 40 characters before the submit button becomes active. While below the minimum, a live hint shows the exact number of characters still needed.
- The reflection textarea accepts a maximum of 2000 characters. Typing past the maximum has no effect.
- The submit button is only active when a did-apply option has been selected, the textarea has at least 40 characters, and the reflection window is open.
- After a successful submission, the tree-growth moment plays for at most 1.5 seconds before the user is redirected to the Grove screen.
- When the user has "reduce motion" enabled at the device level, the tree-growth moment still appears with its headline and plant glyph, but without the scale-in or upward drift animation. The redirect still happens after the same 1.5-second delay.
- On a phone, the reflection textarea must never grow taller than 70% of the viewport height, so that the submit button and character-count feedback remain visible.
- Only one reflection per mission is allowed. If a reflection already exists for today, the reflect view renders the read-only card instead of the three editable blocks.
- When the reflect view is in the read-only state, line-breaks in the saved reflection body are preserved in the display.
- When a submission is queued for later sync (offline), the tree-growth moment surfaces a quiet helper line so the user is not left wondering whether their reflection was lost.

## Success Metrics

- Reflection-submission completion rate (users who begin typing in the textarea and then successfully submit) rises by at least 5 percentage points compared to the pre-refresh baseline.
- Median reflection length stays level or rises — a signal that users felt settled enough to write more rather than rushing a short answer.
- Zero reports in the first four weeks post-launch of users asking "why can't I edit my reflection?" — indicating the read-only state is no longer mistaken for an editable one.
- In an in-app post-submission prompt, at least 70% of users who see the refreshed tree-growth moment rate the experience as "calm" or "rewarding" rather than "quick" or "flat."

## Dependencies

- Story 1 (Design system foundation) — provides the raised card surface, the token-based text and background colours, the primary button primitive, the textarea primitive, the tabular numeral treatment for character counts, the focus-ring token, and the plant/sprout glyph.
- The app's shared motion library for the scale-in and upward-drift animation on the tree-growth moment.
- The app's shared reduced-motion hook, so the moment can adapt when the user has motion disabled.
- The server contract that currently enforces one reflection per mission and queues submissions for sync when offline — unchanged by this story, but depended on.

## Open Questions

- [x] ~~Should the read-only state display the reflection body as plain text or as a quoted block?~~ — **Resolved:** Display as plain text with line-breaks preserved inside the same read-only card, not as a quoted block, so the tone stays personal rather than formal.
- [x] ~~Should the tree-growth moment be skippable by tapping?~~ — **Resolved:** No. The 1.5-second delay is short enough that a skip control would add more visual noise than it removes.

---

## Technical Enrichment

### Functional Requirements

- No API contract changes — `POST /api/reflections` body `{ mission_id, did_apply, text }` preserved. 409 handling preserved (see `convention-reflection-single-submit` learning).
- Three blocks: reminder panel, did-you-act card, reflection textarea card.
- Did-you-act radios become an accessible radiogroup — same three values `"yes_fully" | "partly" | "not_today"` preserved.
- Textarea becomes shadcn `Textarea` primitive. Live `N/2000` with tabular-nums. "N more characters needed" hint fades with framer-motion when length hits 40.
- Submit button: shadcn `Button size="lg"` full width. Icon: lucide `Send`. Loading text "Saving…" preserved.
- Tree-growth moment: `<TreeGrowthMoment />` component — sprout SVG or lucide `Sprout` with scale/drift motion for 1500ms, then `router.push("/grove")`. Under reduced-motion, no scale/drift; headline + glyph render statically for the same 1500ms.
- Read-only: existing `reflection-submitted` card — repainted with tokens.
- Window-closed: textarea + submit disabled, existing helper copy preserved.

### API Design

- None new.

### UI/Frontend Requirements

**New/modified:**

- `app/(app)/today/reflect/ReflectView.tsx` — refactor; split into `ReminderPanel`, `DidApplyCard`, `ReflectionCard`, `TreeGrowthMoment`, `ReadOnlyReflection` subcomponents in same file or split under `app/(app)/today/reflect/_components/`.
- Reminder panel: `bg-secondary/50 text-secondary-foreground` with `var(--font-arabic)` applied to the ayah label if it contains Arabic.
- Did-apply: `role="radiogroup"`, `role="radio"` on each option, keyboard nav.
- Textarea card: shadcn Textarea, tabular-nums char count.
- TreeGrowthMoment: framer-motion animation for 1500ms.

**Preserved testids:** `did-apply-yes_fully`, `did-apply-partly`, `did-apply-not_today`, `reflection-textarea`, `submit-reflection-btn`, `tree-growth-animation`, `reflection-submitted`.

**New testids:** `reflect-reminder`, `did-apply-card`, `reflect-textarea-card`, `reflect-char-count`, `reflect-min-hint`, `read-only-reflection`.

### States

- **Idle (pre-selection):** no radio selected, textarea empty, hint shows "40 more characters needed", Submit disabled.
- **Typing (< 40):** hint counts down, char count visible, Submit disabled.
- **Typing (≥ 40 with option selected):** hint fades out, Submit enabled.
- **Submitting:** button shows "Saving…", disabled.
- **Success:** `tree-growth-animation` moment for 1500ms, then redirect to `/grove`.
- **Success (offline sync queued):** same moment + "Saved locally — we'll sync when you're back online." helper.
- **Read-only:** `reflection-submitted` card with mission, did-apply label, text.
- **Window-closed:** textarea + submit disabled.

### Architecture Notes

- **New dependencies:** none.
- **Dependencies & integration:** depends on Story 1 (Card, Textarea, Button primitives, motion). Consumes existing `POST /api/reflections`. Shares redirect target with Story 7 (`/grove`).

### Exemplar Files

- `origin/main:components/ReflectionForm.tsx` — reference only. This story does NOT introduce the five-marker rubric (retired feature, excluded by epic).
- `origin/main:components/GardenPlant.tsx` — reference for the sprout SVG shape (not copied; simpler icon suffices).

### Implementation Plan

**Task 1: Reminder panel refresh** — small. Files: `app/(app)/today/reflect/ReflectView.tsx`. SEQUENTIAL after Story 1 Task 3.

**Task 2: Did-apply radiogroup** — small. Same file. SEQUENTIAL after Task 1.

**Task 3: Textarea card with live char count** — small. Same file. SEQUENTIAL after Task 2.

**Task 4: TreeGrowthMoment component** — small. Files: `app/(app)/today/reflect/_components/TreeGrowthMoment.tsx` (new). INDEPENDENT.

**Task 5: Wire moment into submit success** — small. File: `app/(app)/today/reflect/ReflectView.tsx`. SEQUENTIAL after Tasks 3 and 4.

**Task 6: Read-only state refresh** — small. Same file. INDEPENDENT (can run parallel with 1–3).

**Task 7: E2E** — small. Files: `e2e/visual-reflect.spec.ts`. SEQUENTIAL after Task 5.

### Negative Constraints

- Do NOT change `/api/reflections` route or the 409 conflict handling.
- Do NOT change copy: "Did you act on it?", "What happened?", "Your tree has grown.", "Honesty plants a sapling.", "Reflection submitted ✓", "Your mission:", "Submit reflection", "Saving…", "Saved locally — we'll sync when you're back online.", "Yes, fully", "Partly", "Not today", "What did you try? What did it feel like? What did you learn?".
- Do NOT change the 40-char min, 2000-char max, or 1500ms redirect delay.
- Do NOT change the existing testids.
- Do NOT introduce the five-marker scorecard or MarkerReveal component.

### Test Scenarios

**Test 1: Submit disabled until both conditions met**

- Setup: `/today` after a mission commit.
- Action: select "Yes, fully" but leave text at 39 chars.
- Expected: Submit disabled; hint shows "1 more characters needed".

**Test 2: Submit enables at 40 chars with option selected**

- Setup: same.
- Action: type to 40 chars.
- Expected: Hint fades out; Submit enabled.

**Test 3: Successful submit triggers moment + redirect**

- Setup: mission committed. Mock `POST /api/reflections` returning `{ sync_status: "synced" }`.
- Action: click Submit.
- Expected: `[data-testid="tree-growth-animation"]` appears, headline "Your tree has grown." visible; after 1500ms `page.url()` is `/grove`.

**Test 4: Not-today headline**

- Setup: same, select "Not today".
- Action: submit.
- Expected: moment headline reads "Honesty plants a sapling.".

**Test 5: Offline queued sync**

- Setup: mock response `{ sync_status: "retry_queued" }`.
- Action: submit.
- Expected: moment shows helper "Saved locally — we'll sync when you're back online.".

**Test 6: Read-only render**

- Setup: mission has an `existingReflectionId`.
- Action: render.
- Expected: `[data-testid="reflection-submitted"]` visible; no textarea, no submit button.

**Test 7: Window closed**

- Setup: `windowClosesAt` in the past.
- Action: render.
- Expected: radios disabled, textarea disabled, submit disabled.

**Test 8: Reduced-motion moment**

- Setup: `page.emulateMedia({ reducedMotion: "reduce" })`.
- Action: successful submit.
- Expected: moment shows (DOM present) but no scale/drift transforms; redirect still after 1500ms.

### Acceptance Criteria

- [ ] Three blocks render with refreshed card/panel styling
- [ ] Did-apply is a `role="radiogroup"` with keyboard nav
- [ ] Textarea uses shadcn primitive; char count uses tabular-nums
- [ ] Min-chars hint fades with framer-motion when 40 is reached
- [ ] Submit triggers moment + 1500ms redirect to `/grove`
- [ ] Not-today variant shows "Honesty plants a sapling."
- [ ] Offline helper visible when `sync_status === "retry_queued"`
- [ ] Read-only state for already-submitted reflections
- [ ] All existing testids preserved
- [ ] `e2e/today-flow.spec.ts` passes unchanged
- [ ] `npm run test:e2e` passes with `visual-reflect.spec.ts` added
- [ ] Both themes render correctly

### Verification

**Backend Tests:** None new.

**Browser/UI Testing:**

- Login via demo, commit a mission, scroll to reflect view.
- Select "Yes, fully", type 40 chars — observe hint fade + submit enable.
- Click Submit; observe tree moment; verify redirect to `/grove` after 1.5s.
- Reload same-day — read-only state.
- Mobile Safari viewport 360px: all three blocks fit.
- Dark theme: reminder panel tints in dark green, textarea readable.

**E2E Tests:**

| Key Scenario                                              | Test file                           | Assigned sub-task |
| --------------------------------------------------------- | ----------------------------------- | ----------------- |
| Successful evening reflection submission with tree growth | `e2e/today-flow.spec.ts` (existing) | Task 7            |
| Not-today submission shows "Honesty plants a sapling."    | `e2e/visual-reflect.spec.ts`        | Task 7            |
| Offline sync helper shown when retry_queued               | `e2e/visual-reflect.spec.ts`        | Task 7            |
| Read-only reflection after reload                         | `e2e/visual-reflect.spec.ts`        | Task 7            |
| Reduced-motion skips scale/drift on the moment            | `e2e/visual-reflect.spec.ts`        | Task 7            |

**Locator strategies:** existing `did-apply-yes_fully|partly|not_today`, `reflection-textarea`, `submit-reflection-btn`, `tree-growth-animation`, `reflection-submitted`; new `reflect-reminder`, `reflect-char-count`, `reflect-min-hint`, `read-only-reflection`.

### Open Questions

All resolved.
