# Mission Card & Commit Celebration

**Ticket:** TBD

A visual refresh of the mission card on the Today screen and a small celebration moment when the user commits to their intention for the day. The card gains a polished, token-driven treatment for its two existing states — pre-commit and committed — and a brief amber particle burst acknowledges the moment the user taps Commit. No functionality, copy, or flow behaviour changes.

## User Story

As a Ghars user picking my mission for the day, I want the moment of committing to feel small but real — a quiet recognition that I've set an intention — so the ritual has shape, not just a button press.

## Background & Context

**Current state:**

- The mission card on the Today screen is a flat white panel with plain radio inputs for the two suggested prompts and a third "Write your own…" option that reveals a basic browser textarea.
- The primary action is a standard button; when the user taps it, the card updates to the committed state with no visible acknowledgement of the transition.
- The character counter on the custom textarea is a single muted line that does not respond as the user approaches the limit.
- A commit error surfaces as a browser-style alert above the card, detached from the action the user just took.

**Problem:**

- Committing a mission is one of the three load-bearing moments of the daily ritual (read, commit, reflect), but visually it receives the same weight as any other form submission in the product.
- Early-cohort users describe the card as "generic" and the commit moment as "anticlimactic," which blunts the sense that an intention has actually been set.
- The inline alert for a server error disrupts the card layout and hides which row the user had selected.
- Night-time users see the same bright white card at 21:15 as they did at 07:40, which makes picking a mission before bed uncomfortable.

## Target User & Persona

- **Who:** Any signed-in Ghars user on the Today screen who has read the day's ayah and is about to set an intention for the day.
- **Context:** Typically on a phone, once per day, often in the first few minutes after opening the app in the morning, occasionally in the afternoon if the morning was missed.
- **Current workaround:** Users currently tap through the plain card without a sense of occasion. Some report taking a second to breathe before tapping because the interface itself does not mark the moment.

## Goals

- Make the pre-commit card feel considered and deliberate: clearly selectable option rows, a live and responsive character count, and a primary button that reads as the ritual's main action.
- Make the commit moment itself feel real with a short amber particle burst that celebrates the intention without delaying the user.
- Make the committed state feel like a quiet "seal" on the day's mission, with the mission text given more presence than the surrounding chrome.
- Surface commit errors inside the card where the user's attention already is, without losing their selection or their typed text.
- Ship the refreshed card in both light and dark theme from day one, and honour reduced-motion preferences without losing any functional feedback.

## Non-Goals

- No change to which prompts are suggested for the day, or to how they are generated.
- No change to the 280-character limit on the custom mission.
- No change to the copy of "Choose your mission", "Today's mission", "Write your own…", "Commit to this mission", "Committing…", or "Committed ✓".
- No celebration moment that exceeds one second in total duration.
- No change to the mission-commit flow itself: one commit per day, committed state persists on reload, existing server behaviour unchanged.

## User Workflow

1. **Opens Today after reading the ayah** — The user scrolls past the ayah card and sees the mission card in its pre-commit state with the label "Choose your mission" and three option rows: two suggested prompts and a "Write your own…" row. The primary "Commit to this mission" button sits at the bottom in a disabled treatment.
2. **Picks a suggested prompt** — The user taps one of the two suggested prompt rows. That row shows a filled selected indicator; the other rows return to their unselected treatment; the primary button becomes enabled.
3. **Or writes their own** — Instead, the user taps "Write your own…". The row selects, and a textarea appears underneath with the placeholder "What will you do today because of this ayah?" and a "0/280" character count alongside it. The primary button stays disabled until the user types at least one non-whitespace character. As the user types, the count updates and its colour shifts from a muted neutral toward the primary green as the text approaches 280 characters.
4. **Commits** — The user taps "Commit to this mission". The button label changes to "Committing…" and enters a loading treatment. A brief amber particle burst plays centred on the button — a small central flash with a ring of particles radiating outward — lasting no longer than one second.
5. **Sees the committed state** — The card fades and swaps to its committed treatment: the label becomes "Today's mission", the mission text is shown in a featured, slightly larger weight, and a muted "Committed ✓" line sits underneath. The option rows and textarea are gone.
6. **Returns later the same day** — If the user closes the app and comes back later the same day, the mission card opens directly in the committed state with the same mission text and the "Committed ✓" confirmation.
7. **Recovers from an error** — If the server rejects the commit, the button returns to its idle "Commit to this mission" state, an inline error row appears inside the card with an alert glyph and the server's message, and the user's selection and typed text are preserved. The user can adjust and tap Commit again.

