# Deployment Checklist — Ghars to Vercel (Production)

Work through each section in order. Check off each item before moving to the next section.

---

## 1. Supabase — create a production project

- [ ] Create a new Supabase project at https://supabase.com (separate from your dev project)
- [ ] Copy the **Project URL**, **Anon Key**, and **Service Role Key** from Project Settings → API
- [ ] Open the Supabase SQL Editor and run all migrations in order:
  - `supabase/migrations/0001_initial.sql`
  - `supabase/migrations/0002_daily_assignment_mission.sql`
  - `supabase/migrations/0003_reflections.sql`
  - `supabase/migrations/0004_weekly_reviews.sql`
  - `supabase/migrations/0005_push_subscriptions.sql`
  - `supabase/migrations/0006_qf_api_errors_status.sql`
  - `supabase/migrations/0007_reflection_answers.sql`
- [ ] Verify tables exist: `users`, `corpus_entries`, `daily_assignments`, `missions`, `reflections`, `bookmarks_mirror`, `weekly_reviews`, `push_subscriptions`
- [ ] Seed `corpus_entries` with the 10 curated ayahs (run `npx tsx scripts/seed-corpus.ts` pointed at prod Supabase)

---

## 2. Quran Foundation — register prod app

- [ ] Log into the QF developer portal
- [ ] Create a **production** OAuth app (separate from your prelive app)
- [ ] Copy the **Client ID** and **Client Secret**
- [ ] Note the prod OAuth base URL: `https://oauth2.quran.foundation`
- [ ] Leave the redirect URI blank for now — you'll fill it in after Vercel gives you a domain (Step 5)

---

## 3. Push notifications — generate VAPID keys

Run this once locally:

```
npx web-push generate-vapid-keys
```

- [ ] Copy the **Public Key** and **Private Key** — you'll need both in Step 4
- [ ] Choose a **VAPID subject** — the format is `mailto:you@yourdomain.com`

---

## 4. Vercel — set environment variables

In your Vercel project → Settings → Environment Variables, add all of the following for the **Production** environment:

### Supabase

| Variable                        | Value                                                           |
| ------------------------------- | --------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your prod Supabase project URL                                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key from Supabase                                          |
| `SUPABASE_SERVICE_ROLE_KEY`     | Service role key from Supabase (**never expose this publicly**) |

### Quran Foundation

| Variable           | Value                                   |
| ------------------ | --------------------------------------- |
| `QF_CLIENT_ID`     | Prod QF Client ID                       |
| `QF_CLIENT_SECRET` | Prod QF Client Secret                   |
| `QF_OAUTH_BASE`    | `https://oauth2.quran.foundation`       |
| `QF_CONTENT_BASE`  | `https://api.quran.com/api/v4`          |
| `QF_USER_BASE`     | `https://apis.quran.foundation/auth/v1` |

### Push notifications

| Variable                       | Value                         |
| ------------------------------ | ----------------------------- |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Public VAPID key from Step 3  |
| `VAPID_PRIVATE_KEY`            | Private VAPID key from Step 3 |
| `VAPID_SUBJECT`                | `mailto:you@yourdomain.com`   |

### App

| Variable              | Value                                                      |
| --------------------- | ---------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL` | Leave blank for now — fill in after Step 5                 |
| `CRON_SECRET`         | Any long random string, e.g. run `openssl rand -base64 32` |

### Answered reflection (optional — leave unset to disable)

| Variable                     | Value                             |
| ---------------------------- | --------------------------------- |
| `ANTHROPIC_API_KEY`          | Your Anthropic API key            |
| `ENABLE_ANSWERED_REFLECTION` | `true` to enable, omit to disable |

---

## 5. Vercel — deploy and get your domain

- [ ] Push the branch to GitHub and trigger a production deployment on Vercel
- [ ] Copy your Vercel domain (e.g. `https://ghars.vercel.app` or your custom domain)
- [ ] Go back to Vercel env vars and set `NEXT_PUBLIC_APP_URL` to that domain (no trailing slash)
- [ ] Redeploy so the updated `NEXT_PUBLIC_APP_URL` takes effect

---

## 6. QF portal — register redirect URI

- [ ] Go back to your prod QF OAuth app in the developer portal
- [ ] Add this exact URL as an allowed redirect URI: `https://your-vercel-domain/api/auth/callback`
  - Replace `your-vercel-domain` with the domain from Step 5
- [ ] Save

---

## 7. Vercel cron — wire up push notifications

Vercel runs the push notification cron automatically if `vercel.json` is configured. Verify:

- [ ] Open `vercel.json` in the repo — confirm a cron job points to `/api/cron/push-dispatch`
- [ ] If not present, add:
  ```json
  {
    "crons": [{ "path": "/api/cron/push-dispatch", "schedule": "0 6,21 * * *" }]
  }
  ```
  (Runs at 6am and 9pm UTC daily — adjust to suit your users' timezones)

---

## 8. Smoke test after deploy

- [ ] Open the app URL — confirm the landing page loads
- [ ] Tap **Sign in with Quran Foundation** — confirm the OAuth flow completes and you land on `/today`
- [ ] Confirm today's ayah loads with Arabic text, translation, and audio
- [ ] Commit a mission and submit a reflection — confirm the tree grows
- [ ] Open Settings — confirm notification toggle appears
- [ ] Enable notifications — confirm browser prompt fires and a push subscription is saved in Supabase
- [ ] Check Supabase `qf_api_errors` table — confirm it is empty (no failed QF API calls)

---

## 9. Before sharing with users

- [ ] Test the demo link: `https://your-domain/api/demo/start` — confirm a demo account provisions in under 1 second with 7 days of history
- [ ] Check the grove screen shows 7 trees in demo mode
- [ ] Check the weekly review is accessible and populated in demo mode

---

## Environment variable quick-reference

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Quran Foundation
QF_CLIENT_ID=
QF_CLIENT_SECRET=
QF_OAUTH_BASE=https://oauth2.quran.foundation
QF_CONTENT_BASE=https://api.quran.com/api/v4
QF_USER_BASE=https://apis.quran.foundation/auth/v1

# App
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
CRON_SECRET=

# Push notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:you@yourdomain.com

# Optional
ANTHROPIC_API_KEY=
ENABLE_ANSWERED_REFLECTION=true
```
