# App Shell — Header + Bottom Nav

**Ticket:** TBD

This story redesigns the two persistent chrome elements that wrap every authenticated screen of the Ghars app: the sticky, scroll-aware top header and the four-destination bottom navigation. The refresh replaces the current flat header and emoji-based nav labels with a quieter, more considered chrome that lets each screen's content — the ayah, the mission, the reflection — lead the experience. No destinations are added, renamed, or removed; only the visual presentation of the chrome changes.

## User Story

As a Ghars user moving through my daily ritual, I want the app chrome to feel calm and polished at the top and the bottom of every screen so the interface never competes with the ayah or my reflection.

## Background & Context

**Current state:**

- The top of each authenticated screen renders a flat, opaque cream bar that sits statically regardless of scroll position.
- The bottom navigation shows four destinations — Today, Grove, Journal, Settings — each labelled with an emoji glyph and plain text. The active destination is indicated only by a colour change on the label.
- Tap targets on the bottom nav are inconsistent in height across devices, and on iOS the nav can be visually crowded by the system home indicator.
- There is no focus ring on nav destinations when they are reached by keyboard.

**Problem:**

- The heavy, opaque header competes with the ayah card for visual weight on the Today screen, which is the single most important surface in the app.
- Emoji-based nav icons render inconsistently across operating-system versions, and they cannot be themed for dark mode.
- The lack of a considered active-state indicator makes it unclear which destination the user is on, particularly after a long scroll.
- The chrome overall reads as "unfinished" in user feedback and is part of why early testers describe the app as prototype-quality.

## Target User & Persona

- **Who:** Any authenticated Ghars user — primarily daily-ritual users who open the app multiple times a day on a mobile phone, and secondarily keyboard and assistive-technology users.
- **Context:** Every in-app navigation event and every scroll on every authenticated screen. The chrome is the single most frequently seen surface in the product.
- **Current workaround:** Users tolerate the current chrome; there is no workaround, but the rough edges are a consistent item in qualitative feedback.

## Goals

- Deliver a sticky top header that is transparent at the top of the page and transitions to a cream-tinted translucent surface with a soft bottom border and gentle blur as the user scrolls.
- Deliver a bottom navigation with lucide iconography, a subtle active-pill indicator behind the current destination, and tap targets of at least 44 x 44 px.
- Make both chrome elements dark-theme-ready so that no bright white surface leaks through at night.
- Respect the user's reduced-motion preference on all chrome transitions.
- Respect the iOS home-indicator safe-area so the bottom nav is never visually overlapped.

## Non-Goals

- No new destinations in the bottom nav. The set remains exactly Today, Grove, Journal, Settings.
- No renaming of any nav destination.
- No radial, flower, or floating-action-button nav variant.
- No changes to the content of any screen the chrome wraps — this story touches only the chrome itself.
- No changes to any screen's routing, data, or behaviour.

## User Workflow

1. **Morning open of Today** — The user opens the app on Today. The sticky header sits at the top of the screen showing the Ghars logo on the left and the Arabic wordmark beside it. The header is transparent, so the cream page colour shows through it. No back-chevron is visible because the user is already on Today. The bottom nav is pinned to the bottom of the viewport, the Today destination is visually highlighted by a soft active-pill behind its icon and label, and the other three destinations sit quietly beside it.
2. **Scrolling the ayah and tafsir** — As the user scrolls down to read the translation and tafsir, the header transitions smoothly from transparent to a cream-tinted translucent surface with a soft bottom border and gentle blur, so the header stays legible over whatever scrolls behind it. The bottom nav does not change.
3. **Navigating to Grove** — The user taps the Grove destination in the bottom nav. The active-pill animates from behind the Today icon to behind the Grove icon. The Grove screen loads. The header now shows a back-chevron to the left of the logo, offering a one-tap return to Today.
4. **Scrolling a long journal list** — The user taps Journal and scrolls a long list of past entries. The header stays pinned at the top of the viewport and keeps its blurred translucent state for the whole scroll. Scrolling back up to the top of the list returns the header to its transparent state.
5. **iOS home-indicator clearance** — On an iPhone with a home indicator, the bottom nav sits just above the indicator with a clear gap, so the four destinations are never visually crowded by or overlapped by the system chrome.
6. **Keyboard navigation** — A keyboard user presses Tab. Focus moves through the four bottom-nav destinations in order, and each destination shows a visible focus ring while it has focus. Pressing Enter or Space activates the focused destination.
7. **Landing and onboarding** — When the user visits the public marketing landing page, or steps through the onboarding flow, neither the sticky header nor the bottom nav is visible. The chrome appears only once the user is inside the authenticated app.

