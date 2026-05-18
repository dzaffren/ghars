# HTML Slides Demo Video Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully automated pipeline that renders 12 HTML slides into a polished 1080p demo video with ElevenLabs voiceover and app footage composited inside a phone mockup.

**Architecture:** Playwright screenshots text/graphic slides; ffmpeg trims the webm recording and composites it into a phone-frame overlay for demo segments; all clips are joined with 0.5s xfade transitions and the ElevenLabs MP3 is mixed in one final pass.

**Tech Stack:** Node.js (CJS), `@playwright/test` chromium, `ffmpeg-static`, Python 3 + Pillow (for phone frame generation), plain HTML/CSS

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `scripts/generate-phone-frame.py` | Generates `scripts/assets/phone-frame.png` via Pillow |
| Create | `scripts/assets/phone-frame.png` | Transparent-bg iPhone mockup frame, 1920×1080 |
| Create | `slides/shared.css` | Design tokens + layout rules for all slides |
| Create | `slides/01-title.html` | "Ghars / غَرْس" title card |
| Create | `slides/02-problem.html` | Problem statement |
| Create | `slides/03-thesis.html` | Three-pillar thesis |
| Create | `slides/04-demo-verse.html` | Demo bg — verse segment |
| Create | `slides/05-demo-tafsir.html` | Demo bg — tafsir segment |
| Create | `slides/06-demo-reflection.html` | Demo bg — reflection segment |
| Create | `slides/07-demo-plant.html` | Demo bg — plant grows segment |
| Create | `slides/08-demo-grove.html` | Demo bg — grove segment |
| Create | `slides/09-demo-bookmarks.html` | Demo bg — bookmarks segment |
| Create | `slides/10-api-beat.html` | API credentials slide |
| Create | `slides/11-close.html` | Closing tagline + URL |
| Create | `slides/12-outro.html` | Outro card |
| Create | `scripts/render-slides.js` | Full orchestrator: server → Playwright → ffmpeg → output |

---

## Task 1: Phone Frame Generator

**Files:**
- Create: `scripts/generate-phone-frame.py`
- Create: `scripts/assets/phone-frame.png` (artifact, not committed)

- [ ] **Step 1.1 — Create assets directory**

```bash
mkdir -p /home/dzafran/Documents/ghars/scripts/assets
```

- [ ] **Step 1.2 — Write `scripts/generate-phone-frame.py`**

```python
#!/usr/bin/env python3
from PIL import Image, ImageDraw
import os

W, H = 1920, 1080
BEZEL = 22

SCREEN_X, SCREEN_Y = 1105, 118
SCREEN_W, SCREEN_H = 390, 844

PHONE_X = SCREEN_X - BEZEL
PHONE_Y = SCREEN_Y - BEZEL
PHONE_W = SCREEN_W + BEZEL * 2   # 434
PHONE_H = SCREEN_H + BEZEL * 2   # 888

BEZEL_COLOR = (28, 28, 30, 255)
CORNER_RADIUS = 55

img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

d.rounded_rectangle(
    [PHONE_X, PHONE_Y, PHONE_X + PHONE_W, PHONE_Y + PHONE_H],
    radius=CORNER_RADIUS,
    fill=BEZEL_COLOR,
)

# Cut screen area back to transparent
cutout = Image.new('RGBA', (SCREEN_W, SCREEN_H), (0, 0, 0, 0))
img.paste(cutout, (SCREEN_X, SCREEN_Y))

# Dynamic island pill
island_w, island_h = 120, 34
island_x = SCREEN_X + (SCREEN_W - island_w) // 2
island_y = SCREEN_Y + 14
d.rounded_rectangle(
    [island_x, island_y, island_x + island_w, island_y + island_h],
    radius=17,
    fill=BEZEL_COLOR,
)

out = os.path.join(os.path.dirname(__file__), 'assets', 'phone-frame.png')
img.save(out)
print(f'saved {out}')
```

- [ ] **Step 1.3 — Run and verify**

```bash
cd /home/dzafran/Documents/ghars
python3 scripts/generate-phone-frame.py
```

