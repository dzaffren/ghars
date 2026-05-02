# Ghars Visual Refresh — Overview

**Ticket:** TBD

## Summary

A cross-cutting UI/UX refresh that lifts Ghars from its current minimal first-pass visual layer to an atmospheric, considered, and habit-forming daily experience. The refresh touches every screen in the app — Today, Reflect, Grove, Weekly Review, Journal, Settings, Onboarding, and the marketing landing — without altering any functionality, content, or user-flow behaviour. The goal is a polished, accessible, inclusive, and delightful surface that makes the daily ritual feel sacred and personal, and that users return to because it feels good, not only because it is useful.

## Background & Context

**Current state:**

- Every screen uses flat white cards on a sand background, with inline hex colours and emoji icons in the bottom nav and grove tiles.
- The Arabic verse renders in the system sans-serif at a generic line-height, and the reflection window uses a plain browser textarea.
- There is no visible motion: committing a mission, submitting a reflection, opening a drawer, and planting a tree all feel the same.
- There is no dark theme. Users reading at night on mobile get the same bright cream that they read at breakfast.
- Touch targets, focus rings, and safe-area insets at the bottom of the screen are inconsistent across surfaces.

**Problem:**

- The product is designed around a sacred daily ritual (one ayah, one mission, one reflection, one planted tree), but the interface treats every moment with the same visual weight. The emotional arc of the day is not rendered.
- Users have fed back that the app looks "unfinished" and "like a prototype," which is affecting how seriously it is taken in early testing and in stakeholder demos.
- Night-time readers currently dim their device or avoid the app after sunset, which conflicts with the evening-reflection step of the core loop.
- The current look is inconsistent with how mature Islamic lifestyle and reflection apps present themselves, which is a credibility tax in the target market.

## Goals

- Make the daily ritual feel considered, atmospheric, and personal at every step — morning read, afternoon carry, evening reflection, and seeing the grove grow.
- Bring the visual language to the quality bar already prototyped on `origin/main` (cream + green + amber palette, shadcn-style token layer, considered Arabic typography, lucide icons, motion for key moments), adapted to the current feature set.
- Offer a fully-supported dark theme so the evening reflection step is comfortable in low light.
- Keep every existing user flow, API contract, and business rule identical — this epic changes nothing the user _does_, only what they _see and feel_.
- Meet baseline accessibility expectations: visible focus states, touch targets at 44 px or larger, respect for the user's reduced-motion preference, and sufficient contrast in both themes.

## Non-Goals

- No changes to which ayah is assigned, how missions are generated, how reflections are scored, what data is stored, or what the API returns.
- No new screens, no new user-facing features, no new settings beyond the dark-mode toggle.
- No RTL layout mirroring of the whole app — Arabic continues to appear inside verses, headings, and the wordmark, but the chrome stays LTR for this epic.
- No native app rewrite — this remains a PWA built on the existing Next.js project.
- No reintroduction of retired features from earlier prototypes (circles, dhikr/tasbih widget, word-learning, explore feed, radial nav) unless a dedicated follow-up epic scopes them.

## Story Index

| Ticket | Story                             | Spec                                                                 | Type        | Status      | Dependencies             |
| ------ | --------------------------------- | -------------------------------------------------------------------- | ----------- | ----------- | ------------------------ |
| TBD    | Design system foundation          | [spec-design-system-foundation.md](spec-design-system-foundation.md) | Technical   | Not Started | —                        |
| TBD    | Dark mode                         | [spec-dark-mode.md](spec-dark-mode.md)                               | User-facing | Not Started | Design system foundation |
| TBD    | App shell — header + bottom nav   | [spec-app-shell.md](spec-app-shell.md)                               | User-facing | Not Started | Design system foundation |
| TBD    | Today screen & ayah card refresh  | [spec-today-ayah.md](spec-today-ayah.md)                             | User-facing | Not Started | Design system foundation |
| TBD    | Mission card & commit celebration | [spec-mission-celebration.md](spec-mission-celebration.md)           | User-facing | Not Started | Design system foundation |
| TBD    | Reflect view refresh              | [spec-reflect-view.md](spec-reflect-view.md)                         | User-facing | Not Started | Design system foundation |
| TBD    | Grove & weekly review refresh     | [spec-grove-week.md](spec-grove-week.md)                             | User-facing | Not Started | Design system foundation |
| TBD    | Secondary surfaces polish sweep   | [spec-secondary-surfaces.md](spec-secondary-surfaces.md)             | User-facing | Not Started | Design system foundation |

