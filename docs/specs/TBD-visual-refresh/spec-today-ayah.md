# Today Screen & Ayah Card Refresh

**Ticket:** TBD

Refresh the Today screen — the first surface a reader meets each morning — so that the day's ayah reads like a verse rather than a text block. Arabic takes a generous Naskh face with restful RTL spacing, the translation sits beneath it as readable prose, and the supporting controls (audio, tafsir extract, full tafsir drawer) adopt the refreshed visual language from the design-system foundation. No functionality, copy, or assignment logic changes.

## User Story

As a Ghars reader opening the app in the morning, I want the day's ayah to feel like a verse, not a text block — so the reading moment has the weight and beauty it deserves.

## Background & Context

**Current state:**

- The Today screen renders the Arabic verse in a generic system sans-serif at a line-height tuned for Latin text, so letters crowd each other and the verse reads as a block rather than as poetry.
- The translation, surah label, audio button, tafsir extract, and full tafsir drawer all sit on a flat white card with ad-hoc hex values and no raised surface treatment.
- The audio control is a plain rectangular button with no progress indication; the tafsir extract snaps open without transition; the full tafsir drawer appears without spring motion or backdrop softness.
- The container has tight vertical spacing, so the ayah, the mission card, and the reflect view visually compete for attention.

**Problem:**

- Readers have told the team the screen looks "like a prototype." For the single most important surface in the app — where the daily ritual begins — the visual language does not match the sacredness of what is being read.
- The Arabic verse does not carry the weight the content deserves, which undercuts the emotional pull of the morning read.
- The refreshed language (cream/green/amber palette, Noto Naskh Arabic, lucide icons, spring motion, dark-theme readiness) has already been prototyped; the Today screen needs to consume it.

## Target User & Persona

- **Who:** A Ghars reader who opens the app first thing in the morning as part of a daily spiritual habit.
- **Context:** On a phone, often one-handed, often in low light before sunrise or in bright light at breakfast. The reader expects the app to feel calm, composed, and reverent.
- **Current workaround:** Readers tolerate the flat visual layer or drop off after a few days because the screen does not reward the daily return.

## Goals

- Make the Arabic verse the clear visual anchor of the Today screen, rendered in the designated Naskh face with restful line- and letter-spacing.
- Lift the ayah card onto a single raised surface with the refreshed palette and spacing, in both light and dark themes.
- Replace the plain audio button with a circular primary-tinted control that shows playback progress in a slim bar.
- Introduce gentle expand/collapse motion for the tafsir extract and a spring-in-from-bottom motion for the full tafsir drawer, while honouring the reader's reduced-motion preference.
- Preserve every existing interaction, copy line, and data source.

## Non-Goals

- No change to which ayah is assigned, how it is fetched, or which translation or tafsir is shown.
- No change to the text of the tafsir extract, the full tafsir body, the audio source, or the surah-name data.
- No change to any acceptance-critical copy, including "Show tafsir for this ayah", "Hide", "Read full tafsir", "Tafsir (Ibn Kathir) — ayah N", "We'll be back in a moment, in sha Allah", "Please try again shortly.", "Try again".
- No new visual element that requires additional data from the server.
- No RTL layout mirroring of the whole screen; Arabic stays inside the verse only.
- No emoji anywhere on this screen.

## User Workflow

1. **First open of the day** — The reader opens Today. The screen fades up; the ayah card is the first thing the eye lands on, with the Arabic verse in a generous Naskh face above the English translation and a small, wide-tracked surah/ayah label at the top (for example, "Al-Baqarah · 286").
2. **Play the recitation** — The reader taps the circular audio button. The icon switches to a pause glyph; a slim progress bar fills left-to-right in the primary tint as the recitation plays.
3. **Pause the recitation** — The reader taps the button again. Playback stops immediately; the progress bar freezes at its current position; the icon switches back to a play glyph.
4. **Peek the tafsir** — The reader taps "Show tafsir for this ayah" below the translation. A brief extract expands in place with a gentle height-and-fade transition. The label swaps to "Hide" and a subtle underlined "Read full tafsir" link appears.
5. **Read the full tafsir** — The reader taps "Read full tafsir". A bottom drawer slides up with a spring motion over a soft backdrop, showing the full tafsir with a close control in the top-right.
6. **Dismiss the drawer** — The reader taps outside the drawer or taps the close control. The drawer slides back down; the Today screen is unchanged underneath.
7. **Graceful failure** — On a day the day's content cannot be loaded, the reader sees a card with the existing wording "We'll be back in a moment, in sha Allah" and "Please try again shortly." alongside a "Try again" control, styled in the refreshed visual language.