Expected: `saved .../scripts/assets/phone-frame.png`

```bash
python3 -c "
from PIL import Image
img = Image.open('scripts/assets/phone-frame.png')
print('size:', img.size)
print('mode:', img.mode)
px = img.getpixel((1300, 540))  # centre of screen area — should be transparent
print('screen pixel (expect alpha=0):', px)
px2 = img.getpixel((1085, 540)) # bezel — should be opaque
print('bezel pixel (expect alpha=255):', px2)
"
```

Expected output:
```
size: (1920, 1080)
mode: RGBA
screen pixel (expect alpha=0): (0, 0, 0, 0)
bezel pixel (expect alpha=255): (28, 28, 30, 255)
```

- [ ] **Step 1.4 — Commit**

```bash
cd /home/dzafran/Documents/ghars
git add scripts/generate-phone-frame.py
git commit -m "feat(video): add phone frame generator script"
```

---

## Task 2: Shared CSS

**Files:**
- Create: `slides/shared.css`

- [ ] **Step 2.1 — Create `slides/` directory and write `shared.css`**

```bash
mkdir -p /home/dzafran/Documents/ghars/slides
```

```css
/* slides/shared.css */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:           #0d1a10;
  --card-from:    #1a3a2a;
  --card-mid:     #1f4434;
  --card-to:      #26563f;
  --glow-green:   rgba(82, 183, 136, 0.55);
  --glow-amber:   rgba(212, 160, 23, 0.45);
  --border-glow:  rgba(82, 183, 136, 0.80);
  --text:         #ffffff;
  --text-muted:   #a8c5b0;
  --mint:         #52b788;
  --amber:        #d4a017;
  --sand:         #f5f0e8;
}

html, body {
  width: 1920px;
  height: 1080px;
  overflow: hidden;
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, -apple-system, sans-serif;
}

/* Serif display font via local file */
@font-face {
  font-family: 'DisplaySerif';
  src: url('file:///usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf');
  font-weight: bold;
}
@font-face {
  font-family: 'DisplaySerif';
  src: url('file:///usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf');
  font-weight: normal;
}

.slide {
  width: 1920px;
  height: 1080px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(160deg, var(--card-from) 0%, var(--card-mid) 55%, var(--card-to) 100%);
}

/* Noise texture overlay */
.slide::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: 0.15;
  mix-blend-mode: overlay;
  pointer-events: none;
  z-index: 10;
}

/* Bottom glow blobs */
.glow {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 67%;
  background:
    radial-gradient(ellipse at bottom right, var(--glow-amber) -10%, transparent 68%),
    radial-gradient(ellipse at bottom left,  var(--glow-green) -10%, transparent 68%);
  filter: blur(38px);
  pointer-events: none;
  z-index: 1;
}

/* Bottom border glow line */
.slide::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    rgba(255,255,255,0.04) 0%,
    var(--border-glow) 50%,
    rgba(255,255,255,0.04) 100%);
  z-index: 30;
}

/* Top bar */
.topbar {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 64px;
  z-index: 20;
}

.wordmark {
  font-family: 'DisplaySerif', serif;
  font-size: 26px;
  color: var(--mint);
  letter-spacing: 0.04em;
}

.seg-label {
  font-size: 15px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

/* Main content area */
.content {
  position: absolute;
  top: 72px; bottom: 60px;
  left: 0; right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
  padding: 0 120px;
  text-align: center;
  gap: 24px;
}

/* Left-aligned for demo slides (leaves right side for phone) */
.content.left {
  align-items: flex-start;
  text-align: left;
  right: auto;
  width: 1060px;
  padding: 0 80px 0 100px;
}

/* Footer */
.footer {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 64px;
  z-index: 20;
}

/* Typography */
.h-xl  { font-family: 'DisplaySerif', serif; font-size: 96px; font-weight: bold; line-height: 1.05; }
.h-lg  { font-family: 'DisplaySerif', serif; font-size: 72px; font-weight: bold; line-height: 1.1; }
.h-md  { font-family: 'DisplaySerif', serif; font-size: 52px; font-weight: bold; line-height: 1.15; }
.h-sm  { font-family: 'DisplaySerif', serif; font-size: 40px; font-weight: normal; line-height: 1.2; }
.body  { font-size: 30px; line-height: 1.65; color: var(--text-muted); }
.body-sm { font-size: 22px; line-height: 1.6; color: var(--text-muted); }

.mint  { color: var(--mint); }
.amber { color: var(--amber); }
.sand  { color: var(--sand); }
.muted { color: var(--text-muted); }

/* Pill badge */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 22px;
  border-radius: 999px;
  border: 1px solid rgba(82, 183, 136, 0.35);
  background: rgba(82, 183, 136, 0.1);
  font-size: 17px;
  color: var(--mint);
  white-space: nowrap;
}

.badge.amber {
  border-color: rgba(212, 160, 23, 0.35);
  background: rgba(212, 160, 23, 0.1);
  color: var(--amber);
}

/* Divider */
.divider {
  width: 80px;
  height: 2px;
  background: linear-gradient(90deg, var(--mint), var(--amber));
  border-radius: 1px;
}

/* Three-pillar grid */
.pillars {
  display: flex;
  gap: 48px;
  margin-top: 16px;
}

.pillar {
  flex: 1;
  background: rgba(82, 183, 136, 0.07);
  border: 1px solid rgba(82, 183, 136, 0.18);
  border-radius: 20px;
  padding: 40px 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* API grid */
.api-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px 64px;
  margin-top: 24px;
  width: 100%;
  max-width: 1400px;
}

.api-col { display: flex; flex-direction: column; gap: 16px; }
.api-col-label { font-size: 18px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
.api-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 24px;
  background: rgba(82, 183, 136, 0.06);
  border: 1px solid rgba(82, 183, 136, 0.15);
  border-radius: 14px;
  font-size: 22px;
}
.api-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--mint); flex-shrink: 0; }
.api-dot.amber { background: var(--amber); }
```

