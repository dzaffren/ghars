---
name: qf-tafsir-endpoint
description: Fetch per-ayah tafsir via /tafsirs/{id}/by_ayah/{key}, not /quran/tafsirs/{id}?verse_key={key}
type: blocker
captured: 2026-05-02
source: /learn, live debugging session
---

The correct way to fetch a single-ayah tafsir from `api.quran.com/api/v4` is `GET /tafsirs/{tafsir_id}/by_ayah/{verse_key}`. The response is shaped `{ tafsir: { text, resource_name, ... } }`.

**Why:** The alternative `/quran/tafsirs/{id}?verse_key={key}` returns `200` with `{ tafsirs: [] }` for any single verse — it's designed for bulk chapter-level fetches, not single-verse lookups, and the `verse_key` filter is effectively a no-op. Because the call succeeds with an empty array, callers that only check `!res.ok` will silently ship empty tafsir text.

**How to apply:** In `lib/qf/content.ts` `getFullTafsir`, use `/tafsirs/${tafsirId}/by_ayah/${verseKey}` and read from `data.tafsir.text`. The response contains HTML (`<h2>`, `<p>`, etc.) — sanitize before rendering (see `convention-tafsir-html-sanitized`).

**What was tried:** `GET /quran/tafsirs/169?verse_key=103:1` — returned `{"tafsirs": [], "meta": {"tafsir_name": null, ...}}`. Because the surrounding code fell back to `text: ""` on an empty array, the tafsir drawer rendered blank without any error surfacing.