## Acceptance Criteria

### Scenario: Pre-commit card on first open

```gherkin
Given Aisha has just read today's ayah and has not yet committed a mission
When she scrolls down to the mission card
Then she sees the label "Choose your mission"
  And she sees two suggested prompt rows
  And she sees a third row labelled "Write your own…"
  And the "Commit to this mission" button is visible but not yet enabled
```

### Scenario: Selecting the first suggested prompt enables the commit button

```gherkin
Given Aisha is on the Today screen in the pre-commit state
  And the first suggested prompt reads "Speak gently to my mother today"
When she taps the first suggested prompt row
Then the first row shows a selected indicator
  And the other two rows show an unselected indicator
  And the "Commit to this mission" button becomes enabled
```

### Scenario: Selecting the second suggested prompt enables the commit button

```gherkin
Given Aisha is on the Today screen in the pre-commit state
  And the second suggested prompt reads "Make one small act of sadaqah before sunset"
When she taps the second suggested prompt row
Then the second row shows a selected indicator
  And the first and third rows show an unselected indicator
  And the "Commit to this mission" button becomes enabled
```

### Scenario: Selecting "Write your own…" reveals the textarea and keeps the button disabled

```gherkin
Given Yusuf is on the Today screen in the pre-commit state
When he taps the "Write your own…" row
Then that row shows a selected indicator
  And a textarea appears underneath with the placeholder "What will you do today because of this ayah?"
  And a character count showing "0/280" appears alongside the textarea
  And the "Commit to this mission" button remains disabled
```

### Scenario: Typing in the custom textarea enables the commit button

```gherkin
Given Yusuf has selected "Write your own…" and the textarea is visible and empty
When he types "Give sadaqah on my way to work"
Then the character count updates to reflect the length of his text
  And the "Commit to this mission" button becomes enabled
```

### Scenario: Whitespace-only custom text does not enable the commit button

```gherkin
Given Yusuf has selected "Write your own…" and the textarea is empty
When he types only spaces into the textarea
Then the "Commit to this mission" button remains disabled
```

### Scenario: Character count colour changes before the 280-character limit

```gherkin
Given Yusuf has selected "Write your own…" and is writing a longer mission
When the text he has typed is approaching but has not yet reached 280 characters
Then the character count is shown in a primary-accent colour instead of the muted neutral
  And Yusuf has a visible warning that he is close to the limit
```

### Scenario: Switching from a suggested prompt to "Write your own…" hides no data

```gherkin
Given Aisha has selected the first suggested prompt
When she taps "Write your own…" instead
Then the first suggested prompt is no longer selected
  And the "Write your own…" row is selected
  And the textarea appears underneath with its placeholder
  And the "Commit to this mission" button is disabled again until she types
```

### Scenario: Committing with a suggested prompt triggers the celebration and committed state

```gherkin
Given Zainab has selected the suggested prompt "Call my father to check on him"
  And her system is not in reduced-motion mode
When she taps "Commit to this mission"
Then the button briefly shows "Committing…"
  And a short amber particle burst plays centred on the button
  And the card transitions to the committed state within one second
  And the committed state shows the label "Today's mission"
  And the committed state shows the mission text "Call my father to check on him"
  And the committed state shows the confirmation "Committed ✓"
```

### Scenario: Committing a custom mission triggers the celebration and committed state

