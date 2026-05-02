# Grove & Weekly Review Refresh

**Ticket:** TBD

A visual refresh of Ghars's two long-arc surfaces — the grove (where planted reflections accumulate over days and months) and the weekly review (where a completed week is read back to the user as a letter). This story lifts both surfaces onto the refreshed visual language from Story 1 (tokens, typography, lucide iconography, shadcn-style primitives, motion) without changing any behaviour, copy, or data. The result is that the grove feels like a garden the user is growing, and the weekly review feels like a letter they have been written.

## User Story

As a Ghars user coming back over days and weeks, I want my grove to feel like a garden I am growing, and my weekly review to feel like a letter I've been written — so the ritual has a long arc, not just a daily one.

## Background & Context

**Current state:**

- The grove page renders a flat cream background with a plain heading and count, a small streak label, a plain weekly-review link, and a grid of tiles whose plant variants are rendered as emoji (full, partial, sapling, withered).
- Tapping a tile opens a bottom sheet that is functional but visually unstyled — a white rectangle with basic text blocks.
- The weekly review page stacks seven day-cards and a closing line, all as flat white rectangles on cream, with no tinted chips for the "did you act on it?" value and no typographic hierarchy on the header.
- Neither page is dark-theme-ready; at night the grove and weekly review are bright cream rectangles on the phone.
- There is no entrance motion when the user lands on the grove; tiles appear instantly with no sense that the garden is being revealed.

**Problem:**

- The grove is the single feature in Ghars that is designed to reward longevity. Rendered as a flat emoji grid, it feels like a completion tracker, not a garden. Users have said it reads as "a list of days I showed up", not "a place I'm tending".
- The weekly review is designed to feel like a closing reflection — a letter back to the reader about what the week held. As flat white cards it reads as a report, not a reflection.
- Emoji-based plant variants render inconsistently across platforms (Android, iOS, desktop) and cannot be themed for dark mode — they will always be the bright saturated emoji, which breaks the atmosphere at night.
- Neither surface has any visible motion, so users never experience the "small reveal" that these long-arc surfaces deserve.

## Target User & Persona

- **Who:** A returning Ghars user in their second, fourth, or twelfth week of using the app — past the onboarding moment, invested in the ritual, beginning to value the long arc.
- **Context:** Typically opens the grove after submitting an evening reflection, or on a quiet weekend morning to see what the week held. Often reads in low light, on a phone, one-handed.
- **Current workaround:** They open the grove, glance at the count, and leave. They rarely tap a tile to revisit a past reflection, and they sometimes miss the weekly-review entry point entirely because it is visually indistinguishable from the rest of the page.

## Goals

- Make the grove canvas read as a cultivated garden — SVG plant glyphs with a soft entrance reveal, tinted tokens that work in both light and dark, and a tap-to-open day-sheet that feels purposeful.
- Make the weekly review feel like a letter — a warm-weight header, seven clearly-separated day-cards with tinted "did you act on it?" chips, and a closing card that carries the week's closing line as the emotional final beat.
- Bring both surfaces to dark-theme readiness: no bright white rectangles when the user is reading at night.
- Preserve every piece of user-facing copy, every navigation path, and every piece of data shown on each surface, exactly as today.

## Non-Goals

- No change to which reflections appear in the grove, how cumulative counts are calculated, how streaks are computed, or how weeks are defined.
- No new surfaces — the grove stays the grove, the weekly review stays the weekly review.
- No rewrite of any copy line. The existing status banners, empty-state copy, weekly-review CTA copy, page headers, and closing-line text all ship unchanged.
- No reintroduction of the "garden / plant-unlock" prototype from an earlier branch — the current one-reflection-per-tile model with four variants (full, partial, sapling, withered) stays exactly as is; only the rendering changes.
- No new filter, sort, or navigation affordance on either page.

## User Workflow — Grove

