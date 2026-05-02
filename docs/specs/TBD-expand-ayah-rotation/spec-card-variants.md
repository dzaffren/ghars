# Reflection and Q&A card variants (end-to-end)

**Ticket:** TBD

**Discovery Brief:** ../../discovery/expand-ayah-rotation/brief.md

**Epic Overview:** ./spec.md

The Today card today always carries a founder-authored tafsir extract plus two "try this today" action prompts. This story introduces two new card body formats — a reflection paragraph from a verified Quran Reflect community post, and a scholar's answer to a question about the ayah from the published ayah-answers service — while keeping the existing action card format unchanged. The person opening Today benefits because the daily card now varies in mood and register from day to day without any change to the surrounding ritual.

## User Story

As a person who opens Today each day, I want the body of my daily ayah card to vary between a behavioural prompt, a short contemplative paragraph, and a scholar's answer, so that the daily ritual stays fresh without the ayah reference, Arabic text, translation, or Reflect call to action moving around on me.

## Background & Context

**Current state:**

- Opening Today shows a single card format: ayah reference, Arabic text, translation, a short founder-authored tafsir extract, and two founder-authored "try this today" action prompts, followed by a Reflect button.
- Every ayah in the rotation carries the same shape of content. The person opening the app sees an action-style prompt every single day.
- Ayah reference, Arabic text, translation, and the Reflect call to action are already served live and rendered consistently for every ayah.

**Problem:**

- The single format makes the daily experience feel uniform in register. Ayahs that read naturally as contemplation or as scholarly clarification are being squeezed into a behavioural-prompt shape that weakens them.
- Without a second and third body format, the rotation cannot be scaled beyond the founder's hand-written output, and pre-launch users begin to recognise the sameness of the card shape well before they recognise repeated ayahs.

## Target User & Persona

- **Who:** A pre-launch user of the app — someone who opens Today each day as part of a short, contemplative daily ritual with the Qur'an.
- **Context:** Opens Today in the morning or evening on a phone, spends under a minute on the card, and may reflect, bookmark, or move on. Returns later the same day expecting the card to be stable.
- **Current workaround:** None inside the app. Outside the app, the same person might read a Quran Reflect post or a scholar's answer separately on the web — the app does not currently bring either inside the daily card.

## Goals

- Introduce a reflection card body whose content is a short contemplative paragraph drawn from a verified Quran Reflect community post.
- Introduce a Q&A card body that presents a short question about the ayah followed by a published scholar's answer.
- Keep the action card body behaving exactly as it does today for ayahs that are tagged as action cards.
- Keep the card frame — ayah reference, Arabic text, translation, and Reflect call to action — identical across all three card types.
- Make each ayah's card type explicit so that, day by day, the app can pull the right body for the right ayah.
- Degrade silently to a plain ayah card whenever an external body cannot be supplied on a given day, so the person opening Today never sees an error, a blank body, or placeholder copy.

## Non-Goals

- Scaling the rotation to 30 ayahs and tagging each one with its card type — owned by Story 3. This story is validated with roughly 2 to 3 ayahs of each type.
- Changing how action card prompts are authored, reviewed, or stamped — the existing founder-authored flow for action cards continues exactly as today.
- Displaying author or username information on reflection cards — only the attribution line "Shared on Quran Reflect" is shown.
- Surfacing languages other than English for reflection and Q&A card bodies.
- In-app authoring, crowdsourcing, or user submission of card bodies.

## User Workflow

1. **Opens Today** — The person opens the app in the morning. They expect a single card for today's ayah and the familiar frame: ayah reference at the top, Arabic text, translation, and a Reflect button at the bottom.
2. **Sees today's card** — The frame looks exactly as it always has. The body of the card is one of three things: a behavioural "try this today" prompt (action), a short contemplative paragraph followed by the line "Shared on Quran Reflect" (reflection), or a short question followed by a scholar's answer (Q&A). Which one appears depends on the ayah assigned for that day.
3. **Reads and reflects** — The person reads the ayah, reads the body, and taps the Reflect button. The Reflect flow behaves identically regardless of card type.
4. **Returns later the same day** — Opening the app again that afternoon, or refreshing the screen, shows the same ayah and the same body. Nothing has shifted.
5. **Opens Today the next day** — The next day, the assigned ayah is different. The body may be any of the three types — it depends on how that new ayah is tagged. The frame is still the same.
6. **Encounters a silent degradation day** — On a day when the assigned ayah is tagged reflection or Q&A but no approved external content is available for it at that moment, the person simply sees the ayah reference, Arabic text, translation, and Reflect button. There is no error banner, no empty body block, and no "content unavailable" message. The Reflect button still works.

## Acceptance Criteria

### Scenario: Action card continues to render unchanged

```gherkin
Given I open Today on a day when my assigned ayah is an action card
  And the assigned ayah is At-Talaq 65:3 ("And whoever relies upon Allah — then He is sufficient for him")
When the card loads
Then I see the ayah reference "At-Talaq 65:3" at the top of the card
  And I see the Arabic text of the ayah
  And I see the English translation of the ayah
  And I see a short founder-authored tafsir extract
  And I see two founder-authored "try this today" action prompts
  And I see a Reflect button at the bottom of the card
```

### Scenario: Reflection card renders a community reflection paragraph with attribution

