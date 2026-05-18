# HTML Slides Demo Video — Design Spec

**Date:** 2026-05-18  
**Target output:** `video-assets/ghars-hackathon-slides.mp4`  
**Target length:** 2:30–2:35 (including transitions)  
**Resolution:** 1920×1080, 25fps, h264/AAC

---

## Goal

Replace the raw screen-recording merge with a polished slide-based demo video. HTML slides carry the visual narrative; actual app footage plays inside a phone mockup for demo segments. Fully automated — one `node scripts/render-slides.js` command produces the final MP4.

---

## Architecture

Three components work together:

```
scripts/
  render-slides.js          ← orchestrator
  assets/
    phone-frame.png         ← transparent-bg iPhone 14 Pro frame (1920×1080 canvas)
slides/
  shared.css                ← design tokens
  01-title.html
  02-problem.html
  03-thesis.html
  04-demo-verse.html
  05-demo-tafsir.html
  06-demo-reflection.html
  07-demo-plant.html
  08-demo-grove.html
  09-demo-bookmarks.html
  10-api-beat.html
  11-close.html
  12-outro.html
video-assets/
  ghars-hackathon-slides.mp4   ← final output
```

### Pipeline (in order)

1. Clean `tmp/slides-render/`
2. Serve `slides/` on `localhost:3333` using Node's built-in `http` module
3. **Playwright** screenshots each text/graphic slide → PNG (1920×1080)
4. **ffmpeg**: loop each PNG for its segment duration → silent `.mp4` clip at 25fps
5. **ffmpeg**: for each demo segment, trim the webm at the correct timestamp + composite into `phone-frame.png` using the `overlay` filter → `.mp4` clip
6. **ffmpeg**: generate 0.5s crossfade between every adjacent clip pair
7. **ffmpeg**: concat all clips → mix ElevenLabs MP3 → `-shortest` → output final MP4
8. Clean up `tmp/slides-render/`

### Dependencies

- `playwright` — already present (used by `e2e/` tests); use `chromium`
- `ffmpeg-static` — installed at `~/.nvm/versions/node/v24.15.0/lib/node_modules/ffmpeg-static/ffmpeg`
- No sudo, no new installs required

---

## Slide Inventory & Timing

Timestamps map to the voiceover script in `docs/video/voiceover-script.md`.

| # | File | Type | Duration | webm seek |
|---|------|------|----------|-----------|
| 01 | `01-title.html` | Playwright PNG | 8s | — |
| 02 | `02-problem.html` | Playwright PNG | 26s | — |
| 03 | `03-thesis.html` | Playwright PNG | 15s | — |
| 04 | `04-demo-verse.html` | ffmpeg composite | 12s | 0:49 (49s) |
| 05 | `05-demo-tafsir.html` | ffmpeg composite | 10s | 1:01 (61s) |
| 06 | `06-demo-reflection.html` | ffmpeg composite | 19s | 1:11 (71s) |
| 07 | `07-demo-plant.html` | ffmpeg composite | 6s | 1:30 (90s) |
| 08 | `08-demo-grove.html` | ffmpeg composite | 14s | 1:36 (96s) |
| 09 | `09-demo-bookmarks.html` | ffmpeg composite | 17s | 1:50 (110s) |
| 10 | `10-api-beat.html` | Playwright PNG | 12s | — |
| 11 | `11-close.html` | Playwright PNG | 11s | — |
| 12 | `12-outro.html` | Playwright PNG | 7s | — |

Raw total: 157s. After 11 × 0.5s crossfades (each overlap removes 0.5s): **~151.5s ≈ 2:32**.

---

## Design System

### Colors (from `app/globals.css` + `GradientCard`)

```css
--bg:            #0d1a10;   /* slide background, slightly darker than app */
--card-from:     #1a3a2a;   /* GradientCard gradient start */
--card-to:       #26563f;   /* GradientCard gradient end */
--glow-green:    rgba(82, 183, 136, 0.55);
--glow-amber:    rgba(212, 160, 23, 0.45);
--border-glow:   rgba(82, 183, 136, 0.80);
--text:          #ffffff;
--text-muted:    #a8c5b0;
--sand:          #f5f0e8;
```

