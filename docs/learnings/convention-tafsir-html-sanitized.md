---
name: tafsir-html-sanitized
description: Tafsir text from QF comes back as HTML and must be sanitized server-side with isomorphic-dompurify before rendering
type: convention
captured: 2026-05-02
source: /learn, live debugging session
---

Tafsir responses from `api.quran.com/api/v4/tafsirs/{id}/by_ayah/{key}` contain HTML tags (`<h2>`, `<h3>`, `<p>`, `<sup>`, `<blockquote>`, etc.), not plain text. Any route that returns tafsir to the browser must sanitize the HTML with `isomorphic-dompurify` before it reaches the client, and the component must render via `dangerouslySetInnerHTML` (never as plain-text, which would show literal tags).

**Why:** Returning raw third-party HTML directly and dropping it into `dangerouslySetInnerHTML` would be an XSS vector (QF content is trusted-ish, but we do not control it and it can change). Rendering raw HTML as plain text inside a `<p>` makes the tafsir look broken — users see `<h2>Which was revealed in Makkah</h2>` as literal text. Server-side sanitization lets the client trust the `text` field and the API stays the single choke point for escape rules.

**How to apply:** In `app/api/content/tafsir/[key]/route.ts`, run `DOMPurify.sanitize(tafsir.text, { ALLOWED_TAGS, ALLOWED_ATTR })` before returning the payload. Keep the allow-list narrow — currently `p, br, h2, h3, h4, strong, em, b, i, u, ul, ol, li, blockquote, sup, sub, span` with attributes `dir, lang`. Rendered with the `.tafsir-prose` styles in `app/globals.css`. If you add a new endpoint that returns QF HTML fragments, sanitize there too.
