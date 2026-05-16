# Exploration Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an `/explore` page where users search Quran verses by theme/feeling, preview results with Claude-generated reasons, and optionally set a verse as today's (or tomorrow's) daily mission.

**Architecture:** Claude Haiku returns 5 verse keys + reasons + action prompts as JSON; the API fetches content from QF and returns verse cards to the client. A dedicated assign endpoint upserts `daily_assignments` for today or tomorrow without touching the `missions` table (the user still commits on `/today`). The schema needs `corpus_entry_id` made nullable and an `exploration_prompt` column added.

**Tech Stack:** Next.js 16 App Router, Supabase (admin client), Anthropic SDK (`@anthropic-ai/sdk`), lucide-react (`Compass` icon), framer-motion, Vitest for unit tests.

---

## File Map

| File | Action |
|---|---|
| `supabase/migrations/0009_explore_assignments.sql` | New — DROP NOT NULL + ADD COLUMN |
| `lib/db/assignments.ts` | Modify — nullable fields + `exploration_prompt` |
| `app/api/today/route.ts` | Modify — handle exploration-sourced assignments |
| `app/(app)/today/page.tsx` | Modify — `prompts: [string, string]` → `string[]` |
| `app/(app)/today/_components/MissionCard.tsx` | Modify — `prompts: [string, string]` → `string[]` |
| `components/RadialNav.tsx` | Modify — add Explore tab at 180° |
| `app/api/explore/search/route.ts` | New — Claude search + QF content fetch |
| `app/api/explore/assign/route.ts` | New — upsert daily_assignment for today/tomorrow |
| `app/(app)/explore/VerseCard.tsx` | New — verse result card with lazy tafsir |
| `app/(app)/explore/ExploreSearch.tsx` | New — search input + suggestion chips |
| `app/(app)/explore/page.tsx` | New — explore page (empty + results states) |
| `tests/unit/explore.test.ts` | New — unit tests for pure logic |

---

### Task 1: Schema Migration

**Files:**
- Create: `supabase/migrations/0009_explore_assignments.sql`

- [ ] **Step 1: Write the migration file**

```sql
-- supabase/migrations/0009_explore_assignments.sql
ALTER TABLE daily_assignments
  ALTER COLUMN corpus_entry_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS exploration_prompt text;

COMMENT ON COLUMN daily_assignments.corpus_entry_id IS
  'NULL when assignment is exploration-sourced (see exploration_prompt).';
COMMENT ON COLUMN daily_assignments.exploration_prompt IS
  'Action prompt for exploration-sourced assignments. NULL for corpus-sourced.';
```

- [ ] **Step 2: Apply the migration**

Run in Supabase SQL editor or via CLI:
```bash
supabase db push
```
Or paste the SQL into the Supabase dashboard → SQL Editor and run it.

- [ ] **Step 3: Verify the schema**

```sql
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'daily_assignments'
  AND column_name IN ('corpus_entry_id', 'exploration_prompt');
```

Expected output:
```
 column_name       | is_nullable | data_type
-------------------+-------------+-----------
 corpus_entry_id   | YES         | integer
 exploration_prompt| YES         | text
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0009_explore_assignments.sql
git commit -m "feat(db): make corpus_entry_id nullable, add exploration_prompt"
```

---

### Task 2: Update `lib/db/assignments.ts`

**Files:**
- Modify: `lib/db/assignments.ts`
- Create: `tests/unit/explore.test.ts`

The current code returns `null` when `corpus_entries` join is null, which will break for exploration-sourced assignments. Fix by selecting `exploration_prompt` and handling both paths.

- [ ] **Step 1: Write failing unit test**

Create `tests/unit/explore.test.ts`:

