# Dark Mode

**Ticket:** TBD

Dark mode delivers a fully-supported dark theme across every surface of Ghars, controlled by a new Theme section in Settings that offers System, Light, and Dark. Evening-reflection users who open the app in dim rooms get a comfortable, low-glare experience that matches their device preference by default. No other behaviour, copy, or flow changes — only what the user sees.

## User Story

As a Ghars reader doing my evening reflection in a low-light room, I want the app to match my device's dark mode so I can reflect without straining my eyes or disturbing the people around me.

## Background & Context

**Current state:**

- Every screen renders on a bright cream background with flat white cards, regardless of time of day or device preference.
- Night-time readers dim their device manually, or put off the evening reflection until the next morning, because the app is uncomfortable to look at in bed.
- There is no theme control anywhere in Settings; the app has one visual mode and one only.

**Problem:**

- The product's core loop has a deliberate evening touchpoint (reflect on today's mission, plant today's tree). A bright cream screen between 20:00 and 22:30 is a consistent friction point that nudges users to skip that touchpoint.
- Users have said the lack of dark mode makes the app feel less considered than mature Islamic lifestyle apps, which costs credibility in early testing.
- Evening-reflection completion is measurably below morning-read engagement, and qualitative feedback points to screen brightness as one contributing reason.

## Target User & Persona

- **Who:** A Ghars reader who completes the daily loop across two sittings — a morning ayah read in good light, and an evening reflection in a dim bedroom.
- **Context:** Between 20:00 and 22:30, often in bed, often with the device-wide dark mode already on, often with a partner or child asleep nearby. The user wants low glare, quiet warmth, and legible Arabic.
- **Current workaround:** Turns device brightness down, uses the system-level screen-dimming shortcut, or postpones the reflection to the next morning. Some users have explicitly asked for dark mode in feedback.

## Goals

- Give every surface of the app a considered dark presentation that feels warm and earthy, not neon or OLED-black.
- Put the user in control with a simple three-option Theme setting (System, Light, Dark) that persists across sessions on the same device.
- Keep the choice effortless by defaulting to System so users who already prefer dark at the OS level get the comfortable experience on first open, with no setup required.
- Preserve every existing flow, every piece of copy, and every API call unchanged.

## Non-Goals

- No theme options beyond System, Light, and Dark. No OLED-pure-black, no sepia, no per-user custom palettes.
- No time-of-day automatic switch (e.g. "dark after sunset"). The only automatic mechanism is honouring the device's own preference when System is selected.
- No per-screen theme overrides. The theme is a single global choice.
- No copy changes and no new user flows beyond the Theme control itself.

## User Workflow

1. **Opening Settings** — The user opens Settings and sees a new Theme section near the top of the page with three clearly-labelled options: System, Light, and Dark. On first visit, System is pre-selected.
2. **Choosing a theme** — The user taps Dark. Every surface of the app — the header, the ayah card, the mission card, the reflection textarea, the grove canvas, the bottom nav, any open drawer or modal — shifts to the dark palette immediately. No page reload, no confirmation dialog.
3. **Returning later** — The user closes the app and reopens it the next morning on the same device. The app opens in Dark, exactly as they left it.
4. **Switching to System** — The user returns to Settings and taps System. The app now follows the device preference: if the device is in light mode, the app is in light mode; if the device is in dark mode, the app is in dark mode.
5. **Device preference changes mid-session** — The user's device is set to auto-darken at sunset. While the user is on the Today screen with System selected, sunset arrives and the device switches to dark. The app transitions to dark in the same moment, without requiring the user to reopen it.

## Acceptance Criteria

### Scenario: User sets dark theme from Settings

```gherkin
Given Aisha is on Settings at 21:15 on a Tuesday
  And her Theme is currently set to System
  And her device is in light mode
When Aisha taps "Dark" in the Theme section
Then the Theme section shows Dark as the selected option
  And the Settings screen renders in the dark theme
  And the bottom nav, header, and any visible cards on Settings render in the dark theme
```

### Scenario: User's Dark choice persists across sessions on the same device

```gherkin
Given Yusuf chose Dark in Settings on Monday evening
  And Yusuf has since closed the app
When Yusuf reopens the app on the same device on Tuesday morning
Then the app opens in the dark theme
  And the Theme section in Settings still shows Dark as the selected option
```

### Scenario: System option follows the device's current preference