- [ ] **Step 2.2 — Smoke-test the CSS renders in Playwright**

```bash
cd /home/dzafran/Documents/ghars
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"

node -e "
const {chromium} = require('./node_modules/@playwright/test');
const fs = require('fs'), http = require('http'), path = require('path');
(async () => {
  const server = http.createServer((req,res) => {
    const f = path.join('slides', req.url);
    res.writeHead(200,{'Content-Type': req.url.endsWith('.css') ? 'text/css':'text/html'});
    res.end(fs.readFileSync(f));
  });
  server.listen(3334);
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setViewportSize({width:1920,height:1080});
  await p.setContent('<html><head><link rel=stylesheet href=http://localhost:3334/shared.css></head><body><div class=slide><div class=glow></div><div class=topbar><span class=wordmark>Ghars</span><span class=seg-label>Test</span></div><div class=content><h1 class=h-xl>Design OK</h1></div></div></body></html>');
  await p.waitForTimeout(500);
  await p.screenshot({path:'/tmp/css-test.png'});
  console.log('CSS test screenshot saved');
  await b.close();
  server.close();
})();
"
```

Expected: `CSS test screenshot saved` (no errors)

- [ ] **Step 2.3 — Commit**

```bash
git add slides/shared.css
git commit -m "feat(video): add shared slide CSS with app design tokens"
```

---

## Task 3: Text Slides 01–03 (Story)

**Files:**
- Create: `slides/01-title.html`
- Create: `slides/02-problem.html`
- Create: `slides/03-thesis.html`

- [ ] **Step 3.1 — Write `slides/01-title.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1920">
  <link rel="stylesheet" href="shared.css">
</head>
<body>
  <div class="slide">
    <div class="glow"></div>
    <div class="topbar">
      <span class="wordmark">Ghars</span>
      <span class="seg-label">01 — Title</span>
    </div>
    <div class="content">
      <h1 class="h-xl">Ghars</h1>
      <p style="font-family:'DisplaySerif',serif;font-size:64px;color:var(--mint);margin-top:-8px;direction:rtl;">غَرْس</p>
      <div class="divider" style="margin:16px 0;"></div>
      <p class="body" style="font-style:italic;color:var(--sand);font-size:26px;">Plant something that outlasts Ramadan.</p>
    </div>
  </div>
</body>
</html>
```