### Typography

- **Display / Arabic:** Amiri (Google Fonts) — loaded via `<link>` in each slide
- **Body / labels:** `system-ui, -apple-system, sans-serif`
- Arabic text: `dir="rtl"`, `font-family: 'Amiri', serif`

### Slide Layout (text slides)

```
┌─────────────────────────────────────────┐
│  [Ghars wordmark]          [segment #]  │  ← top bar, 64px
│                                         │
│         Large heading (Amiri)           │  ← vertically centered
│         Subtitle / body text            │
│                                         │
│  [bottom-left: subtle leaf motif]       │  ← 48px footer
└─────────────────────────────────────────┘
```

- Full-bleed dark gradient background
- Noise texture overlay at 15% opacity (matches GradientCard)
- Glow blob behind key text (CSS `radial-gradient`, no JS)
- Max heading: 96px for single-line titles, 72px for multi-line

### Demo Slide Layout (phone composite slides)

```
┌─────────────────────────────────────────┐
│                                    [#]  │
│  Caption / feature label               │
│  (left third)     [phone mockup]        │
│                   [with app video]      │
│                                         │
│  [Ghars wordmark]                       │
└─────────────────────────────────────────┘
```

- Phone frame: 390×844px inner area, centered-right (x=1105, y=118 on 1920×1080 canvas — right edge at 1495, leaving left 1105px for caption)
- Slide HTML sets the background and left-side caption; phone frame + video composited by ffmpeg
- ffmpeg overlay command:
  ```
  [app_clip]scale=390:844[app];[slide_bg][app]overlay=1105:118[with_app];[with_app][phone_frame]overlay=0:0
  ```

### Phone Frame Asset

- `scripts/assets/phone-frame.png` — 1920×1080, transparent background except the phone bezel
- Generated once by a small Python/Pillow script (`scripts/generate-phone-frame.py`)
- Bezel: dark grey `#1c1c1e`, rounded corners 55px, notch centered top
- Inner cutout is transparent (where the app video shows through)

---

## render-slides.js — Detailed Logic

```
const FFMPEG = `${process.env.HOME}/.nvm/versions/node/v24.15.0/lib/node_modules/ffmpeg-static/ffmpeg`
const WEBM   = 'video-assets/ghars-demo-1080p.webm'
const AUDIO  = 'docs/video/ElevenLabs_2026-05-18T05_43_14_Victoria - Warm, Trustworthy, and Relatable_pvc_sp70_s100_sb100_se44_b_m2.mp3'
const SLIDES = [ { id: '01', type: 'png', duration: 8 }, ... ]

async function main() {
  cleanTmp()
  const server = startServer('slides/', 3333)
  const browser = await chromium.launch()

  for (const slide of SLIDES) {
    if (slide.type === 'png') {
      await screenshotSlide(browser, slide)   // → tmp/01.png
      await pngToClip(slide)                  // → tmp/01.mp4
    } else {
      await compositeDemo(slide)              // → tmp/04.mp4 etc.
    }
  }

  await browser.close()
  server.close()

  await addCrossfades()                       // → tmp/with-transitions.txt
  await concatAndMix()                        // → video-assets/ghars-hackathon-slides.mp4
  cleanTmp()
}
```

### crossfade strategy

ffmpeg `xfade` filter between each adjacent pair:
```
ffmpeg -i clip_A.mp4 -i clip_B.mp4 \
  -filter_complex "xfade=transition=fade:duration=0.5:offset={A_duration - 0.5}" \
  merged_AB.mp4
```
Applied iteratively across all 12 clips.

---

## Output

- **File:** `video-assets/ghars-hackathon-slides.mp4`
- **Codec:** h264 High, CRF 18, preset medium
- **Audio:** AAC 192k, mono
- **Size estimate:** ~12–15MB
- **Movflags:** `+faststart` (web streaming)

---

## Out of Scope

- Captions / subtitles (add manually in Kapwing/CapCut after export if needed)
- Background ambient music (same — add in post if desired)
- B-roll generation
- Animations within slides (CSS transitions not captured by single-screenshot approach)