1. **Landing on the grove** — The user opens the grove. At the top they see the today-status banner (one of three known statuses, copy unchanged). Below it, a large tabular numeral hero count announces how many ayat they have reflected on this month, with a subdued caption underneath. If their current streak is above zero, a streak pill sits alongside with a flame icon and a numeral. If any completed week exists, a weekly-review call-to-action card sits below the hero, drawing the eye as a warmer tinted surface.
2. **The garden revealing itself** — The grove canvas below the header shows a grid of plant tiles, one per past reflection. On first landing, tiles fade in with a short stagger so the garden reveals itself from top-left to bottom-right. If the user has reduced-motion enabled, tiles appear immediately with no stagger. A date label sits below each tile.
3. **Opening a day** — The user taps a tile. A bottom sheet slides up from the bottom of the screen with rounded top corners. The backdrop behind it dims. The sheet shows the date header, the surah and ayah reference, the mission for that day, and the reflection the user wrote. They can scroll inside the sheet; the page behind the sheet does not scroll.
4. **Closing the day-sheet** — The user taps the close control in the top-right of the sheet, or taps the dimmed backdrop outside the sheet. The sheet slides back down and the grove returns, unchanged, underneath.
5. **Into the weekly review** — The user taps the weekly-review call-to-action card. They navigate to the weekly review page for the most recent completed week.

## User Workflow — Weekly Review

1. **Landing on the week** — The user arrives on the weekly review page. At the top, a back link takes them to the grove. Below the back link, the page header reads "Here's what Allah guided you through this week" in a warm-weight treatment.
2. **Reading the seven days** — The user scrolls down through seven day-cards, stacked in order from Day 1 to Day 7. Each card shows the day number, the date underneath in smaller muted text, the "did you act on it?" chip on the right with a context-appropriate tint, the surah and ayah reference, the mission for that day in italic muted text, and the body of the reflection.
3. **The closing line** — At the bottom of the page, a single closing-line card carries the week's closing text in a hero-tinted treatment, as the emotional final beat of the review.
4. **Back to the garden** — The user taps the back link at the top of the page. They return to the grove.

## Acceptance Criteria

### Scenario: Grove header renders in the correct order with all elements present

```gherkin
Given Aisha has reflected on 14 days this month
  And her current streak is 6 days
  And she has completed one full week of reflections
When she opens the grove
Then she sees the today-status banner at the top
  And below it she sees a hero showing "14" as a large tabular numeral with the caption "ayat reflected on this month"
  And she sees a streak pill showing a flame icon and the number "6"
  And she sees a weekly-review call-to-action card reading "Week 1 — see what Allah guided you through →"
  And below all of these she sees the grove canvas with her 14 plant tiles
```

### Scenario: Streak pill is hidden when the streak is zero

```gherkin
Given Yusuf has reflected on 3 days this month
  And his current streak is 0 days
When he opens the grove
Then he sees the hero count "3 ayat reflected on this month"
  And he does not see a streak pill anywhere on the page
```

### Scenario: Streak pill appears once the streak passes zero

```gherkin
Given Yusuf's current streak is 6 days after reflecting six days in a row
When he opens the grove
Then he sees a streak pill alongside the hero count showing a flame icon and the number "6"
```

### Scenario: Weekly-review call-to-action is hidden before any week is complete

```gherkin
Given Zainab has reflected on 4 days
  And she has not yet completed her first week
When she opens the grove
Then she does not see a weekly-review call-to-action card anywhere on the page
```

### Scenario: Weekly-review call-to-action appears after the first full week

```gherkin
Given Zainab has just completed her first full week of reflections
When she opens the grove
Then she sees a weekly-review call-to-action card reading "Week 1 — see what Allah guided you through →"
  And the card is visually distinct from the other cards on the page
```

### Scenario: Tapping the weekly-review call-to-action navigates to the week page

```gherkin
Given Zainab is on the grove
  And a weekly-review call-to-action card is visible
When she taps the weekly-review call-to-action card
Then she is taken to the weekly review page for that week
  And the page header reads "Here's what Allah guided you through this week"
```

### Scenario: Grove tiles animate in with a stagger on first load