```gherkin
Given Yusuf has selected "Write your own…" and typed "Give sadaqah on my way to work"
  And his system is not in reduced-motion mode
When he taps "Commit to this mission"
Then the button briefly shows "Committing…"
  And a short amber particle burst plays centred on the button
  And the card transitions to the committed state within one second
  And the committed state shows the label "Today's mission"
  And the committed state shows the mission text "Give sadaqah on my way to work"
  And the committed state shows the confirmation "Committed ✓"
```

### Scenario: Reduced-motion user skips the celebration but still sees the state change

```gherkin
Given Hana has enabled reduced-motion at the system level
  And she has selected a suggested mission
When she taps "Commit to this mission"
Then no particle burst plays
  And no central flash plays
  And the card transitions directly to the committed state with the same mission text and the "Committed ✓" confirmation
```

### Scenario: Committed state on same-day reload

```gherkin
Given Aisha committed the mission "Speak gently to my mother today" earlier this morning
When she reopens the Today screen the same afternoon
Then the mission card is shown directly in its committed state
  And the label reads "Today's mission"
  And the mission text reads "Speak gently to my mother today"
  And the confirmation reads "Committed ✓"
  And no option rows, textarea, or commit button are shown
```

### Scenario: Server rejects the commit and the user retries

```gherkin
Given Zainab has selected a suggested mission and tapped "Commit to this mission"
  And the server rejects the commit with a message
When the rejection reaches the card
Then the button returns to its idle "Commit to this mission" label
  And an inline error row appears inside the card with an alert glyph and the server's message
  And Zainab's selected row is still selected
  And any text she had typed in the custom textarea is preserved
When Zainab taps "Commit to this mission" again and the commit succeeds
Then the inline error row disappears
  And the card transitions to the committed state
```

### Scenario: Dark mode rendering of the mission card

```gherkin
Given Aisha is reading Ghars in the evening in dark mode
When she opens the Today screen in the pre-commit state
Then the mission card renders with dark-theme surface and text treatments
  And the option row indicators, textarea, and primary button remain clearly legible
  And no part of the card appears as a bright white rectangle
```

### Scenario: Dark mode celebration keeps the amber particles

```gherkin
Given Aisha is in dark mode with reduced-motion disabled
  And she has selected a mission
When she taps "Commit to this mission"
Then the amber particle burst plays with amber-family particles on the dark surface
  And the committed state renders using dark-theme tokens
  And the "Committed ✓" confirmation is legible against the dark surface
```

### Scenario: Keyboard user can tab through every interactive element with a visible focus ring

```gherkin
Given Idris is navigating the Today screen with a keyboard
When he presses Tab repeatedly from the top of the mission card
Then focus moves in order through the first suggested prompt row, the second suggested prompt row, and the "Write your own…" row
  And when "Write your own…" is selected, Tab then moves through the textarea
  And Tab then moves to the "Commit to this mission" button
  And each focused element shows a visible focus ring
```

### Scenario Outline: Each option row is selectable by tap and by keyboard

```gherkin
Given Idris is on the Today screen in the pre-commit state
  And the focused row is the <row>
When he activates the row using <input>
Then the <row> becomes the selected row
  And the other two rows become unselected

Examples:
  | row                       | input                 |
  | first suggested prompt    | a tap                 |
  | first suggested prompt    | pressing Enter        |
  | first suggested prompt    | pressing Space        |
  | second suggested prompt   | a tap                 |
  | second suggested prompt   | pressing Enter        |
  | second suggested prompt   | pressing Space        |
  | "Write your own…" row     | a tap                 |
  | "Write your own…" row     | pressing Enter        |
  | "Write your own…" row     | pressing Space        |
```

### Scenario: Touch target size for each row and the primary button

```gherkin
Given Aisha is using Ghars on her phone with larger-than-average thumbs
When she taps anywhere on any of the three option rows or the primary button
Then the tap registers on the intended element every time
  And she never has to retry the tap because she hit between targets
```