```typescript
import { describe, it, expect } from "vitest";

// Pure logic extracted from resolveOrCreateAssignment
// for the "which source wins" decision — no DB needed.
function assignmentSource(
  corpusEntry: { id: number; action_prompt_1: string; action_prompt_2: string; tafsir_extract: string } | null,
  explorationPrompt: string | null
): "corpus" | "exploration" | "empty" {
  if (corpusEntry) return "corpus";
  if (explorationPrompt) return "exploration";
  return "empty";
}

describe("assignment source resolution", () => {
  it("corpus entry takes priority", () => {
    const ce = { id: 1, action_prompt_1: "a", action_prompt_2: "b", tafsir_extract: "t" };
    expect(assignmentSource(ce, null)).toBe("corpus");
  });

  it("exploration prompt used when no corpus entry", () => {
    expect(assignmentSource(null, "Notice one moment of ease today.")).toBe("exploration");
  });

  it("returns empty when neither", () => {
    expect(assignmentSource(null, null)).toBe("empty");
  });
});

describe("verse key validation", () => {
  const re = /^\d{1,3}:\d{1,3}$/;
  it("accepts valid keys", () => {
    expect(re.test("94:5")).toBe(true);
    expect(re.test("2:255")).toBe(true);
    expect(re.test("114:6")).toBe(true);
  });
  it("rejects invalid keys", () => {
    expect(re.test("")).toBe(false);
    expect(re.test("94")).toBe(false);
    expect(re.test("94:")).toBe(false);
    expect(re.test("abc:5")).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it passes (pure logic only)**

```bash
pnpm test tests/unit/explore.test.ts
```

Expected: all tests PASS (the logic above is self-contained).

- [ ] **Step 3: Update the `Assignment` interface and `resolveOrCreateAssignment`**

Replace the contents of `lib/db/assignments.ts`:

```typescript
import { createAdminSupabaseClient } from "../supabase/server";

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export interface Assignment {
  id: string;
  verse_key: string;
  corpus_entry_id: number | null;
  action_prompt_1: string | null;
  action_prompt_2: string | null;
  tafsir_extract: string | null;
  exploration_prompt: string | null;
}

export async function resolveOrCreateAssignment(
  userId: string,
  localDate: string
): Promise<Assignment | null> {
  const supabase = createAdminSupabaseClient();

  const { data: existing } = await supabase
    .from("daily_assignments")
    .select(
      `
      id, verse_key, exploration_prompt,
      corpus_entries ( id, action_prompt_1, action_prompt_2, tafsir_extract )
    `
    )
    .eq("user_id", userId)
    .eq("local_date", localDate)
    .single();

  if (existing) {
    const ce = existing.corpus_entries as unknown as {
      id: number;
      action_prompt_1: string;
      action_prompt_2: string;
      tafsir_extract: string;
    } | null;

    if (ce) {
      return {
        id: existing.id,
        verse_key: existing.verse_key,
        corpus_entry_id: ce.id,
        action_prompt_1: ce.action_prompt_1,
        action_prompt_2: ce.action_prompt_2,
        tafsir_extract: ce.tafsir_extract,
        exploration_prompt: null,
      };
    }

    if (existing.exploration_prompt) {
      return {
        id: existing.id,
        verse_key: existing.verse_key,
        corpus_entry_id: null,
        action_prompt_1: null,
        action_prompt_2: null,
        tafsir_extract: null,
        exploration_prompt: existing.exploration_prompt,
      };
    }

    return null;
  }

  // Get user seed
  const { data: user } = await supabase
    .from("users")
    .select("seed")
    .eq("id", userId)
    .single();
  const seed = user?.seed ?? 0;

  // Get corpus count
  const { count } = await supabase
    .from("corpus_entries")
    .select("id", { count: "exact", head: true })
    .not("human_reviewed_at", "is", null);

  if (!count || count === 0) return null;

  const date = parseLocalDate(localDate);
  const doy = dayOfYear(date);
  const idx = ((doy + seed) % count) + 1;

  const { data: entry } = await supabase
    .from("corpus_entries")
    .select("id, verse_key, action_prompt_1, action_prompt_2, tafsir_extract")
    .not("human_reviewed_at", "is", null)
    .order("id", { ascending: true })
    .range(idx - 1, idx - 1)
    .single();

  if (!entry) return null;

  const { data: newAssignment, error } = await supabase
    .from("daily_assignments")
    .upsert(
      {
        user_id: userId,
        local_date: localDate,
        corpus_entry_id: entry.id,
        verse_key: entry.verse_key,
      },
      { onConflict: "user_id,local_date", ignoreDuplicates: false }
    )
    .select("id")
    .single();

  if (error || !newAssignment) return null;

  return {
    id: newAssignment.id,
    verse_key: entry.verse_key,
    corpus_entry_id: entry.id,
    action_prompt_1: entry.action_prompt_1,
    action_prompt_2: entry.action_prompt_2,
    tafsir_extract: entry.tafsir_extract,
    exploration_prompt: null,
  };
}
```

- [ ] **Step 4: Check for TypeScript errors**

```bash
pnpm tsc --noEmit 2>&1 | head -30
```

Fix any errors before continuing.

- [ ] **Step 5: Commit**

```bash
git add lib/db/assignments.ts tests/unit/explore.test.ts
git commit -m "feat(db): support exploration-sourced assignments with nullable corpus_entry_id"
```

---

### Task 3: Update `app/api/today/route.ts`

**Files:**
- Modify: `app/api/today/route.ts`

Handle exploration-sourced assignments: return single prompt array and null tafsir_extract.

- [ ] **Step 1: Update the response building section**

Replace the return statement in `app/api/today/route.ts` (the block starting at line 117):

```typescript
  const prompts: string[] = assignment.exploration_prompt
    ? [assignment.exploration_prompt]
    : [assignment.action_prompt_1!, assignment.action_prompt_2!];

  return NextResponse.json({
    assignment_id: assignment.id,
    verse_key: assignment.verse_key,
    surah_name: verse.surah_name,
    ayah_number: verse.ayah_number,
    arabic: verse.arabic,
    translation: translation.text,
    translation_id: "131",
    tafsir_extract: assignment.tafsir_extract,
    audio_url: audio.audio_url,
    prompts,
    theme_label: assignment.exploration_prompt ? "Your choice" : undefined,
    mission: mission
      ? {
          mission_id: mission.id,
          selected_prompt: mission.selected_prompt,
          is_custom: mission.is_custom,
          committed_at: mission.committed_at,
        }
      : null,
    reflection: reflection
      ? {
          reflection_id: reflection.id,
          did_apply: reflection.did_apply,
          text: reflection.text,
          submitted_at: reflection.submitted_at,
          window_closes_at: reflection.window_closes_at,
        }
      : null,
  });
