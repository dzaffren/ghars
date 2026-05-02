---
name: qf-reflect-gateway
description: QF community posts and scholar answers live on apis.quran.foundation with post.read comment.read scopes — use qfReflectFetch, not qfContentFetch
type: blocker
captured: 2026-05-02
source: /build session — Story 1 of Expand Ayah Rotation epic, lib/qf/client.ts two-token design
---

QF community reflection posts (`/quran-reflect/v1/posts/*`) and scholar ayah-answers (`/content/api/v4/ayah-answers`) are served by `apis.quran.foundation`, not `api.quran.com/api/v4`. They require `post.read comment.read` OAuth scopes, not the `content` scope used for verses/translations/tafsir/audio.

**Why:** The `qfContentFetch` wrapper is hard-wired to `QF_CONTENT_BASE = api.quran.com/api/v4` and mints a `content`-scoped token. Calling it for reflect or answers endpoints returns a 403 (wrong host) or an empty result (wrong scope) with no obvious error message. The two-token design in `lib/qf/client.ts` enforces the separation: `_contentToken` for content, `_reflectToken` for reflect/answers.

**How to apply:** Any code that fetches community posts or scholar answers must call `qfReflectFetch(path)` from `lib/qf/client.ts`, not `qfContentFetch`. The high-level wrappers (`listReflectPostsForAyah`, `listAyahAnswers`, `getReflectPostById`, `getAyahAnswerById`) in `lib/qf/reflect.ts` already do this — prefer those over calling `qfReflectFetch` directly. The `QF_REFLECT_BASE` env var (default `https://apis.quran.foundation`) can be overridden in `.env.local` but must never be set to `api.quran.com`.

**What was tried:** Using `qfContentFetch` for the reflect feed returns a 403 or empty data because the content token lacks `post.read` scope and the base URL is wrong.
