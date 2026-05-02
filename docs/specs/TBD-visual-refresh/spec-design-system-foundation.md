# Design System Foundation

**Ticket:** TBD
**Type:** Technical — Infrastructure

This story lands the invisible groundwork that every other story in the visual refresh epic will build on: the Ghars colour token layer, a semantic naming scheme ready for dark mode, the radius and focus rules, the Arabic typeface, the lucide icon set, a framer-motion baseline, and a small set of shadcn-style primitives (Button, Card, Badge, Textarea). It ships without changing the look of a single existing screen, because no consumer has been migrated yet. What it protects is velocity and visual consistency: once it is in place, stories 2–8 can each focus on their own surface instead of re-inventing tokens, typography, and motion presets in isolation.

## Motivation

**Current state:** The app uses a small set of ad-hoc custom properties (a grove green, a sand background, a foreground ink, and a muted text) alongside inline hex values scattered through individual components. There is no semantic mapping (no "primary", no "card", no "accent"), so every new screen has to choose its own palette names, and there is no structural hook that a future dark theme can hang off. Arabic text falls back to the system sans-serif. Icons are a mix of emoji and ad-hoc SVGs. There is no shared motion library and no shared reduced-motion safety net — each surface would have to reimplement those concerns.

**Desired state:** A single token layer defines the Ghars palette under semantic names. The palette is shaped so that a later dark-theme story can swap the underlying values without any consumer ever knowing. A shared radius scale, focus-visible outline rule, reduced-motion safety net, and smooth-scroll baseline are applied globally. The Arabic typeface is loaded once and exposed as a utility class that any Arabic text can opt into. Lucide is the single icon source for the chrome. Framer-motion is the single motion source, with a small set of shared presets that automatically honour the user's reduced-motion preference. A Button, a Card, a Badge, and a Textarea primitive — each styled against the token layer — are available for the rest of the epic to consume.

**Trigger:** The seven user-facing stories in the epic all depend on a consistent palette, typography, icon set, and motion language. Shipping any of them before this foundation would force each story to reinvent those concerns, bake in visual drift, and create a painful reconciliation PR at the end. Landing the foundation first keeps the rest of the epic cheap, consistent, and reversible.

## Scope

- **In scope:**
  - A new token layer exposing the Ghars palette under semantic names: background, foreground, card and card-foreground, primary and primary-foreground, secondary and secondary-foreground, muted and muted-foreground, accent and accent-foreground, border, input, ring, and destructive. The underlying values carry the epic's palette — a green-family primary, a cream background, cream-mist and cream-deep atmospheric variants, an amber accent reserved for celebration, ink-soft neutrals, a green-fog translucent token, and a destructive red.
  - A shared radius scale (small, medium, large) that every primitive and every future surface consumes instead of ad-hoc corner values.
  - A global focus-visible outline rule that is clearly visible on both a cream surface and a future dark surface.
  - A global reduced-motion safety net that disables non-essential animation when the user's system preference is set.
  - A global smooth-scroll behaviour baseline.
  - The Noto Naskh Arabic typeface, loaded once and exposed as a utility class consumable on any Arabic text block, with a sensible fallback while the webfont is in flight.
  - The lucide icon package as the canonical icon source for app chrome, with a declared default size scale (small, medium, large) that every consumer uses.
  - The framer-motion motion library as the canonical motion source, plus a small set of shared presets (entrance stagger, fade-up, spring for cards) that honour the user's reduced-motion preference automatically.
  - Shadcn-style primitives — Button, Card, Badge, Textarea — styled exclusively against the token layer and exported from a single shared module so stories 3–8 consume them directly.
  - The existing legacy custom properties (grove-green, sand, background, foreground, text-muted) continue to resolve correctly so that screens which have not yet been migrated render exactly as they did before.
- **Out of scope:**
  - Any visible change to any existing screen. Today, Reflect, Grove, Week, Journal, Settings, Onboarding, and the landing page must look byte-for-byte the same after this story ships.
  - The dark theme. This story only structures the palette so a second set of values can be added later; it does not add that second set.
  - Migrating any existing component off the legacy custom properties. That is the job of stories 2–8.
  - Any new user-facing feature, setting, screen, or flow.
  - Any change to an API, a stored record, or a business rule.

## Goals