```

- [ ] **Step 2: Check for TypeScript errors**

```bash
pnpm tsc --noEmit 2>&1 | grep "today/route" | head -10
```

- [ ] **Step 3: Commit**

```bash
git add app/api/today/route.ts
git commit -m "feat(today): handle exploration-sourced assignments with single prompt"
```

---

### Task 4: Update `TodayData` type and `MissionCard` props

**Files:**
- Modify: `app/(app)/today/page.tsx`
- Modify: `app/(app)/today/_components/MissionCard.tsx`

Change `prompts: [string, string]` to `string[]` so a single exploration prompt renders correctly.

- [ ] **Step 1: Update `MissionCard.tsx`**

In `app/(app)/today/_components/MissionCard.tsx`, change line 6:
```typescript
// Before:
  prompts: [string, string];
// After:
  prompts: string[];
```

- [ ] **Step 2: Update `TodayData` in `page.tsx`**

In `app/(app)/today/page.tsx`, change line 22:
```typescript
// Before:
  prompts: [string, string];
// After:
  prompts: string[];
```

Also add `theme_label` to `TodayData` (after `prompts`):
```typescript
  theme_label?: string;
```

- [ ] **Step 3: Check for TypeScript errors**

```bash
pnpm tsc --noEmit 2>&1 | grep -E "today/(page|_components)" | head -10
```

- [ ] **Step 4: Commit**

```bash
git add app/\(app\)/today/page.tsx app/\(app\)/today/_components/MissionCard.tsx
git commit -m "fix(today): broaden prompts type to string[] for single exploration prompt"
```

---

### Task 5: Add Explore tab to `RadialNav`

**Files:**
- Modify: `components/RadialNav.tsx`

Add a 4th tab at 180° (left of centre). `Compass` is available in `lucide-react@^1.11.0`.

- [ ] **Step 1: Update the import and TABS array**

In `components/RadialNav.tsx`, change line 7:
```typescript
// Before:
import { Home, BookOpen, Settings } from "lucide-react";
// After:
import { Home, BookOpen, Settings, Compass } from "lucide-react";
```

Change the TABS constant (lines 61-65):
```typescript
const TABS = [
  { href: "/explore", icon: Compass, label: "Explore", deg: 180 },
  { href: "/journal", icon: BookOpen, label: "Journal", deg: 135 },
  { href: "/today", icon: Home, label: "Today", deg: 90 },
  { href: "/settings", icon: Settings, label: "Settings", deg: 45 },
] as const;
```

- [ ] **Step 2: Check for TypeScript errors**

```bash
pnpm tsc --noEmit 2>&1 | grep "RadialNav" | head -10
```

- [ ] **Step 3: Commit**

```bash
git add components/RadialNav.tsx
git commit -m "feat(nav): add Explore tab at 180deg with Compass icon"
```

---

### Task 6: Create `app/api/explore/search/route.ts`

**Files:**
- Create: `app/api/explore/search/route.ts`

Calls Claude Haiku, fetches QF content for surviving verses, returns results.

- [ ] **Step 1: Add unit tests for the Claude JSON parser**

Add to `tests/unit/explore.test.ts`:

```typescript
// Pure JSON extraction helper — same logic as in the route
function parseVerseResults(raw: string): Array<{
  verse_key: string;
  reason: string;
  action_prompt: string;
}> | null {
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) return null;
  try {
    const arr = JSON.parse(match[0]);
    if (!Array.isArray(arr)) return null;
    return arr.filter(
      (item) =>
        typeof item.verse_key === "string" &&
        /^\d{1,3}:\d{1,3}$/.test(item.verse_key) &&
        typeof item.reason === "string" &&
        typeof item.action_prompt === "string"
    );
  } catch {
    return null;
  }
}