- [ ] **Step 3.2 — Write `slides/02-problem.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1920">
  <link rel="stylesheet" href="shared.css">
</head>
<body>
  <div class="slide">
    <div class="glow"></div>
    <div class="topbar">
      <span class="wordmark">Ghars</span>
      <span class="seg-label">02 — Problem</span>
    </div>
    <div class="content" style="gap:32px;max-width:1200px;">
      <h2 class="h-lg">There&rsquo;s a gap.</h2>
      <div class="divider"></div>
      <p class="body">Most Quran apps help you read. And that matters.<br>
      But there&rsquo;s a gap between <span class="mint">reading a verse</span><br>
      — and letting it <span class="amber">change a Tuesday.</span></p>
      <p class="body-sm" style="margin-top:8px;">We&rsquo;ve all been there: finished a beautiful surah, felt something,<br>then had nowhere to take it.</p>
    </div>
  </div>
</body>
</html>
```

- [ ] **Step 3.3 — Write `slides/03-thesis.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1920">
  <link rel="stylesheet" href="shared.css">
</head>
<body>
  <div class="slide">
    <div class="glow"></div>
    <div class="topbar">
      <span class="wordmark">Ghars</span>
      <span class="seg-label">03 — Thesis</span>
    </div>
    <div class="content" style="gap:40px;">
      <div class="pillars" style="width:100%;max-width:1500px;">
        <div class="pillar">
          <span class="h-md mint">One verse.</span>
          <p class="body-sm">Selected from the Quran Foundation&nbsp;API,<br>weighted to your chosen focus areas.</p>
        </div>
        <div class="pillar">
          <span class="h-md amber">One mission.</span>
          <p class="body-sm">A specific action you can carry<br>into your day.</p>
        </div>
        <div class="pillar">
          <span class="h-md sand">One reflection.</span>
          <p class="body-sm">That evening. Claude reads it.<br>Your plant grows.</p>
        </div>
      </div>
      <p class="body-sm muted" style="font-style:italic;">A garden that grows — only if you do.</p>
    </div>
  </div>
</body>
</html>
```

- [ ] **Step 3.4 — Screenshot all three to verify**

```bash
cd /home/dzafran/Documents/ghars
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"

node -e "
const {chromium} = require('./node_modules/@playwright/test');
const fs = require('fs'), http = require('http'), path = require('path');
(async () => {
  const server = http.createServer((req,res) => {
    const f = path.join('slides', req.url);
    const ct = req.url.endsWith('.css') ? 'text/css' : 'text/html';
    res.writeHead(200,{'Content-Type':ct});
    res.end(fs.readFileSync(f));
  });
  server.listen(3335);
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setViewportSize({width:1920,height:1080});
  for (const f of ['01-title.html','02-problem.html','03-thesis.html']) {
    await p.goto('http://localhost:3335/' + f, {waitUntil:'networkidle'});
    await p.screenshot({path:'/tmp/' + f.replace('.html','.png')});
    console.log('saved', f);
  }
  await b.close();
  server.close();
})();
"
```

Expected:
```
saved 01-title.html
saved 02-problem.html
saved 03-thesis.html
```

- [ ] **Step 3.5 — Commit**

```bash
git add slides/01-title.html slides/02-problem.html slides/03-thesis.html
git commit -m "feat(video): add story slides 01-03"
```

---

## Task 4: Demo Slide Backgrounds (04–09)

**Files:**
- Create: `slides/04-demo-verse.html`
- Create: `slides/05-demo-tafsir.html`
- Create: `slides/06-demo-reflection.html`
- Create: `slides/07-demo-plant.html`
- Create: `slides/08-demo-grove.html`
- Create: `slides/09-demo-bookmarks.html`

These slides only render the left-side caption; the phone + app video are composited by ffmpeg at x=1105.