```gherkin
Given I open Today on a day when my assigned ayah is a reflection card
  And the assigned ayah is Al-Baqarah 2:153 ("O you who have believed, seek help through patience and prayer")
  And a verified Quran Reflect post is available for that ayah
When the card loads
Then I see the ayah reference "Al-Baqarah 2:153" at the top of the card
  And I see the Arabic text of the ayah
  And I see the English translation of the ayah
  And I see a short contemplative paragraph as the body of the card
  And I see the line "Shared on Quran Reflect" directly beneath the paragraph
  And I do not see any author name or username
  And I see a Reflect button at the bottom of the card
```

### Scenario: Q&A card renders a scholar's answer introduced by the question

```gherkin
Given I open Today on a day when my assigned ayah is a Q&A card
  And the assigned ayah is Al-Baqarah 2:286 ("Allah does not burden a soul beyond that it can bear")
  And a published scholar's answer is available for that ayah
When the card loads
Then I see the ayah reference "Al-Baqarah 2:286" at the top of the card
  And I see the Arabic text of the ayah
  And I see the English translation of the ayah
  And I see a short question about the ayah as the first line of the body
  And I see the scholar's answer following the question
  And I see a Reflect button at the bottom of the card
```

### Scenario: Refreshing the app on the same day shows the same reflection

```gherkin
Given I opened Today earlier this morning
  And my assigned ayah is Ar-Ra'd 13:28 ("in the remembrance of Allah do hearts find rest") tagged as a reflection card
  And I was served a specific contemplative paragraph from Quran Reflect
When I refresh the screen or close and reopen the app later the same afternoon
Then I see Ar-Ra'd 13:28 again
  And I see the same contemplative paragraph
  And I see the "Shared on Quran Reflect" attribution line
  And nothing about the body has changed
```

### Scenario: A new day picks fresh content when the assigned ayah changes

```gherkin
Given yesterday I was served Al-Baqarah 2:286 as a Q&A card with a specific scholar's answer
  And today I am assigned a different ayah in the rotation
When I open Today
Then I see today's ayah, not yesterday's
  And the body reflects today's ayah and its card type
  And I do not see yesterday's scholar's answer
```

### Scenario: Reflection card degrades silently when no approved post is available

```gherkin
Given I open Today on a day when my assigned ayah is tagged as a reflection card
  And no verified Quran Reflect post is available for that ayah at this moment
When the card loads
Then I see the ayah reference at the top of the card
  And I see the Arabic text of the ayah
  And I see the English translation of the ayah
  And I see a Reflect button at the bottom of the card
  And I do not see a body paragraph
  And I do not see the "Shared on Quran Reflect" attribution line
  And I do not see an error message
  And I do not see a "content unavailable" placeholder
  And I do not see a blank labelled box where the body would have been
```

### Scenario: Q&A card degrades silently when no published answer is available

```gherkin
Given I open Today on a day when my assigned ayah is tagged as a Q&A card
  And no published scholar's answer is available for that ayah at this moment
When the card loads
Then I see the ayah reference at the top of the card
  And I see the Arabic text of the ayah
  And I see the English translation of the ayah
  And I see a Reflect button at the bottom of the card
  And I do not see a question line
  And I do not see an answer body
  And I do not see an error message
  And I do not see a "content unavailable" placeholder
```

### Scenario: Reflect call to action behaves identically across all card types

```gherkin
Given I am viewing today's card
When I tap the Reflect button
Then I am taken into the same Reflect flow regardless of whether today's card is action, reflection, or Q&A
  And the journal entry I produce is associated with today's ayah
  And the downstream grove and journal experience behave exactly as they do today
```

### Scenario: Reflection card never shows author or username even if the underlying post has one

```gherkin
Given I am viewing a reflection card for Al-Baqarah 2:153
  And the underlying Quran Reflect post was written by a community member with a visible username
When the card loads
Then I see the reflection paragraph
  And I see the line "Shared on Quran Reflect" beneath the paragraph
  And I do not see any author name, username, handle, or avatar anywhere on the card
```

### Scenario: Approved content only — unverified posts and draft answers are never shown

```gherkin
Given an unverified post exists on Quran Reflect for my assigned reflection ayah
  And a draft scholar's answer exists for my assigned Q&A ayah on a different day
When I open Today on either of those days
Then I never see the unverified post as a reflection body
  And I never see the draft answer as a Q&A body
  And if no approved alternative is available, the card degrades silently to the plain ayah frame
```

### Scenario: External body content is safe to display

```gherkin
Given a verified Quran Reflect post for my assigned reflection ayah contains formatting or markup originally authored on the community platform
When I open Today and the reflection card loads
Then I see a clean, readable contemplative paragraph
  And I do not see raw markup, code-like fragments, or anything that was not part of the author's intended text
```

### Scenario Outline: The card frame is identical across all three card types

```gherkin
Given I open Today on a day when the assigned ayah is tagged as <card type>
  And the assigned ayah is <ayah reference>
When the card loads
Then I see "<ayah reference>" at the top of the card
  And I see the Arabic text of the ayah
  And I see the English translation of the ayah
  And I see a Reflect button at the bottom of the card
  And the ayah reference, Arabic text, translation, and Reflect button occupy the same positions as on any other card type

Examples:
  | card type  | ayah reference    |
  | action     | At-Talaq 65:3     |
  | reflection | Al-Baqarah 2:153  |
  | reflection | Ar-Ra'd 13:28     |
  | qa         | Al-Baqarah 2:286  |
```

### Scenario Outline: The body block varies by card type

