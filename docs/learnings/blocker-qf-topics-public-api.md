---
name: qf-topics-public-api
description: QF public content API does not expose /topics — exists only under the OAuth-gated content API, shape unverified
type: blocker
captured: 2026-05-02
source: /learn (captured after design session for explore-by-theme feature was aborted)
---

QF's public content API at `api.quran.com/api/v4` does NOT expose a
`/topics` endpoint — it returns 404. The topics endpoint does exist at
`https://apis.quran.foundation/content/api/v4/topics` (returns a proper
JSON error about missing auth when probed), but that lives behind the QF
OAuth2 content API, not the public host, and the endpoint shape (topics
list? verses-by-topic? taxonomy root?) has not been verified against live
prelive/prod.

**Why:** We considered building an "explore Qur'an by theme" feature where
users would browse verses organised by topic. We initially assumed QF's
public content API would serve this the way it serves verses/translations/tafsir.
It does not. A build on that assumption would have 404'd on first request.

**How to apply:** If a future feature needs theme/topic/subject-indexed
verses from QF:

1. Do NOT assume `api.quran.com` serves them — it doesn't.
2. Before any design work, probe `apis.quran.foundation/content/api/v4/topics`
   with a valid OAuth token (from `qf_sessions.access_token`) to verify
   the endpoint exists, what taxonomy it uses, and whether the verses
   returned per topic are useful for the feature's scope.
3. Also consider the alternatives we discussed: expanding `corpus_entries`
   (curated, in-repo, aligned with product voice), semantic search over
   full Qur'an embeddings (infrastructure you don't have yet), or letting
   an LLM search live (risk of hallucinated verse references — do not
   ship without a verification layer).

**What was tried:**

- Probed `GET https://api.quran.com/api/v4/topics` → 404 HTML page.
- Probed `GET https://api.quran.com/api/v4/topics/1` → 404 HTML page.
- Probed `GET https://api.quran.com/api/v4/topics/1/verses?size=3` → 404 HTML page.
- Probed `GET https://apis.quran.foundation/content/api/v4/topics` without
  auth → proper JSON `{"success":false,"type":"invalid_request","message":"The request is missing required headers or is invalid"}`.
  Endpoint exists; auth shape and response shape both unverified.