- [ ] **Step 4.1 — Write `slides/04-demo-verse.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1920">
  <link rel="stylesheet" href="shared.css">
</head>
<body>
  <div class="slide">
    <div class="glow"></div>
    <div class="topbar">
      <span class="wordmark">Ghars</span>
      <span class="seg-label">04 — Verse</span>
    </div>
    <div class="content left">
      <span class="badge">QF Content API</span>
      <h2 class="h-md">Your verse for today.</h2>
      <p class="body" style="margin-top:8px;">Selected each morning — weighted to your<br>chosen focus areas. Personalised to you.</p>
    </div>
  </div>
</body>
</html>
```

- [ ] **Step 4.2 — Write `slides/05-demo-tafsir.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1920">
  <link rel="stylesheet" href="shared.css">
</head>
<body>
  <div class="slide">
    <div class="glow"></div>
    <div class="topbar">
      <span class="wordmark">Ghars</span>
      <span class="seg-label">05 — Tafsir</span>
    </div>
    <div class="content left">
      <span class="badge">QF Content API</span>
      <h2 class="h-md">One tap.</h2>
      <p class="body" style="margin-top:8px;">Ibn Kathir&rsquo;s full tafsir — live,<br>from the Quran Foundation.</p>
    </div>
  </div>
</body>
</html>
```

- [ ] **Step 4.3 — Write `slides/06-demo-reflection.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1920">
  <link rel="stylesheet" href="shared.css">
</head>
<body>
  <div class="slide">
    <div class="glow"></div>
    <div class="topbar">
      <span class="wordmark">Ghars</span>
      <span class="seg-label">06 — Reflection</span>
    </div>
    <div class="content left">
      <span class="badge amber">Claude AI</span>
      <h2 class="h-md">Write. Claude reads it.</h2>
      <p class="body" style="margin-top:8px;">A fresh insight into the ayah.<br>One observation drawn from what you wrote.</p>
    </div>
  </div>
</body>
</html>
```

- [ ] **Step 4.4 — Write `slides/07-demo-plant.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1920">
  <link rel="stylesheet" href="shared.css">
</head>
<body>
  <div class="slide">
    <div class="glow"></div>
    <div class="topbar">
      <span class="wordmark">Ghars</span>
      <span class="seg-label">07 — Plant</span>
    </div>
    <div class="content left">
      <h2 class="h-lg mint">Submit.</h2>
      <p class="body" style="margin-top:8px;">Your plant grows.</p>
    </div>
  </div>
</body>
</html>
```

- [ ] **Step 4.5 — Write `slides/08-demo-grove.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1920">
  <link rel="stylesheet" href="shared.css">
</head>
<body>
  <div class="slide">
    <div class="glow"></div>
    <div class="topbar">
      <span class="wordmark">Ghars</span>
      <span class="seg-label">08 — Grove</span>
    </div>
    <div class="content left">
      <h2 class="h-md">Your grove.</h2>
      <p class="body" style="margin-top:8px;">Miss a day — it wilts.<br>Come back — it recovers.<br><span class="muted" style="font-size:24px;">An honest record of your practice.</span></p>
    </div>
  </div>
</body>
</html>
```

- [ ] **Step 4.6 — Write `slides/09-demo-bookmarks.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1920">
  <link rel="stylesheet" href="shared.css">
</head>
<body>
  <div class="slide">
    <div class="glow"></div>
    <div class="topbar">
      <span class="wordmark">Ghars</span>
      <span class="seg-label">09 — Sync</span>
    </div>
    <div class="content left">
      <span class="badge">QF User API</span>
      <h2 class="h-md">Bookmarks + streak.</h2>
      <p class="body" style="margin-top:8px;">Sync to your Quran Foundation account.<br>Your practice travels with you<br>to Quran.com.</p>
    </div>
  </div>
</body>
</html>
```

- [ ] **Step 4.7 — Commit**

```bash
git add slides/04-demo-verse.html slides/05-demo-tafsir.html slides/06-demo-reflection.html \
        slides/07-demo-plant.html slides/08-demo-grove.html slides/09-demo-bookmarks.html
git commit -m "feat(video): add demo slide backgrounds 04-09"
```

---

## Task 5: Text Slides 10–12 (API Beat, Close, Outro)

