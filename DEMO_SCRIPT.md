# Demo Video Script — 2:30

**Goal:** In the first 10 seconds, make a judge say "this is different from a
Quran reader." Lead with the thesis. Show the habit loop end-to-end. Never
show a broken state.

## Setup before recording

1. Create a fresh test account via the normal sign-in flow. Do NOT use your
   primary account — the grove should look "early" for the demo.
2. On this account, complete onboarding with 2 focus areas (e.g. Patience,
   Gratitude) so the weekly theme line reads cleanly on camera.
3. The starter-word seeder (see `lib/words/seed.ts`) will auto-populate 5
   words on /today, so the first scene has the word-review card live.
4. For the species-unlock beat, manually bump `gardens.known_word_count` on
   this account to 9 in Supabase so the next word review crosses the
   10-word threshold and unlocks Olive on camera.
5. Warm up the Anthropic API by making one throwaway reflection in a private
   window — avoids a cold-start spinner on the real take.

## Shot list

Target length 2:30. Each bullet is roughly one on-screen beat.

### Act 1 — The thesis (0:00–0:20)

- **[0:00]** Open on landing video (the garden loop). Voice-over:
  > "Most Quran apps help you read. Ghars helps you form a lifetime habit —
  > through daily reflection, Arabic vocabulary mastery, and a living garden
  > that grows only if you do."
- **[0:15]** Cut to /today with the word-review card already visible at the
  top. Voice-over:
  > "Every session begins with spaced repetition — the Arabic words you're
  > learning, served at the exact moment you're about to forget them."

### Act 2 — The habit loop (0:20–1:20)

- **[0:20]** Tap "Good" on a review card. Another card animates in. Do this
  for 3 cards total.
- **[0:35]** On card #3, cross the 10-word mature threshold. The olive
  plant-unlock modal fires. Pause on it for 2 seconds. Voice-over:
  > "Master ten words and your first species unlocks — an olive tree,
  > earned through vocabulary, not clicks."
- **[0:45]** Dismiss the modal. Reveal the grove now showing 2 plants
  (reflection tree + olive) side by side.
- **[0:52]** Scroll to the mission card. Voice-over:
  > "Today's mission is generated from one of your focus areas, avoiding
  > verses you've seen in the last week."
- **[1:02]** Show the verse (Arabic + translation). Tap a word to open the
  word sheet. Voice-over:
  > "Every word is tappable. Tap to learn meaning, root, and add it to your
  > review deck."
- **[1:12]** Close the word sheet. Tap "See tafsir" to reveal Ibn Kathir
  commentary. Voice-over:
  > "Full Ibn Kathir tafsir, pulled live from the Quran Foundation API."

### Act 3 — Reflection + growth (1:20–2:00)

- **[1:20]** Scroll to the reflection form. Type ~2 sentences of reflection
  — real, not placeholder text. Voice-over:
  > "We ask for a short reflection — and Claude judges its depth on a 1-to-5
  > scale, giving encouraging, personalised next-step guidance."
- **[1:40]** Tap submit. Show the depth score + next-step copy.
- **[1:50]** Confetti + plant stage advances. Voice-over:
  > "Your plant grows. Your streak continues. Miss a day and it wilts —
  > visibly."

### Act 4 — The ecosystem integration (2:00–2:20)

- **[2:00]** Tap the bookmark icon on the verse. Voice-over:
  > "Bookmarks sync directly to your Quran Foundation library — not stored
  > locally, written to the QF user API so they travel with you."
- **[2:08]** Navigate to /history. Show the 60-day heatmap + the dual-streak
  display (Ghars streak + quran.com streak). Voice-over:
  > "Your reflection streak lives next to your platform reading streak, so
  > your growth on Ghars counts toward your journey on quran.com."

### Act 5 — Close (2:20–2:30)

- **[2:20]** Cut back to the grove, now with a growing olive and the
  reflection plant one stage taller. Voice-over:
  > "Ghars — plant something that outlasts Ramadan."
- **[2:28]** Logo card with URL.

## Voice-over principles

- Conversational, not promotional. No "revolutionary," no "game-changing."
- Name-drop **Quran Foundation API** twice — once for content (tafsir),
  once for user data (bookmarks). Judges are scoring for it.
- Mention **Claude** once explicitly when showing the depth score.
- Never say "we have X features." Show one loop; the judge infers breadth.

## What NOT to show

- /circles invite flow (untested under time pressure; safer to hide).
- /dhikr (counter works but not differentiated enough to earn the airtime).
- Any devtools, console, or error state.
- The raw onboarding screen (judges see onboarding enough; open with /today).

## Technical checklist before recording

- [ ] Test account has 5 starter words seeded and visible on /today.
- [ ] `gardens.known_word_count = 9` for the olive-unlock beat.
- [ ] ANTHROPIC_API_KEY set in env (not the stub).
- [ ] QF tokens valid — do a dry-run sign-in.
- [ ] Screen recorder at 1920×1080 60fps; iPhone mirror if demoing mobile view.
- [ ] Voice-over recorded separately and mixed in post (cleaner than live).
- [ ] Upload at 1080p to YouTube/Vimeo unlisted; link in submission.