```gherkin
Given I open Today on a day when the assigned ayah is tagged as <card type>
When the card loads and approved external content is available where required
Then the body of the card is <body shape>
  And the card carries <attribution>

Examples:
  | card type  | body shape                                                                 | attribution                                      |
  | action     | a short tafsir extract followed by two "try this today" action prompts     | no external-source attribution line              |
  | reflection | a short contemplative paragraph                                            | the line "Shared on Quran Reflect" beneath it    |
  | qa         | a short question followed by a scholar's answer                            | no external-source attribution line              |
```

## Business Rules & Constraints

- **Three card types, exactly one per ayah.** Every ayah served by Today is tagged as exactly one of action, reflection, or Q&A. The tag determines which body shape the card shows.
- **Action-anchored rotation.** At least one-third of the ayahs in the rotation remain action cards so the app's behavioural identity is preserved. This story introduces the card types; Story 3 enforces the one-third share across the full 30.
- **Constant card frame.** The ayah reference, Arabic text, translation, and Reflect button appear in the same positions on every card regardless of type. Only the body block between the translation and the Reflect button differs.
- **Same user, same day, same card.** Once a person has been served a specific reflection paragraph or scholar's answer for a given day, refreshing the screen or closing and reopening the app on that same day shows the same item. A different day can pick fresh content.
- **Silent degradation, never an empty slot.** If a reflection or Q&A ayah has no approved external content available on its assign day, the card degrades silently to the plain ayah frame (reference, Arabic, translation, Reflect button). There is never an error, a blank body block, a "content unavailable" message, or placeholder copy.
- **Approved content only.** Reflection bodies are drawn only from verified Quran Reflect posts. Q&A bodies are drawn only from published scholar answers. Unverified posts and draft answers are never shown to users.
- **Server-side sanitisation of external bodies.** Any externally-sourced body content is cleaned on the server before it reaches the person's screen, reusing the same sanitisation convention already applied to tafsir content. The person never sees raw markup.
- **Reflection attribution text is exact.** Reflection cards carry the line "Shared on Quran Reflect" beneath the body. No author name, username, handle, or avatar is ever shown.
- **Action card authoring is unchanged.** Action cards continue to carry a founder-authored tafsir extract and two founder-authored "try this today" prompts with the existing human-review stamp.
- **Reflect call-to-action parity.** Tapping Reflect from any card type enters the same downstream Reflect, journal, and grove experience. Card type never changes what happens after Reflect is tapped.

## Success Metrics

- Across validation with the 2–3 ayahs tagged per card type for this story, every assigned ayah produces either a correctly-shaped body for its type or a silent degradation to the plain ayah frame. Zero user-visible error states, blank bodies, or placeholder copy are observed.
- Over any validation day, refreshing or reopening the app on that day never changes the card body for a given person.
- On the reflection card, the exact string "Shared on Quran Reflect" is the only attribution shown and no author name or username ever appears.
- The Reflect call-to-action completion rate from reflection and Q&A cards is in the same range as from action cards — the new body shapes do not suppress onward engagement.

## Dependencies

- Story 1 must be complete and its coverage probe gate must have passed, so that verified Quran Reflect posts and published scholar answers can be fetched through the content gateway.
- Confirmation from the content partner on whether reflection cards require a visible link back to Quran Reflect in addition to the text attribution. Current working assumption: text attribution only, no link.
- Continued availability of the ayah reference, Arabic text, translation, and Reflect call-to-action flows already serving Today. This story does not change those flows.
- Story 3 depends on this story shipping in a state where at least one verified ayah per card type can be served end-to-end.

## Open Questions

- [x] ~~Should the reflection card show an author or username?~~ — **Resolved:** No. The only attribution is the exact line "Shared on Quran Reflect" beneath the body.
- [x] ~~What happens on a day when a reflection or Q&A ayah has no approved external content?~~ — **Resolved:** The card degrades silently to the plain ayah frame — reference, Arabic, translation, Reflect button — with no error, no blank body, and no placeholder copy.
- [x] ~~Does the Reflect flow behave differently depending on card type?~~ — **Resolved:** No. Reflect, journal, and grove behave identically regardless of whether the card was action, reflection, or Q&A.
- [x] ~~Does this story tag all 30 ayahs?~~ — **Resolved:** No. Tagging of the full set is owned by Story 3. This story is validated against roughly 2–3 ayahs per card type.
- [ ] Whether the content partner requires a visible link back to Quran Reflect on reflection cards, in addition to the "Shared on Quran Reflect" text — **Status:** Awaiting confirmation from the content partner. **Blocks implementation** if the answer is yes, because a link surface would need to be added to the reflection card body area.

---

## Functional Requirements

- **Card type is authoritative per assignment.** `/api/today` returns the card type for the day's assignment and, for `reflection`/`qa`, either an inlined body + sanitized HTML or an explicit `degraded: true` signal. The client never decides the card type itself.
- **Same-day stability.** The chosen external content's id is persisted on the user's `daily_assignments` row the first time it is resolved. Subsequent reads for the same `(user_id, local_date)` fetch that exact id rather than re-picking.
- **Silent degradation is explicit.** When no usable external content exists at assign-time (and none is already persisted), the API returns `card_type: "reflection"` (or `"qa"`) with `body_html: null` and `degraded: true`. The client renders the plain ayah frame without any error, banner, or placeholder copy.
- **Atomicity.** Picking-and-persisting the external-content id uses a single `UPDATE daily_assignments ... WHERE chosen_external_id IS NULL` so a concurrent request cannot overwrite a value that was just chosen.
- **Idempotency.** `/api/today` is safe to call N times per day per user. Only the first call that resolves a `reflection`/`qa` pick does the persist; subsequent calls read the persisted id.
- **Sanitization at the edge.** All reflect post bodies and ayah-answer bodies pass through `DOMPurify.sanitize()` with the same allowed-tags policy as `app/api/content/tafsir/[key]/route.ts` before being serialised to JSON. The browser receives sanitized HTML only.
- **Action card is a thin compatibility shell.** When `card_type = "action"` the response shape preserves the existing `tafsir_extract` + `prompts: [string, string]` fields so the current `MissionCard` renders unchanged.