## Business Rules & Constraints

- The celebration moment — central flash, particle burst, and card swap together — must not exceed 1000 milliseconds end-to-end. If the network commit takes longer, the button continues to show "Committing…" until the server responds; the celebration itself still fits inside one second once it starts.
- Under reduced-motion, the celebration is skipped entirely: no particles, no central flash, no glow ring. The card transitions to the committed state using only the minimum functional feedback needed for the user to understand that their mission was recorded.
- The primary "Commit to this mission" button is enabled only when either (a) one of the two suggested prompts is selected, or (b) "Write your own…" is selected AND the textarea contains at least one non-whitespace character.
- The custom mission character limit remains 280 characters. The character count must change colour before, not at, the 280-character boundary, so the user has warning that they are approaching the limit.
- The celebration uses no more than twelve particles in total, drawn from the app's primary green and amber accent families only. No other colours are introduced for the burst.
- An error returned by the server is displayed inline inside the card with an alert glyph. The server's message text is used as-is; the product does not rewrite it. The user's row selection and any text they typed are preserved through the error so they can retry without starting over.
- The committed state shows the mission text in a larger, more readable weight than the pre-commit options, with "Today's mission" above and "Committed ✓" below it in a muted treatment.
- The card surface, text, option indicators, and primary button must consume the design system tokens from Story 1 in both light and dark mode. No ad-hoc hex colours are introduced by this story.

## Success Metrics

- Same-day commit-to-reflection conversion rate — the share of users who commit a mission and later that day submit a reflection — holds steady or improves after the refresh lands, measured over the four weeks after release versus the four weeks before.
- Daily commit rate from the Today screen does not regress in the two weeks following the refresh.
- In a short in-app prompt shown after commit, users score "Did committing feel meaningful?" at 4.0 / 5 or higher on average across the first two weeks of release.
- Zero commit-flow regressions: the existing end-to-end test that drives a user from Today through commit to reflection continues to pass after this story ships.

## Dependencies

- Story 1 (Design system foundation) — this story consumes the primary button primitive, the surface and text tokens, the focus-ring treatment, the textarea primitive, the lucide alert glyph, and the motion primitives from the foundation story.
- A motion library capable of a short particle burst and a cross-fade between card states is available from the foundation story.
- Dark-theme tokens from the foundation story must be available so the card renders correctly in dark mode at release.

## Open Questions

- [x] ~~Should the celebration play for every commit, or only on the user's first commit of the week?~~ — **Resolved:** Every commit. The moment is the point of the ritual; gating it dilutes the effect.
- [x] ~~Can the celebration delay the transition to the committed state?~~ — **Resolved:** No. The full celebration must fit inside one second end-to-end, and must be skipped entirely under reduced-motion.
- [x] ~~Should the inline error row replace or sit alongside any existing alert?~~ — **Resolved:** Replace. The previous detached alert is removed; the inline row inside the card is the single error surface for this flow.

---

## Technical Detail

### Functional Requirements

- No API contract changes. `POST /api/today/commit` continues to accept `{ assignment_id, selected_prompt, is_custom }` and returns the updated mission payload. No new query params, no new headers.
- Option rows become `<button>` elements inside a `role="radiogroup"` container, each with `role="radio"`, `aria-checked`, and a `data-state="selected"` attribute when active. The selected row draws the primary ring (`ring-2 ring-primary ring-offset-2`).
- Keyboard navigation inside the radiogroup uses arrow keys (Up/Down, Left/Right all move selection); Enter/Space activates. Focus is trapped within the group via `tabindex="0"` on the selected radio and `tabindex="-1"` on the others (roving tabindex pattern).
- Custom textarea uses the shadcn `Textarea` primitive. Character count text toggles from `text-muted-foreground` to `text-primary` once `value.length >= 220` (i.e. 80% of 280). Format: `{n}/280`.
- Primary Commit button uses the shadcn `Button` primitive with `size="lg"` and `className="w-full"`. Disabled criteria preserved exactly: disabled when neither a suggested prompt is selected nor the custom textarea contains a non-whitespace character; also disabled while `submitting === true`.
- On successful commit, mount `<MissionCelebration />` absolutely positioned over the Commit button wrapper via `position: relative` on the wrapper and `absolute inset-0 pointer-events-none` on the celebration. Unmount after `1000ms` via a `setTimeout` cleared on card unmount. Respects `useReducedMotion()` — returns `null` inside the component when `shouldReduceMotion === true`.
- The transition from pre-commit to committed state uses framer-motion `AnimatePresence` with `mode="wait"`, cross-fading between the two card bodies keyed on `committed ? "committed" : "pending"`.

