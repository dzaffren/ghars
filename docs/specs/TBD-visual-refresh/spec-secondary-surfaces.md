# Secondary Surfaces Polish Sweep

**Ticket:** TBD

A visual refresh across the four surfaces a Ghars user visits less often than the daily Today, Reflect, and Grove pages: the Journal, Settings, Onboarding (both the "How Ghars works" walkthrough and the preferences form), and the signed-out Marketing landing. This story brings each of these surfaces up to the same visual language as the daily ritual so that, wherever a user lands, the product feels like one considered experience rather than a polished core surrounded by a prototype.

## User Story

As a Ghars user who occasionally reviews my journal, updates my settings, or sends the landing page to a friend, I want those surfaces to feel like part of the same product as my daily ritual — so the visual quality is consistent wherever I go in the app.

## Background & Context

**Current state:**

- The Journal page renders reflection entries as flat white cards on a sand background with a plain search input, pill-shaped filter buttons that do not share a state language with the rest of the app, and a "Loading…" text placeholder while entries fetch.
- The Settings page lays out the morning reminder, evening reminder, translation, and pause-notifications controls as loose stacked form rows with browser-default styling. The push-notifications button and the sign-out button sit at the bottom with no grouping or iconography.
- The Onboarding walkthrough shows four numbered steps as plain circles with text; the preferences form mirrors the raw Settings styling.
- The signed-out Marketing landing uses a plain heading, an Arabic glyph, a tagline, and three side-by-side buttons with no visual hierarchy between them and no entrance animation.

**Problem:**

- A user who taps into Journal to re-read a reflection, or who opens Settings to shift their evening reminder, leaves the refreshed daily ritual and lands on a surface that still looks like the earlier prototype. The inconsistency breaks the sense of having entered a single, considered product.
- A friend opening the Marketing landing from a share link forms their first impression from a page that does not carry the quality bar of the rest of the app, which is a credibility tax on invites.
- Night-time users who have adopted dark mode on Today and Reflect see the secondary surfaces revert to bright cream rectangles, making evening journal browsing and settings tweaks uncomfortable.

## Target User & Persona

- **Who:** Any signed-in Ghars user who leaves the daily loop to review past reflections, adjust their reminders or translation preference, or complete onboarding; and any signed-out visitor who opens the Marketing landing from a share link.
- **Context:** Weekly or monthly housekeeping (Journal, Settings), a one-time first-run (Onboarding), or a first encounter with the product through a friend (Landing). These are low-frequency but high-signal moments — they shape trust.
- **Current workaround:** Users tolerate the inconsistent look on these secondary surfaces because the feature itself still works; invited friends form their first impression from a page that does not yet reflect the product's intent.

## Goals

- Bring the Journal, Settings, Onboarding (walkthrough and preferences), and Marketing landing onto the same visual language as the refreshed daily ritual.
- Make each of these surfaces dark-theme-ready so the user's theme choice carries through the whole app.
- Replace ad-hoc inline colour values on these four surfaces with the shared design tokens from the foundation story.
- Reserve a clean slot inside Settings where the Dark Mode theme picker owned by Story 2 will land, without shipping the toggle itself in this story.
- Preserve every existing behaviour: search timing, bookmark toggling, save flow, sign-out destination, onboarding navigation, and the marketing CTA order.

## Non-Goals

- No new Journal capabilities (no editing, no deleting, no folders, no tags, no sorting beyond the existing All / Bookmarked filter).
- No new Settings options. The Dark Mode theme picker is owned by Story 2; this story only reserves the visual slot.
- No new Onboarding steps, no changes to the four-step "How Ghars works" wording, no new preferences fields.
- No Marketing landing copy changes, no new CTAs, no reorder of the existing three CTAs.
- No redesign of the Privacy or Terms pages in this epic.
- No mirroring of the app chrome to right-to-left layout; Arabic continues to render in Arabic type inside its own elements.

## User Workflow