## Acceptance Criteria

### Scenario: Ayah card renders with Arabic above translation and a surah-ayah label on top

```gherkin
Given the reader opens the Today screen on a day the ayah is Al-Baqarah 2:286
When the screen finishes loading
Then I see a single raised card that contains, in order from top to bottom, a small wide-tracked muted label reading "Al-Baqarah · 286", the Arabic verse in the designated Naskh face, and the English translation beneath it
  And the Arabic verse is visibly larger than the translation
  And the Arabic verse has noticeably generous line-spacing so the letters do not crowd each other
  And the card sits on a raised surface rather than a flat block against the background
```

### Scenario: Audio button toggles between play and pause and updates the progress bar

```gherkin
Given the reader is viewing the Today screen with Al-Mulk 67:1 as the day's ayah
  And the day's ayah has a recitation available
When I tap the circular audio button
Then the icon changes from a play glyph to a pause glyph
  And a slim progress bar appears beside the button and begins filling from left to right in the primary tint as the recitation proceeds
When I tap the audio button a second time
Then the icon changes back to a play glyph
  And the progress bar freezes at its current fill position
```

### Scenario: Audio control is absent when the day's ayah has no recitation

```gherkin
Given the reader is viewing the Today screen on a day the ayah has no recitation available
When the screen finishes loading
Then I do not see the circular audio button
  And I do not see the playback progress bar
  And the rest of the ayah card renders as normal
```

### Scenario: Tafsir extract expands and collapses in place

```gherkin
Given the reader is viewing the Today screen with Al-Fatihah 1:1 as the day's ayah
  And the tafsir extract is collapsed
When I tap the "Show tafsir for this ayah" control
Then the extract text expands into view with a gentle height-and-fade transition
  And the toggle label changes to "Hide"
  And an underlined "Read full tafsir" link becomes visible alongside the toggle
When I tap "Hide"
Then the extract collapses with the same gentle transition
  And the toggle label returns to "Show tafsir for this ayah"
  And the "Read full tafsir" link is no longer visible
```

### Scenario: Full tafsir drawer opens from the bottom and can be closed

```gherkin
Given the reader has expanded the tafsir extract for Al-Baqarah 2:286
When I tap "Read full tafsir"
Then a drawer slides up from the bottom of the screen with a spring motion
  And a soft backdrop appears behind the drawer
  And the drawer shows the heading "Tafsir (Ibn Kathir) — ayah 286" and the full tafsir content
  And a close control is visible in the top-right of the drawer
When I tap the close control
Then the drawer slides back down
  And the backdrop fades away
  And the Today screen is unchanged underneath
```

### Scenario: Full tafsir drawer closes on backdrop tap

```gherkin
Given the full tafsir drawer is open for Al-Mulk 67:1
When I tap outside the drawer on the backdrop
Then the drawer slides back down
  And the Today screen is unchanged underneath
```

### Scenario: Tafsir drawer scrolls inside itself without scrolling the page behind it

```gherkin
Given the full tafsir drawer is open for an ayah whose tafsir is longer than the drawer height
When I scroll within the drawer content
Then the drawer content scrolls while the Today screen behind the drawer does not move
  And the drawer never grows taller than 80% of the viewport height
```

### Scenario: Content-unavailable error renders in the refreshed visual language with the same wording