## Acceptance Criteria

### Scenario: Header starts transparent at the top of an authenticated screen

```gherkin
Given the user is signed in and viewing Today
  And the page has not been scrolled
When the user looks at the top of the screen
Then the sticky header is visible
  And the header appears transparent so the cream page colour shows through it
  And the Ghars logo and the Arabic wordmark are visible on the left
  And no back-chevron is shown
```

### Scenario: Header transitions to a translucent blurred state when the user scrolls

```gherkin
Given the user is signed in and viewing Today
  And the page has not been scrolled
When the user scrolls the page downward past the scroll threshold
Then the header transitions to a cream-tinted translucent surface
  And a soft bottom border appears under the header
  And content scrolling under the header reads as gently blurred
```

### Scenario: Header returns to transparent when the user scrolls back to the top

```gherkin
Given the user is signed in and viewing a Journal list scrolled near the bottom
  And the header is currently in its translucent blurred state
When the user scrolls back up until the top of the page is reached
Then the header returns to its transparent state
  And the soft bottom border is no longer visible
```

### Scenario: Bottom nav shows an active indicator on the current destination only

```gherkin
Given the user is signed in and viewing Grove
When the user looks at the bottom nav
Then the Grove destination shows the active-pill indicator behind its icon and label
  And the Today, Journal, and Settings destinations do not show the active-pill indicator
```

### Scenario: Tapping a bottom-nav destination navigates and moves the active-pill

```gherkin
Given the user is signed in and viewing Today
  And the active-pill is behind the Today destination
When the user taps the Journal destination in the bottom nav
Then the Journal screen is shown
  And the active-pill moves to sit behind the Journal destination
  And no other destination shows the active-pill
```

### Scenario: Back-chevron is shown on authenticated screens other than Today

```gherkin
Given the user is signed in and viewing Grove
When the user looks at the top of the screen
Then the header shows a back-chevron to the left of the Ghars logo
When the user taps the back-chevron
Then the Today screen is shown
```

### Scenario Outline: Back-chevron visibility per authenticated screen

```gherkin
Given the user is signed in and viewing <screen>
When the user looks at the top of the screen
Then the back-chevron is <chevron state>

Examples:
  | screen         | chevron state |
  | Today          | hidden        |
  | Grove          | visible       |
  | Journal        | visible       |
  | Settings       | visible       |
  | Weekly Review  | visible       |
  | Reflect        | visible       |
```

### Scenario: Logout control is shown on the right of the header for signed-in users

```gherkin
Given the user is signed in and viewing any authenticated screen
When the user looks at the top of the screen
Then a logout control is visible on the right side of the header
```

### Scenario: Header and bottom nav are hidden on the public marketing landing page

```gherkin
Given the user is not signed in and is viewing the marketing landing page
When the user looks at the top and bottom of the screen
Then no sticky header is visible
  And no bottom navigation is visible
```

### Scenario: Header and bottom nav are hidden during onboarding

```gherkin
Given the user has just completed sign-up
  And the user is stepping through the onboarding flow
When the user looks at the top and bottom of the screen
Then no sticky header is visible
  And no bottom navigation is visible
```

### Scenario: iOS home-indicator safe-area is respected

```gherkin
Given the user is signed in on an iPhone that shows a home indicator at the bottom of the screen
  And the user is viewing Today
When the user looks at the bottom nav
Then the four nav destinations sit clear of the home indicator
  And none of the nav icons or labels are visually overlapped by the home indicator
```

### Scenario: Every nav destination meets the minimum touch-target size

```gherkin
Given the user is signed in and viewing Today on a phone
When the user attempts to tap near the edge of any bottom-nav destination
Then the tap is accepted as long as it falls within an area at least 44 by 44 points
  And the tapped destination activates
```

### Scenario: Keyboard user can reach and activate each nav destination