> Step-by-step experience, from the user's perspective, across all four secondary surfaces.

1. **Opening the Journal** — Aisha taps the Journal tab in the bottom nav. She sees a header, a search field with a small search glyph inside it, and two capsule filter chips labelled "All" and "Bookmarked" below the search. Below those, her reflection entries stack as raised cards, each showing the surah and ayah label in the primary green, the date in muted text, and two to three lines of reflection preview.
2. **Filtering by bookmark** — Aisha taps the "Bookmarked" chip. The chip becomes the selected state; the "All" chip becomes unselected. The list updates to show only reflections she has previously bookmarked. She taps "All" to return to every entry.
3. **Searching** — Aisha types "patience" into the search field. The list narrows to entries that mention the word. She clears the search and the full list returns.
4. **Toggling a bookmark inline** — Aisha taps the bookmark glyph on the right-hand side of an entry card. The glyph flips from outlined to filled; the entry is now bookmarked. She taps it again and it flips back to outlined.
5. **Reading a full reflection** — Aisha taps "Read full reflection" on an entry. A bottom sheet rises from the bottom of the screen with rounded top corners and shows the full reflection text, with its own internal scroll if the reflection is long. She taps the X glyph at the top of the sheet and the sheet descends.
6. **Empty search result** — Aisha types a word that does not match any of her reflections. The list is replaced by a single empty-state glyph and a short message.
7. **Visiting Settings** — Aisha taps Settings. She sees one raised card containing four controls in order: a morning reminder time picker with a sun glyph next to the label, an evening reminder time picker with a moon glyph, a translation dropdown with a book-open glyph, and a "Pause notifications" toggle with a bell glyph. Between the translation control and the pause toggle, she notices a slight vertical gap reserved for a future control.
8. **Enabling push notifications** — Yusuf, a different user whose browser has never been asked for notification permission, sees an "Enable push notifications" button below the settings card with a bell glyph. He taps it, grants permission in the browser prompt, and the button changes to its enabled state. On another device where he previously denied permission, he instead sees a short helper message below the button explaining that permission was denied and how to re-enable it.
9. **Saving Settings** — Yusuf taps "Save". The button label changes to "Saving…" while the change is being recorded and then returns to "Save" once it is done.
10. **Signing out** — Yusuf taps the "Sign out" ghost button at the bottom of the page and is taken to the Marketing landing.
11. **Onboarding walkthrough** — A brand-new user, Laila, opens Ghars for the first time and is taken to the "How Ghars works" walkthrough. She sees four numbered steps. Each step has a green-filled circle with its number, a small lucide glyph next to it (a sun for step one, a compass for step two, a moon for step three, a tree for step four), and the existing step copy preserved verbatim. She taps "Create my account".
12. **Onboarding preferences** — After creating her account, Laila is taken to the preferences page. She sees a single raised form card containing a translation dropdown with a book-open glyph, a morning-time picker with a sun glyph, and an evening-time picker with a moon glyph. She picks her values and taps "Start my first day"; she lands on Today.
13. **Marketing landing** — Zainab opens the Ghars landing URL shared by a friend on her phone. She sees the "Ghars" wordmark in the display typeface, the Arabic glyph "غَرْس" in the Arabic typeface in a muted treatment underneath, the existing tagline, and three calls to action: "Get started" as a filled primary button, "I already have an account" as an outlined button, and the demo button as a ghost-style button. Each of these elements fades in gently, one after another, on first load.

## Acceptance Criteria

> All scenarios below describe what the user can see and do. No implementation, colour values, or styling details.

### Scenario: Journal renders with the refreshed visual language

```gherkin
Given I am a signed-in Ghars user with at least one past reflection
When I open the Journal page
Then I see a search field with a search glyph inside it
  And I see two filter chips labelled "All" and "Bookmarked" with "All" selected
  And I see my reflection entries as raised cards
  And each entry card shows the surah and ayah label, the date, a preview of the reflection, and a bookmark glyph
  And each entry card shows a "Read full reflection" link with a chevron glyph
```