- Every palette colour required by the epic is reachable under a single semantic name, so no subsequent story needs to invent a colour token.
- Every shared primitive (Button, Card, Badge, Textarea) is available from a single place and derives its colour, radius, and focus ring exclusively from the token layer.
- Every surface in the app inherits a visible focus-visible outline, a reduced-motion safety net, and a smooth-scroll baseline automatically, without each surface opting in.
- Arabic text anywhere in the app can adopt the designated typeface through a single utility class, and no Arabic glyph falls back to the system sans-serif once the class is applied.
- Zero visible change on any existing screen on the day this ships, verified by visual inspection of Today, Reflect, Grove, Week, Journal, Settings, Onboarding, and the landing page.

## Non-Goals

- This story does not introduce the dark theme, a theme toggle, or any user-facing setting related to appearance. That is Story 2.
- This story does not adopt the new token layer in any existing screen. Adoption happens screen-by-screen in stories 3–8.
- This story does not add any new screen, navigation target, or copy.
- This story does not touch any server-side code, any data model, or any business logic.
- This story does not remove the legacy custom properties; they remain in place for backwards compatibility until every consumer has been migrated in later stories.

## Success Criteria

- A design-system consumption check confirms that every semantic token named in Scope resolves to a concrete colour value and is reachable by a new component without re-declaring any hex value.
- A visual-diff pass across Today, Reflect, Grove, Week, Journal, Settings, Onboarding, and the landing page shows no perceptible change against the pre-story baseline.
- A new UI built against the primitives (for example, a primary button, a card surface, a soft-muted badge, and a destructive outline) renders in the Ghars palette on first attempt, with no palette-related code living in the new UI itself.
- With the user's reduced-motion preference set at the system level, every shared motion preset produces no motion and the functional end-state is still reached.
- An Arabic verse body and the Arabic wordmark, when given the designated utility class, render in Noto Naskh Arabic, and a slow webfont load falls back to a readable serif rather than a bare system sans-serif.
- Lucide icons used in a new surface render at the small, medium, and large sizes declared by the system, with no per-call size override required.

## Acceptance Criteria

### Scenario: A new primary button consumes the token layer with no hex values in the component

```gherkin
Given the design system foundation has shipped
  And no existing screen has yet been migrated to the new layer
When an engineer builds a new surface that renders a primary button labelled "Commit"
  And the engineer writes the button using only the shared Button primitive
Then the button renders on a cream surface in the green-family primary colour with white-cream foreground text
  And the button's rounded corners come from the shared radius scale
  And the button shows a visible focus ring when reached by keyboard
  And the button source contains no hex colour value, no ad-hoc corner radius, and no bespoke focus outline
```

### Scenario: Existing screens look identical after the foundation lands

```gherkin
Given the app before this story shipped renders Today, Reflect, Grove, Week, Journal, Settings, Onboarding, and the landing page in their current cream-and-green minimal look
  And none of those screens has been migrated to the new token layer yet
When the design system foundation is merged and deployed
Then each of those screens renders byte-for-byte the same as before
  And no user-facing element changes its colour, corner radius, typeface, spacing, or motion
  And the legacy custom properties (grove-green, sand, background, foreground, text-muted) continue to resolve to the values they resolved to before
```

### Scenario: Semantic tokens cover every palette role the epic requires

```gherkin
Given the design system foundation has shipped
When a consumer looks up the available semantic tokens
Then they find a token for each of the following roles
  | Role                | Intended use                                                       |
  | background          | Page-level cream surface behind all content                         |
  | foreground          | Ink body-copy colour on the cream background                        |
  | card                | Card surface tint, slightly distinct from the page background      |
  | card-foreground     | Body copy colour on a card surface                                 |
  | primary             | Green-family colour for primary actions and selected states         |
  | primary-foreground  | Text colour used on a primary-filled surface                        |
  | secondary           | Softer supporting surface tint for quiet controls                   |
  | secondary-foreground| Text colour used on a secondary surface                             |
  | muted               | Cream-mist tint for hushed background blocks                        |
  | muted-foreground    | Lower-contrast ink for helper text and timestamps                   |
  | accent              | Amber reserved for celebration moments                              |
  | accent-foreground   | Text colour used on an amber-filled surface                         |
  | border              | Default hairline divider colour                                     |
  | input               | Field surface colour for text inputs and textareas                  |
  | ring                | Focus-ring colour used by the global focus-visible rule             |
  | destructive         | Red reserved for irreversible destructive actions                   |
  And each token is consumable under its semantic name, not under a palette-specific hex alias
  And the green-fog translucent tint, the cream-mist atmosphere, and the cream-deep atmosphere are all reachable under named tokens
```