**Files:**
- Create: `slides/10-api-beat.html`
- Create: `slides/11-close.html`
- Create: `slides/12-outro.html`

- [ ] **Step 5.1 — Write `slides/10-api-beat.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1920">
  <link rel="stylesheet" href="shared.css">
</head>
<body>
  <div class="slide">
    <div class="glow"></div>
    <div class="topbar">
      <span class="wordmark">Ghars</span>
      <span class="seg-label">10 — APIs</span>
    </div>
    <div class="content" style="gap:32px;">
      <h2 class="h-sm muted" style="text-transform:uppercase;letter-spacing:0.08em;">Every integration load-bearing.</h2>
      <div class="api-grid">
        <div class="api-col">
          <span class="api-col-label">Content APIs (4)</span>
          <div class="api-item"><span class="api-dot"></span>Verses &amp; Translations</div>
          <div class="api-item"><span class="api-dot"></span>Tafsir (Ibn Kathir)</div>
          <div class="api-item"><span class="api-dot"></span>Audio Recitation</div>
          <div class="api-item"><span class="api-dot"></span>Word-by-word Data</div>
        </div>
        <div class="api-col">
          <span class="api-col-label">User APIs (3)</span>
          <div class="api-item"><span class="api-dot amber"></span>Bookmarks</div>
          <div class="api-item"><span class="api-dot amber"></span>Reading Streak</div>
          <div class="api-item"><span class="api-dot amber"></span>OAuth 2.0 Auth</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
```

- [ ] **Step 5.2 — Write `slides/11-close.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1920">
  <link rel="stylesheet" href="shared.css">
</head>
<body>
  <div class="slide">
    <div class="glow"></div>
    <div class="topbar">
      <span class="wordmark">Ghars</span>
      <span class="seg-label">11 — Close</span>
    </div>
    <div class="content" style="gap:28px;">
      <div class="divider"></div>
      <h2 class="h-lg" style="max-width:1100px;">Plant something that outlasts Ramadan.</h2>
      <p class="body-sm mint" style="letter-spacing:0.04em;">ghars-nine.vercel.app</p>
    </div>
  </div>
</body>
</html>
```

- [ ] **Step 5.3 — Write `slides/12-outro.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1920">
  <link rel="stylesheet" href="shared.css">
</head>
<body>
  <div class="slide">
    <div class="glow"></div>
    <div class="topbar">
      <span class="wordmark">Ghars</span>
      <span class="seg-label">Quran Foundation Hackathon 2026</span>
    </div>
    <div class="content" style="gap:20px;">
      <p class="h-md mint">ghars-nine.vercel.app</p>
      <p class="body-sm muted">Quran Foundation Hackathon 2026</p>
    </div>
  </div>
</body>
</html>
```

- [ ] **Step 5.4 — Commit**

```bash
git add slides/10-api-beat.html slides/11-close.html slides/12-outro.html
git commit -m "feat(video): add API beat, close, and outro slides"
```

---

## Task 6: render-slides.js — Server, Playwright Screenshots, PNG-to-Clip

**Files:**
- Create: `scripts/render-slides.js`

- [ ] **Step 6.1 — Write `scripts/render-slides.js` (full file)**