### Scenario: Journal search preserves the existing filter behaviour

```gherkin
Given I am on the Journal page with reflections that mention the word "patience"
  And I am on the "All" filter
When I type "patience" into the search field using the same interaction that previously filtered the list
Then the list narrows to only entries that contain "patience"
  And when I clear the search the full list returns
```

### Scenario Outline: Filter chips toggle between All and Bookmarked

```gherkin
Given I am on the Journal page
  And I have some bookmarked and some non-bookmarked reflections
When I tap the "<chip>" chip
Then the "<chip>" chip shows the selected state
  And the other chip shows the unselected state
  And the list shows "<visible>"

Examples:
  | chip       | visible                    |
  | All        | every reflection I have    |
  | Bookmarked | only bookmarked reflections |
```

### Scenario: Toggling a bookmark from a Journal entry card

```gherkin
Given I am on the Journal page
  And I see a reflection entry whose bookmark glyph is outlined
When I tap the bookmark glyph on that entry
Then the glyph flips to filled
  And when I tap it again the glyph flips back to outlined
  And no other entry's bookmark state changes
```

### Scenario: Reading a full reflection in the bottom sheet

```gherkin
Given I am on the Journal page
When I tap "Read full reflection" on an entry
Then a bottom sheet rises from the bottom of the screen with rounded top corners
  And the sheet shows the full reflection text
  And the sheet scrolls internally if the text is longer than the sheet
  And I can close the sheet with the X glyph at the top
```

### Scenario: Journal empty state for the All filter

```gherkin
Given I am a signed-in user who has never written a reflection
When I open the Journal page with the "All" filter selected
Then I see an empty-state glyph and the existing empty-state message for no reflections yet
  And I do not see any entry cards
```

### Scenario: Journal empty state for the Bookmarked filter

```gherkin
Given I have reflections but none of them are bookmarked
When I tap the "Bookmarked" chip
Then I see an empty-state glyph and the existing empty-state message for no bookmarks yet
  And I do not see any entry cards
```

### Scenario: Journal search with no matches

```gherkin
Given I am on the Journal page with any set of reflections
When I type a word that does not appear in any of my reflections
Then I see an empty-state glyph and the existing empty-state message
  And I can clear the search to see my entries again
```

### Scenario: Journal loading state replaces the plain text placeholder

```gherkin
Given I open the Journal page and the entries are still being fetched
When the page is in its loading state
Then I see shimmering placeholder cards in the shape of entry cards
  And I do not see the words "Loading…"
```

### Scenario: Settings groups the four core controls in a single card

```gherkin
Given I am a signed-in user
When I open the Settings page
Then I see one raised card containing, in order: morning reminder time, evening reminder time, translation, and pause-notifications toggle
  And each control has a small glyph to the left of its label
  And the morning control uses a sun glyph, the evening control uses a moon glyph, the translation control uses a book-open glyph, and the pause toggle uses a bell glyph
```

### Scenario: Settings reserves a visual slot for the Dark Mode theme picker

```gherkin
Given I am on the Settings page for this story
When I look at the raised settings card
Then I see a visible gap between the translation control and the pause-notifications toggle where a future Dark Mode control will live
  And no Dark Mode control is shipped as part of this story
```

### Scenario Outline: Enable-push-notifications button reflects the browser permission state

```gherkin
Given I am on the Settings page
  And my browser's notification permission for Ghars is "<permission>"
When I look at the enable-notifications area
Then I see "<button>"
  And I see "<helper>"

Examples:
  | permission | button                                | helper                                             |
  | default    | an "Enable push notifications" button | no inline helper message                           |
  | granted    | the enabled confirmation state        | no inline helper message                           |
  | denied     | an "Enable push notifications" button | an inline helper message explaining permission was denied |
```