### Scenario: A shared motion preset honours the user's reduced-motion preference

```gherkin
Given the design system foundation has shipped
  And the shared motion presets (entrance stagger, fade-up, spring for cards) are available from a single shared module
When an engineer applies the fade-up preset to a card on a new surface
  And the user's system-level reduced-motion preference is enabled
Then the card appears in its final position and opacity without animating
  And any entrance stagger applied to sibling cards is skipped
  And any functional state change the card carries (for example, switching from "Committing…" to "Committed") still completes
When the same surface is viewed by a user whose reduced-motion preference is not enabled
Then the card fades and rises into position using the shared preset
  And the spring response feels consistent with every other card across the app
```

### Scenario: An Arabic verse body adopts the designated typeface through a single utility

```gherkin
Given the design system foundation has shipped
  And the Noto Naskh Arabic typeface is loaded once at the app shell level
When an engineer renders an Arabic verse body and applies the designated Arabic utility class
Then the verse renders in Noto Naskh Arabic with a restful RTL line-height
  And no glyph in the verse falls back to the system sans-serif
When the webfont is slow to arrive on a cold network
Then the verse falls back to a readable serif rather than a bare sans-serif while the webfont is in flight
  And the verse re-flows to Noto Naskh Arabic once the webfont has loaded without shifting layout noticeably
```

### Scenario: Lucide icons render consistently at declared sizes with no per-call overrides

```gherkin
Given the design system foundation has shipped
  And the lucide icon package is available as the canonical icon source
When an engineer places a home icon in a navigation bar at the medium size, a chevron on a card at the small size, and a celebration icon in a hero moment at the large size
Then each icon renders in the corresponding size from the declared scale
  And each icon inherits its stroke colour from the surrounding text colour token
  And no call site needs to pass a custom pixel size or a custom stroke colour
  And no emoji is used anywhere in the app chrome for the same purpose
```

### Scenario: A destructive action inherits the destructive token without bespoke styling

```gherkin
Given the design system foundation has shipped
When an engineer builds a "Delete account" outline button in Settings using the shared Button primitive in its destructive variant
Then the button's border and label render in the destructive red defined by the token layer
  And the button shows the same visible focus ring as every other button when reached by keyboard
  And the button honours the shared radius scale and the global reduced-motion safety net
  And the button source contains no hex red value and no bespoke outline declaration
```

## Constraints

- **Backwards compatibility:** The existing legacy custom properties — grove-green, sand, background, foreground, text-muted — must keep resolving to the values they resolve to today. The new token layer lives alongside them, not instead of them. Consumers are migrated off the legacy properties screen-by-screen in subsequent stories; until a consumer is migrated, it continues to use the legacy properties unchanged. No existing component is rewritten in this story.
- **Downtime:** Zero. This story produces no user-visible change, so there is no user-facing rollout window to manage. It ships as a normal release.
- **Rollback:** The story must be fully reversible by removing the new token block from the global stylesheet, removing the new shadcn-style primitives from the shared module, removing the shared motion presets, and uninstalling the lucide, framer-motion, and Noto Naskh Arabic additions. Because no existing consumer depends on any of those new things at the moment of this release, rollback leaves the app in its pre-story state with no orphaned references.

## Dependencies

- Product sign-off on the concrete palette values (cream background, cream-mist, cream-deep, green primary, green-fog translucent, amber accent, ink-soft neutrals, destructive red) before the token layer is committed. The reference is the visual direction already prototyped on origin/main; this story adapts those exact values into semantic tokens.
- Licensing confirmation that Noto Naskh Arabic is cleared under the Open Font License for bundling into the PWA.
- Availability of the lucide icon package and the framer-motion motion library as dependencies that the project is willing to adopt epic-wide.

## Open Questions

