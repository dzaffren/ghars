---
name: qf-translation-endpoint
description: Fetch translations via /verses/by_key/{key}?translations={id}, not /quran/translations/{id}?verse_key={key}
type: blocker
captured: 2026-05-02
source: /learn, live debugging session
---

The correct way to fetch a translation for a single verse is `GET /verses/by_key/{verse_key}?translations={translation_id}&fields=text_uthmani`. The endpoint `/quran/translations/{id}?verse_key={key}` returns `translations: []` even with a valid auth token.

**Why:** The `/quran/translations/{id}` endpoint is designed for bulk chapter-level fetches, not single-verse lookups. The `verse_key` filter appears to be broken or unsupported on this endpoint. The `/verses/by_key/` endpoint with the `translations` query param is the correct single-verse path.

**How to apply:** In `lib/qf/content.ts` `getTranslation`, use `/verses/by_key/${verseKey}?translations=${translationId}&fields=text_uthmani` and read the result from `data.verse.translations[0].text`.

**What was tried:** `GET /quran/translations/131?verse_key=103:1` — always returns `{"translations": [], "meta": {...}}` regardless of auth.