describe("parseVerseResults", () => {
  it("extracts valid JSON array from Claude response", () => {
    const raw = `Here are the verses:\n[{"verse_key":"94:5","reason":"ease after hardship","action_prompt":"Notice one ease today."}]`;
    const result = parseVerseResults(raw);
    expect(result).toHaveLength(1);
    expect(result![0].verse_key).toBe("94:5");
  });

  it("filters out items with invalid verse keys", () => {
    const raw = `[{"verse_key":"invalid","reason":"test","action_prompt":"do it"},{"verse_key":"2:255","reason":"ayat al-kursi","action_prompt":"recite it"}]`;
    const result = parseVerseResults(raw);
    expect(result).toHaveLength(1);
    expect(result![0].verse_key).toBe("2:255");
  });

  it("returns null when no JSON array found", () => {
    expect(parseVerseResults("No JSON here")).toBeNull();
  });

  it("returns null for malformed JSON", () => {
    expect(parseVerseResults("[{broken}]")).toBeNull();
  });
});
```

- [ ] **Step 2: Run the new tests**

```bash
pnpm test tests/unit/explore.test.ts
```

Expected: all tests PASS.

- [ ] **Step 3: Create the search route**

Create `app/api/explore/search/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSession } from "@/lib/session";
import { getVerseByKey, getTranslation } from "@/lib/qf/content";

const VERSE_KEY_RE = /^\d{1,3}:\d{1,3}$/;
const SEARCH_TIMEOUT_MS = 8000;
const MODEL = "claude-haiku-4-5-20251001";

const SYSTEM_PROMPT = `You are a Quran scholar. Given a user's theme, feeling, or situation, return the 5 most relevant Quran verses. Respond with valid JSON only — an array of exactly 5 objects:
[{"verse_key":"<surah>:<ayah>","reason":"<one sentence, max 15 words, lowercase>","action_prompt":"<one specific actionable sentence derived from the verse and the user's query, max 20 words>"}]
Use only canonical verse keys (e.g. "2:255"). Do not explain. Do not add prose.`;

function parseVerseResults(raw: string): Array<{
  verse_key: string;
  reason: string;
  action_prompt: string;
}> | null {
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) return null;
  try {
    const arr = JSON.parse(match[0]);
    if (!Array.isArray(arr)) return null;
    return arr.filter(
      (item) =>
        typeof item.verse_key === "string" &&
        VERSE_KEY_RE.test(item.verse_key) &&
        typeof item.reason === "string" &&
        typeof item.action_prompt === "string"
    );
  } catch {
    return null;
  }
}