```gherkin
Given Aisha has reduced-motion turned off on her device
  And she has 14 reflections in her grove
When she opens the grove for the first time in this session
Then the 14 plant tiles fade in one after another in a soft stagger from the top-left tile to the bottom-right tile
  And once the stagger is complete every tile is fully visible
```

### Scenario: Grove tiles do not re-animate when the user returns to the grove in the same session

```gherkin
Given Aisha has already seen the grove's entrance animation once this session
When she navigates away to another page and comes back to the grove
Then the plant tiles appear immediately with no entrance stagger
```

### Scenario: Reduced-motion suppresses the entrance stagger

```gherkin
Given Aisha has reduced-motion turned on in her device settings
When she opens the grove
Then all plant tiles are fully visible immediately
  And no entrance stagger is played
```

### Scenario: Tapping a tile opens the day-sheet with the verse, mission, and reflection

```gherkin
Given Aisha is on the grove
  And one of her tiles represents the day she reflected on Surah Al-Baqarah, ayah 153
When she taps that tile
Then a bottom sheet slides up from the bottom of the screen with rounded top corners
  And the area behind the sheet is dimmed
  And the sheet shows the date of that reflection
  And the sheet shows the surah and ayah reference "Al-Baqarah 2:153"
  And the sheet shows the mission she committed to that day prefixed with "Mission:"
  And the sheet shows the reflection text she wrote that day
```

### Scenario: The page behind the day-sheet does not scroll

```gherkin
Given the day-sheet is open on Aisha's grove
  And the sheet contains a long reflection that requires scrolling
When she scrolls inside the sheet
Then the content inside the sheet scrolls
  And the grove page behind the sheet remains stationary
```

### Scenario: Closing the day-sheet via the close control

```gherkin
Given the day-sheet is open on Aisha's grove
When she taps the close control in the top-right of the sheet
Then the sheet slides back down
  And the backdrop fades away
  And she sees the grove exactly as it was before she opened the sheet
```

### Scenario: Closing the day-sheet via the backdrop

```gherkin
Given the day-sheet is open on Aisha's grove
When she taps the dimmed area outside the sheet
Then the sheet slides back down
  And she sees the grove exactly as it was before she opened the sheet
```

### Scenario: Empty grove shows the preserved empty-state copy

```gherkin
Given Zainab has just signed up and has no reflections yet
When she opens the grove
Then she sees an empty-state card with a small sprout illustration
  And the card reads "Your first tree will appear tonight after your evening reflection."
```

### Scenario Outline: Today-status banner shows the correct copy for each status

```gherkin
Given Aisha's state for today is <status>
When she opens the grove
Then the today-status banner shows the copy "<copy>"
  And the banner shows the lucide icon associated with that status

Examples:
  | status             | copy                                            |
  | awaiting_morning   | the app's existing awaiting-morning status copy |
  | awaiting_evening   | the app's existing awaiting-evening status copy |
  | complete           | the app's existing complete status copy         |
```

### Scenario Outline: Tree-variant glyphs render for each of the four variants

```gherkin
Given Aisha has a reflection whose tree variant is <variant>
When she views the grove canvas
Then the tile for that reflection shows the <glyph> SVG plant glyph
  And the glyph is legible in light theme
  And the glyph is legible in dark theme

Examples:
  | variant  | glyph         |
  | full     | full tree     |
  | partial  | partial tree  |
  | sapling  | sapling       |
  | withered | withered leaf |
```

### Scenario: Weekly review page renders seven day-cards in order

```gherkin
Given Aisha has completed a full week of reflections
When she opens the weekly review page for that week
Then she sees the back link "Back to grove" at the top
  And below it she sees the page header "Here's what Allah guided you through this week"
  And below the header she sees exactly seven day-cards stacked vertically
  And the day-cards are in order from "Day 1" at the top to "Day 7" at the bottom
  And at the bottom of the page she sees a closing-line card
```

### Scenario: Each weekly-review day-card shows the expected fields