```gherkin
Given the day's ayah cannot be loaded from the content source
When the reader opens the Today screen
Then I see a card on the same raised surface as the ayah card
  And the card shows the text "We'll be back in a moment, in sha Allah"
  And the card shows the supporting text "Please try again shortly."
  And the card shows a "Try again" control
  And none of these copy lines differ from their wording before the refresh
```

### Scenario: First render of the ayah card uses an entrance animation; subsequent interactions do not

```gherkin
Given a reader opens the Today screen for the first time in the current session
When the screen finishes loading
Then the ayah card fades in and rises a short distance into place
When I tap "Show tafsir for this ayah"
Then the extract expands without re-running the ayah-card entrance animation
When I tap the audio button
Then playback begins without re-running the ayah-card entrance animation
```

### Scenario: Reduced-motion reader sees no non-essential motion

```gherkin
Given the reader has reduced-motion enabled in their system preferences
When I open the Today screen
Then the ayah card appears in its final position without a fade or rise
When I tap "Show tafsir for this ayah"
Then the extract appears in its expanded state without a height transition
When I tap "Read full tafsir"
Then the drawer appears in its opened position without a spring motion
  And I am still able to read the tafsir content and close the drawer as normal
```

### Scenario: Dark-mode reader sees a lifted dark surface with legible Arabic and translation

```gherkin
Given the reader has the app in dark mode
When I open the Today screen with Al-Baqarah 2:255 as the day's ayah
Then the ayah card renders on a lifted dark surface rather than a bright white rectangle
  And the Arabic verse is legible against the card surface
  And the English translation is legible against the card surface
  And the surah-ayah label, audio button, and tafsir toggle all remain legible
  And the full tafsir drawer, when opened, also renders in the dark visual language
```

### Scenario: Keyboard reader can reach and activate every interactive control with a visible focus ring

```gherkin
Given the reader is navigating the Today screen with the keyboard only
When I move focus through the ayah card in order
Then focus lands on the audio button with a visible focus ring
  And focus then lands on the "Show tafsir for this ayah" toggle with a visible focus ring
  And after expanding the tafsir, focus can land on the "Read full tafsir" link with a visible focus ring
  And after opening the drawer, focus can land on the drawer close control with a visible focus ring
When I activate any focused control using the keyboard
Then the same behaviour occurs as a tap on that control
```

### Scenario Outline: Arabic verse renders in the designated Naskh typeface across reference ayahs

```gherkin
Given the day's ayah is <reference>
When the reader opens the Today screen
Then the Arabic verse is rendered in the designated Naskh typeface
  And the Arabic verse is visibly larger than the English translation beneath it
  And the surah-ayah label at the top of the card reads "<label>"

Examples:
  | reference         | label              |
  | Al-Fatihah 1:1    | Al-Fatihah · 1     |
  | Al-Baqarah 2:255  | Al-Baqarah · 255   |
  | Al-Mulk 67:1      | Al-Mulk · 1        |
```

### Scenario: Audio button and progress bar fit on a narrow phone without wrapping

```gherkin
Given the reader is on a phone with a 360 px wide viewport
  And the day's ayah has a recitation available
When I view the ayah card
Then the circular audio button and the progress bar sit side by side on the same row
  And neither control wraps onto a new line
  And neither control overlaps the other
```

## Business Rules & Constraints