```gherkin
Given the user is signed in and viewing Today using a physical keyboard
  And no element currently has focus
When the user presses Tab repeatedly
Then focus moves through the four bottom-nav destinations in order
  And each destination shows a visible focus ring while it has focus
When the user presses Enter while the Journal destination has focus
Then the Journal screen is shown
```

### Scenario: Reduced-motion user sees state changes without the transition animation

```gherkin
Given the user has enabled reduced motion in their operating-system settings
  And the user is signed in and viewing Today
When the user scrolls past the scroll threshold
Then the header appears in its translucent blurred state immediately without an animated transition
When the user taps the Grove destination in the bottom nav
Then the active-pill appears behind the Grove destination immediately without a sliding animation
```

### Scenario: Dark-mode user sees a dark-tinted translucent header, not a cream one

```gherkin
Given the user has chosen the dark theme
  And the user is signed in and viewing Today
When the user scrolls past the scroll threshold
Then the header transitions to a dark-tinted translucent surface
  And no cream, white, or bright surface leaks through the header
  And the Ghars logo and Arabic wordmark remain legible against the dark surface
```

### Scenario: Header stays pinned during long scrolls

```gherkin
Given the user is signed in and viewing a Journal list with many entries
When the user scrolls continuously from the top of the list to the bottom
Then the header stays pinned at the top of the viewport throughout the scroll
  And the header remains in its translucent blurred state
```

### Scenario: Arabic wordmark falls back gracefully when its webfont has not loaded

```gherkin
Given the user opens the app on a connection where the Arabic webfont has not yet loaded
When the header first renders
Then the Arabic wordmark is still shown as readable Arabic text
  And the header layout is not visibly broken
When the Arabic webfont finishes loading
Then the Arabic wordmark switches to the designated Arabic typeface without shifting the header layout
```

## Business Rules & Constraints

- The sticky header and the bottom navigation are hidden on exactly two surfaces: the public marketing landing page, and the onboarding flow. Every other screen shows both.
- The sticky header is transparent while the page is at its scroll origin and transitions to a tinted translucent surface with a soft bottom border and gentle blur once the user has scrolled past a small threshold. The reverse transition happens when the user scrolls back to the top.
- The back-chevron in the header is shown on every authenticated screen except Today. On Today, the chevron is hidden to keep the morning surface as quiet as possible.
- The bottom nav contains exactly four destinations in fixed order: Today, Grove, Journal, Settings. No destination is added, removed, or renamed by this story.
- Exactly one bottom-nav destination shows the active-pill indicator at any time — the destination matching the current screen.
- The active-pill indicator animates between destinations only when reduced motion is not active. Under reduced motion, the pill appears in its new position immediately without a sliding animation.
- The transition between the header's transparent and translucent states is animated only when reduced motion is not active. Under reduced motion, the state change is applied immediately.
- Every bottom-nav destination presents a tap area of at least 44 x 44 points, even when the visible icon and label are smaller.
- Every bottom-nav destination shows a visible focus ring when reached by keyboard, in both light and dark themes.
- The bottom nav respects the device safe-area at the bottom of the screen so that, on devices with a home indicator, the nav sits clear of the indicator.
- The header respects the user's chosen theme: in light theme the translucent surface reads as cream-tinted; in dark theme it reads as dark-tinted. No bright surface is rendered when the user is in dark mode.
- The Arabic wordmark renders in the app's designated Arabic typeface once that typeface is available. Before it loads, the wordmark renders in a readable fallback without causing visible layout shift when the typeface arrives.
- No ad-hoc hex values are introduced by this story; all colours come from the token layer shipped in the foundation story.

## Success Metrics

- Time-to-first-tap on the bottom nav from a cold open of the app does not regress against the pre-refresh baseline.
- The rate of mis-taps between adjacent bottom-nav destinations (measured as consecutive destination taps within two seconds) does not increase against the pre-refresh baseline.
- Post-launch qualitative feedback from the early-tester cohort confirms the chrome feels "lighter", "calmer", or "more professional" — captured in the two-week post-reflection prompt run alongside the epic-wide visual-quality rating.
- Zero regressions in navigation flows: users can still reach Today, Grove, Journal, and Settings from any authenticated screen in one tap.
- In reduced-motion mode, users can complete a full navigation loop (Today to Grove to Journal to Settings and back to Today) without seeing any non-essential animation.

