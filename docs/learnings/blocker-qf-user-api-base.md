---
name: qf-user-api-base
description: QF User APIs base path is {host}/auth/v1, confirmed from user-apis-quickstart docs
type: blocker
captured: 2026-05-02
source: /learn, live debugging session
---

The QF User APIs (bookmarks, notes, streaks, goals, preferences, collections, activity) are served at `{host}/auth/v1/`. Production: `https://apis.quran.foundation/auth/v1`. Prelive: `https://apis-prelive.quran.foundation/auth/v1`.

**Why:** Confirmed from the QF user-apis-quickstart documentation which shows `https://apis.quran.foundation/auth/v1/bookmarks` as the example endpoint. Earlier assumptions about `/content/api/user/v1` were wrong.

**How to apply:** Set `QF_USER_BASE` env var to `https://apis.quran.foundation/auth/v1` (production) or `https://apis-prelive.quran.foundation/auth/v1` (prelive). The default in `lib/qf/client.ts` is the production URL. All user API paths in `lib/qf/user.ts` and `lib/qf/bookmarks.ts` are relative to this base (e.g. `/notes`, `/bookmarks`, `/streaks/current`).