## Shared Business Rules

- Every surface across every story must honour the user's system-level reduced-motion preference. When reduced motion is active, entrance staggers, particle bursts, card tilts, and ambient animations are skipped; functional feedback (e.g. a button going from "Committing…" to a committed state) still occurs.
- Every surface must respect the user's chosen theme: when the user is in dark mode, no card, overlay, or drawer may appear as a bright white rectangle.
- All interactive elements must meet a minimum 44 × 44 px touch target and show a visible focus state when reached by keyboard.
- The Arabic verse, wordmark, and any Arabic UI glyph renders in the app's designated Arabic typeface; it must never fall back to a generic system sans-serif.
- The colour language across the epic is consistent: a single green-family primary, a warm cream background, an amber accent reserved for celebration moments, and a neutral ink for body copy. Pages do not introduce ad-hoc hex values.
- No story in this epic may change the text of any acceptance-critical copy line (e.g. "Honesty plants a sapling.", "Today's tree is planted ✓", "Committed ✓", "Here's what Allah guided you through this week"). Copy rewriting is out of scope.
- No story may change which actions the user performs, which screens they navigate between, which inputs they provide, or which outputs they see beyond visual presentation. All API calls, button labels, and flow transitions remain identical.

## User Journey Map

> Narrative of how the refreshed ritual feels across a representative day. Each step maps to the story that owns its surface.

1. **First open of the day** — Aisha opens Ghars on her phone at 07:40. The app shell reveals itself: a sticky, cream-tinted header with the Ghars logo and Arabic wordmark, and a bottom nav with crisp iconography that is clearly in the current-tab state. The screen is calm, not busy. _(Stories: App shell, Design system foundation)_
2. **Reading the ayah** — The day's ayah card fades up. The Arabic renders in Noto Naskh Arabic at a restful RTL line-height; the translation follows in a readable prose block. An audio control sits in the corner with a slim progress bar. Tapping "Show tafsir" reveals a short extract with a gentle expand, and a "Read full tafsir" link opens a bottom sheet. _(Story: Today screen & ayah card refresh)_
3. **Choosing a mission** — Below the ayah, the mission card shows two suggested prompts and a "Write your own" option with a polished textarea. Aisha picks one and taps the primary button. A brief amber particle burst plays around the button; the card flips to a quiet "committed" state with the mission repeated back to her. _(Story: Mission card & commit celebration)_
4. **Carrying the mission through the day** — No screen change; Aisha closes the app and gets on with her day.
5. **Evening reflection** — At 21:15, Aisha reopens the app. The app shell is now in dark mode, matching her phone. The ayah card and mission are shown as a reminder at the top of the screen. Below, a three-block reflection flow asks "Did you act on it?" with three clear options, and "What happened?" with a textarea that shows a character count and a disabled submit until the minimum is reached. Tapping submit plays a tree-growth moment and then takes her to the grove. _(Stories: Reflect view refresh, Dark mode)_
6. **Seeing the grove grow** — The grove page shows a large cumulative count, a streak pill, and a canvas of plant glyphs representing each day she has reflected. Tapping a tile opens a day-view drawer with the verse, mission, and reflection from that day. A "Week N — see what Allah guided you through" card sits near the top if a completed week exists. _(Story: Grove & weekly review refresh)_
7. **Weekly review** — On Sunday morning, tapping the weekly review card takes Aisha to the week page: seven cards stacked vertically, each one a day's reflection with the verse, the mission, a "Did you act on it?" chip, and the reflection text. A closing card at the bottom carries the week's theme line. _(Story: Grove & weekly review refresh)_
8. **Housekeeping and onboarding** — When Aisha visits Settings to change her evening reminder, or when she sends the landing link to a friend, the secondary surfaces (Journal browsing, Settings, Onboarding, Landing, the four-step "How Ghars works" walkthrough, and the marketing welcome page) carry the same visual language and iconography. _(Story: Secondary surfaces polish sweep)_

## Success Metrics