### Validation & Business Rules

- `corpus_entries.card_type` must be exactly one of `action`, `reflection`, `qa`. Violations → `400 INVALID_CARD_TYPE`.
- Reflection pick criteria: `verified = true`, `languageName = "English"`, `moderationStatus = "APPROVED"`, `draft = false`, `hidden = false`, `removed = false`. Sort: `featuredAt DESC, likesCount DESC`. Top 1 is chosen.
- Q&A pick criteria: answer `status = "Published"`, `language = "English"`. Sort: prefer `type = "TAFSIR"` over `"CLARIFICATION"`, then `answers.length DESC`. Top 1 question + its top answer is chosen.
- Attribution line text is the literal string `Shared on Quran Reflect`. Rendered by the client, not returned by the API, so the string lives in exactly one place (`ReflectionCard.tsx`).
- Reflection / Q&A body is truncated server-side to 1,200 characters before sanitization; truncation respects word boundaries and appends `…`.

## Permissions & Security

- **Scope:** Private API. `/api/today` already requires `getSession()` → unauthenticated requests receive `401 UNAUTHENTICATED`. No change to auth.
- **Authorization:** A user can only see their own assignment. Card type and externally-sourced body are a function of the assignment's `corpus_entry_id`, not the caller's identity, so RLS remains unchanged.
- **Input validation:** `local_date` stays as `YYYY-MM-DD` regex per existing `LOCAL_DATE_RE`. No new user input.
- **Output sanitization:** All externally-sourced HTML passes through DOMPurify with `ALLOWED_TAGS` identical to the tafsir route. Raw QF post/answer bodies never reach the browser.
- **No secrets in the client bundle.** The QF reflect token is minted server-side only; the client receives only the sanitized body.

## API Design

### `GET /api/today?local_date=YYYY-MM-DD`

Existing route. Response shape grows by two fields; existing consumers that only read `prompts`, `tafsir_extract`, `arabic`, `translation` continue to work unchanged for `action` cards.

**Response (200) — action card (unchanged shape)**:

```json
{
  "assignment_id": "a0f7e6d2-1b2c-4d3e-9f10-1122aabbccdd",
  "verse_key": "65:3",
  "surah_name": "At-Talaq",
  "ayah_number": 3,
  "arabic": "...",
  "translation": "And whoever relies upon Allah - then He is sufficient for him.",
  "translation_id": "131",
  "card_type": "action",
  "tafsir_extract": "Tawakkul: after tying the camel, hand the rope to Allah.",
  "audio_url": "https://audio.qurancdn.com/...",
  "prompts": [
    "Pause once today before reacting and say Hasbunallah.",
    "Name one worry you're holding and hand it over."
  ],
  "reflection_body": null,
  "qa_body": null,
  "mission": null,
  "reflection": null
}
```

**Response (200) — reflection card (new)**:

```json
{
  "assignment_id": "a0f7e6d2-1b2c-4d3e-9f10-1122aabbccdd",
  "verse_key": "2:153",
  "surah_name": "Al-Baqarah",
  "ayah_number": 153,
  "arabic": "...",
  "translation": "O you who have believed, seek help through patience and prayer.",
  "translation_id": "131",
  "card_type": "reflection",
  "tafsir_extract": null,
  "audio_url": "https://audio.qurancdn.com/...",
  "prompts": [],
  "reflection_body": {
    "html": "<p>Patience paired with prayer becomes a posture: steady, and asking.</p>",
    "source_id": 48291,
    "degraded": false
  },
  "qa_body": null,
  "mission": null,
  "reflection": null
}
```

**Response (200) — Q&A card (new)**:

```json
{
  "assignment_id": "a0f7e6d2-1b2c-4d3e-9f10-1122aabbccdd",
  "verse_key": "2:286",
  "card_type": "qa",
  "qa_body": {
    "question": "Why does the verse end with a prayer asking not to be burdened?",
    "answer_html": "<p>The closing du'a teaches that awareness of one's limits is itself an act of faith.</p>",
    "source_id": "a_7k2x",
    "degraded": false
  },
  "reflection_body": null,
  "tafsir_extract": null,
  "prompts": [],
  "arabic": "...",
  "translation": "...",
  "surah_name": "Al-Baqarah",
  "ayah_number": 286,
  "audio_url": "https://audio.qurancdn.com/...",
  "translation_id": "131",
  "mission": null,
  "reflection": null
}
```

**Response (200) — silent degradation (reflection or Q&A with no usable content)**:

```json
{
  "assignment_id": "a0f7e6d2-1b2c-4d3e-9f10-1122aabbccdd",
  "verse_key": "49:12",
  "card_type": "reflection",
  "reflection_body": { "html": null, "source_id": null, "degraded": true },
  "qa_body": null,
  "tafsir_extract": null,
  "prompts": [],
  "arabic": "...",
  "translation": "...",
  "surah_name": "Al-Hujurat",
  "ayah_number": 12,
  "audio_url": "...",
  "translation_id": "131",
  "mission": null,
  "reflection": null
}
```

**Errors (unchanged from current route):**