### API Design

- None new. Existing `POST /api/today/commit` contract untouched.

### UI/Frontend Requirements

**New / modified components:**

- `components/MissionCelebration.tsx` — client component (`"use client"`). Renders 12 radial particles (6 amber, 6 green, alternating) at 3 distance rings (40px, 64px, 88px), a central flash (scale 0 → 1.4, opacity 1 → 0 over 0.5s), and an expanding glow ring (scale 0.6 → 2.2, opacity 0.6 → 0 over 0.85s). Per-particle durations 0.5–1.0s with staggered delays. Returns `null` under `useReducedMotion()`.
- `app/(app)/today/_components/MissionCard.tsx` — full refresh. Consumes `Card`, `CardHeader`, `CardContent`, `Button`, `Textarea`, `Badge` primitives from Story 1. Option rows become styled buttons inside a `<div role="radiogroup" aria-label="Choose your mission">`. Committed state uses `<Badge variant="secondary">Committed ✓</Badge>`.
- `app/(app)/today/page.tsx` — after `handleCommit()` resolves with a 2xx response, call `setShowCelebration(true)`, then `setTimeout(() => setShowCelebration(false), 1000)`. Mount `<MissionCelebration />` conditionally as an absolute child of the Commit button wrapper only while `showCelebration === true` AND `!shouldReduceMotion`.

**Preserved testids:** `mission-option-1`, `mission-option-2`, `mission-custom-input`, `commit-button`.

**New testids:** `mission-card`, `mission-committed-card`, `mission-celebration` (present between mount and unmount, ~1000ms), `mission-option-custom`, `mission-error-row`.

### States

- **Pre-commit (default)**: three option rows visible, Commit button disabled (greyed, `aria-disabled="true"`).
- **Pre-commit (suggested option selected)**: selected row shows `data-state="selected"` + primary ring; Commit enabled.
- **Pre-commit (custom selected, empty textarea)**: custom row selected, textarea visible, counter reads `0/280` in muted; Commit disabled.
- **Pre-commit (custom selected, text entered)**: counter reflects length; Commit enabled; once `length >= 220`, counter colour shifts to `text-primary`.
- **Submitting**: Commit label changes to "Committing…" with a `<Loader2 className="animate-spin" />` lucide icon; button `disabled`.
- **Celebrating**: `MissionCelebration` mounted over the button area for exactly 1000ms; Commit button visually unchanged during this window.
- **Committed**: card cross-fades (framer-motion `AnimatePresence mode="wait"`) to the committed state — shows "Today's mission" label, larger mission text, and `Badge` reading "Committed ✓". No option rows, textarea, or button.
- **Error**: inline row under the radiogroup with `<AlertTriangle className="h-4 w-4 text-destructive" />` + the server's `error.message`. Commit button returns to its idle "Commit to this mission" label and is re-enabled. Selection and typed text preserved.

### Architecture Notes

- **New dependencies**: none. Uses existing framer-motion (via `lib/motion`), lucide-react, shadcn primitives from Story 1.
- **Dependencies & integration**: depends on Story 1 (Card, Button, Textarea, Badge primitives; `lib/motion` reduced-motion helper). Invokes existing `/api/today/commit` with the identical body. Reads the same `/api/today` response shape (no server-side change).
- The celebration overlay sits in its own `AnimatePresence` distinct from the card's cross-fade to avoid unmounting the button mid-celebration.

