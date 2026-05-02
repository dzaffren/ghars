---
name: framer-motion-svg-transforms
description: framer-motion scale/translate on SVG elements shifts position in the viewBox — prefer opacity or native pathLength
type: blocker
captured: 2026-05-02
source: /learn (captured after GardenPlant animation rewrite was reverted)
---

Applying CSS-transform animations (`scale`, `translate`, `rotate`) to SVG
elements via `motion.ellipse`, `motion.path`, `motion.circle`, or
`motion.g` breaks their position in the viewBox. Two failure modes:

1. **CSS transform clobbers SVG `transform` attribute.** If an element has
   `transform="rotate(deg cx cy)"` in the JSX (the idiomatic SVG way to
   rotate around a point), framer-motion's CSS transform overwrites it
   and the rotation is lost.
2. **Scale anchors at viewBox origin (0,0).** Without `transformBox:
fill-box`, an element at `(cx=48, cy=98)` scaling from 0.35 → 1 slides
   toward the top-left corner of the viewBox as it scales. Adding
   `transformBox: fill-box; transformOrigin: center` helps on
   leaves/circles but is unreliable for nested `<motion.g>` children —
   browsers disagree on how to compute the fill-box of a group.

What DOES work reliably on SVG:

- **`opacity` animations** — no transform issue; just fade in/out.
- **Native SVG `pathLength`** (for `<motion.path>` with `strokeDasharray`/
  `strokeDashoffset`, or direct `pathLength="0→1"`) — stem-drawing effect,
  no position drift.
- **CSS transforms on a wrapping HTML `<div>`** around the entire SVG
  (e.g. plant-wide sway) — the SVG viewBox is untouched, only the
  containing element moves.

**Why:** We rewrote `components/GardenPlant.tsx` to a single composite SVG
with per-element scale-and-fade-in animations driven by growth points.
Elements rendered in visibly wrong positions (leaves floating away from
stems, flowers off-centre). Fixing with `transformBox: fill-box` partially
improved things but did not fully resolve for `<motion.g>` clusters. We
reverted to discrete per-stage scenes with opacity cross-fade +
`pathLength` stem-drawing on newly mounted stages, which rendered cleanly.

**How to apply:** For any new SVG animation in this repo:

1. Default to `opacity` or `pathLength` — they're safe.
2. For "unfurl" or "pop in" effects, scale the **wrapping HTML div** of
   the SVG, not the SVG elements themselves.
3. If you must scale an SVG element directly, test across at least one
   mobile Safari viewport — fill-box behaviour varies. Budget an extra
   iteration to debug positioning.
4. Avoid `<motion.g>` with scale children entirely. Ship it as a single
   motion.svg or motion HTML wrapper instead.

**What was tried:**

- First attempt: per-element `animate={{ opacity: p, scale: 0.35 + p * 0.65 }}`
  on `motion.ellipse`, `motion.circle`, `motion.g` with `transformBox:
fill-box; transformOrigin: center`. Result: positions improved but still
  visibly off (user feedback: "still off but improved").
- Second attempt: dropped scale entirely, kept opacity only. Positions
  clean but lost the "unfurl" feeling.
- Final approach: reverted to discrete 5-stage scenes using
  `AnimatePresence mode="wait"` on the `<motion.svg>` container (whole-SVG
  opacity cross-fade) + `pathLength: 0 → 1` on individual stems. Ambient
  sway applied to the wrapping HTML div, not the SVG.