```javascript
#!/usr/bin/env node
// scripts/render-slides.js
'use strict';

const path = require('path');
const fs = require('fs');
const http = require('http');
const { execFileSync } = require('child_process');
const { chromium } = require(path.join(__dirname, '../node_modules/@playwright/test'));

const ROOT        = path.resolve(__dirname, '..');
const FFMPEG      = `${process.env.HOME}/.nvm/versions/node/v24.15.0/lib/node_modules/ffmpeg-static/ffmpeg`;
const WEBM        = path.join(ROOT, 'video-assets/ghars-demo-1080p.webm');
const AUDIO_FILE  = path.join(ROOT, 'docs/video/ElevenLabs_2026-05-18T05_43_14_Victoria - Warm, Trustworthy, and Relatable_pvc_sp70_s100_sb100_se44_b_m2.mp3');
const PHONE_FRAME = path.join(ROOT, 'scripts/assets/phone-frame.png');
const SLIDES_DIR  = path.join(ROOT, 'slides');
const TMP         = path.join(ROOT, 'tmp/slides-render');
const OUT         = path.join(ROOT, 'video-assets/ghars-hackathon-slides.mp4');

const SLIDES = [
  { id: '01', type: 'png',  file: '01-title.html',           duration: 8  },
  { id: '02', type: 'png',  file: '02-problem.html',          duration: 26 },
  { id: '03', type: 'png',  file: '03-thesis.html',           duration: 15 },
  { id: '04', type: 'demo', file: '04-demo-verse.html',       duration: 12, seek: 49  },
  { id: '05', type: 'demo', file: '05-demo-tafsir.html',      duration: 10, seek: 61  },
  { id: '06', type: 'demo', file: '06-demo-reflection.html',  duration: 19, seek: 71  },
  { id: '07', type: 'demo', file: '07-demo-plant.html',       duration: 6,  seek: 90  },
  { id: '08', type: 'demo', file: '08-demo-grove.html',       duration: 14, seek: 96  },
  { id: '09', type: 'demo', file: '09-demo-bookmarks.html',   duration: 17, seek: 110 },
  { id: '10', type: 'png',  file: '10-api-beat.html',         duration: 12 },
  { id: '11', type: 'png',  file: '11-close.html',            duration: 11 },
  { id: '12', type: 'png',  file: '12-outro.html',            duration: 7  },
];

// ── helpers ──────────────────────────────────────────────────────────────────

function ff(args) {
  execFileSync(FFMPEG, ['-y', ...args], { stdio: 'pipe' });
}

function startServer(port) {
  const server = http.createServer((req, res) => {
    const url  = req.url === '/' ? '/index.html' : req.url;
    const file = path.join(SLIDES_DIR, url);
    const ext  = path.extname(file);
    const ct   = ext === '.css' ? 'text/css' : 'text/html';
    try {
      res.writeHead(200, { 'Content-Type': ct });
      res.end(fs.readFileSync(file));
    } catch {
      res.writeHead(404);
      res.end('not found');
    }
  });
  server.listen(port);
  return server;
}

async function screenshotSlide(page, slide) {
  await page.goto(`http://localhost:3333/${slide.file}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const out = path.join(TMP, `${slide.id}.png`);
  await page.screenshot({ path: out, type: 'png' });
  return out;
}

function pngToClip(pngPath, duration, outPath) {
  ff([
    '-loop', '1', '-i', pngPath,
    '-t', String(duration), '-r', '25',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
    outPath,
  ]);
}

function compositeDemo(bgPng, seek, duration, outPath) {
  ff([
    '-ss', String(seek), '-t', String(duration), '-i', WEBM,
    '-loop', '1', '-i', bgPng,
    '-loop', '1', '-i', PHONE_FRAME,
    '-filter_complex',
      '[1:v]scale=1920:1080[bg];' +
      '[0:v]scale=390:844[app];' +
      '[bg][app]overlay=1105:118[with_app];' +
      '[with_app][2:v]overlay=0:0:format=auto[out]',
    '-map', '[out]',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
    '-t', String(duration), '-r', '25',
    outPath,
  ]);
}

function xfadeAll(clips) {
  const FADE = 0.5;
  let current     = clips[0].path;
  let currentDur  = clips[0].duration;

  for (let i = 1; i < clips.length; i++) {
    const merged = path.join(TMP, `merged_${i}.mp4`);
    const offset = +(currentDur - FADE).toFixed(3);

    console.log(`  xfade ${i}/${clips.length - 1}  offset=${offset}s`);
    ff([
      '-i', current, '-i', clips[i].path,
      '-filter_complex',
        `xfade=transition=fade:duration=${FADE}:offset=${offset}`,
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
      merged,
    ]);

    currentDur = +(currentDur + clips[i].duration - FADE).toFixed(3);
    current    = merged;
  }
  return { path: current, duration: currentDur };
}