### Exemplar Files

- `origin/main:components/MissionCelebration.tsx` — the direct exemplar for the particle pattern: 12 particles at 3 distance rings, 0.85s glow ring, 0.5s central flash, reduced-motion short-circuit returning `null`.
- Current `app/(app)/today/_components/MissionCard.tsx` and `app/(app)/today/page.tsx` define the behavioural baseline (selection state, disable criteria, testids) to preserve.

### Implementation Plan

**Task 1: MissionCelebration particle component** — small. Files: `components/MissionCelebration.tsx`. Port the origin/main pattern; export a client component returning 12 particles + central flash + glow ring with `data-testid="mission-celebration"`. INDEPENDENT.

**Task 2: Refresh MissionCard pre-commit UI** — medium. Files: `app/(app)/today/_components/MissionCard.tsx`. Replace the existing panel and inputs with `Card`, radiogroup of three `<button role="radio">` options, `Textarea`, and `Button size="lg" w-full`. Preserve all existing testids and disable criteria. SEQUENTIAL after Story 1 Task 3.

**Task 3: Committed state + Badge** — small. Files: `app/(app)/today/_components/MissionCard.tsx`. Branch on `committed` and render the committed variant inside `AnimatePresence mode="wait"` with a `Badge` reading "Committed ✓". Testid `mission-committed-card`. SEQUENTIAL after Task 2.

**Task 4: Wire celebration trigger in Today page** — small. Files: `app/(app)/today/page.tsx`. Add `showCelebration` state, set true on 2xx from `/api/today/commit`, clear after 1000ms. Mount `<MissionCelebration />` absolutely over the commit button wrapper. SEQUENTIAL after Tasks 1 and 2.

**Task 5: Inline error row** — small. Files: `app/(app)/today/_components/MissionCard.tsx`. Replace any `alert(...)` with a stateful `errorMessage` and render a row containing `AlertTriangle` + message below the radiogroup. Testid `mission-error-row`. SEQUENTIAL after Task 2.

**Task 6: E2E** — small. Files: `e2e/visual-mission.spec.ts`. Cover celebration mount/unmount within 1000ms, reduced-motion skip, server error inline, and character-count colour at 220. SEQUENTIAL after Task 4.

### Negative Constraints

- Do NOT change `/api/today/commit` or any API route contract.
- Do NOT change the 280-character limit or any disable-criteria logic.
- Do NOT change any copy ("Choose your mission", "Write your own…", "Commit to this mission", "Committing…", "Today's mission", "Committed ✓").
- Do NOT change `mission-option-1`, `mission-option-2`, `mission-custom-input`, `commit-button` testids.
- Do NOT make the celebration last longer than 1000ms end-to-end.
- Do NOT introduce ad-hoc hex colours; only tokens from Story 1 (primary/amber/green families).
- Do NOT fall back to `window.alert()` on commit failure.

### Test Scenarios

**Test 1: Option select enables Commit**

- Setup: navigate to `/today` post-load, no mission committed yet.
- Action: click `[data-testid="mission-option-1"]`.
- Expected: `[data-testid="commit-button"]` is enabled and has `aria-disabled="false"`; the option row has `data-state="selected"`.

**Test 2: Custom with empty textarea stays disabled**

- Setup: same.
- Action: click `[data-testid="mission-option-custom"]`, leave textarea empty.
- Expected: `[data-testid="commit-button"]` remains disabled.

**Test 3: Successful commit triggers celebration and swaps to committed**

- Setup: same; route `/api/today/commit` to return 200 with a valid mission payload.
- Action: select option 1, click Commit.
- Expected: `[data-testid="mission-celebration"]` appears within ~100ms of click and disappears within 1000ms; `[data-testid="mission-committed-card"]` is visible; the text "Committed ✓" is present.