async function callClaude(
  client: Anthropic,
  query: string
): Promise<Array<{ verse_key: string; reason: string; action_prompt: string }> | null> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), SEARCH_TIMEOUT_MS);
  try {
    const res = await client.messages.create(
      {
        model: MODEL,
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: query }],
      },
      { signal: ac.signal }
    );
    const textBlock = res.content.find((b) => b.type === "text");
    const raw = textBlock?.type === "text" ? textBlock.text : "";
    return parseVerseResults(raw);
  } catch (err) {
    const name = (err as { name?: string })?.name;
    if (name === "AbortError" || name === "APIConnectionTimeoutError") return null;
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Session required" } },
      { status: 401 }
    );
  }

  let query: string;
  try {
    const body = await request.json();
    query = typeof body?.query === "string" ? body.query.trim() : "";
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_BODY", message: "JSON body required" } },
      { status: 400 }
    );
  }

  if (!query || query.length > 200) {
    return NextResponse.json(
      { error: { code: "INVALID_QUERY", message: "query must be 1–200 characters" } },
      { status: 400 }
    );
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? "" });

  // First attempt
  let claudeResults = await callClaude(client, query).catch(() => null);

  // Retry once on null (malformed JSON or timeout)
  if (!claudeResults) {
    claudeResults = await callClaude(client, query).catch(() => null);
  }

  if (!claudeResults) {
    return NextResponse.json(
      { error: { code: "UPSTREAM_UNAVAILABLE", message: "Could not generate results — please try again" } },
      { status: 503 }
    );
  }

  // Fetch QF content for all verses in parallel; drop failures silently
  const settled = await Promise.allSettled(
    claudeResults.map(async (item) => {
      const [verse, translation] = await Promise.all([
        getVerseByKey(item.verse_key),
        getTranslation(item.verse_key, "131"),
      ]);
      return {
        verse_key: item.verse_key,
        reason: item.reason,
        action_prompt: item.action_prompt,
        arabic: verse.arabic,
        translation: translation.text,
      };
    })
  );

  const results = settled
    .filter((r) => r.status === "fulfilled")
    .map((r) => (r as PromiseFulfilledResult<typeof settled[number] extends PromiseFulfilledResult<infer T> ? T : never>).value);

  if (results.length === 0) {
    return NextResponse.json(
      { error: { code: "NO_VALID_VERSES", message: "No valid verses found — try rephrasing" } },
      { status: 422 }
    );
  }

  return NextResponse.json({ results });
}
```

- [ ] **Step 4: Check for TypeScript errors**

```bash
pnpm tsc --noEmit 2>&1 | grep "explore/search" | head -10
```

Fix any errors (the `settled` map type may need adjustment — see note below).

> **Note on the results map:** If TypeScript complains about the `.map` on settled results, replace the results line with:
> ```typescript
> const results: Array<{ verse_key: string; reason: string; action_prompt: string; arabic: string; translation: string }> = [];
> for (const r of settled) {
>   if (r.status === "fulfilled") results.push(r.value);
> }
> ```

- [ ] **Step 5: Commit**

```bash
git add app/api/explore/search/route.ts
git commit -m "feat(api): add /api/explore/search — Claude Haiku verse discovery"
```

---

### Task 7: Create `app/api/explore/assign/route.ts`

**Files:**
- Create: `app/api/explore/assign/route.ts`

Upserts `daily_assignments` for today (if no committed mission) or tomorrow.

- [ ] **Step 1: Add unit tests for the today/tomorrow date logic**

Add to `tests/unit/explore.test.ts`:

```typescript
// Pure date helper — same logic used in the assign route
function nextDay(localDate: string): string {
  const [y, m, d] = localDate.split("-").map(Number);
  const date = new Date(y, m - 1, d + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

describe("nextDay", () => {
  it("advances a normal date", () => {
    expect(nextDay("2026-05-15")).toBe("2026-05-16");
  });

  it("rolls over month boundary", () => {
    expect(nextDay("2026-05-31")).toBe("2026-06-01");
  });

  it("rolls over year boundary", () => {
    expect(nextDay("2026-12-31")).toBe("2027-01-01");
  });
});
```

- [ ] **Step 2: Run the new tests**

```bash
pnpm test tests/unit/explore.test.ts
```

Expected: all tests PASS.

- [ ] **Step 3: Create the assign route**

Create `app/api/explore/assign/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

const VERSE_KEY_RE = /^\d{1,3}:\d{1,3}$/;
const LOCAL_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function nextDay(localDate: string): string {
  const [y, m, d] = localDate.split("-").map(Number);
  const date = new Date(y, m - 1, d + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Session required" } },
      { status: 401 }
    );
  }

  let verse_key: string, action_prompt: string, local_date: string;
  try {
    const body = await request.json();
    verse_key = body?.verse_key ?? "";
    action_prompt = body?.action_prompt ?? "";
    local_date = body?.local_date ?? "";
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_BODY", message: "JSON body required" } },
      { status: 400 }
    );
  }

  if (!VERSE_KEY_RE.test(verse_key)) {
    return NextResponse.json(
      { error: { code: "INVALID_VERSE_KEY", message: "verse_key must match {chapter}:{verse}" } },
      { status: 400 }
    );
  }
  if (!action_prompt || action_prompt.length > 280) {
    return NextResponse.json(
      { error: { code: "INVALID_ACTION_PROMPT", message: "action_prompt must be 1–280 characters" } },
      { status: 400 }
    );
  }
  if (!LOCAL_DATE_RE.test(local_date)) {
    return NextResponse.json(
      { error: { code: "INVALID_LOCAL_DATE", message: "local_date must be YYYY-MM-DD" } },
      { status: 400 }
    );
  }

  const supabase = createAdminSupabaseClient();

  // Check if today's assignment has a committed mission
  const { data: todayAssignment } = await supabase
    .from("daily_assignments")
    .select("id")
    .eq("user_id", session.userId)
    .eq("local_date", local_date)
    .single();

  let missionExists = false;
  if (todayAssignment) {
    const { data: mission } = await supabase
      .from("missions")
      .select("id")
      .eq("assignment_id", todayAssignment.id)
      .single();
    missionExists = !!mission;
  }

  const targetDate = missionExists ? nextDay(local_date) : local_date;
  const assigned_for: "today" | "tomorrow" = missionExists ? "tomorrow" : "today";

  const { error } = await supabase
    .from("daily_assignments")
    .upsert(
      {
        user_id: session.userId,
        local_date: targetDate,
        verse_key,
        corpus_entry_id: null,
        exploration_prompt: action_prompt,
      },
      { onConflict: "user_id,local_date", ignoreDuplicates: false }
    );

  if (error) {
    console.error("Explore assign error:", error);
    return NextResponse.json(
      { error: { code: "ASSIGN_FAILED", message: "Could not save assignment" } },
      { status: 500 }
    );
  }

  return NextResponse.json({ assigned_for, date: targetDate });
}
```

- [ ] **Step 4: Check for TypeScript errors**

```bash
pnpm tsc --noEmit 2>&1 | grep "explore/assign" | head -10
```

- [ ] **Step 5: Commit**

```bash
git add app/api/explore/assign/route.ts
git commit -m "feat(api): add /api/explore/assign — set exploration verse as mission"
```

---

### Task 8: Create `app/(app)/explore/VerseCard.tsx`

**Files:**
- Create: `app/(app)/explore/VerseCard.tsx`

Verse result card with Arabic, translation, reason, lazy tafsir, bookmark (stubbed), and "Set as mission" button.

- [ ] **Step 1: Create the component**

Create `app/(app)/explore/VerseCard.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Bookmark, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VerseResult {
  verse_key: string;
  reason: string;
  action_prompt: string;
  arabic: string;
  translation: string;
}