```gherkin
Given Aisha is on the weekly review page
  And Day 3 of that week was her reflection on Surah Al-Baqarah 2:153 with mission "Remember Allah in every moment of struggle today"
  And her did-apply answer that day was "yes_fully"
  And her reflection body read "Felt His presence during the difficult meeting"
When she looks at the Day 3 card
Then she sees the label "Day 3"
  And she sees the date of that reflection underneath the day label in smaller muted text
  And she sees a chip on the right of the card reading "Yes, fully" with a subtle-positive tint
  And she sees the surah and ayah reference "Al-Baqarah 2:153"
  And she sees the mission line "Mission: Remember Allah in every moment of struggle today" in italic muted text
  And she sees the reflection body "Felt His presence during the difficult meeting"
```

### Scenario: Closing-line card renders at the bottom of the weekly review

```gherkin
Given Aisha is on the weekly review page
  And the week has a closing-line text
When she scrolls to the bottom of the page
Then she sees a single closing-line card separated from the day-cards above
  And the closing-line card uses a hero-tinted treatment
  And the closing-line text is shown in the primary green
```

### Scenario: Back link returns the user to the grove

```gherkin
Given Aisha is on the weekly review page
When she taps the back link "Back to grove"
Then she is taken back to the grove page
  And the grove shows her tiles without replaying the entrance stagger
```

### Scenario Outline: Did-apply chip label and tint on each day-card

```gherkin
Given a day-card on the weekly review page corresponds to a reflection whose did-apply value is <value>
When Aisha looks at that card
Then she sees a chip reading "<label>"
  And the chip carries a <tint> tint

Examples:
  | value     | label      | tint            |
  | yes_fully | Yes, fully | subtle-positive |
  | partly    | Partly     | neutral         |
  | not_today | Not today  | soft-warm       |
```

### Scenario: Grove renders correctly in dark mode

```gherkin
Given Aisha has dark mode enabled on her device
When she opens the grove at night
Then no card, tile, backdrop, or sheet on the grove appears as a bright white rectangle
  And every plant glyph remains legible against the dark background
  And the hero numeral, streak pill, and weekly-review call-to-action card all render with the dark-theme token palette
```

### Scenario: Weekly review renders correctly in dark mode

```gherkin
Given Aisha has dark mode enabled on her device
When she opens the weekly review page at night
Then no day-card, chip, or closing-line card appears as a bright white rectangle
  And the did-apply chip tints are visible but not glaring against the dark background
  And the closing-line text remains legible with sufficient contrast
```

### Scenario: Keyboard users can reach every interactive element on the grove

```gherkin
Given a user is navigating the grove with a keyboard
When they move focus through the page in order
Then focus lands in turn on the today-status banner's interactive area if any, the weekly-review call-to-action card if present, and each plant tile
  And every focused element shows a visible focus ring
  And pressing the activation key on a focused plant tile opens the day-sheet
  And when the day-sheet is open, focus is moved into the sheet and cannot escape to the grove until the sheet is closed
```

### Scenario: Keyboard users can reach every interactive element on the weekly review page

```gherkin
Given a user is navigating the weekly review page with a keyboard
When they move focus through the page in order
Then focus lands first on the back link
  And then on each interactive element inside the seven day-cards in order
  And every focused element shows a visible focus ring
```

### Scenario: Plant tiles meet the minimum touch target size

```gherkin
Given Aisha is viewing the grove on her phone
When she attempts to tap a plant tile
Then the tile's tappable area is at least 44 pixels by 44 pixels
  And the tap opens the day-sheet for that reflection
```

## Business Rules & Constraints