## Dependencies

- Story 1 (Design system foundation) must be merged first so the token layer, icon set, and shadcn-style primitives are available for this story to consume.
- The Ghars logo asset must be available in a resolution-independent form from the brand file.
- The Arabic wordmark glyph must be available, with a graceful text fallback agreed for the window before the Arabic typeface has loaded.
- Product confirmation of the four-destination bottom nav set (Today, Grove, Journal, Settings) in its current order — carried over from the current app without change.

## Open Questions

- [x] ~~Should this story introduce a radial or flower-menu nav variant?~~ — **Resolved:** No. The epic explicitly defers that prototype. The four-destination horizontal bottom nav stays.
- [x] ~~Should the Today screen show a back-chevron?~~ — **Resolved:** No. Today is the home surface and shows no back-chevron; every other authenticated screen shows one.
- [x] ~~Should emoji be retained as fallback icons in the bottom nav?~~ — **Resolved:** No. The epic mandates lucide iconography across the product for theme consistency.

---

## Technical Detail

### Functional Requirements

- Bottom nav: four destinations Today / Grove / Journal / Settings. Icons switch from emoji to lucide (`BookOpen` for Today, `Trees` for Grove, `Notebook` for Journal, `Settings` for Settings). Active tab gets a pill background consuming `--primary` with primary-foreground text/icon.
- Sticky header: height 48px; transparent at scrollY 0; at scrollY > 24, background becomes `var(--cream-mist)` with `backdrop-filter: blur(14px)` and a bottom border `var(--border)`. Left: Ghars logo (`/logo.png`, 24×24) + wordmark "Ghars" + Arabic glyph "غَرْس" (uses `.arabic-text`). Right: logout button (form POST to `/api/auth/logout`).
- Back chevron (lucide `ArrowLeft`) appears on every authenticated screen except `/today`.
- Both chrome elements hidden on `/`, `/onboarding`, `/onboarding/preferences`, `/callback`.
- Safe-area: bottom nav uses `padding-bottom: env(safe-area-inset-bottom)`.
- Reduced-motion: header scroll transition uses instant swap rather than animated transition.

### Permissions & Security

- Logout POSTs to `/api/auth/logout` (existing route). No new auth surface.

### API Design

- None. This story is shell-only.

### UI/Frontend Requirements

**New components:**

- `components/AppHeader.tsx` — sticky, scroll-aware, `"use client"`. Uses `useScroll`, `useMotionValueEvent` from framer-motion. Hides on `HIDE_ON = ["/", "/onboarding", "/onboarding/preferences", "/callback"]`.
- `components/BottomNav.tsx` — `"use client"`. Renders four nav items with lucide icons. Active detection via `usePathname().startsWith(href)`. Pill indicator uses `motion.div` with `layoutId="active-pill"` for shared-element animation; falls back to a static element under `useReducedMotion()`.

**Modified files:**

- `app/(app)/layout.tsx` — replaces the emoji nav; wraps children with `<AppHeader />` above and `<BottomNav />` below. Preserves the existing `data-testid="bottom-nav"` and `data-testid="nav-today|grove|journal|settings"` attributes to keep E2E tests green.

**Props:**

```typescript
interface AppHeaderProps {
  className?: string;
}
interface BottomNavProps {
  // no props — reads pathname internally
}
```

**States:**

- Header at scrollY 0: transparent, no border.
- Header at scrollY > 24: `var(--cream-mist)` bg, blurred, bottom border.
- Bottom nav active tab: pill bg-primary, icon + label in `--primary-foreground`.
- Bottom nav inactive tab: icon + label in `--muted-foreground`.

### Architecture Notes

- **New dependencies:** none.
- **Dependencies & integration:** depends on Story 1 (tokens, lucide already installed, framer-motion already installed). Consumed by every `/today`, `/grove`, `/journal`, `/week/[weekId]`, `/settings` screen via `app/(app)/layout.tsx`.

### Exemplar Files

- `origin/main:components/AppHeader.tsx` — reference for the `useScroll` + `useMotionValueEvent` pattern.
- `origin/main:components/RadialNav.tsx` is NOT the pattern — this story uses a flat bottom nav, not radial (excluded by epic).

