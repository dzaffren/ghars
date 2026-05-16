# Hackathon Demo Video — Production Guide & Checklist

**Deadline:** 2026-05-20  
**Target length:** 2:20–2:30  
**Output:** 1080p MP4, uploaded YouTube unlisted  

---

## Quick overview

| Session | Steps | Est. time |
|---|---|---|
| Session 1 | Script review → Voiceover → Test account | 1.5 h |
| Session 2 | Screen recording | 1.5–2 h |
| Session 3 | Cards + B-roll → CapCut edit → Upload | 2–3 h |

---

## Session 1 — Script, voiceover, and test account

### 1.1 Review the script

- [ ] Open `docs/video/voiceover-script.md`
- [ ] Read top-to-bottom aloud at normal speed. Should land between 2:10 and 2:25.
- [ ] Adjust any line that feels unnatural for the voice you're choosing.
- [ ] Confirm the "Quran dot com" phrasing and "Claude" mention are both kept — scoring criteria.

### 1.2 Generate the voiceover

**Where:** [elevenlabs.io](https://elevenlabs.io) — free tier

1. Sign up / sign in (Google account is fine).
2. Go to **Speech Synthesis** (not the Projects or Dubbing tools — just Speech Synthesis).
3. Choose a voice:
   - **Adam** — clear, warm, authoritative. Recommended for English.
   - **Bill** — slightly deeper, also strong.
   - Preview both with the first paragraph before committing.
4. Set **Stability** to 0.5, **Similarity** to 0.75, **Style Exaggeration** to 0 (defaults are fine).
5. Paste the ElevenLabs block from `voiceover-script.md` (everything between the `---` markers, without the `[pause]` notes).
6. Adjust "Pause between sentences" to **0.7s**.
7. Click **Generate**, listen back at 1.0× on headphones.
8. If any sentence sounds off, select just that sentence, regenerate, and note the timestamp for splicing.
9. Click **Download** → save as `ghars-vo-v1.mp3` into a local `video-assets/` folder on your desktop.
10. Total ElevenLabs credit used: ~2,500 chars (~25% of free monthly quota).

### 1.3 Seed the demo account

This is so the screen looks lived-in, not empty:

**Pre-prod URL:** use the pre-prod `QF_CLIENT_ID` + `QF_CLIENT_SECRET` locally

1. Sign in to the app with a **fresh test account** (not your personal account — no real data on screen).
2. Complete onboarding: choose 2 focus areas (e.g., Patience + Gratitude).
3. Submit **3 past reflections** manually (change system date or use the seeder script if one exists under `scripts/`).
   - Each reflection should be ≥ 40 characters and meaningfully worded.
   - This populates: 3 grove plants at varied stages, 3 journal rows, 3 heatmap cells.
4. Verify in the UI:
   - [ ] `/today` shows a verse + mission (not an error).
   - [ ] Grove has at least 2 plants visible.
   - [ ] `/journal` shows 3 rows.
   - [ ] Streak count is ≥ 1.
   - [ ] Bookmark icon visible on the verse card (will tap on camera).
5. Sign out and sign back in to confirm session persists.

---

## Session 2 — Screen recording

### 2.1 OBS Studio setup

**Download:** [obsproject.com](https://obsproject.com) (free, Linux/Mac/Win)

1. Open OBS → Settings → Output:
   - Format: **MP4**
   - Encoder: NVENC H.264 (GPU) or x264 at preset "medium"
   - Video bitrate: 8000 kbps
2. Settings → Video:
   - Base (Canvas) Resolution: **1920×1080**
   - Output Resolution: **1920×1080**
   - FPS: **60**
3. Add a **Display Capture** or **Window Capture** source pointed at your browser.
4. Test record 5 seconds. Play it back. Confirm it's sharp.

### 2.2 Browser setup

1. Chrome / Chromium. Close all other tabs.
2. DevTools → toggle device toolbar → set to **iPhone 14 Pro** (430×932).
   - Ghars is a PWA; mobile viewport = the right framing.
   - If DevTools chrome is visible, hit the ⋮ menu and set DevTools to a separate window before recording.
3. Zoom browser to fit the phone frame comfortably in the 1920×1080 canvas (not tiny, not clipped).
4. Install **Cursor Highlighter** extension in Chrome (free) — makes your cursor visible as a yellow ring. Set ring size to Medium.
5. Sign in to the demo account. Verify the screen is clean (no notifications, no unread badges unrelated to the demo).

### 2.3 Shot list — record each clip separately

For each row below: hit **Start Recording**, do the action, hit **Stop Recording**. Name the file as noted. Do 2–3 takes per clip; keep the best.

| Clip | Action | File name | Target length |
|---|---|---|---|
| 01-landing | Open the app from a blank tab. Landing screen → tap "Sign in with Quran.Foundation" | `01-landing.mp4` | 5s |
| 02-today | After sign-in lands on `/today`. Scroll slowly to reveal verse card, mission card. Don't tap anything yet. | `02-today.mp4` | 8s |
| 03-word-tap | Tap any highlighted Arabic word. Word sheet slides up. Let it sit 2s. Swipe down to dismiss. | `03-word-tap.mp4` | 6s |
| 04-tafsir | Tap "See tafsir" / tafsir accordion. It expands to show Ibn Kathir text. Scroll a tiny bit. | `04-tafsir.mp4` | 6s |
| 05-reflection-type | Tap the reflection input. Type: "I chose to be patient with someone today even when I felt frustrated. The verse reminded me that patience is not passive — it's a choice I make actively." (Type slowly, ~10 WPM, so it reads.) | `05-type.mp4` | 12s |
| 06-submit | Tap Submit. Show the depth score card appear + plant advancing. Pause on it 2s. | `06-submit.mp4` | 8s |
| 07-grove | Navigate to `/grove`. Grove with 2–3 plants at varied stages. Pan slowly up the page. | `07-grove.mp4` | 6s |
| 08-streak | Back on `/today` or `/journal`: show streak number + QF platform streak displayed side-by-side. | `08-streak.mp4` | 5s |
| 09-bookmark | Tap the bookmark icon on the verse. Brief confirmation animation. | `09-bookmark.mp4` | 4s |
| 10-journal | Navigate to `/journal`. 60-day heatmap visible with some filled cells. Scroll slowly. | `10-journal.mp4` | 5s |

**Total raw footage target:** ~65 seconds across all clips. You'll use ~60s in the final cut.

### 2.4 Record the title card and outro separately

These are static — no screen recording needed. Create them in CapCut directly (Step 3.1).

---

## Session 3 — Cards, B-roll, editing, upload

### 3.1 Create title and outro cards in CapCut

**Title card (0:00–0:08):**
- Background: `#1a2e1a` (deep muted green) or `#0f1f0f`
- Text line 1: **Ghars** (large, white, serif if available — otherwise bold sans)
- Text line 2: **غَرْس** (Arabic, slightly smaller, centered under Ghars)
- Text line 3: *Plant something that outlasts Ramadan.* (small, light grey, italic)
- Duration: 8 seconds

**Outro card (2:28–2:35):**
- Same background color as title
- Text line 1: **ghars-nine.vercel.app**
- Text line 2: *Quran Foundation Hackathon 2026*
- Duration: 7 seconds

### 3.2 Optional — AI B-roll for the "Problem" segment (0:08–0:34)

If you want visuals behind the "Most Quran apps…" narration, choose one:

**Option A — Gemini Veo 3 (Gemini Pro):**
1. Open Gemini at gemini.google.com.
2. In a new chat, paste: *"Generate a short 6-second video clip: a hand holding a phone showing a Quran app, the person reads for a moment, then closes the app and puts the phone down on a wooden table. Warm evening light. No text on screen."*
3. Download the clip. Trim to 6s. Drop it behind the VO in CapCut.

**Option B — Static image with Ken Burns pan (zero effort):**
1. In CapCut, add a high-quality PNG of the Ghars landing screen or garden.
2. Apply the built-in "Ken Burns" zoom animation at 8-10% over 26 seconds.
3. Done. No external tool needed.

### 3.3 Assemble in CapCut

**Import all assets first:**
- `ghars-vo-v1.mp3` (voiceover)
- All `.mp4` clips from Session 2
- Optional: B-roll clip
- Background music (download from CapCut's free library — search "ambient", "focus" — pick one under 100 BPM)

**Track layout (bottom to top):**
```
Track 4: Captions (auto-generated)
Track 3: Background music (full length, -20 dB, fade in 1s / fade out 2s)
Track 2: Screen clips (spliced to match VO timing — see timing table in voiceover-script.md)
Track 1: Voiceover MP3 (this is the spine — lock it first)
```

**Editing steps in order:**

1. **Drop VO on Track 1.** Lock it. Don't move it.
2. **Drop title card at start of Track 2** (0:00–0:08), outro card at end.
3. **Place screen clips on Track 2** using the timing table. Trim each clip to fit. For any gap, extend the previous clip or add a 0.5s hold on the last frame.
4. **Drop B-roll / Ken Burns image** over the 0:08–0:34 problem segment.
5. **Add background music on Track 3.** Volume: -20 dB (barely audible). Fade in at 0:00, fade out at 2:28.
6. **Auto-captions:** Captions tab → Auto-captions → English → Generate. Style: white text, black thin outline, bottom-third position, max 6 words per line. Review every line for errors (especially "Quran", "tafsir", "Ibn Kathir").
7. **Color grade (optional):** If clips look inconsistent in brightness, apply a single LUT or the "Natural" preset in CapCut to all clips at once. Keep Arabic text on screen readable.
8. **Preview full video** top-to-bottom with headphones. Watch for:
   - VO and clips out of sync?
   - Any clip shows loading spinners or error states?
   - Arabic text rendering correctly in captions?
   - Music audible over VO? (shouldn't be)

### 3.4 Export

- Resolution: **1080p**
- Frame rate: **30fps** (CapCut default; downscaling 60fps source is fine)
- Format: **MP4 H.264**
- Filename: `ghars-hackathon-demo-2026.mp4`

### 3.5 Upload and submit

1. YouTube → Create → Upload video.
2. Title: `Ghars — Daily Quranic Reflection App | QF Hackathon 2026 Demo`
3. Visibility: **Unlisted**
4. Thumbnail: pick the frame showing the grove with grown plants (use YouTube's frame selector).
5. Before pasting the link anywhere, open it in a **private/incognito browser tab** on mobile and confirm it plays end-to-end.
6. Paste the YouTube link into the hackathon submission form.

---

## Final pre-submit checklist

- [ ] Video plays without buffering at 1080p on mobile data
- [ ] No personal/private data visible on any screen
- [ ] "Quran Foundation" named at least twice in the VO
- [ ] "Claude" named at least once (for AI transparency judging criteria)
- [ ] Length is between 2:00 and 3:00
- [ ] Captions are on and accurate
- [ ] YouTube link is **Unlisted** (not Private — Private means judges can't view it)
- [ ] Link tested in incognito + mobile

---

## Troubleshooting quick-ref

| Problem | Fix |
|---|---|
| ElevenLabs VO sounds robotic on one sentence | Select just that sentence in the editor, regenerate, download just that clip, splice in Audacity free |
| OBS recording is choppy | Lower to 30fps, or switch encoder to x264 medium |
| Plant doesn't animate on screen recording | Check if the app is using CSS animations that OBS captures as static — try recording at 30fps in OBS with "CFR" framerate type |
| CapCut captions misspell Arabic terms | Manually edit: click each caption, retype. "Ibn Kathir" → "Ibn Kathir", "tafsir" → "tafsir" |
| Video is 3:05 | Remove the "API credentials" beat (2:07–2:19) — it's the most skippable section. Cut straight from bookmarks to close |
| YouTube upload blocked by music copyright | CapCut's built-in library tracks are royalty-free. Don't use Spotify or YouTube Audio Library tracks — they're for personal use, not hackathon submissions |