| Status | Code                     | Condition                                                                                                     |
| ------ | ------------------------ | ------------------------------------------------------------------------------------------------------------- |
| 400    | `INVALID_LOCAL_DATE`     | `local_date` is missing or doesn't match `YYYY-MM-DD`.                                                        |
| 401    | `UNAUTHENTICATED`        | No session.                                                                                                   |
| 404    | `CORPUS_EMPTY`           | No reviewed corpus entries exist.                                                                             |
| 503    | `QF_CONTENT_UNAVAILABLE` | Verse / translation / audio fetch failed. Reflect/answers failures do NOT return 503 — they degrade silently. |

**Important:** Failures of the reflect/answers gateway never raise to the user. They degrade to `{ degraded: true }` in the body block so the card falls back to the plain ayah frame.

## Data Model & Migrations

New migration `supabase/migrations/0008_card_types.sql`:

```sql
-- 1. Add card_type to corpus_entries
alter table corpus_entries
  add column card_type text not null default 'action'
    check (card_type in ('action', 'reflection', 'qa'));

create index if not exists idx_corpus_card_type on corpus_entries(card_type);

-- 2. Persist chosen external content id on daily_assignments
alter table daily_assignments
  add column chosen_reflect_post_id bigint,
  add column chosen_answer_id text,
  add column chosen_question_text text,
  add column chosen_at timestamptz;

-- 3. Backfill: existing 10 rows stay as 'action' (default applies)
-- no data change needed.
```

**Table: `corpus_entries` (modified)**

| Field     | Type | Constraints                              | Description                          |
| --------- | ---- | ---------------------------------------- | ------------------------------------ |
| card_type | text | NOT NULL, DEFAULT 'action', CHECK in set | One of `action`, `reflection`, `qa`. |

**Table: `daily_assignments` (modified)**

| Field                  | Type        | Constraints | Description                                                     |
| ---------------------- | ----------- | ----------- | --------------------------------------------------------------- |
| chosen_reflect_post_id | bigint      | NULL        | Reflect post id chosen for this (user, date) — reflection card. |
| chosen_answer_id       | text        | NULL        | Ayah-answer id chosen for this (user, date) — Q&A card.         |
| chosen_question_text   | text        | NULL        | Cached question text paired with `chosen_answer_id`.            |
| chosen_at              | timestamptz | NULL        | When the external pick was first persisted.                     |

**Migration notes:**

- Default `card_type = 'action'` preserves current behaviour for the 10 existing rows and any action card authored later.
- `chosen_*` columns are nullable because action cards never populate them, and reflection/Q&A cards populate them only after the first resolution.
- No downtime; the migration is additive.
- Rollback: drop the four `chosen_*` columns from `daily_assignments` and the `card_type` column from `corpus_entries`. Drop the index. No data loss for existing features.

## UI/Frontend Requirements

### Components

**`ReflectionCard`** — `app/(app)/today/_components/ReflectionCard.tsx`

- **Type:** New.
- **Purpose:** Renders the reflection-body variant: sanitised HTML paragraph + the exact string `Shared on Quran Reflect` beneath it. Uses `dangerouslySetInnerHTML` with the already-sanitised `html` string, styled via the existing `.tafsir-prose` class for typography parity with the tafsir drawer.
- **Props:**

```typescript
interface ReflectionCardProps {
  html: string; // already sanitised server-side
  // No author, no username, no link. Attribution line is a fixed literal inside the component.
}
```

- `data-testid="reflection-card"`, `data-testid="reflection-attribution"` on the attribution line.

**`QaCard`** — `app/(app)/today/_components/QaCard.tsx`

- **Type:** New.
- **Purpose:** Renders the Q&A-body variant: a plain-text question on the first line (no HTML), followed by sanitised answer HTML.
- **Props:**

```typescript
interface QaCardProps {
  question: string; // plain text
  answer_html: string; // already sanitised server-side
}
```

- `data-testid="qa-card"`, `data-testid="qa-question"`, `data-testid="qa-answer"`.

**`TodayPage`** — `app/(app)/today/page.tsx` (modify)

- Branch on `data.card_type`:
  - `action` → existing `AyahCard` + `MissionCard` flow, unchanged.
  - `reflection` → `AyahCard` (without `tafsir_extract`, without prompts section) + `ReflectionCard` if `!reflection_body.degraded`, else plain `AyahCard` alone.
  - `qa` → `AyahCard` + `QaCard` if `!qa_body.degraded`, else plain `AyahCard` alone.
- In all three cases the `ReflectView` (reflection/commit flow) continues to render below. The Reflect CTA is identical.
- The `MissionCard` only renders for `card_type = "action"`. Reflection and Q&A cards go straight to the Reflect flow without a prompt-selection step; `selected_prompt` is auto-filled with the ayah reference + a generic "Reflect on this ayah" string.

**`AyahCard`** — `app/(app)/today/_components/AyahCard.tsx` (modify)

- The `tafsir_extract` prop becomes optional. When absent/null, the "read the full tafsir" inline preview is omitted; the "Open full tafsir" drawer button remains (full tafsir is still fetched on demand from `/api/content/tafsir/[key]`).

### User Interactions

- Reading a reflection card → tap Reflect → same `ReflectView` that today's action card produces.
- Reading a Q&A card → tap Reflect → same `ReflectView`. The `selected_prompt` stored on the mission is a deterministic string like `"Reflect on Al-Baqarah 2:286"` so downstream reflections still have a prompt field.

### States