- Every screen in the app renders in both light and dark theme without any hard-coded white, black, or ad-hoc hex values leaking through. Measured by a design-system-consumption audit before sign-off.
- Weekly-returning users rate the visual quality of the app at 4.0 / 5 or higher in an in-app post-reflection prompt run for two weeks after the refresh is live, up from a baseline of 3.1 / 5 in the pre-refresh cohort.
- Evening-reflection completion rate (reflections submitted after 18:00 local time) improves by at least 10% in the four-week window following the release, attributable to the dark theme and the reflect-view refresh.
- Zero regressions in user flows: the full E2E suite that exists for the current app (mission commit, reflection submit, grove growth, weekly review, bookmark toggle) continues to pass unchanged after the refresh.
- In reduced-motion mode, a user can complete the full daily loop without seeing any non-essential animation.

## Dependencies

- Product sign-off on the palette, typography, and motion language before the foundation story is kicked off. The reference is the visual direction already prototyped on `origin/main`; this epic adapts, not copies.
- Availability of the Ghars logo asset and the Arabic wordmark glyph in PNG/SVG form from the brand file.
- Licensing check for the chosen Arabic typeface (Noto Naskh Arabic is Open Font License-permissible) before it ships.
- Decision from Product on whether the dark-mode toggle defaults to system preference or to light — captured as the single open question below.

## Rollout Strategy

- Story 1 (foundation) ships first and is invisible to users — it lands the tokens, typography, icon set, and shadcn-style primitives behind the existing visuals.
- Stories 2–8 can then roll out independently and in any order, each as a self-contained PR. Each story is gated behind no feature flag because the visual change is non-breaking; however, the team may choose to ship behind the existing staging environment first and have an internal cohort confirm the look before promoting to production.
- The epic is considered complete when all eight stories are live in production and the success-metrics audit passes.

## Open Questions

- [x] ~~Should the refresh retain any visual element from the current branch, or adopt the origin/main direction wholesale?~~ — **Resolved:** Adopt origin/main's visual direction wholesale, adapted to the current feature set. Nothing from the current flat layer needs to be preserved.
- [x] ~~Should emoji remain as the tree variants in the grove?~~ — **Resolved:** Switch to lucide/SVG iconography across the app — nav, controls, and plant stages — for a consistent and themeable visual language.
- [x] ~~Dark mode in scope for this epic?~~ — **Resolved:** Yes. Dark mode is Story 2 and every subsequent story must ship dark-theme-ready.
- [ ] Should the dark-mode toggle default to the user's system preference, or to light with an explicit opt-in? — **Status:** Awaiting product decision. Non-blocking for Story 1 (foundation) but must be resolved before Story 2 (dark mode) starts.

---

## Dependencies & Integration

- **Affected features:** Every authenticated screen (`/today`, `/today/reflect` view inside Today, `/grove`, `/grove` day sheet, `/week/[weekId]`, `/journal`, `/settings`) plus the unauthenticated surfaces (`/`, `/onboarding`, `/onboarding/preferences`). No API route, DB table, or server-side module is touched.
- **Shared state:** A new client-readable `theme` preference (`system` | `light` | `dark`) is introduced by Story 2 and persisted in `localStorage` under the key `ghars_theme`. Stories 1, 3–8 must be built token-first so they require no code change when Story 2 flips the theme class on `<html>`.
- **Breaking changes:** None to API, DB, or copy. The only user-facing addition is the Theme picker in Settings (owned by Story 2). The legacy CSS custom properties (`--grove-green`, `--sand`, `--background`, `--foreground`, `--text-muted`) remain resolvable throughout the epic until every consumer has been migrated; they are removed in a clean-up PR after Story 8 lands.
- **Migration path:** Each story 3–8 migrates its target surface off the legacy tokens and onto the new semantic tokens (`--primary`, `--card`, `--muted-foreground`, etc.). Tests (`e2e/today-flow.spec.ts`, `e2e/grove-journal.spec.ts`, `e2e/health.spec.ts`) continue to pass unchanged because all `data-testid` attributes, button labels, and user-facing copy are preserved.

## Shared Architecture Notes

