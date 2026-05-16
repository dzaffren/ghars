# Exploration Page — Design Spec

**Date:** 2026-05-07  
**Status:** Approved, ready for implementation

---

## Context

Ghars currently surfaces one verse per day via a deterministic assignment. Users have no way to seek verses by personal context — a theme they're working through, a feeling they're sitting with, a life situation. This feature adds an `/explore` page where users type a free-form query, Claude identifies the 3–5 most relevant Quran verses from its knowledge, and the user can bookmark or adopt any verse as their current (or next day's) daily mission — without disrupting any user who has already committed to today's mission.

---

## Nav & Page Structure

**Nav:** Add a 4th tab to `RadialNav.tsx` — Compass icon, label "Explore", `href="/explore"`, placed at **180°** (left of centre, balancing Settings at 0°).

**Page states:**

### Empty state
- Centred heading: *"What's on your heart today?"*
- Free-text input: placeholder *"a theme, feeling, or situation…"*
- 4 suggestion chips below input (tappable, pre-fill the input):
  - "patience in difficulty"
  - "gratitude for small things"
  - "trusting Allah's plan"
  - "being a better person"
- No results until first search

### Results state
- Input remains at top (editable for a new search)
- 3–5 verse cards stacked vertically
- Loading skeleton (shimmer) during Claude + QF fetch (~2–3s)

### Verse card anatomy
```
┌─────────────────────────────────────────┐
│  [Arabic text — large, right-aligned]   │
│  [Translation — English]                │
│                                         │
│  ✦ reason Claude chose this verse       │  ← italic, muted, 1 line
│                                         │
│  [Tafsir ▾]  [🔖]  [Set as mission]    │
└─────────────────────────────────────────┘
```
- **Tafsir row**: collapsed by default; tap to expand Ibn Kathir snippet (lazy-fetched)
- **Bookmark icon**: calls existing bookmark flow; fills on success
- **Set as mission**: primary text button; triggers assign flow

---

## API Design

### `POST /api/explore/search`

**Request:**
```json
{ "query": "patience in difficulty" }
```
Validation: query 1–200 chars, authenticated user.

**What it does:**
1. Calls Claude Haiku with a structured prompt (see below) — returns 5 verse keys + reasons as JSON
2. Fetches Arabic + translation for all 5 in parallel via `getVerseByKey` + `getTranslation` (existing `lib/qf/content.ts`)
3. Drops any verse with an invalid/unfetchable key (silent, graceful)
4. Returns surviving cards

**Claude prompt:**
```
System: You are a Quran scholar. Given a user's theme or situation, return the 5 most relevant 
Quran verses. Respond with valid JSON only — an array of exactly 5 objects:
[{"verse_key":"<surah>:<ayah>","reason":"<one sentence, max 15 words, lowercase>"}]
Use only canonical verse keys (e.g. "2:255"). Do not explain. Do not add prose.

User: <query>
```

**Response:**
```json
{
  "results": [
    {
      "verse_key": "94:5",
      "reason": "on ease following every difficulty, for when hardship feels unending",
      "arabic": "فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
      "translation": "For indeed, with hardship will be ease."
    }
  ]
}
```

**Error handling:**
- Claude timeout (>8s): return 504, client shows retry prompt
- Claude returns malformed JSON: retry once; if still broken, return 503
- All 5 verse keys invalid: return 422 with message "No valid verses found — try rephrasing"

---

### `POST /api/explore/assign`

**Request:**
```json
{ "verse_key": "94:5", "action_prompt": "Notice one moment of ease today and name it aloud." }
```

**What it does:**
1. Load today's `daily_assignments` row for the user
2. Check if a `missions` row exists for that assignment
3. **No mission yet** → upsert `daily_assignments` for today's date with `verse_key`, `corpus_entry_id = NULL`, `exploration_prompt = action_prompt`
4. **Mission already committed** → upsert for tomorrow's date instead
5. Return `{ assigned_for: "today" | "tomorrow", date: "YYYY-MM-DD" }`

**action_prompt generation:** The search endpoint generates one action_prompt per verse alongside the reason — Claude derives it from the verse and the original query. Included in the `/api/explore/search` response (not shown in the card UI, passed through on assign).

**Upsert behaviour:** Uses existing `upsert_daily_assignment` Postgres function (adapted to accept nullable `corpus_entry_id`) with `onConflict: "user_id,local_date"`.

---

### `GET /api/content/verse/[key]?tafsir=true`

Add `tafsir` query param support to the existing route. When `tafsir=true`, also calls `getFullTafsir(verseKey)` and includes it in the response. Lazy — only triggered on card expand tap.

---

### `GET /api/today` — modification

When loading the daily assignment, check `corpus_entry_id`:
- **Not null** (corpus-sourced): existing path — read prompts from `corpus_entries`
- **Null** (exploration-sourced): use `daily_assignments.exploration_prompt` as the single prompt; tafsir comes live from QF API as it already does; theme label shows "Your choice"

The reflection submission, plant growth, journal, and streak flows are all keyed off `daily_assignments.id` and `reflections` — no changes needed there.

---

## Schema Migration

**File:** `supabase/migrations/0009_explore_assignments.sql`

```sql
ALTER TABLE daily_assignments
  ALTER COLUMN corpus_entry_id DROP NOT NULL,
  ADD COLUMN exploration_prompt text;

COMMENT ON COLUMN daily_assignments.corpus_entry_id IS 
  'NULL when assignment is exploration-sourced (see exploration_prompt).';
COMMENT ON COLUMN daily_assignments.exploration_prompt IS 
  'Single action prompt for exploration-sourced assignments. NULL for corpus-sourced.';
```

---

## Files Changed

| File | Change |
|---|---|
| `supabase/migrations/0009_explore_assignments.sql` | New — schema migration |
| `app/(app)/explore/page.tsx` | New — explore page |
| `app/(app)/explore/ExploreSearch.tsx` | New — search input + chip component |
| `app/(app)/explore/VerseCard.tsx` | New — verse result card |
| `app/api/explore/search/route.ts` | New — Claude search endpoint |
| `app/api/explore/assign/route.ts` | New — mission assignment endpoint |
| `app/api/content/verse/[key]/route.ts` | Modified — add `?tafsir=true` |
| `app/api/today/route.ts` | Modified — handle nullable corpus_entry_id |
| `lib/db/assignments.ts` | Modified — accept nullable corpus_entry_id |
| `components/RadialNav.tsx` | Modified — add Explore tab at 180° |

---

## Constraints & Non-Goals

- **No search history** in v1 — each session starts fresh
- **No caching** of Claude results in v1 — query variety makes it low value
- **No re-reflection** on exploration-sourced missions beyond what today's flow already supports
- **No corpus review gate** for exploration-sourced entries — they bypass `human_reviewed_at` entirely by not touching `corpus_entries`
- The 30-verse Ghars corpus is not surfaced on this page — it's a separate editorial pipeline

---

## Verification

1. Run `supabase/migrations/0009_explore_assignments.sql` against the project
2. Navigate to `/explore` — empty state renders, nav tab visible
3. Type "patience in hardship" → 3–5 verse cards appear within 4s
4. Expand tafsir on one card → tafsir text appears (lazy fetch)
5. Tap Bookmark → icon fills, bookmark appears in `/journal` or QF library
6. Tap "Set as mission" on a verse **before** submitting today's reflection → `/today` now shows that verse with the exploration prompt
7. Tap "Set as mission" **after** submitting today's reflection → confirmation shows "Set for tomorrow", next day's `/today` shows the exploration verse
8. Submit a reflection on an exploration-sourced mission → plant grows, journal entry appears — same as corpus-sourced
