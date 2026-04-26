# Ghars — غَرْس

> One verse. One mission. Every day.

**Ghars** (Arabic: "the planting") is a daily Quranic reflection PWA built for the Quran Foundation Hackathon 2026. Each day a personalised verse + actionable mission is generated from the QF Content API. The user reflects on how they applied it; an AI judge evaluates depth and grows a plant in their digital garden. Missing days causes the plant to wilt. The garden is the visual memory of their spiritual practice.

---

## Features

| Feature | Description |
|---|---|
| **Daily mission** | LLM picks a verse + one-sentence actionable mission, weighted by the user's focus areas |
| **Reflection judge** | Claude Sonnet evaluates depth (1–5) and returns encouraging feedback + a concrete next-step suggestion |
| **Garden plant** | 5-stage SVG plant (Seed → Sprout → Small Plant → Flowering → Fruiting) with glow halo + sparkles |
| **Progress bar** | Shows current stage, pts toward next stage, and day streak — directly below the plant |
| **Reflection journal** | Browse, search, and filter all past reflections; click through to full verse + mission detail |
| **Bookmarks library** | Saved verses synced to QF User API; tap any to read the full surah with highlighted ayah |
| **Arabic word of the day** | One word from today's verse with transliteration + meaning |
| **Weekly theme** | Focus areas cycle weekly — all missions for the week share one virtue theme |
| **Daily Tasbih** | SubhanAllah / Alhamdulillah / Allahu Akbar counters (33/33/34); completion awards +3 growth points |
| **Garden circles** | Private groups (max 5 members); share plant progress + streak — reflections are never shared |
| **60-day heatmap** | Calendar showing completed / missed days + QF platform streak alongside local streak |
| **Push notifications** | PWA push at the user's chosen local time via Vercel cron + web-push |
| **Offline audio cache** | Service worker caches QF recitation audio for offline playback |

---

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4, shadcn/ui, Framer Motion |
| Database | Supabase (PostgreSQL) |
| Auth | QF OAuth2 / PKCE + iron-session |
| LLM | Anthropic Claude Haiku 4.5 (mission gen) + Sonnet 4.6 (reflection judge); Ollama for local dev |
| QF APIs | Content API (verses, audio, tafsir, surah) + User API (bookmarks, goals, streaks) |
| PWA | web-push + VAPID, service worker with audio cache |
| Deployment | Vercel (Hobby) — cron at 06:00 UTC daily |
| Testing | Vitest (unit) · Playwright (E2E) |

---

## Local development — step by step

### Step 1 · Prerequisites