function mixAudio(videoPath, audioPath, outPath) {
  ff([
    '-i', videoPath,
    '-i', audioPath,
    '-map', '0:v:0', '-map', '1:a:0',
    '-c:v', 'copy',
    '-c:a', 'aac', '-b:a', '192k',
    '-shortest',
    '-movflags', '+faststart',
    outPath,
  ]);
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('→ cleaning tmp...');
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });

  const server  = startServer(3333);
  const browser = await chromium.launch();
  const page    = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  const clips = [];

  for (const slide of SLIDES) {
    console.log(`→ [${slide.id}] ${slide.file}`);
    const pngPath  = await screenshotSlide(page, slide);
    const clipPath = path.join(TMP, `${slide.id}.mp4`);

    if (slide.type === 'png') {
      pngToClip(pngPath, slide.duration, clipPath);
    } else {
      compositeDemo(pngPath, slide.seek, slide.duration, clipPath);
    }

    clips.push({ path: clipPath, duration: slide.duration });
  }

  await browser.close();
  server.close();

  console.log('\n→ applying xfades...');
  const merged = xfadeAll(clips);

  console.log('\n→ mixing audio...');
  mixAudio(merged.path, AUDIO_FILE, OUT);

  console.log('\n→ cleaning tmp...');
  fs.rmSync(TMP, { recursive: true, force: true });

  console.log(`\nDone → ${OUT}`);
}

main().catch(err => { console.error(err.message); process.exit(1); });
```

- [ ] **Step 6.2 — Commit**

```bash
git add scripts/render-slides.js
git commit -m "feat(video): add render-slides.js orchestrator"
```

---

## Task 7: End-to-End Run & Verify

- [ ] **Step 7.1 — Run the full pipeline**

```bash
cd /home/dzafran/Documents/ghars
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
node scripts/render-slides.js
```

Expected output (each line appears as processing completes):
```
→ cleaning tmp...
→ [01] 01-title.html
→ [02] 02-problem.html
→ [03] 03-thesis.html
→ [04] 04-demo-verse.html
→ [05] 05-demo-tafsir.html
→ [06] 06-demo-reflection.html
→ [07] 07-demo-plant.html
→ [08] 08-demo-grove.html
→ [09] 09-demo-bookmarks.html
→ [10] 10-api-beat.html
→ [11] 11-close.html
→ [12] 12-outro.html

→ applying xfades...
  xfade 1/11  offset=7.5s
  ...
  xfade 11/11 offset=...s

→ mixing audio...

→ cleaning tmp...

Done → .../video-assets/ghars-hackathon-slides.mp4
```

- [ ] **Step 7.2 — Verify output**

```bash
FFMPEG="$HOME/.nvm/versions/node/v24.15.0/lib/node_modules/ffmpeg-static/ffmpeg"
$FFMPEG -i video-assets/ghars-hackathon-slides.mp4 2>&1 | grep -E "Duration|Stream"
ls -lh video-assets/ghars-hackathon-slides.mp4
```

Expected:
```
  Duration: 00:02:2x.xx, ...
  Stream #0:0: Video: h264 ... 1920x1080 ...
  Stream #0:1: Audio: aac ...
-rw-r--r-- ... 10M-16M ... ghars-hackathon-slides.mp4
```

Duration must be between 2:20 and 2:45.

- [ ] **Step 7.3 — Commit final output reference**

```bash
git add scripts/render-slides.js scripts/generate-phone-frame.py slides/
git status
git commit -m "feat(video): complete HTML slides video pipeline"
```

---

## Debugging Reference

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `FFMPEG: spawn ENOENT` | FFMPEG path wrong | Check `echo $HOME` and verify the path in `render-slides.js` |
| Font renders as fallback sans | `file://` path not found | Run `ls /usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf` |
| Demo composite is black | `format=auto` not available | Replace with `format=yuv420p` in the overlay filter |
| xfade produces corrupted frame | Duration floating point | Check `.toFixed(3)` is applied before offset calculation |
| Phone frame centre is black not transparent | Pillow paste not transparent | Re-run `generate-phone-frame.py` and recheck pixel at (1300, 540) |
| Output is shorter than 2:20 | webm seek past end | Verify webm duration ≥ 127s (`ffmpeg -i webm` → Duration) |