- The Arabic verse line-height is at least 1.8 times its font size so the letters have room to breathe.
- The Arabic verse font size is visibly larger than the English translation; the translation reads as supporting prose beneath the verse.
- The surah/ayah label (for example, "Al-Baqarah · 286") renders in a small, wide-tracked, muted uppercase style above the verse.
- The audio control is a circular primary-tinted icon button using the lucide play and pause glyphs, with a slim progress bar filling in the primary tint as recitation proceeds.
- The audio button and progress bar must fit on a single row at viewports 360 px wide and up, without overlap or wrap.
- The tafsir extract is visually subordinate to the translation (smaller, muted) while remaining comfortably readable.
- The full tafsir drawer never grows taller than 80% of the viewport; content inside scrolls without scrolling the page behind it.
- The ayah card always uses a single raised surface in both light and dark themes; it is never a flat block on the page background.
- Reduced-motion readers see no entrance animation on the ayah card, no height transition on the tafsir extract expand/collapse, and no spring motion on the drawer; functionality is preserved.
- All interactive controls — the audio button, the tafsir toggle, the "Read full tafsir" link, the "Try again" control in the error state, and the drawer close control — meet a minimum 44 × 44 px touch target and show a visible focus ring when reached by keyboard.
- No ad-hoc hex values appear on this screen; all colour comes from the design-system tokens shipped in Story 1.
- No copy on this screen is rewritten. "Show tafsir for this ayah", "Hide", "Read full tafsir", "Tafsir (Ibn Kathir) — ayah N", "We'll be back in a moment, in sha Allah", "Please try again shortly.", and "Try again" appear verbatim.
- No emoji appears on this screen.

## Success Metrics

- Tafsir expand rate (share of daily readers who tap "Show tafsir for this ayah") rises by at least 15% in the four weeks following the refresh, indicating the new visual balance encourages deeper engagement with the verse.
- Audio play rate (share of daily readers who start playback) holds steady or rises relative to the pre-refresh baseline.
- No increase in reported layout issues on narrow phones (360–390 px wide) in the four weeks following release.
- Readers rate the visual quality of the Today screen at 4.0 / 5 or higher in an in-app post-reflection prompt run for two weeks after release, up from the 3.1 / 5 pre-refresh baseline.

## Dependencies

- Story 1 (Design system foundation) — colour tokens, typography scale, elevation tokens, motion language, lucide icon set, and card/drawer primitives must be in place.
- Noto Naskh Arabic webfont — licensed and available to the app for rendering the Arabic verse.
- Lucide icon set — available for the play, pause, chevron, and close glyphs used on this screen.
- Dark theme readiness from Story 2 — every surface shipped by this story must render correctly once dark mode is enabled.

## Open Questions

- [x] ~~Should any element from the current flat Today screen be preserved?~~ — **Resolved:** No. The epic overview confirms the refresh adopts the origin/main visual direction wholesale.
- [x] ~~Should the tafsir extract copy be updated as part of this refresh?~~ — **Resolved:** No. Copy rewriting is out of scope for the entire epic; the extract text and all toggle labels stay exactly as they are.
- [x] ~~Should the ayah card's entrance animation run every time the reader returns to Today in the same session?~~ — **Resolved:** No. The entrance runs on first render of the screen in a session; subsequent in-screen interactions (expand tafsir, play audio, open drawer) do not re-trigger it.

---

## Technical Detail

### Functional Requirements

- **No data contract changes** — `GET /api/today?local_date=YYYY-MM-DD` return shape preserved.
- Arabic verse: `font-family: var(--font-arabic)` (Noto Naskh Arabic from Story 1); `font-size: 1.75rem`; `line-height: 2.2`; `direction: rtl`; `lang="ar"`; `translate="no"`.
- Surah/ayah label: `text-xs uppercase tracking-widest text-muted-foreground`.
- Audio button: 40×40 circular, `bg-primary text-primary-foreground`, lucide `Play`/`Pause` (size 16). Slim progress bar beside it: height 4px, `bg-muted` background, progress fill `bg-primary`.
- Tafsir extract: collapse/expand via `<motion.div>` with `layout` and `AnimatePresence`. Under reduced-motion, instant toggle (no height animation).
- Full tafsir drawer: slide-up `<motion.div>` with `initial={{ y: "100%" }}`, `animate={{ y: 0 }}`, `exit={{ y: "100%" }}`, spring transition `{ stiffness: 300, damping: 28 }`. Backdrop `bg-black/40`. Sheet `rounded-t-2xl bg-card max-h-[80vh] overflow-y-auto`.
- Entrance: first render of the ayah card uses `fadeUp` variant from `lib/motion.ts`. Subsequent re-renders (audio play, tafsir expand) do NOT re-fire the entrance.
- Error state card preserves existing copy exactly.