### Scenario: Saving Settings shows a transient saving state

```gherkin
Given I am on the Settings page
  And I have changed at least one control
When I tap the "Save" button
Then the button label changes to "Saving…" while the change is being recorded
  And the button returns to "Save" once the save has completed
```

### Scenario: Signing out from Settings

```gherkin
Given I am a signed-in user on the Settings page
When I tap the "Sign out" ghost button at the bottom of the page
Then I am taken to the Marketing landing
  And I am signed out
```

### Scenario: Onboarding walkthrough renders the four numbered steps with glyphs

```gherkin
Given I am a brand-new user who has just signed up
When I am shown the "How Ghars works" walkthrough
Then I see four numbered steps in a vertical stack
  And each step's number sits in a green-filled circle
  And step one shows a sun glyph, step two shows a compass glyph, step three shows a moon glyph, and step four shows a tree glyph
  And each step's wording is preserved exactly as before
  And a primary "Create my account" button appears below the steps
```

### Scenario: Onboarding preferences form

```gherkin
Given I have just created my account
When I am shown the preferences page
Then I see one raised form card containing a translation dropdown, a morning-time picker, and an evening-time picker
  And each control has the same glyph as it has on Settings
  And a primary "Start my first day" button appears below the form
  And when I pick my values and tap "Start my first day" I am taken to the Today page
```

### Scenario: Marketing landing renders the refreshed welcome composition

```gherkin
Given I am a signed-out visitor opening the landing URL
When the landing page finishes loading
Then I see the "Ghars" wordmark in the display typeface
  And I see the Arabic glyph "غَرْس" underneath in the Arabic typeface in a muted treatment
  And I see the existing tagline preserved exactly
  And I see three calls to action in order: "Get started" as a primary button, "I already have an account" as an outlined button, and the demo button as a ghost button
```

### Scenario: Marketing landing entrance stagger plays once

```gherkin
Given my device is not in reduced-motion mode
When I open the landing page for the first time in this session
Then the wordmark, Arabic glyph, tagline, and three calls to action fade in with a soft stagger
  And the stagger does not replay on subsequent interactions within the same page visit
```

### Scenario: Reduced-motion users do not see the landing stagger

```gherkin
Given my device is in reduced-motion mode
When I open the landing page
Then all four landing elements are present and readable immediately
  And no entrance stagger plays
  And no non-essential animation plays on any of the four secondary surfaces
```

### Scenario Outline: Dark theme renders correctly across all four secondary surfaces

```gherkin
Given I have chosen dark theme on my device or in the app
When I open the "<surface>"
Then the background, cards, inputs, chips, and drawers all render in the dark palette
  And no element on the page appears as a bright white rectangle

Examples:
  | surface                        |
  | Journal page                   |
  | Settings page                  |
  | Onboarding walkthrough         |
  | Onboarding preferences form    |
  | Marketing landing              |
```

### Scenario Outline: Keyboard users can reach every control with a visible focus state

```gherkin
Given I am navigating the "<surface>" using only the keyboard
When I press Tab repeatedly
Then each interactive element in turn shows a visible focus state
  And I can activate the focused control with the keyboard
  And no interactive element is skipped or unreachable

Examples:
  | surface                        |
  | Journal page                   |
  | Settings page                  |
  | Onboarding walkthrough         |
  | Onboarding preferences form    |
  | Marketing landing              |
```

### Scenario: Touch targets meet the minimum size on secondary surfaces

```gherkin
Given I am viewing any of the four secondary surfaces on a mobile device
When I look at every interactive control — search field, filter chips, bookmark glyph, read-full link, time pickers, translation dropdown, pause toggle, enable-notifications button, save button, sign-out button, onboarding CTAs, and landing CTAs
Then each control is at least 44 by 44 density-independent pixels
```

### Scenario: Icons come from the shared lucide set