- **Loading:** No change. Existing "Loading today's ayah…" applies.
- **Empty body (degraded reflection/qa):** `ReflectionCard` / `QaCard` is not rendered at all. The page shows just `AyahCard` + `ReflectView`. No error banner, no skeleton, no "content unavailable" placeholder.
- **Error:** Existing `QF_CONTENT_UNAVAILABLE` / `CORPUS_EMPTY` handling unchanged.

## Architecture Notes

- **New dependencies:** none. Reuses `isomorphic-dompurify` (already a dependency via tafsir route) and `lib/qf/reflect.ts` introduced by Story 1.
- **Dependencies & integration:**
  - Depends on Story 1's `qfReflectFetch`, `listReflectPostsForAyah`, `listAyahAnswers`.
  - Adds a new server helper `lib/today/resolve-card.ts` that takes a resolved assignment and returns `{ card_type, reflection_body, qa_body }`, persisting `chosen_*` fields on first resolution.
  - `lib/db/assignments.ts` — extends `Assignment` type with `card_type`, `chosen_reflect_post_id`, `chosen_answer_id`, `chosen_question_text`. The existing `resolveOrCreateAssignment` keeps picking the same way (deterministic by day-of-year + seed); no change to rotation logic.
- **Caching:** The existing `qfContentFetch` uses `next: { revalidate: 86400 }`. `qfReflectFetch` uses `revalidate: 3600` (1h) because reflect posts can be featured/unfeatured more often. Per-user, per-day stability is enforced by the DB-persisted `chosen_*` ids, independent of HTTP cache.

## Exemplar Files

- `app/api/content/tafsir/[key]/route.ts` — canonical DOMPurify sanitization pattern. `lib/today/resolve-card.ts` reuses `TAFSIR_ALLOWED_TAGS` and `TAFSIR_ALLOWED_ATTR` verbatim.
- `app/(app)/today/_components/TafsirFullDrawer.tsx` — the `.tafsir-prose` styling block + `dangerouslySetInnerHTML` render pattern. `ReflectionCard` and `QaCard` follow the same markup shape.
- `app/api/today/route.ts` — the shape for extending the response with new fields while keeping old consumers working.
- `lib/db/assignments.ts` — the Supabase upsert + joined-scalar normalisation pattern (see `convention-supabase-joined-scalars`).

## Implementation Plan

### Sub-tasks

**Task 1: Migration `0008_card_types.sql`** — _small_

- Files: `supabase/migrations/0008_card_types.sql`
- INDEPENDENT
- Adds `corpus_entries.card_type` (default `action`, check constraint) and the four `chosen_*` columns on `daily_assignments`. Adds `idx_corpus_card_type`.

**Task 2: Extend `lib/db/assignments.ts`** — _small_

- Files: `lib/db/assignments.ts`
- SEQUENTIAL (depends on Task 1)
- Expand the `Assignment` interface and the two queries (existing-assignment read and new-assignment upsert) to return `card_type`, `chosen_reflect_post_id`, `chosen_answer_id`, `chosen_question_text`. Nothing else changes; rotation logic stays deterministic.

**Task 3: `lib/today/resolve-card.ts` — card-content resolver** — _medium_

- Files: `lib/today/resolve-card.ts`
- SEQUENTIAL (depends on Task 2)
- `resolveCardContent(assignment): Promise<{ card_type, reflection_body?, qa_body? }>`:
  - If `card_type === "action"` → return `{ card_type: "action" }` (the existing `tafsir_extract` + `prompts` are already on the assignment).
  - If `chosen_reflect_post_id` / `chosen_answer_id` is set → fetch that specific item by id via a new `getReflectPostById(id)` / `getAyahAnswerById(id)` helper in `lib/qf/reflect.ts`; sanitize; return `{ degraded: false, ... }`.
  - Else call `listReflectPostsForAyah` / `listAyahAnswers`, pick the top item per the business rules, persist its id to `daily_assignments` via a single `UPDATE ... WHERE chosen_reflect_post_id IS NULL` atomic guard, sanitize, return.
  - On any QF failure or zero results → return `{ degraded: true }`. Never throw.

**Task 4: Extend `lib/qf/reflect.ts` with by-id helpers** — _small_

- Files: `lib/qf/reflect.ts`
- SEQUENTIAL (depends on Task 3 blueprint, but implementable in parallel with Task 3)
- Add `getReflectPostById(id)` → `GET /quran-reflect/v1/posts/{id}`. Add `getAyahAnswerById(questionId)` → fetch the question detail, return the top published-English answer. Both return `null` on 404 or other non-2xx; logging via `logQfError`.

**Task 5: Update `/api/today` route** — _medium_

- Files: `app/api/today/route.ts`
- SEQUENTIAL (depends on Tasks 2, 3, 4)
- After `resolveOrCreateAssignment`, call `resolveCardContent(assignment)`; merge the result into the response. When `card_type !== "action"`, set `tafsir_extract = null` and `prompts = []`. Keep `arabic`, `translation`, `audio_url` fetches unchanged. Keep the existing `QF_CONTENT_UNAVAILABLE` path for verse/translation/audio failures; do NOT raise for reflect/answers failures.

**Task 6: Build `ReflectionCard` and `QaCard` components** — _small_

- Files: `app/(app)/today/_components/ReflectionCard.tsx`, `app/(app)/today/_components/QaCard.tsx`
- SEQUENTIAL (depends on Task 5 response shape)
- Pure presentational components. Reuse `.tafsir-prose` from `app/globals.css`. Literal attribution string `Shared on Quran Reflect`.

**Task 7: Wire `TodayPage` to branch on `card_type`** — _medium_

