---
name: reflection-single-submit
description: One reflection per mission — POST /api/reflections must 409 if one exists, and /api/today returns the existing reflection so the UI renders read-only
type: convention
captured: 2026-05-02
source: /learn, live debugging session
---

A mission accepts exactly one reflection. Once submitted, the user cannot create, edit, or overwrite it in the same session or on a later visit to `/today`.

**Why:** The product framing is that reflection is a sincere, one-shot act tied to the day's mission — not a draft the user edits across a window. Previously the API accepted a second `POST` as long as the window was still open (silently upserting), and `/api/today` did not return the existing reflection, so the form re-rendered blank on refresh and users could unknowingly overwrite their own text.

**How to apply:**

- `POST /api/reflections` must reject with `409 REFLECTION_ALREADY_SUBMITTED` whenever `getReflectionByMissionId(mission_id)` returns a row. Do not fall through to an upsert or a PATCH path.
- `GET /api/today` must include a `reflection` field (or `null`) alongside `mission`, so the client can render the submitted-state card without a second round-trip.
- `ReflectView` must check for an existing reflection first and render the read-only "Reflection submitted ✓" card (data-testid `reflection-submitted`) — no radio buttons, no textarea, no submit button. Do not reuse the form in a "disabled" state; fully swap the view.
- The window-closed branch for unsubmitted reflections is still valid (the user skipped the day), but once a reflection exists the window state no longer matters for rendering.
