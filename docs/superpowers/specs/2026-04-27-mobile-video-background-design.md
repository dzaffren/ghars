# Mobile Video Background Fix — Design

**Date:** 2026-04-27
**Status:** Approved

## Problem

On mobile, the landing page (`app/page.tsx`) renders the browser's native play button overlay instead of the expected autoplaying video background.

Root causes:

1. **Single 19 MB source** — iOS Safari and mobile Chrome refuse autoplay or fall back to native controls when a video can't buffer fast enough on cellular.
2. **No `poster` attribute** — while the video is loading, the browser has nothing to show and renders its default play-button UI.
3. **No responsive sources** — every device downloads the full 19 MB file, even when a smaller version would do.

The `autoPlay muted playsInline` attributes are already correct; the issue is asset delivery, not attribute misconfiguration.

## Strategy

Deliver a different, smaller video to mobile via `<source media="...">`, and add a poster image that covers the brief load window on every device. This preserves the full-fidelity experience on desktop while making mobile autoplay reliable.

## Asset Generation

Three assets live under `public/`:

| File | Purpose | Target |
|---|---|---|
| `public/videos/garden-loop.mp4` | Desktop source — **unchanged** | 19 MB |
| `public/videos/garden-loop-mobile.mp4` | Mobile source — new | ≤ 2.5 MB, 720 px wide, H.264 baseline, 24 fps, no audio |
| `public/images/garden-loop-poster.jpg` | Fallback image — new | ≤ 80 KB, first frame of the loop |

### ffmpeg commands

Run once locally; commit the resulting files.

```bash
# Mobile-optimized MP4 — ~2 MB, H.264 baseline for max compatibility
ffmpeg -i public/videos/garden-loop.mp4 \
  -vf "scale=720:-2" \
  -c:v libx264 -profile:v baseline -level 3.0 \
  -preset slow -crf 30 \
  -movflags +faststart \
  -an \
  public/videos/garden-loop-mobile.mp4

# Poster from first frame
ffmpeg -i public/videos/garden-loop.mp4 \
  -vframes 1 -q:v 4 \
  public/images/garden-loop-poster.jpg
```

Key flags:

- `-movflags +faststart` moves the moov atom to the front of the file so playback can start before the full download completes — essential for mobile.
- `-an` strips audio; the video is muted anyway, no reason to ship the track.
- `-crf 30` trades some quality for size; acceptable because the video sits under a translucent cream wash.

If the mobile file exceeds 2.5 MB after the command runs, bump `-crf` to 32 and re-encode. If it is meaningfully under target, consider `-crf 28` for better quality.

## Component Change

File: `app/page.tsx`

Replace the current `<video>` block (lines 11–22):

```tsx
<video
  autoPlay
  loop
  muted
  playsInline
  preload="metadata"
  poster="/images/garden-loop-poster.jpg"
  aria-hidden="true"
  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
  style={{ background: "#faf7f0", opacity: 0.75 }}
>
  <source
    src="/videos/garden-loop-mobile.mp4"
    type="video/mp4"
    media="(max-width: 768px)"
  />
  <source src="/videos/garden-loop.mp4" type="video/mp4" />
</video>
```

Deliberate changes:

1. **`preload="metadata"`** (was `"auto"`) — avoids eagerly fetching the whole file; the browser pulls what it needs once `autoPlay` begins. Reduces wasted bandwidth for users who bounce.
2. **`poster="/images/garden-loop-poster.jpg"`** — shown until the first decoded frame paints. If autoplay is ever blocked (iOS Low Power Mode, Reduce Motion), the poster stays visible instead of a black box with a play button.
3. **Two `<source>` elements, mobile-first** — the browser picks the first match. `media="(max-width: 768px)"` covers phones and small tablets in portrait.

### Known caveat

`<source media>` is evaluated on initial load, not on resize. That is acceptable here — users do not resize across the 768 px boundary on a landing page.

## Verification

This is a visual fix on static assets plus a few JSX attributes; verification is manual:

1. **Build** — `pnpm build` passes, no TS errors.
2. **Asset size** — `ls -lh public/videos/garden-loop-mobile.mp4` confirms ≤ 2.5 MB; `ls -lh public/images/garden-loop-poster.jpg` confirms ≤ 80 KB.
3. **Desktop browser** — load `/` in a desktop viewport; DevTools Network tab shows `garden-loop.mp4` (19 MB) loading; video autoplays.
4. **Mobile emulation** — DevTools device mode at iPhone width, hard reload; Network tab shows `garden-loop-mobile.mp4`, not the desktop file; video autoplays with no play button overlay.
5. **Real iOS device (if available)** — test in Safari with Low Power Mode **on** to confirm the poster renders cleanly as a fallback.

No automated tests. Playwright autoplay behavior diverges from real-device behavior enough that an e2e test here would produce false confidence.

## Out of Scope

- WebM/AV1 alternate encodings — not worth the added complexity for this single-asset landing page.
- Runtime media-query switching on resize — not a real user flow on a landing page.
- Replacing the desktop video file — keeping it unchanged preserves the current desktop experience.
