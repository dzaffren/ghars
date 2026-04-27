# Mobile Video Background Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single 19 MB video source on the landing page with a responsive `<source>` setup so mobile devices autoplay a small, mobile-optimized video instead of showing the native play-button overlay.

**Architecture:** Generate two new static assets (a ~2 MB mobile MP4 and a poster JPEG) with ffmpeg, then update the `<video>` element in `app/page.tsx` to use two `<source>` elements (mobile-first with a `media` query) plus a `poster` attribute and `preload="metadata"`. Desktop continues to receive the unchanged 19 MB file.

**Tech Stack:** Next.js (the project's custom fork — see `AGENTS.md`), React, ffmpeg (libx264), static assets served from `public/`.

**Spec:** `docs/superpowers/specs/2026-04-27-mobile-video-background-design.md`

---

## File Structure

| File | Change | Responsibility |
|---|---|---|
| `public/videos/garden-loop.mp4` | unchanged | Desktop source (19 MB) |
| `public/videos/garden-loop-mobile.mp4` | **create** | Mobile source (~2 MB, 720 px, H.264 baseline, no audio) |
| `public/images/garden-loop-poster.jpg` | **create** | Poster shown while loading / if autoplay is blocked |
| `app/page.tsx` | **modify** (lines 11–22) | Swap single `<source>` for two responsive sources + `poster` + `preload="metadata"` |

No code files beyond `app/page.tsx` need to change. No new tests are added — see spec's verification section for why automated tests aren't appropriate for this change.

---

## Task 1: Verify ffmpeg is available

**Files:** none

- [ ] **Step 1: Check ffmpeg is on PATH**

Run: `which ffmpeg && ffmpeg -version | head -1`

Expected: prints a path (e.g. `/opt/homebrew/bin/ffmpeg`) and a version line.

If ffmpeg is NOT installed:

```bash
brew install ffmpeg
```

(On non-macOS, use the system package manager: `apt-get install ffmpeg`, etc.)

After install, re-run the check above and confirm it prints a path and version.

- [ ] **Step 2: Confirm the source video exists**

Run: `ls -lh public/videos/garden-loop.mp4`

Expected: shows the 19 MB file.

If it is missing, stop and ask the user — the mobile encode depends on this source.

No commit in this task — verification only.

---

## Task 2: Generate the mobile-optimized video

**Files:**
- Create: `public/videos/garden-loop-mobile.mp4`

- [ ] **Step 1: Encode the mobile MP4 with ffmpeg**

Run from the repo root:

```bash
ffmpeg -i public/videos/garden-loop.mp4 \
  -vf "scale=720:-2" \
  -c:v libx264 -profile:v baseline -level 3.0 \
  -preset slow -crf 30 \
  -movflags +faststart \
  -an \
  public/videos/garden-loop-mobile.mp4
```

Expected: ffmpeg runs without errors and prints `video:… audio:0kB …` near the end (audio is intentionally stripped by `-an`).

Flag-by-flag reason (don't modify without reading the spec):
- `-vf "scale=720:-2"` — 720 px wide, height auto-rounded to an even number (required by H.264).
- `-profile:v baseline -level 3.0` — maximum iOS Safari compatibility.
- `-preset slow -crf 30` — slower encode for better compression; crf 30 targets our ~2 MB budget.
- `-movflags +faststart` — moves the moov atom to the front so mobile can begin playback before the full download completes. **Essential.**
- `-an` — strips audio; the video is muted anyway.

- [ ] **Step 2: Verify file size is within budget**

Run: `ls -lh public/videos/garden-loop-mobile.mp4`

Expected: file size ≤ 2.5 MB.

If the file is meaningfully over 2.5 MB: re-run Step 1 with `-crf 32` (smaller, slightly lower quality).
If the file is well under 2.0 MB: the spec permits re-running with `-crf 28` for better quality, but do not exceed 2.5 MB.

- [ ] **Step 3: Quick visual sanity check**

Open `public/videos/garden-loop-mobile.mp4` in QuickTime / VLC / the system default player.

Expected: video plays, loops visually similar to the original, no audio track, no obvious artifacts.

If the encode looks broken, re-run Step 1.

- [ ] **Step 4: Commit the asset**

```bash
git add public/videos/garden-loop-mobile.mp4
git commit -m "chore: add mobile-optimized garden loop video

Encoded at 720p H.264 baseline, ~2MB target, with faststart for
progressive mobile playback. Source remains public/videos/garden-loop.mp4."
```

Expected: commit succeeds; pre-commit hooks pass (no staged code to lint).

---

## Task 3: Generate the poster image

**Files:**
- Create: `public/images/` (new directory)
- Create: `public/images/garden-loop-poster.jpg`

- [ ] **Step 1: Create the images directory**

Run: `mkdir -p public/images`

Expected: no error. Verify with `ls public/ | grep images`.

- [ ] **Step 2: Extract the poster frame with ffmpeg**

Run from the repo root:

```bash
ffmpeg -i public/videos/garden-loop.mp4 \
  -vframes 1 -q:v 4 \
  public/images/garden-loop-poster.jpg
```

Flag reasons:
- `-vframes 1` — grab exactly one frame (the first).
- `-q:v 4` — JPEG quality; 2 is best, 31 is worst. 4 is a good size/quality balance for a background poster.

Expected: ffmpeg runs without errors and writes the JPEG.

- [ ] **Step 3: Verify file size**

Run: `ls -lh public/images/garden-loop-poster.jpg`

Expected: file size ≤ 80 KB.

If it is over 80 KB, re-run Step 2 with `-q:v 6`. If it is over 150 KB even then, re-run with `-q:v 8`.

- [ ] **Step 4: Visual sanity check**

Open `public/images/garden-loop-poster.jpg` in Preview (or any image viewer).

Expected: shows the first frame of the garden video, not a black/corrupt frame.

If the frame looks wrong or black, re-run Step 2 but grab a later frame by prepending `-ss 00:00:01` before `-i`:

```bash
ffmpeg -ss 00:00:01 -i public/videos/garden-loop.mp4 -vframes 1 -q:v 4 public/images/garden-loop-poster.jpg
```

- [ ] **Step 5: Commit the asset**

```bash
git add public/images/garden-loop-poster.jpg
git commit -m "chore: add poster image for landing video background

Shown while the video is loading and as a fallback when mobile autoplay
is blocked (iOS Low Power Mode, Reduce Motion)."
```

Expected: commit succeeds.

---

## Task 4: Update the `<video>` element in `app/page.tsx`

**Files:**
- Modify: `app/page.tsx` (lines 11–22)

- [ ] **Step 1: Read the current file**

Run: `cat app/page.tsx`

Expected: shows the current 37-line file with the existing `<video>` block at lines 11–22 using a single `<source src="/videos/garden-loop.mp4" …>`.

- [ ] **Step 2: Replace the `<video>` block**

In `app/page.tsx`, replace **exactly** this block (currently lines 11–22):

```tsx
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ background: "#faf7f0", opacity: 0.75 }}
      >
        <source src="/videos/garden-loop.mp4" type="video/mp4" />
      </video>
```

…with this block:

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

Three changes only:
1. `preload="auto"` → `preload="metadata"` (don't eagerly download the whole file).
2. Added `poster="/images/garden-loop-poster.jpg"`.
3. Single `<source>` → two `<source>` elements, mobile-first. The browser picks the first whose `media` query matches.

Do NOT modify the surrounding `<main>`, the radial-gradient overlay div, or the `<LandingContent />` import — they are correct and intentional.

- [ ] **Step 3: Verify the diff is exactly the intended change**

Run: `git diff app/page.tsx`

Expected: the diff shows exactly the three changes above — nothing else. If the diff shows changes to other lines, restore the file and redo Step 2 carefully.

- [ ] **Step 4: TypeScript / build check**

Run: `pnpm build`

Expected: build succeeds. No TS errors. No new warnings related to `app/page.tsx`.

If the build fails, read the error — the most likely cause is a typo in the JSX attribute. Fix and re-run.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx
git commit -m "fix: serve mobile-optimized video on small viewports

Replace single 19MB source with responsive <source> elements: mobile
devices get the ~2MB mobile encode via media=\"(max-width: 768px)\";
desktop keeps the full-fidelity file. Add poster and preload=\"metadata\"
so the browser shows a still frame instead of its native play button
while the video buffers."
```

Expected: commit succeeds; pre-commit hooks pass (lint-staged will run on the staged `.tsx` file).

If commitlint complains about body line length, wrap body lines at ≤ 100 chars and retry.

---

## Task 5: Manual verification in the browser

**Files:** none

- [ ] **Step 1: Start the dev server**

Run (in a separate terminal, keep it running):

```bash
pnpm dev
```

Expected: Next.js starts and prints `Local: http://localhost:3000`.

- [ ] **Step 2: Desktop check**

Open `http://localhost:3000/` in a desktop browser window (not a mobile emulator).

Open DevTools → Network tab → filter by "media" or "mp4", then hard-reload (Cmd+Shift+R).

Expected:
- `garden-loop.mp4` (the 19 MB file) appears in the Network tab, NOT `garden-loop-mobile.mp4`.
- The video is playing in the background behind the landing copy.
- No native play button overlay.

If `garden-loop-mobile.mp4` loads instead, your window is narrower than 768 px — widen it and reload.

- [ ] **Step 3: Mobile emulation check**

In DevTools, toggle device emulation (Cmd+Shift+M in Chrome), pick "iPhone 14" (or any device narrower than 768 px). Hard-reload.

Expected:
- `garden-loop-mobile.mp4` loads in the Network tab (NOT the 19 MB file).
- The video autoplays behind the landing copy.
- **No native play button overlay visible.**
- The poster image may flash briefly before the video starts — this is correct.

If the native play button still appears in mobile emulation, check:
1. The Network tab — is the mobile file actually being served?
2. The Elements tab — does the `<video>` tag have `autoplay`, `muted`, `playsinline` attributes applied?
3. Hard-reload again; stale cache can mask the fix.

- [ ] **Step 4: Real iOS device check (if available)**

If you have a physical iPhone on the same network:

1. Find your machine's LAN IP: `ipconfig getifaddr en0`.
2. Visit `http://<that-ip>:3000/` in iOS Safari.
3. Enable Low Power Mode (Settings → Battery → Low Power Mode).
4. Reload the page.

Expected: the poster image is visible (autoplay is blocked by Low Power Mode), NOT a native play button on a black background. This is the acceptable fallback the spec calls for.

If you do not have a physical iOS device, skip this step and note it in the final report.

- [ ] **Step 5: Stop the dev server**

In the terminal running `pnpm dev`, press Ctrl+C.

No commit in this task.

---

## Done

After all five tasks are complete:

- `public/videos/garden-loop-mobile.mp4` exists and is ≤ 2.5 MB.
- `public/images/garden-loop-poster.jpg` exists and is ≤ 80 KB.
- `app/page.tsx` uses two `<source>` elements with `media` + a `poster` + `preload="metadata"`.
- Desktop browser loads the 19 MB file; mobile emulation loads the ~2 MB file.
- No native play button overlay appears on mobile emulation.
- Three commits on the branch (mobile video asset, poster, component change).
