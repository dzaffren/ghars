---
name: supabase-joined-scalars
description: Supabase nested .select on one-to-one joins returns scalar objects, not arrays — normalise with a first() helper
type: convention
captured: 2026-05-02
source: /learn (caught twice in same session — DaySheet silent-fail and grove DaySheet)
---

When a Supabase `.select()` nests a relationship where the FK has a UNIQUE
constraint (or is a one-to-one via `!inner`), Supabase returns a **scalar
object** for that relationship, not an array. Code that assumes array
access (`data.missions?.[0]`) silently returns `undefined` and the UI
renders nothing.

Always normalise joined data with a `first()` helper before access:

```ts
function first<T>(value: T | T[] | null | undefined): T | undefined {
  if (value == null) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

const mission = first(data?.missions);
const reflection = first(mission?.reflections);
const answer = first(reflection?.reflection_answers);
```

**Why:** We hit this bug on `app/(app)/journal/page.tsx`'s DaySheet —
calendar showed a dot for 2026-05-02, click returned `HTTP 200` with a
valid payload, but the sheet body was blank. Root cause: `missions` came
back as `{...}`, not `[{...}]`, so `data.missions?.[0]` was `undefined`.
The exact same join pattern existed on grove's DaySheet and would have
broken the same way. Supabase's behaviour here varies subtly across
client versions and across which relationships are involved — a runtime
normalisation is the only durable defence.

**How to apply:** Any time a server-side query (in `app/api/**` or
`lib/db/**`) uses nested `.select()` with relationships keyed by a UNIQUE
FK (e.g. `missions` → `daily_assignments`, `reflections` → `missions`,
`reflection_answers` → `reflections`):

1. Type the nested relationship as `T | T[] | null` on the consumer side.
2. Wrap every access with `first(...)`.
3. Do NOT rely on `.single()` at the query level to coerce — it changes
   the top-level shape only, not nested joins.