- **Tree-variant mapping is 1:1 with existing data.** The four variants (full, partial, sapling, withered) correspond to the same four states the app currently uses. No variant is added, removed, or redefined; only the rendering swaps from emoji to SVG glyph.
- **Streak pill visibility.** The streak pill is shown only when the current streak is greater than zero. When the streak is zero the pill is absent, not hidden-but-present.
- **Weekly-review call-to-action visibility.** The weekly-review call-to-action card is shown only when at least one completed week exists. On a fresh account with no completed weeks, the card is absent, not greyed out.
- **Day-sheet scroll containment.** When the day-sheet is open, the grove page behind it does not scroll. Scroll is contained inside the sheet body.
- **Day-sheet dismissal.** The sheet dismisses on a tap of the close control in the top-right, on a tap of the backdrop outside the sheet, and on the escape key when focus is inside the sheet. All three dismissals return the grove to its prior state.
- **Reduced-motion contract.** When the user's system preference is reduced-motion, the entrance stagger on grove tiles is skipped and tiles appear immediately. Functional transitions (sheet open / close, page navigation) still occur but use instant or minimal motion.
- **Touch target minimum.** Every plant tile is tappable across an area of at least 44 × 44 pixels, regardless of the visual size of the glyph inside it.
- **Copy is preserved exactly.** No text on either page is changed by this story. This includes the today-status banner copy, the hero caption "ayat reflected on this month", the weekly-review call-to-action "Week N — see what Allah guided you through →", the empty-state "Your first tree will appear tonight after your evening reflection.", the "Mission:" prefix, the page header "Here's what Allah guided you through this week", the "Back to grove" back link, the did-apply chip labels "Yes, fully" / "Partly" / "Not today", and the week's closing-line text.
- **No ad-hoc colour values.** All surfaces, tints, chips, and glyph fills consume tokens defined by Story 1. No raw hex values are introduced on either page.
- **Dark-theme readiness.** Both pages render correctly in dark mode without any bright white surface leaking through. Every card, chip, sheet, backdrop, and glyph uses token-driven colour.
- **Entrance stagger is first-load only.** The grove's tile entrance stagger plays only on the first time the grove is landed on in a given session. Subsequent returns to the grove — for example coming back from a day-sheet, from the weekly review page, or from another tab — render tiles immediately.

## Success Metrics

- Day-sheet open rate from the grove rises by at least 15% in the four-week window after the refresh ships, measured as the share of grove sessions in which at least one tile is tapped. This is the primary signal that users are re-engaging with past reflections, not just glancing at the count.
- Click-through rate on the weekly-review call-to-action card from the grove rises by at least 10% in the same window, measured as the share of grove sessions in which the card is tapped (among sessions where the card is present).
- Qualitative feedback in post-reflection prompts confirms that users describe the grove as a "garden", "forest", or "something growing" rather than as a "list" or "tracker" in at least 60% of free-text responses that mention the grove.
- Zero user-flow regressions: existing end-to-end coverage for grove growth, day-sheet opening, weekly-review navigation, and tile rendering continues to pass unchanged after the refresh.
- In reduced-motion mode, the grove can be fully navigated — including opening and closing a day-sheet — with no non-essential animation playing.

## Dependencies

- Story 1 (Design system foundation) has shipped and provides the token layer, typography scale, lucide icon set, shadcn-style primitives (card, sheet, chip), and motion primitives consumed by this story.
- The four SVG plant glyphs (full tree, partial tree, sapling, withered) are designed, exported, and token-aware so they render correctly in both light and dark themes.
- The motion primitive for the tile entrance stagger is available from Story 1 and honours the reduced-motion preference by default.
- The existing grove data shape (one reflection per tile, a tree-variant per reflection, a cumulative count, a streak, a list of completed weeks) is unchanged; this story consumes exactly what the current implementation already provides.

## Open Questions

- [x] ~~Should emoji be retained for any of the four plant variants, or are all four replaced by SVG glyphs?~~ — **Resolved:** All four variants are replaced by SVG glyphs so that the grove is themeable and consistent across platforms. Mapping is 1:1 with the existing variant states.
- [x] ~~Should the entrance stagger play every time the user lands on the grove, or only on first load?~~ — **Resolved:** First load per session only. Subsequent returns to the grove in the same session render tiles immediately so the user does not perceive the animation as a delay.
- [x] ~~Should the day-sheet be dismissible by swipe-down in addition to the close control and backdrop tap?~~ — **Resolved:** The close control and backdrop tap are sufficient for this story. Swipe-down dismissal is not in scope; it may be considered in a later polish pass.

---

## Technical Enrichment

### Functional Requirements