```gherkin
Given I look at any glyph introduced by this story on the four secondary surfaces
When I compare it to the icons used elsewhere in the refreshed app
Then it comes from the same lucide icon set
  And no emoji is used as a chrome icon
  And emoji that appear inside user-written reflection text still render as the user typed them
```

### Scenario: Search-firing behaviour is unchanged from before the refresh

```gherkin
Given I was a Journal user before this story shipped
When I use the search field after the refresh
Then the search fires on the same interaction it fired on before — whether that was live-as-I-type or on pressing Enter
  And this story does not change which of those two behaviours applies
```

### Scenario: Bookmark server behaviour is unchanged from before the refresh

```gherkin
Given I toggle the bookmark glyph on a Journal entry
When the server records the change
Then the server contract for bookmarks is identical to what it was before this story
  And only the visual treatment of the bookmark glyph has changed
```

### Scenario: Onboarding navigation is unchanged

```gherkin
Given I am a brand-new user going through onboarding
When I move through the "How Ghars works" walkthrough and the preferences form
Then the screens appear in the same order as before this story
  And no new screen is inserted and no existing screen is removed
```

### Scenario: Marketing landing preserves its three CTAs and copy

```gherkin
Given I compare the refreshed landing to the landing before this story
When I read the page from top to bottom
Then the wordmark, Arabic glyph, tagline, and the three CTAs are present
  And the three CTAs appear in the same order — "Get started", "I already have an account", demo
  And no copy line has been rewritten
```

## Business Rules & Constraints

- No new settings controls are introduced in this story. The Dark Mode theme picker is owned by Story 2; this story only reserves a visible, empty slot for it between the translation control and the pause-notifications toggle.
- Journal search behaviour is preserved exactly. If the pre-refresh Journal fired its search live-as-you-type, the refreshed Journal fires live-as-you-type. If it fired on Enter, the refreshed Journal fires on Enter. This story does not switch between those behaviours.
- Journal bookmark behaviour is preserved exactly. Toggling the bookmark glyph on an entry card produces the same server-side effect as the pre-refresh bookmark control. No new fields, no new confirmations, no new timing.
- Onboarding navigation is preserved exactly. The walkthrough still shows four steps in the same order with the same copy; the preferences form still asks for translation, morning time, and evening time and then navigates to Today.
- The Marketing landing preserves its three CTAs ("Get started", "I already have an account", demo) in the same order and preserves all existing copy including the tagline.
- Icons used across these four surfaces are from the lucide set only. Emoji may not be used as chrome iconography. Emoji inside user-written content (e.g. a 🌱 typed by the user into a reflection) renders as written.
- All interactive elements on these surfaces meet the shared 44 × 44 pixel touch-target rule and show a visible focus state when reached by keyboard.
- All four surfaces are dark-theme-ready: no bright white card, overlay, drawer, or input leaks through when the user is in dark mode.
- All four surfaces consume the shared design tokens from the foundation story. No new ad-hoc hex values are introduced on these surfaces.
- Reduced-motion users do not see the Marketing landing entrance stagger, and no non-essential animation plays on any of the four surfaces for them.

## Success Metrics

- Visual-consistency audit at sign-off shows zero ad-hoc colour values on the Journal, Settings, Onboarding walkthrough, Onboarding preferences, and Marketing landing surfaces. Every colour, radius, spacing, and font on these surfaces resolves to a shared design token.
- Journal read-rate — the share of users visiting Journal who open at least one full reflection in a bottom sheet — holds steady or improves in the four weeks after release compared with the four weeks before.
- Settings save-success rate is at 100% after the refresh. No user reports a Settings form that silently fails to save. The existing E2E coverage for a settings save continues to pass.
- First-day onboarding completion rate — the share of users who finish the "How Ghars works" walkthrough and submit the preferences form in the same session as sign-up — does not regress relative to the pre-refresh baseline.
- Invited-friend first-impression signal: qualitative feedback collected from new accounts created from the landing in the four weeks after release describes the landing as polished or considered at a rate higher than the pre-refresh cohort.