- Files: `app/(app)/today/page.tsx`
- SEQUENTIAL (depends on Task 6)
- Add `card_type` / `reflection_body` / `qa_body` to `TodayData`. Branch rendering between `MissionCard` (action) and the new cards. Auto-fill `selected_prompt` for reflection/Q&A commits. Ensure `AyahCard` tolerates a null `tafsir_extract`.

**Task 8: Seed fixtures for validation (3 test entries per type)** — _small_

- Files: `supabase/seed.sql` or `scripts/seed-corpus.ts` (extend existing)
- SEQUENTIAL (depends on Task 1)
- Ensure 2–3 corpus entries exist for each `card_type` in local/dev so the E2E suite can exercise all three branches. No change to production seeding.

**Task 9: E2E coverage** — _medium_

- Files: `e2e/today-card-variants.spec.ts`
- SEQUENTIAL (depends on Task 7, 8)
- Covers the four key user-facing scenarios (see E2E Tests table below).

### Negative Constraints

- Do NOT modify the rotation/selection logic in `resolveOrCreateAssignment`. The pool grows (Story 3), but the deterministic pick stays.
- Do NOT change `app/api/content/tafsir/[key]/route.ts` — the full-tafsir drawer is unchanged.
- Do NOT change the reflection/commit flow (`POST /api/today/commit`, `POST /api/reflections`). The card variant does not change what happens after Reflect is tapped. In particular, reflection/Q&A cards still produce a `missions` row with a `selected_prompt`; the prompt text is auto-assigned by the client.
- Do NOT call `qfReflectFetch` on the client. All reflect/answers traffic goes through the server `/api/today` path.
- Do NOT render any author name, username, handle, or avatar on reflection cards.
- Do NOT invent a new sanitization policy. Reuse `TAFSIR_ALLOWED_TAGS` / `TAFSIR_ALLOWED_ATTR`.

## Test Scenarios

**Test 1: Action card response is unchanged**

- Setup: `card_type = 'action'` for `corpus_entries` row with `verse_key = '65:3'`. User assigned to it for today.
- Action: `GET /api/today?local_date=2026-05-03`.
- Expected: `200` with `card_type: "action"`, non-null `tafsir_extract`, `prompts.length === 2`, `reflection_body === null`, `qa_body === null`. Existing `TodayPage` renders `AyahCard` + `MissionCard` identically to today.

**Test 2: Reflection card — first resolution picks top post and persists id**

- Setup: `card_type = 'reflection'` for `2:153`. `daily_assignments.chosen_reflect_post_id` is `NULL`. `listReflectPostsForAyah("2:153")` mocked to return a list where id `48291` has the most recent `featuredAt`.
- Action: `GET /api/today?local_date=2026-05-03`.
- Expected: Response contains `card_type: "reflection"`, `reflection_body.source_id === 48291`, `reflection_body.degraded === false`, `reflection_body.html` is DOMPurified. After the call, `daily_assignments.chosen_reflect_post_id === 48291` and `chosen_at IS NOT NULL`.

**Test 3: Reflection card — repeat call same day returns same post id**

- Setup: As Test 2 but `chosen_reflect_post_id = 48291` is already set. The underlying feed's ordering has changed so the top item would now be id `99999`.
- Action: `GET /api/today?local_date=2026-05-03` twice more in succession.
- Expected: Both responses carry `reflection_body.source_id === 48291`. The feed-listing endpoint is NOT called (only the by-id fetch). `chosen_reflect_post_id` remains `48291`.

**Test 4: Reflection card — no usable post → degraded**