- No API contract change. Grove consumes `GET /api/grove`, `GET /api/weeks`, `GET /api/grove/day/[date]`. Week consumes `GET /api/weeks/[weekId]`.
- Tree-variant mapping is 1:1 from the existing `variant: "full" | "partial" | "sapling" | "withered"` field. Each maps to an SVG plant glyph.
- Streak pill hidden when `streak_days === 0`.
- Weekly-review CTA hidden when `weeks.length === 0`.
- Tiles have stagger entrance on first load only (`initial={false}` after mount).
- Day-sheet: framer-motion slide-up, backdrop tap closes, internal scroll.
- Week page: did-apply chip tint:
  - `yes_fully` → `bg-primary/10 text-primary`
  - `partly` → `bg-muted text-muted-foreground`
  - `not_today` → `bg-amber-500/10 text-amber-700 dark:text-amber-400` using the amber accent from tokens.

### API Design

- None new. Contracts from the Grove & Weekly Review feature area (`/api/grove`, `/api/weeks`, `/api/grove/day/[date]`, `/api/weeks/[weekId]`) are consumed unchanged by this refresh.

### UI/Frontend Requirements

**New/modified components:**

- `components/plants/PlantGlyph.tsx` — client component. Renders an SVG based on `variant` prop: `"full" | "partial" | "sapling" | "withered"`. Exported sizes: `sm` (32px), `md` (40px), `lg` (56px). Uses `currentColor` so tokens apply.
  - Full: a stylised rounded tree (full canopy silhouette).
  - Partial: a smaller tree with fewer branches.
  - Sapling: two leaves on a stem.
  - Withered: a curled leaf.
- `app/(app)/grove/page.tsx` — full refresh.
  - `TodayStatus` → card with lucide `Sun` / `Moon` / `Check` icon.
  - Hero number uses `text-5xl font-bold tabular-nums text-primary`.
  - Streak pill uses lucide `Flame` + amber accent.
  - Weekly-review CTA becomes an anchor button with gradient bg — card with `bg-gradient-to-br from-primary to-primary/80` and lucide `Sparkles`.
  - Grove canvas becomes a grid of `<PlantGlyph>` tiles with framer-motion stagger container.
  - `DaySheet` gets spring motion (slide-up with backdrop fade).
- `app/(app)/week/[weekId]/page.tsx` — full refresh.
  - Back link: lucide `ChevronLeft`.
  - Day cards: raised Card primitive, day label, date muted, did-apply chip (Badge primitive) with contextual tint, surah/ayah label, italic mission line, reflection body.
  - Closing card: tinted card with `bg-primary/5 text-primary`.

**Preserved testids:** `month-count`, `streak-badge`, `weekly-review-card`, `empty-grove`, `grove-canvas`, `tree-${date}`, `today-status`, `week-review-header`, `week-reflection-${n}`, `week-closing`.

**New testids:** `plant-glyph-${variant}`, `day-sheet`, `day-sheet-close`, `week-back-link`, `did-apply-chip-${value}`.

### States

- **Grove loading:** muted-foreground "Loading your grove…" (existing copy preserved).
- **Grove empty:** `[data-testid="empty-grove"]` card with sprout icon + existing copy "Your first tree will appear tonight after your evening reflection."
- **Grove populated:** hero count + streak + CTA + canvas with tiles.
- **Day sheet open:** slide-up drawer with dimmed backdrop; internal scroll.
- **Week loading:** "Loading your week…" (existing copy preserved).
- **Week populated:** 7 day-cards + closing card.

### Architecture Notes

- **New dependencies:** none. `framer-motion` and `lucide-react` are already introduced by Story 1 of the visual refresh.
- **Dependencies & integration:** depends on Story 1 (design tokens, shadcn primitives — Card, Badge, Button — and motion primitives). Uses the same backend contracts unchanged.
- **Session-scoped stagger:** first-load-only stagger is tracked via in-memory `useRef` / mount flag; `framer-motion` `initial={false}` after mount ensures re-entries within the same session skip the reveal.
- **Reduced motion:** `useReducedMotion()` from framer-motion disables the stagger container variants when set.