### Implementation Plan

**Task 1: BottomNav component** — small. Files: `components/BottomNav.tsx`. SEQUENTIAL after Story 1 Task 3 (needs lucide icons conventionally sized).

**Task 2: AppHeader component** — small. Files: `components/AppHeader.tsx`. INDEPENDENT of Task 1.

**Task 3: Wire both into (app) layout** — small. Files: `app/(app)/layout.tsx`. SEQUENTIAL after Tasks 1 and 2.

**Task 4: E2E shell test** — small. Files: `e2e/visual-app-shell.spec.ts`. SEQUENTIAL after Task 3.

### Negative Constraints

- Do NOT change any existing `data-testid` on the nav (`bottom-nav`, `nav-today`, `nav-grove`, `nav-journal`, `nav-settings`).
- Do NOT add the header or nav to marketing/onboarding/callback routes.
- Do NOT introduce a RadialNav or flower menu.
- Do NOT modify `proxy.ts`.

### Test Scenarios

**Test 1: Active state on current tab**
- Setup: at `/today`.
- Action: render.
- Expected: `nav-today` has the active pill styling; others do not.

**Test 2: Scroll-aware header transition**
- Setup: any authenticated page with content taller than viewport.
- Action: scroll 100px down.
- Expected: header background is `var(--cream-mist)` with blur; bottom border visible.

**Test 3: Hidden on excluded routes**
- Setup: navigate to `/`, `/onboarding`, `/onboarding/preferences`, `/callback`.
- Action: render.
- Expected: no header, no bottom nav in DOM.

**Test 4: Back chevron visibility**
- Setup: navigate to `/grove`.
- Action: render.
- Expected: back chevron visible on the left of the logo, linking to `/today`. On `/today`, no chevron.

**Test 5: Keyboard Tab cycle**
- Setup: on `/today`.
- Action: Tab through nav.
- Expected: every nav item receives focus with the `:focus-visible` outline from Story 1.

### Acceptance Criteria

- [ ] Bottom nav renders lucide icons (not emoji) for all four destinations
- [ ] Active-pill animates between tabs via framer-motion `layoutId` (or static under reduced-motion)
- [ ] Header transitions at scrollY > 24 threshold
- [ ] Header back-chevron visible on every authenticated screen except `/today`
- [ ] Shell hidden on `/`, `/onboarding`, `/onboarding/preferences`, `/callback`
- [ ] Safe-area inset honoured
- [ ] `npm run test:e2e` passes with the new shell test added
- [ ] All existing E2E tests pass unchanged
- [ ] Works in both themes

### Verification

**Backend Tests:** None.

**Browser/UI Testing:**
- URL `http://localhost:3000`. Login via `/api/demo/start`.
- Steps:
  1. Land on `/today`; verify header transparent, bottom nav visible, Today tab has active pill, no back chevron.
  2. Scroll down; verify header goes cream-mist + blurred.
  3. Tap Grove; verify navigation, active pill moves to Grove, back chevron appears.
  4. Visit `/week/1`; verify same shell applies.
  5. Visit `/` signed-out; no shell.
  6. iOS Mobile Safari viewport (in Playwright): bottom nav sits above the home indicator.

**E2E Tests:**
| Key Scenario | Test file | Assigned sub-task |
|---|---|---|
| Nav destinations render lucide icons and reflect active state | `e2e/visual-app-shell.spec.ts` | Task 4 |
| Header transitions between transparent and blurred | `e2e/visual-app-shell.spec.ts` | Task 4 |
| Shell hidden on marketing landing and onboarding | `e2e/visual-app-shell.spec.ts` | Task 4 |
| Back chevron hidden on `/today`, visible elsewhere | `e2e/visual-app-shell.spec.ts` | Task 4 |
| Existing Today flow passes unchanged | `e2e/today-flow.spec.ts` | Task 4 |

**Locator strategies:**
- Nav buttons: existing `data-testid="nav-today|grove|journal|settings"` (preserve).
- Nav container: existing `data-testid="bottom-nav"`.
- Header: `data-testid="app-header"` (new).
- Back chevron: `data-testid="header-back"` (new).

### Open Questions

All resolved in the business spec.