## Dependencies

- Story 1 (Design system foundation) must ship first. This story consumes the tokens, typography scale, radius scale, primitive form controls, button variants, chip, card, bottom sheet, and skeleton shimmer defined there.
- Story 2 (Dark mode) pairs with the slot reserved inside Settings; this story does not block on Story 2 but must leave the slot ready for Story 2 to fill.
- Availability of the lucide icon set so that the sun, moon, book-open, bell, search, bookmark, chevron-right, log-out, compass, and tree glyphs render consistently across the four surfaces.
- Availability of the display typeface for the "Ghars" wordmark on the Marketing landing, and of Noto Naskh Arabic for the Arabic glyph "غَرْس".

## Rollout Considerations

- This story can ship independently of the other story-level refreshes. Because the behaviour of each of the four surfaces is unchanged, no feature flag is required; the visual change can be promoted to production as a single deploy.
- Consider a brief internal-cohort preview where the team uses the refreshed Journal and Settings for at least one daily cycle before promoting to production, to catch any contrast or touch-target issues under real usage rather than only in design review.
- No user communication is required: there are no new controls to explain and no existing controls have moved.

## Open Questions

- [x] ~~Does this story ship the Dark Mode theme picker inside Settings?~~ — **Resolved:** No. This story only reserves the visual slot between the translation control and the pause-notifications toggle. Story 2 owns the picker.
- [x] ~~Does this story alter Journal search or bookmark behaviour in any way?~~ — **Resolved:** No. Both behaviours are preserved exactly. Only the visual treatment changes.
- [x] ~~Are the Privacy and Terms pages in scope for this refresh?~~ — **Resolved:** No. They are out of scope for this epic entirely.

---

## Technical Detail

### Functional Requirements

- No API contract changes. Journal consumes `GET /api/journal`, `POST/DELETE /api/bookmarks`. Settings consumes `POST /api/settings`, `POST /api/push/subscribe`, `POST /api/auth/signout`. Onboarding consumes `POST /api/onboarding/preferences`, `GET /api/auth/start`. Landing uses `GET /api/auth/start` and demo start.
- Journal:
  - Search input: shadcn-style with lucide `Search` icon on the left inside a relative wrapper.
  - Filter chips (All / Bookmarked): Badge-style capsules with `data-state="active"`.
  - Entry card: Card primitive. Bookmark icon: lucide `Bookmark` (outlined) / `BookmarkCheck` (filled). "Read full reflection" link: lucide `ChevronRight`.
  - Empty state: lucide `Leaf` glyph + existing copy.
  - Loading: token-based skeleton shimmer via a new `Skeleton` primitive (`components/ui/skeleton.tsx`) — 3 shimmer rows.
  - Read-full drawer: framer-motion slide-up sheet, lucide `X` close.
- Settings:
  - Wrap in a Card section. Each label has a lucide icon left: morning `Sun`, evening `Moon`, translation `BookOpen`, pause `BellOff`.
  - Reserved slot between translation and pause toggle for the Theme picker (owned by Story 2).
  - Push-notifications button: outlined Button with lucide `Bell`; denied-state helper below.
  - Save: primary Button size="lg".
  - Sign-out: ghost Button with lucide `LogOut`.
- Onboarding:
  - /onboarding four-step card: each numbered circle becomes a `bg-primary text-primary-foreground rounded-full` plus a lucide glyph on the right of the number (`Sun`, `Compass`, `Moon`, `TreePine`).
  - Preferences form: Card primitive, same lucide icons as Settings per label.
- Marketing landing:
  - Wordmark "Ghars" at `text-5xl font-bold tracking-tight text-primary`; Arabic glyph "غَرْس" beneath with `.arabic-text`.
  - CTA trio: primary Button "Get started", outline Button "I already have an account", ghost DemoButton.
  - Entrance stagger via `lib/motion.ts` `stagger` variant.