### Exemplar Files

- `origin/main:components/GardenPlant.tsx` — reference for SVG plant shape ideas (not copied; simpler four-variant set here).
- `origin/main:components/ui/gradient-card.tsx` — reference for gradient-hero CTA styling (simpler variant sufficient here).
- `app/(app)/grove/page.tsx` (current) — existing structure to refresh in place.
- `app/(app)/week/[weekId]/page.tsx` (current) — existing structure to refresh in place.

### Implementation Plan

**Task 1: PlantGlyph SVG component (4 variants)** — medium. Files: `components/plants/PlantGlyph.tsx`. INDEPENDENT.

- Create 4-variant SVG renderer with `size` prop (`sm` | `md` | `lg`).
- Use `currentColor` fills so tokens drive theming.
- Export `data-testid={`plant-glyph-${variant}`}`.

**Task 2: Grove page — hero, streak, CTA, today-status** — medium. Files: `app/(app)/grove/page.tsx`. SEQUENTIAL after Story 1 Tasks 1, 3.

- Swap inline `style` tokens for tailwind token classes.
- Swap `TodayStatus` emoji for lucide icons (`Sun`/`Moon`/`Check`).
- Convert hero count to `text-5xl font-bold tabular-nums text-primary`.
- Streak pill: lucide `Flame`, amber accent, `tabular-nums`.
- Weekly-review CTA: gradient card with lucide `Sparkles`.

**Task 3: Grove canvas — plant tiles with stagger** — small. Same file. SEQUENTIAL after Tasks 1 and 2.

- Replace emoji map with `<PlantGlyph>`.
- Wrap canvas in framer-motion stagger container; `initial={false}` after mount.
- Honour `useReducedMotion()`.

**Task 4: DaySheet motion** — small. Same file. SEQUENTIAL after Task 2.

- Convert DaySheet to framer-motion `AnimatePresence` with spring slide-up.
- Backdrop fade on open/close; internal scroll container.
- Add `data-testid="day-sheet"` and `data-testid="day-sheet-close"`.

**Task 5: Week page refresh** — medium. Files: `app/(app)/week/[weekId]/page.tsx`. SEQUENTIAL after Story 1 Task 3. INDEPENDENT of Tasks 1–4 (can run in parallel).

- Replace inline `style` with Card + Badge primitives.
- Back link uses lucide `ChevronLeft` with `data-testid="week-back-link"`.
- Did-apply chip tinted per value; `data-testid={`did-apply-chip-${value}`}`.
- Closing card tinted with `bg-primary/5 text-primary`.

**Task 6: E2E** — small. Files: `e2e/visual-grove-week.spec.ts`. SEQUENTIAL after Tasks 4 and 5.

- Mock `/api/grove`, `/api/weeks`, `/api/grove/day/[date]`, `/api/weeks/[weekId]` responses via `page.route()`.
- Assert all preserved + new testids present under the scenarios below.
- Preserve and do not modify `e2e/grove-journal.spec.ts`.

### Negative Constraints

- Do NOT change `/api/grove`, `/api/weeks`, `/api/grove/day/[date]`, or `/api/weeks/[weekId]`.
- Do NOT change copy: "Loading your grove…", "Loading your week…", "ayat reflected on this month", "Your first tree will appear tonight after your evening reflection.", "Here's what Allah guided you through this week", "Today's ayah is waiting →", "Come back this evening to reflect →", "Today's tree is planted ✓", "← Back to grove", "Week N — see what Allah guided you through →", "Close".
- Do NOT change emoji-to-variant data mapping beyond rendering (`full`, `partial`, `sapling`, `withered` values remain).
- Do NOT introduce GardenGrove, PlantUnlockModal, or species/stage mechanics from origin/main.
- Do NOT change the existing testids.

### Test Scenarios

**Test 1: Hero count + streak**