| Requirement | Check |
|---|---|
| Node.js ≥ 20.10 | `node --version` |
| pnpm | `npm i -g pnpm` |
| Supabase project | [supabase.com](https://supabase.com) → New project |
| QF developer app | [api-docs.quran.foundation/request-access](https://api-docs.quran.foundation/request-access) (see Step 5) |
| Anthropic API key | [console.anthropic.com](https://console.anthropic.com) — or use Ollama (see Step 8) |

---

### Step 2 · Clone and install

```bash
git clone <your-repo-url>
cd quran-hackathon
pnpm install
```

---

### Step 3 · Environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in every value:

```env
# ── Quran Foundation API ─────────────────────────────────────────
QF_CLIENT_ID=           # from QF developer portal
QF_CLIENT_SECRET=       # same
QF_BASE_URL=https://apis.quran.foundation/content/api/v4
QF_OAUTH_URL=https://oauth2.quran.foundation
QF_CONTENT_OAUTH_URL=https://oauth2.quran.foundation

# For dev/testing against QF prelive environment (if needed):
# QF_BASE_URL=https://apis.quran.foundation/apis-prelive/content/api/v4
# QF_USER_BASE_URL=https://apis-prelive.quran.foundation/auth/v1
# QF_OAUTH_URL=https://prelive-oauth2.quran.foundation

# ── App URL ──────────────────────────────────────────────────────
APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ── Session secret (must be ≥ 32 chars) ─────────────────────────
SESSION_PASSWORD=       # run: openssl rand -base64 32

# ── Supabase ─────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=        # Project Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # same
SUPABASE_SERVICE_ROLE_KEY=       # same (server-only, keep secret)

# ── LLM ──────────────────────────────────────────────────────────
LLM_PROVIDER=anthropic           # or: ollama
ANTHROPIC_API_KEY=sk-ant-...
OLLAMA_BASE_URL=http://localhost:11434   # only if using Ollama
OLLAMA_MODEL=llama3.1:8b                # only if using Ollama

# ── Web Push / VAPID (see Step 4) ───────────────────────────────
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:you@example.com

# ── Cron authentication ──────────────────────────────────────────
CRON_SECRET=            # any random string; set same value in Vercel
```

---

### Step 4 · Generate VAPID keys

```bash
npx web-push generate-vapid-keys
```

Copy the output into your `.env.local`:
- `Public Key` → `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `Private Key` → `VAPID_PRIVATE_KEY`

---

### Step 5 · Register your QF app

Submit at **[api-docs.quran.foundation/request-access](https://api-docs.quran.foundation/request-access)**:

| Field | Value |
|---|---|
| Redirect URI | `http://localhost:3000/callback` and `https://yourapp.vercel.app/callback` |
| Logo URL | A publicly accessible HTTPS image URL |
| Privacy policy URL | `https://yourapp.vercel.app/privacy` (page is built and lives there) |
| Terms of service URL | `https://yourapp.vercel.app/terms` (same) |
| Requested scopes | `openid offline_access` + Content API access |

> Approval can take a few days. For local testing the prelive environment is available immediately — swap the `QF_BASE_URL` and `QF_OAUTH_URL` values in `.env.local`.

---

### Step 6 · Run database migrations

Open **Supabase → SQL Editor** and run each file in order:

```
1.  supabase/migrations/0001_init.sql        — core tables (users, missions, reflections, gardens, activity_log)
2.  supabase/migrations/0002_dhikr_log.sql   — daily tasbih counter
3.  supabase/migrations/0003_circles.sql     — garden circles + invite codes
```

Paste each file's full contents and press **Run**. Each migration is idempotent.

---

### Step 7 · (Optional) Seed mock data

To see what the app looks like after a week of use:

```sql
-- Step 7a: find your user_id (run after first sign-in)
SELECT id, email, display_name FROM users;
```

Open `supabase/seed.sql`, paste your UUID on line 13, then run the file in SQL Editor. This inserts 7 days of missions + reflections and sets the garden to the Flowering stage with a 3-day streak.

---

### Step 8 · Start the dev server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000). Sign in with your QF account → complete onboarding → your first mission appears on `/today`.

---

### Step 8b · Using Ollama instead of Anthropic (no API cost)

```bash
# Install Ollama from https://ollama.com, then:
ollama pull llama3.1:8b
```

Set in `.env.local`:
```env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
```

Mission generation and reflection judging will use the local model. Quality will be lower than Sonnet but sufficient for development.

---

## Running tests

```bash
# Unit tests — no server needed
pnpm test

# E2E tests — requires dev server
pnpm dev            # terminal 1
pnpm test:e2e       # terminal 2

# Playwright interactive UI
pnpm test:e2e:ui
```

---

## Deployment (Vercel)

1. Push to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add all env vars from `.env.local` — change `APP_URL` and `NEXT_PUBLIC_APP_URL` to your Vercel domain
4. `vercel.json` is already configured with a daily cron at `0 6 * * *`
5. Vercel auto-deploys on every push to `main`

---

## Project structure

```
app/
  today/              Daily mission + garden plant
  history/            60-day calendar heatmap
  reflections/        Reflection journal (list + detail)
  bookmarks/          QF bookmarks library
  surah/[chapterId]/  Full surah reader
  dhikr/              Daily Tasbih counter
  circles/            Garden circles (create / join / view)
  onboarding/         Focus areas + reminder setup
  api/
    auth/             QF OAuth2 PKCE + logout
    reflection/       LLM judge + garden update
    bookmarks/        QF bookmark sync
    dhikr/            Tasbih counter API
    circles/          Circles CRUD + invite codes
    cron/daily/       Mission generation + push notifications

components/
  GardenPlant.tsx     5-stage SVG plant with glow + sparkles
  GardenTree.tsx      Re-export (preserves existing import paths)
  AppHeader.tsx       Sticky frosted-glass header with inline nav
  ReflectionForm.tsx
  MissionCelebration.tsx
  AudioPlayer.tsx

lib/
  auth/               QF OAuth, PKCE, token refresh
  qf/                 Content API + User API clients
  llm/                Anthropic + Ollama providers, prompts
  mission/            Mission generation, judge, weekly theme

supabase/
  migrations/         0001_init · 0002_dhikr_log · 0003_circles
  seed.sql            Dev seed data

e2e/                  Playwright specs
tests/                Vitest unit tests
public/
  sw.js               Service worker (audio cache + push)
  videos/             garden-loop.mp4 (landing background)
```

---

## QF APIs used

| Category | Endpoint | Purpose |
|---|---|---|
| Content | `GET /verses/by_key/{key}` | Verse text + translation + tafsir + word list |
| Content | `GET /recitations/{id}/by_ayah/{key}` | Verse audio URL |
| Content | `GET /chapters/{id}/verses` | Full surah for the reader |
| User | `POST /bookmarks` | Save a verse |
| User | `GET /bookmarks` | Fetch saved verses |
| User | `GET /streaks` | QF platform reading streak |
| User | `POST /goals` | Create daily reflection goal on onboarding |
| User | `POST /goals/{id}/activities` | Log activity on reflection accept |

**Auth:** Content API uses client-credentials (auto-refreshed in memory). User API uses auth-code + PKCE with automatic token refresh (`lib/auth/qf-oauth.ts:getValidQfAccessToken`).

---

*Quran Foundation Hackathon 2026 · Submission deadline: 20 May 2026*
