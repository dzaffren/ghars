# Cron / Wilting Check — Vercel Hobby Tier Fix

**Date:** 2026-04-29
**Context:** Deployed on Vercel Hobby which limits crons to once per day minimum interval. Push notifications are nice-to-have and skipped for the hackathon. Wilting check must run reliably for every user.

---

## Problem

The current `/api/cron/daily` route:

1. Only runs once a day at 06:00 UTC
2. Gates processing on `localHour === user.reminder_hour` — meaning most users are never processed
3. Dead code: `currentHourUtc` is computed but never used
4. Wilting check only runs via cron, not on page load — users who open the app aren't wilted correctly until the cron fires

## Design

### 1. Move wilting check into `getOrCreateTodaysMission`

`applyWiltingCheck(userId, db)` is extracted from the cron route and called at the end of `getOrCreateTodaysMission` in `lib/mission/generate.ts`. It remains idempotent (no-ops if already wilted or no prior completion date). This ensures every active user gets the wilting check the moment they open `/today`.

### 2. Simplify the cron to a dumb daily sweep

Remove the `localHour === reminder_hour` gate and all push notification code. The cron becomes:

- Fetch all users
- Call `getOrCreateTodaysMission` for each (idempotent, no-ops if mission exists)
- `applyWiltingCheck` is now called inside `getOrCreateTodaysMission`, so no separate call needed

Remove dead `currentHourUtc` variable. Remove `web-push` import and `initWebPush`.

`vercel.json` schedule stays `0 6 * * *` (Hobby tier limit), but now it actually covers all users.

## Files Changed

- `lib/mission/generate.ts` — add `applyWiltingCheck` (moved from cron route), call it at end of `getOrCreateTodaysMission`
- `app/api/cron/daily/route.ts` — remove hour gate, remove push notification code, remove dead variable

## Out of Scope

- Push notifications (nice-to-have, deferred)
- Timezone-aware scheduling (requires Pro tier or external cron)
- Wilting logic changes (existing logic is correct)