- [x] ~~Should this story migrate any existing screen onto the new token layer to prove it works end-to-end?~~ — **Resolved:** No. The story ships the foundation only; adoption is the explicit job of stories 2–8. A migration in this story would both widen its blast radius and break the "zero visible change" guarantee that makes it safe to land first.
- [x] ~~Should the legacy custom properties be removed as part of this story?~~ — **Resolved:** No. They stay until every consumer has been migrated off them in stories 2–8. Removing them here would force a same-PR migration of every screen, which is exactly what landing the foundation separately is meant to avoid.
- [x] ~~Does this story need to introduce the dark-theme value set so downstream stories can wire up the toggle sooner?~~ — **Resolved:** No. Shaping the token layer so dark mode can plug in later is in scope; adding the second value set is Story 2's job. Keeping the dark-theme values out of this story preserves its "invisible landing" guarantee.

---

## Solution Design

The story adds a parallel token layer to `app/globals.css` without removing or touching the existing legacy custom properties. The legacy block (`--background: #fafaf8`, `--foreground: #1a1a18`, `--grove-green: #1a4731`, `--grove-green-light: #2d6a4f`, `--sand: #f5f0e8`, `--text-muted: #6b7280`) remains resolvable exactly as today. A new shadcn-style token block is appended alongside, scoped under `:root` for the light theme, and shaped so that Story 2 can later fill in a `.dark { … }` block without touching any consumer. The two sets coexist from Story 1 through the end of Story 8; a clean-up PR after the epic closes removes the legacy tokens once no consumer references them.

**Token block — semantic palette under `:root`:**

```css
:root {
  /* New shadcn-style semantic layer (coexists with legacy tokens above) */
  --background: #faf7f0; /* overrides legacy #fafaf8 — cream base */
  --foreground: #1a1a1a; /* overrides legacy #1a1a18 — ink body */
  --card: #ffffff;
  --card-foreground: #1a1a1a;
  --popover: #ffffff;
  --popover-foreground: #1a1a1a;
  --primary: #2d6a4f; /* green-family */
  --primary-foreground: #ffffff;
  --secondary: #f0f5f2;
  --secondary-foreground: #1a3a2a;
  --muted: #f0f5f2;
  --muted-foreground: #666666;
  --accent: #52b788; /* amber reserved for celebration via `--amber` below */
  --accent-foreground: #1a3a2a;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: rgba(82, 183, 136, 0.2);
  --input: rgba(82, 183, 136, 0.2);
  --ring: #2d6a4f;
  --radius: 0.75rem;

  /* Brand tokens kept as aliases for direct use by future chrome */
  --green-dark: #1a3a2a;
  --green-mid: #2d6a4f;
  --green-light: #52b788;
  --cream: #faf7f0;
  --amber: #d4a017;

  /* Atmospheric extras */
  --cream-deep: #f3ede0;
  --cream-mist: rgba(250, 247, 240, 0.55);
  --ink-soft: #5b6b62;
  --green-fog: rgba(82, 183, 136, 0.1);
}
```

**Note on legacy override:** the existing `--background` and `--foreground` values (`#fafaf8` / `#1a1a18`) are overwritten by near-identical values (`#faf7f0` / `#1a1a1a`). The delta is imperceptible to the eye and inside display-calibration noise; the visual-diff verification (Test 3 below) is the gate. The remaining legacy tokens (`--grove-green`, `--grove-green-light`, `--sand`, `--text-muted`) are left untouched.

**Radius scale** — the `@theme inline { … }` block (Tailwind v4 mapping) derives four radii from the single `--radius: 0.75rem` source:

```css
@theme inline {
  /* …color mappings… */
  --radius-sm: calc(var(--radius) - 4px); /* 0.5rem / 8px */
  --radius-md: calc(var(--radius) - 2px); /* 0.625rem / 10px */
  --radius-lg: var(--radius); /* 0.75rem / 12px */
  --radius-xl: calc(var(--radius) + 4px); /* 0.875rem / 14px */
}
```

**Global rules** appended to `app/globals.css`:

```css
html {
  scroll-behavior: smooth;
}

:focus-visible {
  outline: 2px solid var(--green-mid);
  outline-offset: 2px;
  border-radius: 4px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

.arabic-text {
  font-family:
    var(--font-arabic), "Noto Naskh Arabic", "Scheherazade New",
    "Traditional Arabic", serif;
  direction: rtl;
  line-height: 2.2;
  font-size: 1.5rem;
}
```

**Arabic typeface wiring in `app/layout.tsx`** — import Noto Naskh Arabic through `next/font/google` and expose it as a CSS variable on `<html>`:

```tsx
import { Noto_Naskh_Arabic } from "next/font/google";

const notoNaskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={notoNaskh.variable}>
      <body>{children}</body>
    </html>
  );
}
```

The `--font-arabic` CSS variable is consumed by the `.arabic-text` utility above so the fallback order is `Noto Naskh Arabic` → `Scheherazade New` → `Traditional Arabic` → `serif` (never system sans-serif).

**Shared motion module at `lib/motion.ts`** — small, tree-shakeable module exporting three variants plus a spring preset. Each variant internally branches on `useReducedMotion()` so consumers never have to write the reduced-motion branch themselves:

```ts
import type { Variants } from "framer-motion";
import { useReducedMotion } from "framer-motion";

export const cardSpring = {
  type: "spring",
  stiffness: 300,
  damping: 28,
  mass: 0.9,
} as const;

export function useFadeUp(): Variants {
  const reduce = useReducedMotion();
  return reduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 8 },
        show: { opacity: 1, y: 0, transition: cardSpring },
      };
}

export function useStagger(step = 0.06): Variants {
  const reduce = useReducedMotion();
  return { show: { transition: { staggerChildren: reduce ? 0 : step } } };
}
```

The static `fadeUp`, `stagger` variant constants are also exported (non-hook form) for use inside `motion.*` elements that are not themselves React hooks; the hook form is what every consumer story uses.

**Shadcn primitives at `components/ui/*`** — the `components/` directory does not exist on this branch; Task 3 creates it. Each primitive is hand-authored to match the `origin/main` exemplar shape byte-for-byte so Stories 3–8 consume an identical API. Every primitive imports `cn` from `@/lib/utils` and consumes tokens only — no hex values in the component body:

- `components/ui/button.tsx` — `Button`, `buttonVariants` via CVA. Variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`. Sizes: `default` (`h-9 px-4`), `sm` (`h-8`), `lg` (`h-11`), `icon` (`h-9 w-9`). Uses `@radix-ui/react-slot` for `asChild`.
- `components/ui/card.tsx` — `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`. Variants: `default`, `mission`, `stat`.
- `components/ui/badge.tsx` — `Badge`, `badgeVariants`. Variants: `default`, `secondary`, `destructive`, `outline`, `amber`.
- `components/ui/textarea.tsx` — standard shadcn textarea consuming `border-input`, `bg-transparent`, `ring-ring`, `rounded-md`.

### Changes

- `app/globals.css` — append the new semantic token block under `:root`, add the `@theme inline` radius scale mapping, add the global `html { scroll-behavior }` rule, `:focus-visible` rule, `@media (prefers-reduced-motion)` safety net, and the `.arabic-text` utility class. Leave the legacy token block and the `.tafsir-prose` rules untouched.
- `app/layout.tsx` — add the `next/font/google` import for `Noto_Naskh_Arabic`, instantiate it with `variable: "--font-arabic"`, and attach its `.variable` className to `<html>`.
- `components/ui/button.tsx` — new file. CVA-based Button primitive with six variants and four sizes.
- `components/ui/card.tsx` — new file. Card plus Header/Title/Description/Content/Footer sub-components and three variants.
- `components/ui/badge.tsx` — new file. Five-variant Badge primitive.
- `components/ui/textarea.tsx` — new file. Token-consuming Textarea primitive.
- `lib/motion.ts` — new file. Exports `cardSpring`, `useFadeUp`, `useStagger`, plus static `fadeUp` and `stagger` variant objects for non-hook contexts.
- `components/ui/index.ts` — optional barrel export re-exporting the four primitives. Not strictly required; include only if Stories 3–8 prefer a single import line.

### Architecture Notes

- **New dependencies:** none. `framer-motion@12.38`, `lucide-react@1.11`, `tailwindcss@4`, `@tailwindcss/postcss@4`, `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/react-slot`, `@radix-ui/react-slider` are all already in `package.json`. The only net-new import is `next/font/google`, which ships with `next@16.2.4` and requires no `npm install`.
- **Dependencies & integration:** zero visible impact on any existing screen. No file under `app/(app)/`, `app/api/`, or `lib/` (except the new `lib/motion.ts`) is touched. `proxy.ts` is not touched. The `e2e/` suite is not touched. Every subsequent story in the epic (2–8) depends on this foundation landing first; nothing else in the codebase consumes it on Day 0.
- **Backwards-compatibility guarantees:** the override of `--background` from `#fafaf8` to `#faf7f0` and `--foreground` from `#1a1a18` to `#1a1a1a` are the only behavioural deltas on unmigrated screens. These are indistinguishable at normal viewing distance and are gated by the visual-diff verification step (Test 3).
- **Theme-readiness:** the `:root` block is structured so Story 2 can add `html.dark { --background: …; --foreground: …; … }` with no consumer change. The `--ring` token drives the global `:focus-visible` outline colour so dark mode can re-tint the focus ring without touching any component.