### API Design

- None new.

### UI/Frontend Requirements

**New/modified components:**

- `components/ui/skeleton.tsx` — new shadcn-style shimmer.
- `app/(app)/journal/page.tsx` — refresh.
- `app/(app)/settings/page.tsx` — refresh; reserve Appearance slot for Story 2's ThemePicker.
- `app/onboarding/page.tsx` — refresh.
- `app/onboarding/preferences/page.tsx` — refresh.
- `app/(marketing)/page.tsx` — refresh.
- `app/(marketing)/_components/DemoButton.tsx` — adopt ghost Button primitive.

**Preserved testids:** `journal-search`, `filter-all`, `filter-bookmarked`, `journal-empty`, `journal-list`, `journal-entry-${id}`, `bookmark-btn-${id}`, `settings-morning-time`, `settings-evening-time`, `settings-translation`, `settings-pause`, `enable-notifications-btn`, `notif-permission-status`, `save-settings-btn`, `sign-out-btn`, `create-account-btn`, `translation-picker`, `morning-time-picker`, `evening-time-picker`, `start-btn`, `get-started-btn`, `sign-in-btn`.

**New testids:** `journal-skeleton`, `journal-search-icon`, `journal-drawer`, `journal-drawer-close`, `settings-appearance-slot`, `landing-wordmark`.

### States

- Journal loading: skeleton shimmer.
- Journal empty (all): "Your reflections will appear here — start with today's ayah."
- Journal empty (bookmarked): "No bookmarked reflections yet."
- Settings default: form card visible, save idle.
- Settings saving: Save button shows spinner.
- Settings notifications denied: helper visible.
- Onboarding: static rendered.
- Landing: stagger on entry then static.

### Architecture Notes

