---
name: qf-content-base-url
description: QF Content APIs are served by api.quran.com/api/v4, not apis.quran.foundation
type: blocker
captured: 2026-05-02
source: /learn, live debugging session
---

The correct base URL for QF Content APIs (verses, translations, tafsir, audio) is `https://api.quran.com/api/v4`. The `apis.quran.foundation` host returns 404 for content endpoints.

**Why:** The QF docs reference `apis.quran.foundation` as the API host, but the content APIs are actually served by the public Quran.com v4 API. The two hosts serve different API surfaces.

**How to apply:** Set `QF_CONTENT_BASE=https://api.quran.com/api/v4` in all environments. The prelive/production split only applies to User APIs and OAuth2. Do not change the content base URL to the prelive host.

**What was tried:** Setting `QF_CONTENT_BASE=https://apis-prelive.quran.foundation/content/api/v4` — returned 404 for all verse/translation/audio endpoints. Switching to `api.quran.com/api/v4` immediately resolved.