- Setup: `/api/grove` returns `{ month_count: 14, streak_days: 6, ... }`.
- Action: visit `/grove`.
- Expected: `[data-testid="month-count"]` shows "14"; `[data-testid="streak-badge"]` visible with "6-day streak".

**Test 2: Empty grove**

- Setup: `/api/grove` returns `{ trees: [], month_count: 0, ... }`.
- Action: visit `/grove`.
- Expected: `[data-testid="empty-grove"]` visible with existing copy; no canvas.

**Test 3: Plant glyph rendering**

- Setup: `/api/grove` returns 4 trees, one of each variant.
- Action: visit `/grove`.
- Expected: `[data-testid="plant-glyph-full"]`, `[data-testid="plant-glyph-partial"]`, `[data-testid="plant-glyph-sapling"]`, `[data-testid="plant-glyph-withered"]` all present.

**Test 4: Day sheet open/close**

- Setup: populated grove.
- Action: click `[data-testid="tree-2026-04-30"]`; then click `[data-testid="day-sheet-close"]`.
- Expected: sheet slides up; closes.

**Test 5: Weekly review page**

- Setup: `/api/weeks/1` returns 7 reflections with mixed `did_apply` values.
- Action: visit `/week/1`.
- Expected: 7 cards; each did-apply chip tinted by value (`yes_fully` → primary-tinted, `partly` → muted, `not_today` → amber-tinted); closing card visible.

**Test 6: Today-status three variants**

- Setup: `/api/grove` returns each of `awaiting_morning | awaiting_evening | complete`.
- Action: visit `/grove` three times.
- Expected: status card shows the correct existing copy and the correct lucide icon (Sun / Moon / Check).

**Test 7: Reduced-motion no stagger**

- Setup: `reducedMotion: "reduce"`.
- Action: visit `/grove` with 6 trees.
- Expected: all tiles render immediately; no per-tile entrance motion.

### Acceptance Criteria

- [ ] PlantGlyph SVG exists with 4 variants and size prop
- [ ] Hero count in `tabular-nums`
- [ ] Streak pill shows lucide `Flame` + `tabular-nums`, hidden at 0
- [ ] Weekly-review CTA uses gradient card with lucide `Sparkles`
- [ ] Day sheet slides up with spring motion; closes on backdrop + X
- [ ] Week page uses Card + Badge primitives; closing card tinted
- [ ] Did-apply chip tints contextually
- [ ] All existing testids preserved; all existing copy preserved
- [ ] `npm run test:e2e` passes with new `visual-grove-week.spec.ts`
- [ ] Both themes render correctly

### Verification

**Backend Tests:** None.

**Browser/UI Testing:**

- Login, visit `/grove`, verify hero count, streak pill, CTA, canvas.
- Tap a tree, verify day sheet.
- Visit `/week/1`, verify 7 cards + closing.
- Toggle dark mode; re-check every surface.
- Mobile Safari viewport; check overflow.

**E2E Tests:**

| Key Scenario                                    | Test file                               | Assigned sub-task |
| ----------------------------------------------- | --------------------------------------- | ----------------- |
| Hero count and streak render correctly          | `e2e/visual-grove-week.spec.ts`         | Task 6            |
| Plant glyphs render for each variant            | `e2e/visual-grove-week.spec.ts`         | Task 6            |
| Day sheet opens and closes                      | `e2e/visual-grove-week.spec.ts`         | Task 6            |
| Today-status three variants                     | `e2e/visual-grove-week.spec.ts`         | Task 6            |
| Week page renders 7 day-cards with tinted chips | `e2e/visual-grove-week.spec.ts`         | Task 6            |
| Empty grove copy preserved                      | `e2e/grove-journal.spec.ts` (preserved) | Task 6            |

**Locator strategies:** existing `month-count`, `streak-badge`, `weekly-review-card`, `empty-grove`, `grove-canvas`, `tree-${date}`, `today-status`, `week-review-header`, `week-reflection-${n}`, `week-closing`; new `plant-glyph-${variant}`, `day-sheet`, `day-sheet-close`, `did-apply-chip-${value}`, `week-back-link`.

### Open Questions

All resolved (see business section above).