### Exemplar Files

- `origin/main:app/globals.css` (lines 1–65) — reference for the token block shape, the `@theme inline` Tailwind v4 mapping, and the `.arabic-text` utility. Adapt; do not copy verbatim. The current branch's `.tafsir-prose` rules must be preserved in place.
- `origin/main:components/ui/button.tsx` — reference for the CVA Button primitive API shape. Variant and size enums must match so Stories 3–8 consume the same props surface as on `origin/main`.
- `origin/main:components/ui/card.tsx` — reference for the Card + sub-component split and the three variants (`default`, `mission`, `stat`).
- `origin/main:components/ui/badge.tsx` — reference for the five-variant Badge (including the `amber` celebration variant).
- `origin/main:components/ui/gradient-card.tsx` — reference for the spring values (`stiffness: 300, damping: 28, mass: 0.9`) that feed `cardSpring` in `lib/motion.ts`. Only the numeric constants are borrowed; the component itself is not introduced in this story (it belongs to later visual stories if at all).

### Implementation Plan — Sub-tasks

**Task 1: Token layer + global rules in `app/globals.css`** — _small_ (<100 LOC)

- Files: `app/globals.css`
- INDEPENDENT
- Append the semantic token block under `:root`, the `@theme inline` radius scale mapping, the `:focus-visible` rule, the `@media (prefers-reduced-motion)` safety net, and the `html { scroll-behavior: smooth }` baseline. Leave the legacy token block and `.tafsir-prose` rules intact. Add the `.arabic-text` utility selector (its `var(--font-arabic)` reference is finalised in Task 2).

**Task 2: `next/font` Noto Naskh Arabic wiring in `app/layout.tsx`** — _small_ (<100 LOC)