```gherkin
Given Zainab's device is currently in dark mode
  And Zainab's Theme is set to System
When Zainab opens the app
Then every surface Zainab visits renders in the dark theme
  And the Theme section in Settings shows System as the selected option
```

### Scenario: App reacts immediately when the device preference changes mid-session

```gherkin
Given Zainab is reading the ayah on the Today screen
  And Zainab's Theme is set to System
  And Zainab's device is currently in light mode
When Zainab's device switches to dark mode because the sun has set and she has auto-dark scheduled
Then the Today screen transitions to the dark theme in the same moment
  And Zainab does not need to close or reopen the app
  And the ayah card, mission card, and bottom nav all render in the dark theme
```

### Scenario: Explicit Light choice overrides a dark device preference

```gherkin
Given Yusuf prefers the app to always be light, even at night
  And Yusuf's device is currently in dark mode
When Yusuf opens Settings and taps "Light"
Then the app renders in the light theme
  And the app continues to render in the light theme when Yusuf navigates to Today, Reflect, Grove, and Journal
  And the app stays in the light theme when Yusuf reopens it the next day with the device still in dark mode
```

### Scenario: Explicit Dark choice overrides a light device preference

```gherkin
Given Aisha prefers the app to always be dark, even during the day
  And Aisha's device is currently in light mode
When Aisha opens Settings and taps "Dark"
Then the app renders in the dark theme
  And the app continues to render in the dark theme when Aisha navigates to Today, Reflect, Grove, and Journal
  And the app stays in the dark theme when Aisha reopens it the next day with the device still in light mode
```

### Scenario: Switching from an explicit choice back to System

```gherkin
Given Aisha previously selected Dark as her explicit Theme
  And Aisha's device is currently in light mode
When Aisha opens Settings and taps "System"
Then the app transitions to the light theme, matching her device
  And the Theme section shows System as the selected option
  And if Aisha later changes her device to dark mode, the app follows the device into dark mode
```

### Scenario: Arabic verse remains legible in dark mode

```gherkin
Given Aisha is on the Today screen in the dark theme
When Aisha reads the ayah card
Then the Arabic verse is clearly legible against the ayah card surface
  And the translation text below the Arabic is clearly legible
  And the tafsir extract, when expanded, is clearly legible
  And the body text contrast in the dark theme meets the WCAG AA standard
```

### Scenario: Reflection textarea remains usable in dark mode

```gherkin
Given Aisha is on the Reflect view in the dark theme at 21:20
When Aisha types her reflection into the "What happened?" textarea
Then the textarea is clearly distinguishable from its surrounding card
  And her typed characters are clearly legible
  And the character count is clearly legible
  And the disabled-until-minimum submit state is visibly distinct from the enabled state
```

### Scenario: Amber celebration moment reads as warm, not neon, in dark mode

```gherkin
Given Aisha is on the Today screen in the dark theme
  And Aisha has just chosen a mission
When Aisha taps the commit button and the amber celebration plays
Then the amber accent appears warm and earthy against the dark surface
  And the amber accent does not appear harsh, oversaturated, or glowing in a way that feels out of place
  And the "Committed ✓" state that follows renders cleanly in the dark theme
```

### Scenario: Streak pill and grove plant glyphs feel earthy in dark mode

```gherkin
Given Zainab is on the Grove screen in the dark theme
  And Zainab has a current streak of 12 days
When Zainab views the grove
Then the streak pill is clearly legible with a warm, earthy tone
  And the plant glyphs on the grove canvas are clearly distinguishable from the background
  And the plant glyphs feel warm and earthy rather than neon or glowing
  And tapping a plant glyph opens the day-view drawer in the dark theme
```

### Scenario: Audio progress bar remains readable in dark mode

```gherkin
Given Aisha is on the Today screen in the dark theme
When Aisha plays the ayah audio
Then the progress bar is clearly distinguishable from the ayah card surface
  And the filled portion of the progress bar is clearly distinguishable from the unfilled portion
  And the play and pause controls are clearly legible
```

### Scenario: Bottom nav active state is clear in dark mode

```gherkin
Given Yusuf is on the Journal tab in the dark theme
When Yusuf looks at the bottom nav
Then the Journal icon and label are shown in the active state
  And the active state is visibly distinct from the inactive tabs
  And Yusuf can tell at a glance which tab he is on
```