### Validation & Business Rules

- Arabic typeface is mandatory on the verse; fallback to `serif`, never `sans-serif`.
- Audio controls hidden entirely when `data.audio_url` is empty string.
- Tafsir drawer height clamped to 80vh.

### API Design

- None new. Existing consumers: `GET /api/today`, `GET /api/content/tafsir/[key]?full=true`.

### UI/Frontend Requirements

**New/modified components:**

- `app/(app)/today/_components/AyahCard.tsx` — full rewrite. Consumes Card primitive from Story 1 for the outer surface. Uses framer-motion `fadeUp` for entrance. Audio and progress use `<Button size="icon">` and a `<div>` progress bar.
- `app/(app)/today/_components/TafsirFullDrawer.tsx` — replace the plain overlay with a framer-motion slide-up sheet. Uses `AnimatePresence` to animate entry/exit. Preserves `tafsir-prose` class and `dangerouslySetInnerHTML` (per existing learning `convention-tafsir-html-sanitized`).
- `app/(app)/today/page.tsx` — wraps the outer container in a `motion.main` with `fadeUp` on first mount only (`initial={false}` for subsequent state changes). No logic change.

**Existing testids preserved:**

- `ayah-arabic`, `ayah-translation`, `audio-play`, `tafsir-reveal`, `tafsir-extract`, `tafsir-full-trigger`, `unavailable-card`.

**New testids:**

- `ayah-card` (outer card), `tafsir-full-drawer` (drawer root), `tafsir-drawer-close` (X button).

### States

- Loading: existing copy "Loading today's ayah…" in a centered muted-foreground block, unchanged text but styled with the new token layer.
- Error (`CORPUS_EMPTY` / `QF_CONTENT_UNAVAILABLE`): existing copy preserved; card adopts refreshed look.
- Idle: ayah visible, translation, audio (if present), tafsir collapsed.
- Tafsir expanded: extract visible, "Read full tafsir" + "Hide" links.
- Drawer open: full tafsir displayed with scroll-inside-sheet.

### Architecture Notes

- **New dependencies:** none.
- **Dependencies & integration:** depends on Story 1 (tokens, Noto Naskh Arabic font, Card + Button primitives, motion variants). No API changes. Does not touch MissionCard or ReflectView (owned by Stories 5 and 6).

### Exemplar Files

- `origin/main:components/AudioPlayer.tsx` — reference only; current branch has an inline audio control inside AyahCard and keeps it inline.

### Implementation Plan

**Task 1: Refresh AyahCard layout + typography** — medium. Files: `app/(app)/today/_components/AyahCard.tsx`. SEQUENTIAL after Story 1 Tasks 1, 2, 3.

**Task 2: Refresh audio button + progress** — small. Files: `app/(app)/today/_components/AyahCard.tsx` (same file, but isolate the change). SEQUENTIAL inside Task 1 (keep Task 1 + 2 as one PR if small).

**Task 3: Animated tafsir expand/collapse** — small. Files: `app/(app)/today/_components/AyahCard.tsx`. SEQUENTIAL after Task 1.

**Task 4: TafsirFullDrawer motion upgrade** — small. Files: `app/(app)/today/_components/TafsirFullDrawer.tsx`. INDEPENDENT of Tasks 1–3.

**Task 5: Entrance motion on Today page** — small. Files: `app/(app)/today/page.tsx`. SEQUENTIAL after Tasks 1–4.

**Task 6: E2E visual regression** — small. Files: `e2e/visual-today-ayah.spec.ts`. SEQUENTIAL after Task 5.

### Negative Constraints

- Do NOT change `/api/today` or `/api/content/tafsir/[key]` routes.
- Do NOT change MissionCard, ReflectView, or any other surface in this story.
- Do NOT change any user-facing copy ("Loading today's ayah…", "Show tafsir for this ayah", "Hide", "Read full tafsir", "Tafsir (Ibn Kathir) — ayah N", "Full Tafsir — Ibn Kathir", "Close", "We'll be back in a moment, in sha Allah", "Please try again shortly.", "Try again").
- Do NOT change the `tafsir-prose` class — it is documented in `convention-tafsir-html-sanitized`.
- Do NOT change any existing `data-testid`.