interface Props {
  result: VerseResult;
  localDate: string;
  onAssigned: (assignedFor: "today" | "tomorrow") => void;
}

export function VerseCard({ result, localDate, onAssigned }: Props) {
  const [tafsirOpen, setTafsirOpen] = useState(false);
  const [tafsirHtml, setTafsirHtml] = useState<string | null>(null);
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assigned, setAssigned] = useState(false);

  async function handleTafsirToggle() {
    if (tafsirOpen) {
      setTafsirOpen(false);
      return;
    }
    setTafsirOpen(true);
    if (tafsirHtml !== null) return; // already fetched
    setTafsirLoading(true);
    try {
      const res = await fetch(`/api/content/tafsir/${result.verse_key}`);
      const data = await res.json();
      setTafsirHtml(data.text ?? null);
    } catch {
      setTafsirHtml(null);
    } finally {
      setTafsirLoading(false);
    }
  }

  async function handleBookmark() {
    if (bookmarked || bookmarking) return;
    setBookmarking(true);
    try {
      await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verse_key: result.verse_key }),
      });
      setBookmarked(true);
    } catch {
      // silent fail
    } finally {
      setBookmarking(false);
    }
  }

  async function handleAssign() {
    if (assigning || assigned) return;
    setAssigning(true);
    try {
      const res = await fetch("/api/explore/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verse_key: result.verse_key,
          action_prompt: result.action_prompt,
          local_date: localDate,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAssigned(true);
        onAssigned(data.assigned_for);
      }
    } catch {
      // silent fail
    } finally {
      setAssigning(false);
    }
  }

  return (
    <div
      className="rounded-2xl p-5 shadow-sm flex flex-col gap-3"
      style={{ backgroundColor: "white" }}
    >
      {/* Arabic */}
      <p
        className="text-xl leading-relaxed text-right font-arabic"
        dir="rtl"
        style={{ color: "var(--foreground)" }}
      >
        {result.arabic}
      </p>

      {/* Translation */}
      <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
        {result.translation}
      </p>

      {/* Verse reference */}
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        {result.verse_key.replace(":", ":")} — {result.verse_key.split(":")[0]}
      </p>

      {/* Reason */}
      <p className="text-xs italic" style={{ color: "var(--text-muted)" }}>
        ✦ {result.reason}
      </p>

      {/* Tafsir toggle */}
      <button
        onClick={handleTafsirToggle}
        className="flex items-center gap-1 text-xs font-medium self-start"
        style={{ color: "var(--grove-green)" }}
      >
        Tafsir {tafsirOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      <AnimatePresence>
        {tafsirOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {tafsirLoading ? (
              <div className="h-16 rounded-lg animate-pulse" style={{ backgroundColor: "var(--cream-deep, #f3ede0)" }} />
            ) : tafsirHtml ? (
              <div
                className="text-xs leading-relaxed prose prose-sm max-w-none"
                style={{ color: "var(--text-muted)" }}
                dangerouslySetInnerHTML={{ __html: tafsirHtml }}
              />
            ) : (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Tafsir unavailable for this verse.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action row */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={handleBookmark}
          disabled={bookmarked || bookmarking}
          aria-label={bookmarked ? "Bookmarked" : "Bookmark this verse"}
          className="p-2 rounded-full transition-colors"
          style={{
            color: bookmarked ? "var(--grove-green)" : "var(--text-muted)",
            backgroundColor: bookmarked ? "rgba(45,106,79,0.08)" : "transparent",
          }}
        >
          <Bookmark size={16} fill={bookmarked ? "currentColor" : "none"} />
        </button>

        <button
          onClick={handleAssign}
          disabled={assigning || assigned}
          className="ml-auto text-sm font-semibold px-4 py-2 rounded-xl transition-opacity disabled:opacity-50"
          style={{
            backgroundColor: assigned ? "rgba(45,106,79,0.1)" : "var(--grove-green)",
            color: assigned ? "var(--grove-green)" : "white",
          }}
        >
          {assigned ? "Mission set ✓" : assigning ? "Setting…" : "Set as mission"}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Check for TypeScript errors**

```bash
pnpm tsc --noEmit 2>&1 | grep "VerseCard" | head -10
```

- [ ] **Step 3: Commit**

```bash
git add "app/(app)/explore/VerseCard.tsx"
git commit -m "feat(explore): add VerseCard component with lazy tafsir and assign action"
```

---

### Task 9: Create `app/(app)/explore/ExploreSearch.tsx`

**Files:**
- Create: `app/(app)/explore/ExploreSearch.tsx`

Search input + 4 suggestion chips. Calls parent with query string on submit.

- [ ] **Step 1: Create the component**

Create `app/(app)/explore/ExploreSearch.tsx`:

```typescript
"use client";

import { useState, FormEvent } from "react";
import { Search } from "lucide-react";

const SUGGESTIONS = [
  "patience in difficulty",
  "gratitude for small things",
  "trusting Allah's plan",
  "being a better person",
];

interface Props {
  onSearch: (query: string) => void;
  loading: boolean;
}

export function ExploreSearch({ onSearch, loading }: Props) {
  const [query, setQuery] = useState("");

  function submit(q: string) {
    const trimmed = q.trim();
    if (!trimmed || loading) return;
    onSearch(trimmed);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit(query);
  }

  function handleChip(s: string) {
    setQuery(s);
    submit(s);
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="a theme, feeling, or situation…"
          maxLength={200}
          className="flex-1 rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2"
          style={{
            borderColor: "rgba(45,106,79,0.3)",
            backgroundColor: "white",
            color: "var(--foreground)",
          }}
        />
        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="flex items-center justify-center w-12 h-12 rounded-xl text-white disabled:opacity-40"
          style={{ backgroundColor: "var(--grove-green)" }}
          aria-label="Search"
        >
          <Search size={18} />
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => handleChip(s)}
            disabled={loading}
            className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40"
            style={{
              backgroundColor: "rgba(45,106,79,0.08)",
              color: "var(--grove-green)",
              border: "1px solid rgba(45,106,79,0.2)",
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Check for TypeScript errors**

```bash
pnpm tsc --noEmit 2>&1 | grep "ExploreSearch" | head -10
```

- [ ] **Step 3: Commit**

```bash
git add "app/(app)/explore/ExploreSearch.tsx"
git commit -m "feat(explore): add ExploreSearch component with suggestion chips"
```

---

### Task 10: Create `app/(app)/explore/page.tsx`

**Files:**
- Create: `app/(app)/explore/page.tsx`

Wires together ExploreSearch + VerseCard. Handles empty, loading, and results states.

- [ ] **Step 1: Create the page**

Create `app/(app)/explore/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { ExploreSearch } from "./ExploreSearch";
import { VerseCard } from "./VerseCard";

interface VerseResult {
  verse_key: string;
  reason: string;
  action_prompt: string;
  arabic: string;
  translation: string;
}

export default function ExplorePage() {
  const [results, setResults] = useState<VerseResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignedMessage, setAssignedMessage] = useState<string | null>(null);

  const localDate = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  async function handleSearch(query: string) {
    setLoading(true);
    setError(null);
    setAssignedMessage(null);

    try {
      const res = await fetch("/api/explore/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message ?? "Something went wrong. Please try again.");
        setResults(null);
      } else {
        setResults(data.results);
      }
    } catch {
      setError("Could not reach the server. Please check your connection.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  function handleAssigned(assignedFor: "today" | "tomorrow") {
    setAssignedMessage(
      assignedFor === "today"
        ? "Set as today's mission. Go to Today to commit to it."
        : "Set for tomorrow — you've already committed to today's mission."
    );
  }

  return (
    <main
      className="min-h-screen p-6 pb-28"
      style={{ backgroundColor: "var(--sand)" }}
    >
      <div className="max-w-sm mx-auto flex flex-col gap-6">
        <div className="pt-2">
          <h1
            className="text-2xl font-bold mb-1"
            style={{ color: "#1a3a2a" }}
          >
            What&apos;s on your heart today?
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Find a verse that speaks to where you are.
          </p>
        </div>

        <ExploreSearch onSearch={handleSearch} loading={loading} />

        {assignedMessage && (
          <div
            className="rounded-xl px-4 py-3 text-sm font-medium"
            style={{ backgroundColor: "rgba(45,106,79,0.1)", color: "var(--grove-green)" }}
          >
            {assignedMessage}
          </div>
        )}

        {error && (
          <div
            className="rounded-xl px-4 py-3 text-sm"
            style={{ backgroundColor: "rgba(200,60,60,0.08)", color: "#c83c3c" }}
          >
            {error}
          </div>
        )}

        {loading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl h-40 animate-pulse"
                style={{ backgroundColor: "rgba(45,106,79,0.08)" }}
              />
            ))}
          </div>
        )}

        {!loading && results && results.length > 0 && (
          <div className="flex flex-col gap-4">
            {results.map((r) => (
              <VerseCard
                key={r.verse_key}
                result={r}
                localDate={localDate}
                onAssigned={handleAssigned}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Check for TypeScript errors**

```bash
pnpm tsc --noEmit 2>&1 | grep "explore/page" | head -10
```

- [ ] **Step 3: Run all unit tests**

```bash
pnpm test
```

Expected: all tests PASS.

- [ ] **Step 4: Commit**

```bash
git add "app/(app)/explore/page.tsx"
git commit -m "feat(explore): add /explore page — search by theme and set as mission"
```

---

### Task 11: End-to-End Verification

No automated E2E tests for this flow — manual verification against the deployed staging site.

- [ ] **Step 1: Push to staging**

```bash
git push
```

Wait for Vercel deployment (~1-2 min).

- [ ] **Step 2: Verify empty state**

Navigate to `https://ghars-nine.vercel.app/explore`.

Expected:
- Heading "What's on your heart today?" visible
- Search input and 4 chips visible
- No results cards shown
- Nav shows Compass icon at left

- [ ] **Step 3: Verify search results**

Type "patience in difficulty" → press Enter or tap search.

Expected:
- 3 shimmer skeletons appear while loading
- Within 4–6s, 3–5 verse cards appear
- Each card shows Arabic text (right-aligned), English translation, italic reason line

- [ ] **Step 4: Verify lazy tafsir**

Tap "Tafsir ▾" on one card.

Expected:
- Expands with shimmer while fetching
- Ibn Kathir tafsir text appears within 2s

- [ ] **Step 5: Verify mission setting (before reflection)**

Sign in with a fresh or unseen account. On /explore, search for a verse and tap "Set as mission".

Expected:
- Button changes to "Mission set ✓"
- Banner shows "Set as today's mission. Go to Today to commit to it."
- Navigate to /today — that verse now shows with the exploration prompt as the single mission option

- [ ] **Step 6: Verify mission setting (after reflection)**

Submit today's reflection on /today. Then go to /explore, find a verse, tap "Set as mission".

Expected:
- Banner shows "Set for tomorrow — you've already committed to today's mission."
- Next day: /today shows the exploration verse

- [ ] **Step 7: Verify reflection still works on exploration-sourced mission**

After setting an exploration mission on /today and committing to it, submit a reflection.

Expected: plant grows, journal entry appears — identical to corpus-sourced missions.

---

## Spec Coverage Check

| Spec requirement | Task |
|---|---|
| Explore tab in RadialNav at 180° | Task 5 |
| Empty state with heading + chips | Task 10 |
| Results state with verse cards | Task 10 |
| Loading shimmer during search | Task 10 |
| Arabic right-aligned, translation, reason | Task 8 |
| Lazy tafsir on card expand | Task 8 |
| Bookmark button | Task 8 (stub — calls /api/bookmarks) |
| Set as mission button | Task 8 |
| POST /api/explore/search | Task 6 |
| Claude Haiku with 8s timeout | Task 6 |
| Retry on malformed JSON | Task 6 |
| Parallel QF fetch, drop invalid keys | Task 6 |
| POST /api/explore/assign | Task 7 |
| Today vs tomorrow logic | Task 7 |
| Schema migration (nullable corpus_entry_id) | Task 1 |
| exploration_prompt column | Task 1 |
| assignments.ts handles exploration-sourced | Task 2 |
| today/route.ts handles exploration-sourced | Task 3 |
| Single prompt for exploration assignments | Task 3, 4 |
| theme_label "Your choice" | Task 3 |