- **Stack is already aligned.** `package.json` already declares `framer-motion@12.38`, `lucide-react@1.11`, `tailwindcss@4`, `@tailwindcss/postcss@4`, `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/react-slider`, `@radix-ui/react-slot`. A `components.json` is present at repo root (`"style": "new-york"`, `"baseColor": "green"`, `"iconLibrary": "lucide"`, `"tailwind.css": "app/globals.css"`, aliases `@/components`, `@/lib/utils`, `@/components/ui`). `lib/utils.ts` already exports `cn()` via `twMerge(clsx(...))`. No new runtime dependency is needed by the epic.
- **Token layer location.** Story 1 lands the new token block in `app/globals.css`, co-existing with the existing legacy tokens. All consumer stories (3–8) write their styles against the new semantic Tailwind classes (`bg-card`, `text-muted-foreground`, `border-border`, `ring-ring`, `text-primary`, `bg-primary`, `rounded-lg`, etc.) and never reach for hex values.
- **Shadcn primitive location.** Story 1 places primitives at `components/ui/button.tsx`, `components/ui/card.tsx`, `components/ui/badge.tsx`, `components/ui/textarea.tsx`. The `components/` directory does not yet exist on this branch and is created by Story 1.
- **Arabic typography.** Noto Naskh Arabic is loaded via `next/font` in `app/layout.tsx` and exposed as a utility class `.arabic-text` (set on `html`, `body`, or `font-family` of the `<p dir="rtl" lang="ar">` block). Story 1 owns this setup. All Arabic content (ayah card, landing wordmark, onboarding headings) consumes this utility.
- **Motion presets.** Story 1 provides a shared motion module at `lib/motion.ts` exporting a small set of variants (`fadeUp`, `stagger`, `cardSpring`) that wrap `useReducedMotion()` so each consumer does not re-implement the reduced-motion branch.
- **Proxy auth is unchanged.** Every page under `/today`, `/grove`, `/journal`, `/week`, `/settings` continues to rely on `proxy.ts` (Next.js 16 replacement for middleware.ts, as documented in `docs/learnings/convention-app-route-middleware.md`). No story in this epic adds or modifies route auth.
- **Test infrastructure is unchanged.** Vitest unit tests live in `tests/unit/*.test.ts`; Playwright E2E live in `e2e/*.spec.ts` (see `playwright.config.ts`, which runs both Chromium Desktop and Mobile Safari `iPhone 13` projects). Each story's Verification section maps its Key Scenarios to either an existing E2E file or a new one under `e2e/visual-*.spec.ts`. The existing `e2e/today-flow.spec.ts` and `e2e/grove-journal.spec.ts` must continue to pass untouched across all 8 stories.
- **Exemplar files.** The `origin/main` branch — commits up to `a36bbf8` — contains a more mature visual layer including `components/ui/button.tsx`, `components/ui/card.tsx`, `components/ui/gradient-card.tsx`, `components/AppHeader.tsx`, `components/MarkerReveal.tsx`, `components/MissionCelebration.tsx`. These are reference implementations only; each story reviews the `origin/main` exemplar before adapting it to the current feature set. No file is copied verbatim — behaviour must match the current branch, only presentation is refreshed.

## Cross-Story Verification Rollup

| Verification gate                                                                  | Owner story                              |
| ---------------------------------------------------------------------------------- | ---------------------------------------- |
| New token layer exists, legacy tokens still resolve, visual-diff clean on Day 0    | Story 1 (Design System Foundation)       |
| Both themes render every surface without bright-white leak                         | Story 2 (Dark mode)                      |
| Every `app/(app)/*` surface shows refreshed header + bottom nav                    | Story 3 (App shell)                      |
| `e2e/today-flow.spec.ts` "user can read today's ayah and commit to a mission" test | Stories 4 and 5 jointly (must both pass) |
| `e2e/today-flow.spec.ts` "user can submit an evening reflection" test              | Story 6 (Reflect view)                   |
| `e2e/grove-journal.spec.ts` grove + journal flows                                  | Stories 7 and 8                          |
| All 8 stories: `npm run test` (Vitest) passes, `npm run test:e2e` passes           | Each story's Verification section        |

## Negative Constraints (Shared)

- **Do NOT** modify `proxy.ts` or any route under `app/api/**` in any story in this epic.
- **Do NOT** change any `data-testid` attribute used by `e2e/*.spec.ts`; tests must pass unchanged.
- **Do NOT** change any user-facing copy string, button label, error message, or placeholder text.
- **Do NOT** introduce a new runtime dependency beyond the font (`next/font/google` for Noto Naskh Arabic) — every other package this epic requires is already in `package.json`.
- **Do NOT** re-introduce retired components (`RadialNav`, `MarkerReveal`, `TasbihWidget`, `CirclesWidget`, `WordWidget`, `ExploreWidget`, `GardenGrove`, `PlantUnlockModal` from `origin/main`). Those belong to scopes out of this epic.