**Test 4: Reduced-motion skips celebration**

- Setup: `await page.emulateMedia({ reducedMotion: "reduce" })`.
- Action: select option 1, commit.
- Expected: `[data-testid="mission-committed-card"]` visible; `[data-testid="mission-celebration"]` is never mounted (use `expect(locator).toHaveCount(0)` across the full commit window).

**Test 5: Server error shows inline row**

- Setup: mock `POST /api/today/commit` to return 500 with body `{ "error": { "message": "Please try again." } }`.
- Action: select option 1, commit.
- Expected: `[data-testid="mission-celebration"]` is never mounted; `[data-testid="mission-error-row"]` is visible with text "Please try again." and an `AlertTriangle` icon; `[data-testid="commit-button"]` is re-enabled with label "Commit to this mission".

**Test 6: Character count colour shifts at 220**

- Setup: custom option selected.
- Action: type 220 characters into `[data-testid="mission-custom-input"]`.
- Expected: the character-count element's class attribute contains `text-primary` (and no longer `text-muted-foreground`).

### Acceptance Criteria

- [ ] Option rows render inside a `role="radiogroup"` with arrow-key keyboard navigation and roving tabindex
- [ ] Selected option has `data-state="selected"` and a visible primary ring
- [ ] Custom textarea uses the shadcn `Textarea` primitive
- [ ] Character count colour switches from `text-muted-foreground` to `text-primary` at 220 characters
- [ ] Commit button uses shadcn `Button` with `size="lg"` and full width
- [ ] Celebration mounts for exactly 1000ms after a 2xx commit, then unmounts
- [ ] Celebration is skipped entirely under `prefers-reduced-motion: reduce`
- [ ] Inline error row replaces the existing `alert()` on commit failure
- [ ] Committed state renders the mission text and a `Badge` reading "Committed ✓"
- [ ] All four preserved testids (`mission-option-1`, `mission-option-2`, `mission-custom-input`, `commit-button`) continue to exist and resolve
- [ ] `e2e/today-flow.spec.ts` passes unchanged
- [ ] `npm run test:e2e` passes with `e2e/visual-mission.spec.ts` added
- [ ] Both light and dark themes render correctly with no ad-hoc colours

### Verification

**Backend Tests:** None.

**Browser/UI Testing:**

- Sign in, navigate to `/today`, pick option 1, commit — observe the amber/green particle burst for ~1s, then the committed state appears with "Committed ✓".
- Repeat using the custom textarea; type past 220 characters and confirm the counter turns green/primary.
- Open DevTools → Network → Offline; attempt to commit; confirm an inline error row appears (not a browser `alert()` popup); verify selection and typed text are preserved.
- Test in Mobile Safari viewport at 360px — option rows and button remain tap-accessible, no layout overflow.
- Enable `prefers-reduced-motion: reduce` in DevTools → Rendering; commit; verify no particles render.
- Toggle dark theme — verify the amber particles appear as warm amber (not neon), and the card surface and ring are legible.

**E2E Tests:**
| Key Scenario | Test file | Assigned sub-task |
|---|---|---|
| Selecting option 1 enables Commit and committing swaps to committed state | `e2e/today-flow.spec.ts` (existing) | Task 6 |
| Celebration mounts and unmounts within 1000ms | `e2e/visual-mission.spec.ts` | Task 6 |
| Reduced-motion skips celebration | `e2e/visual-mission.spec.ts` | Task 6 |
| Server error renders inline | `e2e/visual-mission.spec.ts` | Task 6 |
| Character count colour shifts at 220 | `e2e/visual-mission.spec.ts` | Task 6 |

**Locator strategies:** existing `mission-option-1`, `mission-option-2`, `mission-custom-input`, `commit-button`; new `mission-option-custom`, `mission-card`, `mission-committed-card`, `mission-celebration`, `mission-error-row`.

### Open Questions

All resolved.