- Setup: `card_type = 'reflection'` for `49:12`. `listReflectPostsForAyah("49:12")` returns empty after the `verified + English` filter.
- Action: `GET /api/today?local_date=2026-05-03`.
- Expected: `reflection_body: { html: null, source_id: null, degraded: true }`. `chosen_reflect_post_id` remains `NULL` (not persisted so tomorrow's resolution can re-try). No 5xx; status is `200`.

**Test 5: Q&A card — first resolution picks top Published English answer**

- Setup: `card_type = 'qa'` for `2:286`. `listAyahAnswers("2:286")` returns one `TAFSIR` question with one `Published` English answer (id `a_7k2x`) and one `CLARIFICATION` with a `Draft` answer.
- Action: `GET /api/today?local_date=2026-05-03`.
- Expected: `qa_body.source_id === "a_7k2x"`, `qa_body.question` is plain text, `qa_body.answer_html` is sanitized. `chosen_answer_id === "a_7k2x"` and `chosen_question_text` is persisted.

**Test 6: Q&A card — degraded when no Published answer**

- Setup: `card_type = 'qa'` for a rarely-answered ayah; `listAyahAnswers` returns only `Draft` answers.
- Action: `GET /api/today?local_date=2026-05-03`.
- Expected: `qa_body: { question: null, answer_html: null, source_id: null, degraded: true }`. No error.

**Test 7: Reflect gateway outage during reflection resolution → degraded, NOT 503**

- Setup: `card_type = 'reflection'`. `qfReflectFetch` mocked to throw.
- Action: `GET /api/today?local_date=2026-05-03`.
- Expected: `200` with `reflection_body.degraded === true`. Core verse/translation/audio fetches still succeed. No `QF_CONTENT_UNAVAILABLE` response.

**Test 8: Verse/translation outage → existing 503 path**

- Setup: `getVerseByKey` throws.
- Action: `GET /api/today?local_date=2026-05-03`.
- Expected: `503 QF_CONTENT_UNAVAILABLE` (unchanged from today).

**Test 9: Sanitization strips script tags**

- Setup: `listReflectPostsForAyah` returns a post whose `body` is `<p>Steady.</p><script>alert(1)</script>`.
- Action: `GET /api/today` → read `reflection_body.html`.
- Expected: `"<p>Steady.</p>"`. No `<script>` tag in the response.

**Test 10: Atomic persist under concurrent requests**

- Setup: Two concurrent `GET /api/today` calls for the same `(user, local_date)` where `chosen_reflect_post_id IS NULL`. The feed mock returns id `48291` on each call but is called only once (deduped via the update guard).
- Action: Fire both in parallel.
- Expected: Both responses carry `source_id: 48291`. DB has exactly one `chosen_reflect_post_id = 48291`. The underlying feed-list helper is invoked at most twice, but only one `UPDATE ... WHERE chosen_reflect_post_id IS NULL` actually writes a row.

**Test 11: Reflection card in `TodayPage` — commits with auto-prompt**

- Setup: `card_type = 'reflection'`, non-degraded body. User has not yet committed.
- Action: User visits `/today`, taps Reflect, enters text, submits.
- Expected: `missions` row is created with `selected_prompt = "Reflect on Al-Baqarah 2:153"` and `is_custom = false`. The reflection row is created as today via `POST /api/reflections`.

## Acceptance Criteria

- [ ] `corpus_entries.card_type` exists with CHECK constraint and default `action`.
- [ ] `daily_assignments` has the four `chosen_*` columns and is populated on first reflection/Q&A resolution.
- [ ] `/api/today` returns `card_type` plus the matching body block (`reflection_body` or `qa_body`) and nulls the unused fields.
- [ ] Reflect/answer failures degrade silently to `{ degraded: true }`; verse/translation failures still return `503`.
- [ ] All externally-sourced HTML is DOMPurified server-side with the same policy as `app/api/content/tafsir/[key]/route.ts`.
- [ ] `ReflectionCard` renders sanitized HTML with the literal attribution `Shared on Quran Reflect` and no author/username.
- [ ] `QaCard` renders a plain-text question + sanitized answer HTML.
- [ ] Action cards render identically to today's UI; reflection and Q&A cards reuse the same Reflect flow.
- [ ] Same-day reload of `/today` never changes the persisted reflection post or answer id.
- [ ] All existing tests still pass. No type errors or lint warnings.

## Verification

Run the `did-workflow:verifier` skill after implementation.

### Backend Tests

- `tests/unit/lib/today/resolve-card.test.ts` — Tests 1–7, 9, 10 using a mocked `qfReflectFetch` and an in-memory Supabase test client.
- `tests/integration/api-today-card-variants.test.ts` — Tests 1, 2, 4, 5, 6, 8 exercising the full `/api/today` route against a seeded DB (3 corpus entries: one per card type, plus one reflection-tagged ayah with empty external pool to exercise degradation).
- `tests/unit/qf/reflect-by-id.test.ts` — verifies `getReflectPostById` and `getAyahAnswerById` filter by verified/English and Published/English respectively and return `null` on 404.

### Browser/UI Testing

- Local dev: `npm run dev`. Seed three corpus entries with distinct `card_type` values. Log in via `/api/demo/start`.
- Steps:
  1. Visit `/today` on a date whose deterministic pick is an action card → expect `AyahCard` + `MissionCard` identical to current behaviour.
  2. Force-assign a reflection card (update `daily_assignments` directly) → refresh `/today` → expect `ReflectionCard` with body + `Shared on Quran Reflect` line + Reflect button. No author text.
  3. Refresh the page 3 times → body content does not change.
  4. Clear the reflect feed mock (return `[]`) → force-assign a fresh reflection-tagged ayah → expect the page to render `AyahCard` alone + the Reflect button, with no banner.
- Mobile viewport (375×812): same four steps — frame positions of reference/Arabic/translation/Reflect button are identical across card types.

### E2E Tests

| Key Scenario                                                              | Test file                         | Assigned sub-task |
| ------------------------------------------------------------------------- | --------------------------------- | ----------------- |
| Action card continues to render unchanged                                 | `e2e/today-card-variants.spec.ts` | Task 9            |
| Reflection card renders a community reflection paragraph with attribution | `e2e/today-card-variants.spec.ts` | Task 9            |
| Q&A card renders a scholar's answer introduced by the question            | `e2e/today-card-variants.spec.ts` | Task 9            |
| Refreshing the app on the same day shows the same reflection              | `e2e/today-card-variants.spec.ts` | Task 9            |
| Reflection card degrades silently when no approved post is available      | `e2e/today-card-variants.spec.ts` | Task 9            |
| Q&A card degrades silently when no published answer is available          | `e2e/today-card-variants.spec.ts` | Task 9            |
| Reflect call to action behaves identically across all card types          | `e2e/today-card-variants.spec.ts` | Task 9            |
| Reflection card never shows author or username                            | `e2e/today-card-variants.spec.ts` | Task 9            |

Not mapped to E2E (backend-only, covered by integration tests): _Approved content only — unverified posts and draft answers are never shown_, _External body content is safe to display (sanitization)_, _The body block varies by card type_ outline.

**Locator strategies:** `data-testid` attributes: `ayah-arabic`, `ayah-translation`, `reflection-card`, `reflection-attribution`, `qa-card`, `qa-question`, `qa-answer`, `mission-option-1` (action-only), `commit-button`, `did-apply-yes_fully`, `reflection-textarea`, `submit-reflection-btn`. The demo session is set up via `page.request.post("/api/demo/start")` per the existing E2E pattern in `e2e/today-flow.spec.ts`.
