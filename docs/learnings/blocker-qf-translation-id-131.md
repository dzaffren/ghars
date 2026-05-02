---
name: qf-translation-id-131
description: Translation id 131 (Clear Quran) does not exist on api.quran.com/api/v4; map legacy 131 to 20 (Saheeh International)
type: blocker
captured: 2026-05-02
source: /learn, live debugging session
---

Translation id `131` — the repo's legacy default, seeded as the `users.translation_id` column default in `supabase/migrations/0001_initial.sql` — does not exist on the `api.quran.com/api/v4` host we use for content. Requesting it returns a valid verse object with no `translations` array at all, so the UI silently renders an empty string where the English translation should appear.

**Why:** `131` refers to Dr. Mustafa Khattab's Clear Quran on `apis.quran.foundation`. The repo has moved content fetching to `api.quran.com/api/v4` (see `blocker-qf-content-base-url.md`), and the two hosts have different translation id spaces. Without a mapping, every user seeded with the default id gets a blank translation.

**How to apply:** In `lib/qf/content.ts` `getTranslation`, treat `131` as a legacy alias and resolve it to `20` (Saheeh International) before calling the API. The default value of the `translationId` parameter should also be `20`, not `131`. Valid english ids on this host include `20` (Saheeh International), `85` (Abdel Haleem), `22` (Yusuf Ali), `95` (Maududi), `19` (Pickthall).

**What was tried:** `GET /verses/by_key/103:1?translations=131` on `api.quran.com/api/v4` — returns the verse object with no `translations` key. Switching to `translations=20` returns the expected array. The `/resources/translations` listing on this host confirms 131 is not in the id space.