### Scenario: Ayah card surface feels lifted, not flat pure black

```gherkin
Given Aisha is on the Today screen in the dark theme
When Aisha views the ayah card
Then the ayah card surface is visibly lifted from the page background
  And the page background is not pure black
  And the ayah card is not pure black
  And the overall impression is warm and atmospheric rather than stark
```

### Scenario: Theme transition respects reduced-motion preference

```gherkin
Given Aisha has reduced motion enabled at the device level
  And Aisha is on Settings in the light theme
When Aisha taps "Dark"
Then the app switches to the dark theme
  And the switch does not play a crossfade, slide, or other non-essential animation that violates the reduced-motion preference
  And Aisha still sees that the change has taken effect
```

### Scenario: Drawers and modals honour the active theme

```gherkin
Given Aisha is on the Today screen in the dark theme
When Aisha taps "Read full tafsir" to open the tafsir drawer
Then the drawer opens in the dark theme
  And the drawer's surface is visibly lifted from the Today screen behind it
  And no part of the drawer appears as a bright white rectangle
```

### Scenario Outline: Each theme option renders each surface in the expected palette

```gherkin
Given the user has selected "<theme>" in Settings
  And the user's device preference is "<device>"
When the user navigates to "<surface>"
Then the surface renders in the "<expected>" theme

Examples:
  | theme  | device | surface  | expected |
  | System | light  | Today    | light    |
  | System | light  | Reflect  | light    |
  | System | light  | Grove    | light    |
  | System | light  | Journal  | light    |
  | System | light  | Settings | light    |
  | System | dark   | Today    | dark     |
  | System | dark   | Reflect  | dark     |
  | System | dark   | Grove    | dark     |
  | System | dark   | Journal  | dark     |
  | System | dark   | Settings | dark     |
  | Light  | light  | Today    | light    |
  | Light  | dark   | Today    | light    |
  | Light  | dark   | Grove    | light    |
  | Dark   | light  | Today    | dark     |
  | Dark   | light  | Reflect  | dark     |
  | Dark   | dark   | Journal  | dark     |
```

## Business Rules & Constraints

- On a user's very first visit to Settings, the Theme control is pre-selected to System. The app honours the device's current preference until the user expresses an explicit choice.
- An explicit choice of Light or Dark overrides the device preference and remains in effect on that device until the user changes it — including across app reopens, device restarts, and changes to the device preference.
- When System is selected, the app follows the device's current preference in real time. If the device preference changes while the app is open, the app's theme updates in the same moment without requiring a reopen.
- The user's theme choice is remembered on the device the choice was made on. Choices do not need to synchronise across devices for this story.
- Body text in both themes must meet the WCAG AA contrast standard. The Arabic verse, the translation, the tafsir, and the reflection textarea content must all be clearly legible against their surfaces.
- In dark mode, the amber accent used for the commit celebration and other warmth moments may be slightly desaturated relative to the light-mode amber, so that it reads as warm and earthy rather than harsh or glowing.
- In dark mode, the ayah card surface must feel visibly lifted from the page background. A subtle gradient or raised tone is acceptable; a pure-black card on a pure-black page is not.
- No surface of the app — header, bottom nav, cards, drawers, modals, overlays, onboarding screens, landing page — may render as a bright white rectangle when the active theme is dark.
- Switching between themes does not alter any copy, any icon, any button label, any flow, or any stored user data. Only the palette changes.
- The theme swap itself must respect the user's reduced-motion preference. When reduced motion is active, the app still updates to the new theme but does not play a non-essential transition animation.

## Success Metrics

- Evening-reflection completion rate (reflections submitted after 18:00 local time) rises by at least 10% in the four weeks after dark mode ships, compared with the four weeks before.
- The share of users who set an explicit Light or Dark preference in their first month of use is measured, so Product can understand how often users override System and in which direction.
- The share of in-app post-reflection feedback responses that mention a readability issue in dark mode does not exceed the share that mention a readability issue in light mode.
- Zero surfaces in the app render as a bright white rectangle when the active theme is dark, measured via a pre-release design audit across Today, Reflect, Grove, Weekly Review, Journal, Settings, Onboarding, Landing, the header, the bottom nav, all drawers, and all modals.

## Dependencies