- **New dependencies:** none.
- **Dependencies & integration:** depends on Story 1 and Story 2 (Story 2 fills the Settings Appearance slot; this story renders a placeholder region with `data-testid="settings-appearance-slot"` that Story 2's PR replaces).

### Exemplar Files

- `origin/main:components/LandingContent.tsx` — reference for landing stagger.
- `origin/main:components/BrandHeader.tsx` — reference for wordmark + Arabic glyph.
- `origin/main:app/reflections/ReflectionArchive.tsx` — reference for journal filter chips.

### Implementation Plan

**Task 1: Skeleton primitive** — small. Files: `components/ui/skeleton.tsx`. INDEPENDENT.

**Task 2: Journal page refresh** — medium. Files: `app/(app)/journal/page.tsx`. SEQUENTIAL after Story 1 Task 3 and Task 1 here.

**Task 3: Journal bottom drawer motion** — small. Same file. SEQUENTIAL after Task 2.

**Task 4: Settings page refresh + Appearance slot** — medium. Files: `app/(app)/settings/page.tsx`. SEQUENTIAL after Story 1 Task 3. INDEPENDENT of Tasks 1–3.

**Task 5: Onboarding /onboarding refresh** — small. Files: `app/onboarding/page.tsx`. INDEPENDENT of Tasks 1–4.

**Task 6: Onboarding /preferences refresh** — small. Files: `app/onboarding/preferences/page.tsx`. INDEPENDENT.

**Task 7: Marketing landing refresh + DemoButton** — small. Files: `app/(marketing)/page.tsx`, `app/(marketing)/_components/DemoButton.tsx`. INDEPENDENT.

**Task 8: E2E** — small. Files: `e2e/visual-secondary.spec.ts`. SEQUENTIAL after Tasks 2–7.

### Negative Constraints

- Do NOT change any API route.
- Do NOT change any copy strings anywhere on these four surfaces.
- Do NOT change any existing testid.
- Do NOT redesign `/privacy` or `/terms` (out of scope).
- Do NOT implement the Theme picker in this story — only the slot. Story 2 owns the picker.
- Do NOT reintroduce circles/dhikr/words/explore pages from origin/main.

### Test Scenarios

**Test 1: Journal skeleton on load**

- Setup: slow the `/api/journal` response.
- Action: visit `/journal`.
- Expected: `[data-testid="journal-skeleton"]` visible for the duration, then list replaces it.

**Test 2: Journal search preserves existing behaviour**

- Setup: list of entries.
- Action: type "patience" and press Enter.
- Expected: request fires with `q=patience`; list filters.

**Test 3: Bookmark toggle**

- Setup: an entry with `is_bookmarked: false`.
- Action: click `[data-testid="bookmark-btn-${id}"]`.
- Expected: icon swaps from outlined Bookmark to filled BookmarkCheck; POST fires.

**Test 4: Journal drawer**

- Setup: populated list.
- Action: click "Read full reflection"; then close.
- Expected: `[data-testid="journal-drawer"]` slides up; closes on X or backdrop tap.

**Test 5: Settings appearance slot reserved**

- Setup: visit `/settings` (Story 2 not yet shipped).
- Action: render.
- Expected: `[data-testid="settings-appearance-slot"]` exists as an empty region; Save button still works.

**Test 6: Notifications denied helper**

- Setup: `Notification.permission === "denied"`.
- Action: render `/settings`.
- Expected: `[data-testid="notif-permission-status"]` visible with existing copy.

**Test 7: Onboarding four steps**

- Setup: visit `/onboarding` signed-out.
- Action: render.
- Expected: 4 numbered circles + lucide glyphs next to each; "Create my account" CTA visible.

**Test 8: Landing stagger**

- Setup: visit `/`.
- Action: render.
- Expected: wordmark, tagline, CTA trio visible. Stagger sequence runs on first load (under reduced-motion: no stagger, elements still present).

### Acceptance Criteria

- [ ] Skeleton primitive implemented and used on Journal loading
- [ ] Journal search, filter chips, entry cards, drawer all refreshed
- [ ] Settings grouped in Card; icons per label; Appearance slot reserved
- [ ] Onboarding numbered circles + lucide glyphs; CTA is primary Button
- [ ] Preferences page uses Card + icons
- [ ] Landing wordmark + Arabic glyph + stagger; CTA trio primary/outline/ghost
- [ ] All existing testids preserved; all copy preserved
- [ ] `e2e/grove-journal.spec.ts` passes unchanged
- [ ] `npm run test:e2e` passes with `visual-secondary.spec.ts` added
- [ ] Both themes render correctly

### Verification

**Backend Tests:** None.

**Browser/UI Testing:**

- Login, visit `/journal`, test search + bookmark toggle + drawer.
- Visit `/settings`, verify icons and Appearance slot region present.
- Log out, visit `/onboarding`, verify 4 steps + CTA.
- Visit `/` signed out, verify wordmark + Arabic glyph + CTA trio + stagger.
- Mobile Safari viewport across all five surfaces.
- Dark theme across all five.

**E2E Tests:**
| Key Scenario | Test file | Assigned sub-task |
|---|---|---|
| Journal search filters entries | `e2e/grove-journal.spec.ts` (existing preserved) | Task 8 |
| Journal bookmark toggle | `e2e/visual-secondary.spec.ts` | Task 8 |
| Journal drawer open/close | `e2e/visual-secondary.spec.ts` | Task 8 |
| Settings Appearance slot reserved | `e2e/visual-secondary.spec.ts` | Task 8 |
| Notifications denied helper visible | `e2e/visual-secondary.spec.ts` | Task 8 |
| Onboarding four steps render | `e2e/visual-secondary.spec.ts` | Task 8 |
| Landing wordmark + CTA trio | `e2e/visual-secondary.spec.ts` | Task 8 |

**Locator strategies:** preserved testids listed above; new `journal-skeleton`, `journal-drawer`, `journal-drawer-close`, `settings-appearance-slot`, `landing-wordmark`.

### Open Questions

All resolved.