- Files: `app/layout.tsx`, `app/globals.css` (verifies the `.arabic-text` utility resolves the new variable)
- SEQUENTIAL — depends on Task 1 (the `.arabic-text` class must already exist in `globals.css` before this task's `--font-arabic` variable is attached).
- Import `Noto_Naskh_Arabic` from `next/font/google`, instantiate with `subsets: ["arabic"]`, `variable: "--font-arabic"`, `display: "swap"`, `weight: ["400", "500", "600", "700"]`, and attach the generated `.variable` className to `<html>`.

**Task 3: Shadcn primitives (Button, Card, Badge, Textarea)** — _medium_ (100–300 LOC)

- Files: `components/ui/button.tsx`, `components/ui/card.tsx`, `components/ui/badge.tsx`, `components/ui/textarea.tsx`
- SEQUENTIAL — depends on Task 1 (tokens must exist so CVA classNames resolve).
- Create the `components/` and `components/ui/` directories. Hand-author each primitive to match the `origin/main` exemplar API exactly: variant names, size names, and exported symbols. No primitive contains a hex value; all colour, radius, focus-ring, and border styling flows through token-backed Tailwind utilities (`bg-primary`, `text-primary-foreground`, `rounded-lg`, `ring-ring`, `border-input`, etc.).

**Task 4: Shared motion presets in `lib/motion.ts`** — _small_ (<100 LOC)

- Files: `lib/motion.ts`
- INDEPENDENT — can run in parallel with Task 2 or Task 3.
- Export `cardSpring` constant, `useFadeUp()` and `useStagger(step?)` hooks wrapping `useReducedMotion()`, plus static `fadeUp` and `stagger` variant objects for non-hook consumers.

**Task 5: Verification — visual-diff check across all existing screens** — _small_ (<100 LOC, zero production files)

- Files: none (verification task). Screenshots land in `.tmp/visual-diff/` for human review.
- SEQUENTIAL — depends on Tasks 1–4 all landing.
- Run `npm run test`, `npm run test:e2e`, and a manual screenshot pass of `/`, `/onboarding`, `/onboarding/preferences`, `/today`, `/grove`, `/journal`, `/week/1`, `/settings`. Confirm no perceptible change against the pre-story baseline.

### Negative Constraints

- Do NOT remove any legacy custom property from `app/globals.css` in this story (`--grove-green`, `--grove-green-light`, `--sand`, `--text-muted`). They stay resolvable until Story 8 lands.
- Do NOT modify any file under `app/(app)/`, `app/api/`, `lib/qf/`, `lib/db/`, `middleware.ts`, or `proxy.ts`. The only `lib/` file touched is the net-new `lib/motion.ts`.
- Do NOT modify any existing component outside `components/ui/` (the directory is net-new in this story).
- Do NOT change any `data-testid` attribute anywhere in the repo.
- Do NOT introduce a new runtime dependency beyond `next/font/google` (which ships with Next.js 16.2.4 and requires no `npm install`).
- Do NOT adopt the new token layer in any existing consumer — migration is the explicit job of Stories 3–8.
- Do NOT add a dark-theme value set; Story 2 owns that.

### Test Scenarios

**Test 1: Token layer resolves**

- Setup: Story 1 shipped to staging. Log in with demo credentials via `page.request.post('/api/auth/demo')` per `docs/learnings/pattern-playwright-demo-auth.md`, then navigate to `/today`.
- Action: In DevTools, run `getComputedStyle(document.documentElement).getPropertyValue('--primary')`.
- Expected: returns `#2d6a4f` (trimmed). Similarly `--background` returns `#faf7f0`, `--accent` returns `#52b788`, `--destructive` returns `#ef4444`, `--ring` returns `#2d6a4f`.

**Test 2: Legacy tokens still resolve**

- Setup: Story 1 shipped. No consumer migrated.
- Action: In DevTools, read `--grove-green`, `--grove-green-light`, `--sand`, `--text-muted`.
- Expected: resolve to `#1a4731`, `#2d6a4f`, `#f5f0e8`, `#6b7280` respectively — the exact values they resolved to before the story landed.

**Test 3: Visual diff across all screens**

- Setup: Capture `.tmp/visual-diff/before/*.png` screenshots of `/`, `/onboarding`, `/onboarding/preferences`, `/today`, `/grove`, `/journal`, `/week/1`, `/settings` from the pre-story baseline (current `feature/ghars-pwa-fresh-start` HEAD) at a 390×844 viewport (iPhone 13 in Playwright). Build Story 1 on top. Capture `after/*.png`.
- Action: Pixel-diff each pair using any image-diff tool (e.g. `pixelmatch`, default threshold `0.1`).
- Expected: all eight screens show zero perceptible difference to the human eye; per-pixel delta under the threshold accounts only for anti-aliasing noise from the near-identical `--background` override (`#fafaf8` → `#faf7f0`).

**Test 4: Reduced-motion global safety net**

- Setup: System preference `prefers-reduced-motion: reduce` on (set via Playwright `page.emulateMedia({ reducedMotion: 'reduce' })`). Navigate to `/today` where a placeholder element with an animation (`<div class="sparkle" style="animation: pulse 1s infinite"/>`) is temporarily inserted.
- Action: Read computed `animation-duration` and `animation-iteration-count`.
- Expected: `animation-duration: 0.01ms`, `animation-iteration-count: 1` (forced by the `@media (prefers-reduced-motion: reduce)` rule in `globals.css`).

**Test 5: Arabic font utility**

- Setup: Render a fragment `<p dir="rtl" lang="ar" className="arabic-text">بِسْمِ ٱللَّهِ</p>` inside a harness page. `next/font` has fully loaded.
- Action: In DevTools, read computed `font-family` of the `<p>`.
- Expected: the computed value begins with the `next/font`-generated hashed class name resolving to Noto Naskh Arabic and the fallback chain reads `"Noto Naskh Arabic", "Scheherazade New", "Traditional Arabic", serif`. No `system-ui` or `sans-serif` appears in the chain.

### Acceptance Criteria

- [ ] `app/globals.css` declares the full semantic token set under `:root` (`--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--destructive-foreground`, `--border`, `--input`, `--ring`)
- [ ] `app/globals.css` declares the atmospheric extras (`--cream-deep: #f3ede0`, `--cream-mist: rgba(250, 247, 240, 0.55)`, `--ink-soft: #5b6b62`, `--green-fog: rgba(82, 183, 136, 0.1)`)
- [ ] Radius scale derives from `--radius: 0.75rem` via `@theme inline` (`--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`)
- [ ] Legacy tokens (`--grove-green`, `--grove-green-light`, `--sand`, `--text-muted`) remain declared in `app/globals.css` and resolve to their pre-story values
- [ ] `app/layout.tsx` imports `Noto_Naskh_Arabic` from `next/font/google` with `variable: "--font-arabic"` and attaches `.variable` to `<html>`
- [ ] `.arabic-text` utility exists in `app/globals.css` and consumes `var(--font-arabic)` with the correct fallback chain
- [ ] `components/ui/button.tsx`, `components/ui/card.tsx`, `components/ui/badge.tsx`, `components/ui/textarea.tsx` exist and compile
- [ ] Each primitive's source contains zero hex colour values and derives styling from tokens only
- [ ] `lib/motion.ts` exports `cardSpring`, `useFadeUp`, `useStagger`, `fadeUp`, `stagger`, and each hook internally calls `useReducedMotion()`
- [ ] `:focus-visible` rule applied globally with `outline: 2px solid var(--green-mid)`
- [ ] `@media (prefers-reduced-motion: reduce)` safety net present and scoped to `*, *::before, *::after`
- [ ] `html { scroll-behavior: smooth }` baseline present
- [ ] `npm run test` (Vitest) passes
- [ ] `npm run test:e2e` (Playwright, both Chromium Desktop and Mobile Safari iPhone 13 projects) passes unchanged
- [ ] Visual-diff (Test 3) shows no perceptible change on all eight screens
- [ ] No TypeScript errors (`tsc --noEmit` clean)
- [ ] No Prettier / lint warnings on changed files

### Verification

Run the `did-workflow:verifier` skill after each sub-task completes.

**Backend Tests:** N/A — no server-side code, no API route, no DB schema, and no business logic is touched by this story.

**Manual Verification:**

- [ ] Navigate through `/today`, `/grove`, `/journal`, `/week/1`, `/settings`, `/onboarding`, `/onboarding/preferences`, `/` (logged in where required) and confirm each renders identically to the pre-story baseline to the naked eye.
- [ ] DevTools: every new semantic token listed in Scope resolves to a concrete colour string (no empty values, no fallback to inherited values).
- [ ] DevTools: every legacy token (`--grove-green`, `--grove-green-light`, `--sand`, `--text-muted`) resolves to its pre-story value.
- [ ] DevTools: `getComputedStyle(document.documentElement).getPropertyValue('--radius-sm')` returns `calc(0.75rem - 4px)` (or the computed `8px` equivalent once resolved).
- [ ] With `prefers-reduced-motion: reduce` enabled at the OS level, entrance animations on any page that triggers one are globally disabled.
- [ ] Arabic text rendered with `.arabic-text` utility shows Noto Naskh Arabic glyphs (visually distinct from system sans-serif).

**E2E Tests:** No new E2E files added. The two existing suites must continue to pass unchanged:

| Scenario                                               | Test file                   | Assigned sub-task |
| ------------------------------------------------------ | --------------------------- | ----------------- |
| Existing Today flow (read ayah, commit, reflect)       | `e2e/today-flow.spec.ts`    | Task 5            |
| Existing Grove/Journal flow (growth, bookmark, search) | `e2e/grove-journal.spec.ts` | Task 5            |
| App health-check smoke                                 | `e2e/health.spec.ts`        | Task 5            |

### Open Questions

- [x] ~~Should this story migrate any existing screen onto the new token layer to prove it works end-to-end?~~ — **Resolved** (business section above): No. Adoption is the explicit job of Stories 2–8.
- [x] ~~Should the legacy custom properties be removed as part of this story?~~ — **Resolved** (business section above): No.
- [x] ~~Does this story need to introduce the dark-theme value set so downstream stories can wire up the toggle sooner?~~ — **Resolved** (business section above): No.
- [x] ~~Is the shadcn CLI used to scaffold primitives or are they hand-authored?~~ — **Resolved:** Hand-authored to match the `origin/main` exemplar shape exactly (variant names, size names, exported symbols, CVA structure). Stories 3–8 consuming these primitives must get an identical API surface to what `origin/main` offers, which the shadcn CLI would not guarantee across future CLI version drift.