- Story 1 (Design system foundation) must ship first. The token layer it lands is the mechanism this story maps to a second set of values for dark.
- Design sign-off on the dark palette, including the dark-mode amber tuning and the lifted ayah-card surface treatment, before this story starts.
- Contrast audit of the dark palette against WCAG AA for body text, verse text, translation text, tafsir text, reflection textarea content, the streak pill, and the bottom-nav active state — signed off by design before this story starts.

## Open Questions

- [x] ~~Should the dark-mode toggle default to the user's system preference, or to light with an explicit opt-in?~~ — **Resolved:** Default to System. Rationale: it matches the user's existing device expectation, it is one fewer decision on first open, and users whose device is already in dark mode get the comfortable evening experience immediately without any setup. Users who prefer the light cream palette regardless of device can opt in to Light explicitly, and users who want dark permanently can opt in to Dark explicitly.

---

## Functional Requirements

- **Theme states:** `system` | `light` | `dark`. Default is `system`.
- **Persistence:** User's choice is persisted in `localStorage` under the key `ghars_theme`. Read synchronously in an inline `<script>` in the `<head>` of `app/layout.tsx` BEFORE React hydrates, to avoid a light to dark flash on navigation or reload.
- **DOM hook:** When the resolved theme is `dark`, the root `<html>` element receives the class `dark`. When the resolved theme is `light`, the class is removed. Tailwind v4 `dark:` variants apply via this class (Tailwind v4's default dark-mode strategy keyed on the `.dark` selector).
- **System reactivity:** When `theme === "system"`, a `matchMedia("(prefers-color-scheme: dark)")` listener updates the `<html>` class immediately on device preference change, with no reload required.
- **Atomicity:** The theme swap is a single class mutation on `<html>` — `classList.add("dark")` or `classList.remove("dark")`. Every token-bound surface reflows in the same paint.
- **Idempotency:** Re-applying the same theme (e.g. tapping "Dark" while already in dark) is a no-op — the class is already present, the `localStorage` value is already set, and no re-render is forced.

### Validation & Business Rules

- Only the literal string values `"system"`, `"light"`, `"dark"` are accepted in `localStorage.ghars_theme`. Any other value (e.g. `"sepia"`, `""`, `null`, a JSON blob) is treated as `"system"` AND `localStorage.ghars_theme` is cleared so the invalid value is not observed on subsequent loads.
- When no `localStorage.ghars_theme` entry exists on first visit, the default is `"system"` and no value is written to storage until the user expresses an explicit choice.
- Setting `theme` to `"system"` from an explicit choice clears any `<html>.dark` class state that conflicts with the current `matchMedia` result and re-applies the resolved class in the same tick.

## Permissions & Security

- **Scope:** Client-only. No API route, no server action, no cookie.
- **Authorization:** N/A — dark mode is a per-device, unauthenticated preference.
- **Input validation:** Only the three literal string values (`"system"`, `"light"`, `"dark"`) are accepted; the inline script and the `ThemeProvider` both defensively coerce unknown values to `"system"` and clear storage.

## API Design

- None. Dark mode is entirely client-side. No endpoint is added, modified, or called.

## UI/Frontend Requirements

### New components

**`ThemeProvider`** — `components/ui/theme-provider.tsx`

- **Type:** New (client component, `"use client"`).
- **Purpose:** Reads `localStorage["ghars_theme"]` on mount, subscribes to `matchMedia("(prefers-color-scheme: dark)")`, and applies/removes the `dark` class on `document.documentElement`. Exposes a `useTheme()` hook returning `{ theme, setTheme, resolvedTheme }` via React context.
- **Props:**

  ```typescript
  interface ThemeProviderProps {
    children: React.ReactNode;
  }

  type Theme = "system" | "light" | "dark";
  type ResolvedTheme = "light" | "dark";

  interface ThemeContextValue {
    theme: Theme;
    setTheme: (next: Theme) => void;
    resolvedTheme: ResolvedTheme;
  }
  ```

**`ThemePicker`** — `components/ui/theme-picker.tsx`

- **Type:** New (client component).
- **Purpose:** A three-button segmented control (System / Light / Dark). Uses the `Button` primitive from Story 1 and lucide icons (`Monitor`, `Sun`, `Moon`). Calls `setTheme()` from `useTheme()` on tap. Visually reflects the current `theme` (not `resolvedTheme`) as the selected segment.
- **Testids:** `data-testid="theme-system"`, `data-testid="theme-light"`, `data-testid="theme-dark"` on the three buttons respectively.

### Modified files

- **`app/layout.tsx`** — render `<ThemeProvider>` around `{children}`; add an inline `<script>` in `<head>` (using `dangerouslySetInnerHTML`) that reads `localStorage.ghars_theme`, resolves `"system"` via `matchMedia`, and synchronously sets `document.documentElement.classList.add("dark")` BEFORE the body paints, to eliminate FOUC on reload.
- **`app/globals.css`** — add a `.dark { ... }` block (outside `:root`) mapping every semantic token from Story 1 to its dark-palette counterpart. Values:
  - `--background: #0f1a15`
  - `--foreground: #e8ebe6`
  - `--card: #18251f`
  - `--card-foreground: #e8ebe6`
  - `--primary: #52b788`
  - `--primary-foreground: #0f1a15`
  - `--secondary: #1f3329`
  - `--secondary-foreground: #e8ebe6`
  - `--muted: #1f3329`
  - `--muted-foreground: #9aa79e`
  - `--accent: #d4a017`
  - `--accent-foreground: #0f1a15`
  - `--border: rgba(82, 183, 136, 0.22)`
  - `--input: rgba(82, 183, 136, 0.22)`
  - `--ring: #52b788`
  - `--destructive: #ef4444`
  - Atmospheric extras: `--cream-deep: #18251f`, `--cream-mist: rgba(24, 37, 31, 0.55)`, `--ink-soft: #a4b0a8`, `--green-fog: rgba(82, 183, 136, 0.12)`.
- **`app/(app)/settings/page.tsx`** — insert a new "Appearance" section above the existing notifications block, containing `<ThemePicker />`. Do NOT remove or rename any existing `data-testid` on the page (e.g. `settings-morning-time`, `settings-evening-time`, `settings-translation`, `settings-pause`, `enable-notifications-btn`, `save-settings-btn`, `sign-out-btn` all stay).

### User Interactions

- User taps System segment → `setTheme("system")` → `localStorage.ghars_theme = "system"`; `<html>.dark` follows the current `matchMedia("(prefers-color-scheme: dark)").matches` value.
- User taps Light segment → `setTheme("light")` → `localStorage.ghars_theme = "light"`; `<html>.dark` class is removed.
- User taps Dark segment → `setTheme("dark")` → `localStorage.ghars_theme = "dark"`; `<html>.dark` class is added.
- OS-level preference toggles while `theme === "system"` → `matchMedia` listener fires → `<html>.dark` class is synchronously added or removed to match.

### States

- **Pre-hydration:** The inline `<script>` in `<head>` picks the correct class based on `localStorage` (or `matchMedia` if no stored value). No FOUC.
- **Hydrated:** `ThemeProvider` takes over the class mutation; the segmented control in Settings reflects the stored `theme` value.
- **Reduced-motion:** The global `prefers-reduced-motion: reduce` rule from Story 1 already neutralises any CSS transition on `background-color`/`color`, so the theme swap is effectively instantaneous for reduced-motion users — no special code path needed in this story.

## Architecture Notes

- **New dependencies:** none. Lucide is already landed by Story 1; `Button` primitive comes from Story 1; `matchMedia` and `localStorage` are native web platform APIs.
- **Dependencies & integration:** depends on Story 1 (semantic tokens in `app/globals.css` and the `Button` primitive at `components/ui/button.tsx`). No API change, no DB change, no `proxy.ts` change. Interacts with every screen indirectly because every screen must render correctly in both themes — this story itself does not touch any screen other than Settings, but subsequent stories 3–8 must author their styles using semantic tokens so the `.dark` block automatically applies.
- **Breaking changes:** none. The `localStorage` key `ghars_theme` is new, so no migration is required for existing users; they will see `"system"` behaviour on their next open.

## Exemplar Files

- `origin/main:app/globals.css` — reference palette variables for the light theme; confirmed to contain NO `.dark { ... }` block, so this story breaks new ground for dark-mode values.
- `origin/main:app/(app)/settings/page.tsx` — does not exist on `origin/main`; no prior theme picker to reference. The pattern to follow for segmented-control styling is the `Button` primitive landed by Story 1 with `variant="outline"` and a `data-[state=active]` visual marker.

## Implementation Plan

### Sub-tasks

**Task 1: Dark token block in `globals.css`** — small (<100 LOC).

- Files: `app/globals.css`
- SEQUENTIAL — depends on Story 1 Task 1 (light-theme semantic tokens must exist first so the dark block can override them).
- Output: a single `.dark { ... }` block appended after the `:root` block, mapping all 14 semantic tokens plus the 4 atmospheric extras to their dark-palette values.

**Task 2: `ThemeProvider` + `useTheme` hook** — small (<100 LOC).

- Files: `components/ui/theme-provider.tsx`
- SEQUENTIAL — depends on Story 1 Task 3 (needs the `Button` primitive to exist for downstream Task 4). Can start in parallel with Task 1.
- Output: `ThemeProvider` context, `useTheme()` hook, `matchMedia` subscription with proper cleanup, localStorage read/write with corrupt-value fallback.

**Task 3: Inline no-FOUC script + layout wiring** — small (<50 LOC).

- Files: `app/layout.tsx`
- SEQUENTIAL — depends on Task 2 (needs `ThemeProvider` import).
- Output: inline `<script>` in `<head>` via `dangerouslySetInnerHTML`, `<ThemeProvider>` wrapper around `{children}`, `suppressHydrationWarning` on `<html>` to silence the unavoidable SSR/CSR class-attribute mismatch.

**Task 4: `ThemePicker` segmented control** — small (<100 LOC).

- Files: `components/ui/theme-picker.tsx`
- INDEPENDENT (can run in parallel with Task 3 once Task 2 is done).
- Output: three-button segmented control with lucide icons (`Monitor`, `Sun`, `Moon`), `data-testid` attributes, `aria-pressed` state reflecting the active segment, keyboard focus ring from Story 1's `:focus-visible` rule.

**Task 5: Settings integration** — small (<50 LOC).

- Files: `app/(app)/settings/page.tsx`
- SEQUENTIAL — depends on Task 4.
- Output: new "Appearance" section inserted above the notifications block; `<ThemePicker />` rendered inside. No existing `data-testid` removed or renamed.

**Task 6: E2E tests** — small (<150 LOC).

- Files: `e2e/visual-dark-mode.spec.ts`
- SEQUENTIAL — depends on Task 5 (the UI the tests drive must exist end-to-end).
- Output: Playwright spec covering the key scenarios in the verification table below.

### Negative Constraints

- Do NOT touch any API route (`app/api/**`) or `proxy.ts`.
- Do NOT modify, remove, or rename any existing `data-testid` on `app/(app)/settings/page.tsx` (e.g. `settings-morning-time`, `settings-evening-time`, `settings-translation`, `settings-pause`, `enable-notifications-btn`, `save-settings-btn`, `sign-out-btn`).
- Do NOT change the default startup behaviour for users who haven't set a preference beyond defaulting to `"system"`.
- Do NOT write a server-side cookie for theme; this story is strictly client-only.
- Do NOT introduce the `next-themes` package (or any new runtime dep) — a ~60-line hand-rolled provider is sufficient and keeps the dependency surface flat.
- Do NOT alter the `viewport.themeColor` in `app/layout.tsx` dynamically based on the theme in this story; the static `#1a4731` stays (dynamic theme-color meta is out of scope).

## Test Scenarios

**Test 1: First-visit default**

- Setup: clear `localStorage` entirely; device `prefers-color-scheme: light`.
- Action: open `/today`.
- Expected: `<html>` does NOT have the `dark` class; `localStorage.getItem("ghars_theme")` returns `null` (no write on first visit until user expresses an explicit choice).

**Test 2: Explicit Light overrides system-dark**

- Setup: `page.emulateMedia({ colorScheme: "dark" })`, user lands on `/settings`.
- Action: click `[data-testid="theme-light"]`.
- Expected: `<html>` no longer has the `dark` class; `localStorage.getItem("ghars_theme") === "light"`.

**Test 3: Reload persistence (no FOUC)**

- Setup: from Test 2's final state (`localStorage.ghars_theme === "light"`, device still in dark mode).
- Action: reload the page.
- Expected: `<html>` has no `dark` class on the very first paint (the inline `<script>` handled it before React mounted); no visible flash. Confirm via `page.evaluate(() => document.documentElement.classList.contains("dark"))` immediately after `page.reload()`.

**Test 4: System-follow mid-session**

- Setup: `localStorage.ghars_theme === "system"`, device currently light (`page.emulateMedia({ colorScheme: "light" })`).
- Action: `page.emulateMedia({ colorScheme: "dark" })`.
- Expected: within 100ms, `<html>` gains the `dark` class; `localStorage.ghars_theme` still equals `"system"` (unchanged).

**Test 5: Bad localStorage value**

- Setup: `page.evaluate(() => localStorage.setItem("ghars_theme", "sepia"))`.
- Action: `page.reload()`.
- Expected: the invalid value is treated as `"system"`; `localStorage.getItem("ghars_theme")` returns `null` (cleared by the fallback path).

## Acceptance Criteria

- [ ] `ThemePicker` renders three buttons (System / Light / Dark) in Settings with lucide icons (`Monitor`, `Sun`, `Moon`) and `data-testid="theme-system"|"theme-light"|"theme-dark"`.
- [ ] `ThemePicker` visually reflects the current `theme` (segmented-control active state).
- [ ] `<html>` gets/loses the `dark` class in response to user interaction and to device preference changes when in System mode.
- [ ] No light-to-dark flash on reload when the user's stored preference is Dark (verified by asserting the class is present on the first paint after reload).
- [ ] Every authenticated screen (`/today`, `/grove`, `/journal`, `/week/1`, `/settings`) and unauthenticated screen (`/`, `/onboarding`, `/onboarding/preferences`) renders correctly in both themes with no bright-white rectangle leaks.
- [ ] An invalid `localStorage.ghars_theme` value is silently treated as `"system"` and the bad value is cleared from storage.
- [ ] `npm run test` (Vitest) passes.
- [ ] `npm run test:e2e` passes with the new `e2e/visual-dark-mode.spec.ts` added.
- [ ] All existing E2E tests (`e2e/today-flow.spec.ts`, `e2e/grove-journal.spec.ts`, `e2e/health.spec.ts`) pass unchanged — no `data-testid` regressed.

## Verification

Run the verifier skill to confirm changes are clean.

### Backend Tests

None — this story introduces no server-side code.

### Browser/UI Testing

- **URL:** `http://localhost:3000`
- **Login:** demo session via `POST /api/demo/start` (see `e2e/today-flow.spec.ts` for the exact pattern; also see `docs/learnings/pattern-playwright-demo-auth.md`).
- **Steps:**
  1. Log in as demo, navigate to `/settings`.
  2. Tap each of System / Light / Dark; observe `<html>` class change and the Settings card background swap.
  3. Reload `/settings` after each choice — verify no FOUC (no bright cream flash before the dark paint when the stored value is Dark).
  4. In DevTools → Rendering → "Emulate CSS media feature prefers-color-scheme", toggle dark/light while `theme === "system"`; verify the app follows the device preference within ~100ms.
  5. Visit every other route (`/today`, `/grove`, `/journal`, `/week/1`, `/`) in both themes; verify no bright-white rectangle leaks in headers, cards, drawers, modals, or bottom nav.
  6. With `localStorage.setItem("ghars_theme", "sepia")` set from DevTools, reload — verify fallback to System and cleared storage.

### E2E Tests

| Key Scenario                                                              | Test file                      | Assigned sub-task |
| ------------------------------------------------------------------------- | ------------------------------ | ----------------- |
| Choosing Dark applies the `dark` class to `<html>` and persists on reload | `e2e/visual-dark-mode.spec.ts` | Task 6            |
| System mode follows device preference (`matchMedia` reactivity)           | `e2e/visual-dark-mode.spec.ts` | Task 6            |
| Bad `localStorage.ghars_theme` value gracefully falls back to System      | `e2e/visual-dark-mode.spec.ts` | Task 6            |
| Explicit Light overrides a device-level dark preference                   | `e2e/visual-dark-mode.spec.ts` | Task 6            |

**Locator strategies:**

- Theme picker buttons: `page.getByTestId("theme-system")`, `page.getByTestId("theme-light")`, `page.getByTestId("theme-dark")`.
- Assert the class on `<html>`: `await page.evaluate(() => document.documentElement.classList.contains("dark"))`.
- Assert the stored preference: `await page.evaluate(() => localStorage.getItem("ghars_theme"))`.
- Emulate the system preference: `await page.emulateMedia({ colorScheme: "dark" })` / `"light"`.
- Seed an invalid value: `await page.addInitScript(() => localStorage.setItem("ghars_theme", "sepia"))` before navigating.