### Test Scenarios

**Test 1: Ayah renders with Naskh font**

- Setup: `/today` with a valid assignment (e.g. Al-Baqarah 2:286).
- Action: inspect computed `font-family` of `[data-testid="ayah-arabic"]`.
- Expected: resolves to Noto Naskh Arabic.

**Test 2: Audio play/pause cycle**

- Setup: `/today` with non-empty `audio_url`.
- Action: click `[data-testid="audio-play"]`; wait 500ms; click again.
- Expected: first click: icon swaps from Play to Pause, progress bar starts filling. Second click: icon back to Play, progress frozen.

**Test 3: Audio button absent when no audio_url**

- Setup: mock `/api/today` to return `audio_url: ""`.
- Action: render.
- Expected: `[data-testid="audio-play"]` not present in DOM.

**Test 4: Tafsir expand / collapse**

- Setup: `/today`.
- Action: click `[data-testid="tafsir-reveal"]`; then click Hide link.
- Expected: expand shows `[data-testid="tafsir-extract"]`; collapse hides it.

**Test 5: Full tafsir drawer open/close**

- Setup: `/today`, tafsir extract expanded.
- Action: click `[data-testid="tafsir-full-trigger"]`; then click `[data-testid="tafsir-drawer-close"]`.
- Expected: drawer slides up with `y: 0`; closes on X tap; backdrop click also closes.

**Test 6: Error state**

- Setup: mock `/api/today` to return `error.code === "QF_CONTENT_UNAVAILABLE"`.
- Action: render.
- Expected: `[data-testid="unavailable-card"]` visible with existing copy.

### Acceptance Criteria

- [ ] Ayah Arabic renders in Noto Naskh Arabic at line-height 2.2
- [ ] Audio button is a circular 40×40 primary-tinted button with lucide Play/Pause
- [ ] Progress bar updates as playback proceeds
- [ ] Tafsir extract animates expand/collapse (instant under reduced-motion)
- [ ] Full tafsir drawer slides up with spring motion, closes on X and backdrop
- [ ] All existing testids preserved; `e2e/today-flow.spec.ts` passes unchanged
- [ ] `npm run test:e2e` passes with new `visual-today-ayah.spec.ts`
- [ ] Renders correctly in both themes

### Verification

**Backend Tests:** None.

**Browser/UI Testing:**

- Login via `/api/demo/start`, visit `/today`.
- Verify ayah Arabic is Naskh (computed `font-family` via DevTools).
- Play audio; observe progress.
- Tap "Show tafsir"; observe expand animation.
- Tap "Read full tafsir"; drawer slides up.
- Close drawer via X and via backdrop.
- Toggle dark mode; verify everything legible.
- Mobile Safari viewport: no overflow at 360px wide.

**E2E Tests:**

| Key Scenario                                           | Test file                           | Assigned sub-task |
| ------------------------------------------------------ | ----------------------------------- | ----------------- |
| Ayah renders with Arabic verse and translation visible | `e2e/today-flow.spec.ts` (existing) | Task 6            |
| Audio play/pause toggles icon and progresses bar       | `e2e/visual-today-ayah.spec.ts`     | Task 6            |
| Tafsir extract expands and collapses                   | `e2e/visual-today-ayah.spec.ts`     | Task 6            |
| Full tafsir drawer opens/closes                        | `e2e/visual-today-ayah.spec.ts`     | Task 6            |
| Error state renders with existing copy                 | `e2e/visual-today-ayah.spec.ts`     | Task 6            |

**Locator strategies:** existing `ayah-arabic`, `ayah-translation`, `audio-play`, `tafsir-reveal`, `tafsir-extract`, `tafsir-full-trigger`, `unavailable-card`; new `ayah-card`, `tafsir-full-drawer`, `tafsir-drawer-close`.

### Open Questions

All resolved.
