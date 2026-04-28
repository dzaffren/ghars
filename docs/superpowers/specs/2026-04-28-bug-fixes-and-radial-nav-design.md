# Bug Fixes and Radial Nav Polish — Design

**Date:** 2026-04-28
**Status:** Approved

## Context

Seven issues reported across the app after the hackathon polish pass: one new feature (radial nav promotion) and six bugs spanning data layer, UI, and external API integration. Each is small-to-medium in isolation; bundled because they target the same codebase in the same sitting and share no risky coupling.

## Items

1. **Journal card 404** — homepage card links to a non-existent detail id
2. **Heatmap stale after submit** — prop not lifted to state
3. **Tasbih max 2/100** — non-atomic read-modify-upsert race
4. **Circles detail shows 0/5 members** — fragile embedded Supabase join
5. **Listen button silent fail** — audio play() errors swallowed
6. **Surah content unavailable** — QF Content API throwing, unclear root cause
7. **Radial nav polish** — promote to primary nav, polish visuals

---

## Item 1: Journal Card 404

### Root cause

In `app/today/page.tsx`, `latestReflection` is queried from the `reflections` table. The `journalEntry` preview sets `id: latestReflection.id` (a reflection row id). The homepage `JournalWidget` links to `/reflections/{id}`. But `app/reflections/[id]/page.tsx` queries the `daily_missions` table by id — so the reflection id does not match and returns 404.

### Fix

Change the select in `app/today/page.tsx` to include the joined mission's id, and use that for `journalEntry.id`.

```ts
// Add id to joined missions:
.select("id, missions:mission_id(id, local_date, mission_text), depth_score")

// Use mission id, not reflection id:
journalEntry = {
  id: (m as { id: string }).id,
  local_date: (m as { local_date: string }).local_date,
  mission_text: (m as { mission_text: string }).mission_text,
  depth_score: latestReflection.depth_score,
};
```

No schema or route change. Trivial.

---

## Item 2: Heatmap Stale After Mission Submit

### Root cause

`app/today/TodayClient.tsx` receives `completedDates14` as a static prop and passes it directly to `<HeatmapStripWidget>`. `handleAccepted()` updates `garden` state but never mutates the heatmap source, so the new green cell doesn't render until the next full page load. The `x/14 done` label updates because it reads from the same array length — wait, both derive from the same prop. On close inspection, `today14done = completedDates14.length` and the API revalidation on `/api/reflection` refreshes the server component's cache on next hard navigation — but within-session the client shows the old values for both counter and heatmap.

*Correction to the user's description:* the counter and heatmap are the same source. Both stall after submit until the page re-fetches.

### Fix

Lift `completedDates14` into local state and append today's local date in `handleAccepted()`:

```ts
const [completedDates, setCompletedDates] = useState(completedDates14);

function handleAccepted(result) {
  setGarden(...);
  setCompleted(true);
  setCelebrationActive(true);
  const today = new Date().toISOString().slice(0, 10);
  setCompletedDates((prev) =>
    prev.includes(today) ? prev : [...prev, today]
  );
  ...
}

// In JSX:
<HeatmapStripWidget
  completedDates={completedDates}
  totalDone={completedDates.length}
/>
```

Uses the browser's local date — matches how the server computes it.

---

## Item 3: Tasbih Race Condition

### Root cause

`app/api/dhikr/route.ts` does SELECT → compute → UPSERT non-atomically. Two overlapping POSTs for different dhikr types both read `(0,0,0)`, each writes its own single-field increment; the second write overwrites the first. The `inFlight` guard in `DhikrClient.tsx` blocks concurrent taps *of the same type* only.

Result: rapid taps across multiple dhikr types cap the total counter around 2 per burst.

### Fix

Add a Postgres function that performs the increment atomically under row lock. API route switches to one `db.rpc(...)` call.

**Migration** `supabase/migrations/0006_dhikr_increment.sql`:

```sql
create or replace function dhikr_increment(
  p_user_id uuid,
  p_local_date date,
  p_type text
) returns table (
  subhan int,
  alhamd int,
  akbar int,
  completed boolean,
  just_completed boolean
)
language plpgsql
as $$
declare
  v_target int;
  v_subhan int;
  v_alhamd int;
  v_akbar int;
  v_completed boolean;
  v_just_completed boolean := false;
begin
  v_target := case p_type
    when 'subhan' then 33
    when 'alhamd' then 33
    when 'akbar' then 34
    else 0
  end;
  if v_target = 0 then
    raise exception 'invalid dhikr type: %', p_type;
  end if;

  insert into dhikr_log (user_id, local_date)
  values (p_user_id, p_local_date)
  on conflict (user_id, local_date) do nothing;

  select dl.subhan, dl.alhamd, dl.akbar, dl.completed
    into v_subhan, v_alhamd, v_akbar, v_completed
  from dhikr_log dl
  where dl.user_id = p_user_id and dl.local_date = p_local_date
  for update;

  if v_completed then
    return query select v_subhan, v_alhamd, v_akbar, v_completed, false;
    return;
  end if;

  if p_type = 'subhan' and v_subhan < 33 then
    v_subhan := v_subhan + 1;
  elsif p_type = 'alhamd' and v_alhamd < 33 then
    v_alhamd := v_alhamd + 1;
  elsif p_type = 'akbar' and v_akbar < 34 then
    v_akbar := v_akbar + 1;
  end if;

  if v_subhan >= 33 and v_alhamd >= 33 and v_akbar >= 34 then
    v_completed := true;
    v_just_completed := true;
  end if;

  update dhikr_log
    set subhan = v_subhan,
        alhamd = v_alhamd,
        akbar = v_akbar,
        completed = v_completed,
        updated_at = now()
    where user_id = p_user_id and local_date = p_local_date;

  return query select v_subhan, v_alhamd, v_akbar, v_completed, v_just_completed;
end;
$$;
```

**API route rewrite** (`app/api/dhikr/route.ts` POST):

```ts
const { data, error } = await db.rpc("dhikr_increment", {
  p_user_id: session.userId,
  p_local_date: localDate,
  p_type: type,
});
if (error || !data?.[0]) {
  return NextResponse.json({ error: "Could not update" }, { status: 500 });
}
const row = data[0];

// Award growth points if just completed (best-effort)
if (row.just_completed) {
  const { data: garden } = await db
    .from("gardens").select("growth_points")
    .eq("user_id", session.userId).single();
  if (garden) {
    await db.from("gardens")
      .update({
        growth_points: garden.growth_points + 3,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", session.userId);
  }
}

return NextResponse.json({
  subhan: row.subhan,
  alhamd: row.alhamd,
  akbar: row.akbar,
  completed: row.completed,
  justCompleted: row.just_completed,
  targets: TARGETS,
});
```

Note: RPC returns an array of rows; `data[0]` is the single row. Garden points are still updated from the API route (post-RPC) to avoid coupling the garden table into the atomic function.

### Client side

No changes required to `DhikrClient.tsx` — the optimistic update still works and the server returns the authoritative count.

---

## Item 4: Circles Detail Shows 0/5

### Root cause

`app/circles/[id]/page.tsx` uses a single embedded select:

```ts
.from("circle_members")
.select("user_id, users(display_name), gardens(growth_points, current_streak, wilting)")
```

`circle_members.user_id → users.id` is a valid FK. But `gardens.user_id → users.id` means Supabase has to resolve `circle_members → gardens` via the `users` intermediary, which is ambiguous. When the resolution fails, the entire `members` array can come back empty — not just the garden column. The list view (item 1 of the page) does a simple `.select("circle_id")` so it's unaffected.

### Fix

Split into two explicit queries:

```ts
// 1. Members + user info via the real FK
const { data: memberRows } = await db
  .from("circle_members")
  .select("user_id, users(display_name)")
  .eq("circle_id", circleId);

// 2. Gardens for those members
const userIds = (memberRows ?? []).map((m) => m.user_id);
const { data: gardenRows } = userIds.length
  ? await db
      .from("gardens")
      .select("user_id, growth_points, current_streak, wilting")
      .in("user_id", userIds)
  : { data: [] };

// 3. Build a Map and merge
const gardenMap = new Map(gardenRows?.map((g) => [g.user_id, g]) ?? []);
const memberData = (memberRows ?? []).map((m) => {
  const u = Array.isArray(m.users) ? m.users[0] : m.users;
  const g = gardenMap.get(m.user_id);
  return {
    userId: m.user_id,
    displayName: u?.display_name ?? "Member",
    isYou: m.user_id === session.userId,
    isOwner: m.user_id === circle.owner_id,
    garden: {
      growthPoints: g?.growth_points ?? 0,
      currentStreak: g?.current_streak ?? 0,
      wilting: g?.wilting ?? false,
    },
  };
});
```

Result shape is unchanged; `CircleDetail.tsx` needs no edits.

---

## Item 5: Listen Button Silent Fail

### Root cause

`components/AudioPlayer.tsx` does `await audioRef.current.play()` inside `try { ... } finally { setLoading(false) }`. There is no `catch`. When `play()` rejects (browser autoplay policy, CORS, unsupported codec), the promise rejection escapes but the component shows no error — button just appears to do nothing.

Second issue: `new Audio(url)` only fires `oncanplay` on successful preload. Network errors fire `onerror`, but the component doesn't listen.

### Fix

Rewrite `AudioPlayer.tsx`:

```tsx
const [playing, setPlaying] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(false);
const audioRef = useRef<HTMLAudioElement | null>(null);

function ensureAudio() {
  if (audioRef.current) return audioRef.current;
  const a = new Audio(url);
  a.onended = () => setPlaying(false);
  a.oncanplay = () => setLoading(false);
  a.onerror = () => {
    console.error("[AudioPlayer] failed to load:", url, a.error);
    setError(true);
    setLoading(false);
    setPlaying(false);
  };
  audioRef.current = a;
  return a;
}

async function toggle() {
  setError(false);
  const audio = ensureAudio();
  if (playing) {
    audio.pause();
    setPlaying(false);
    return;
  }
  setLoading(true);
  try {
    await audio.play();
    setPlaying(true);
  } catch (err) {
    console.error("[AudioPlayer] play() rejected:", url, err);
    setError(true);
    setPlaying(false);
  } finally {
    setLoading(false);
  }
}

// In JSX: if error, show "Unavailable" label and reset error on next click
```

Also surface a `title` attribute so users get a tooltip on failure.

### Deliberate choices

- Error state is not persistent — reset on next tap so user can retry after network recovers.
- Console logs are intentional; they're how we'll diagnose field issues without a full observability stack.

---

## Item 6: Surah "Content Temporarily Unavailable" — Diagnostic Approach

### Root cause (hypothesis)

`app/surah/[chapterId]/page.tsx` catches any error from `fetchChapters / fetchChapterVerses / fetchChapterAudioUrl` and sets `loadError = true`. The underlying cause is in `lib/qf/content-client.ts` and is one of:

1. `QF_BASE_URL` env var unset in dev/prod → `new URL(\`${BASE_URL}...\`)` throws
2. Content OAuth credentials missing/stale → `getContentToken()` throws
3. Content API endpoint returns 4xx/5xx — already logged via `console.error`

### Fix approach

This can't be fixed blind. Three-step plan:

**Step A — Instrument better logging:**

In `lib/qf/content-client.ts`, enrich the error path so the *which* of the three failure modes is visible:

```ts
async function getContentToken(): Promise<string> {
  if (!BASE_URL) throw new Error("QF_BASE_URL not set");
  if (!CLIENT_ID || !CLIENT_SECRET) throw new Error("QF content credentials missing");
  // ... rest unchanged
}
```

Upgrade `app/surah/[chapterId]/page.tsx` catch to log the error with identifying context:

```ts
catch (err) {
  console.error("[SurahPage]", chId, String(err));
  loadError = true;
}
```

**Step B — Diagnose by running:**

Run `pnpm dev`, open `/surah/2`, read the server console. The log will pinpoint which of the three modes is failing.

**Step C — Fix whatever Step B reveals:**

- If env vars are missing: document them in `.env.example` and set locally
- If credentials are stale: regenerate via QF portal, update `.env.local`
- If endpoint returns 4xx/5xx: check QF status and the QF support channel

### User-facing improvement

Independent of root cause: split `loadError` into per-resource flags so the page can still render verses if only audio fails, or still render the verse list if only tafsir fails. Out of scope for this pass if it grows the change too much.

---

## Item 7: Radial Navbar Promotion & Polish

### Architecture

- `RadialNav` moves from `components/ui/radial-social-menu.tsx` to `components/RadialNav.tsx` (rename; the "ui/" directory implies shadcn primitives)
- Mount once in `app/layout.tsx` so it appears on every route
- `RadialNav` itself remains responsible for hide-on-landing/onboarding logic
- `AppHeader` keeps logo + wordmark + logout at the top in the sticky slot, but loses the tab row (lines 93-125 of the current file). This keeps the app name visible without doubling navigation.

### Visual polish

- **Anchor position:** bottom-right floating, `fixed bottom-4 right-4 z-50`, opens up-left (180°→270° sweep). Keeps out of reading flow; fits mobile thumb zone. Desktop benefits too.
- **Sweep:** 120° (from 90°) for better spacing between six items
- **Labels on hover only:** icon always visible; label fades in on hover/focus/active with an absolutely-positioned pill under the orbit button. On touch devices (hover not supported), labels remain always visible for the currently-active item only.
- **Active glow:** `shadow-[0_0_20px_rgba(45,106,79,0.35)]` on the active orbit item
- **Center pulse (first visit):** if `localStorage.getItem("ghars_radial_seen") !== "1"`, pulse the center button twice via framer-motion `animate` loop, then set the flag
- **Backdrop on open:** full-viewport `bg-black/10 backdrop-blur-sm` fading in from 0 opacity; tap to close
- **Shadow:** deepen center button shadow to `shadow-[0_6px_22px_-6px_rgba(45,106,79,0.35)]`
- **Reduced motion:** `useReducedMotion()` short-circuits all animation durations to 0

### Anchor content

Center button shows only the Ghars logo (Image `/logo.png`, 30×30). The wordmark lives in AppHeader at the top, so the anchor stays compact and iconic. No text next to the center button — simpler, and the logo itself is recognizable.

### Files touched

- `components/RadialNav.tsx` (rename from `components/ui/radial-social-menu.tsx`, major rewrite)
- `app/layout.tsx` (import and render `<RadialNav />` after `{children}`)
- `components/AppHeader.tsx` (delete lines 93-125 — the nav tabs row and surrounding conditional)
- No changes to page-level `<AppHeader variant="..." />` call sites (the variant prop is already a no-op in the component body)

---

## Verification

Manual, per task. No new automated tests — these are UX/data fixes with immediate visible feedback.

**Item 1:** Submit a reflection on `/today`, tap the Journal card — should land on the detail page, not 404.

**Item 2:** Submit a reflection, watch the heatmap card below — today's cell should fill green immediately.

**Item 3:** Open `/dhikr` in two browser tabs, tap rapidly across subhan/alhamd/akbar. Total should increment by every tap across both tabs. Verify via DB that `subhan + alhamd + akbar` matches total taps.

**Item 4:** Join a circle via invite code from a second account, then open the circle detail from both accounts. Member count should match the list view count.

**Item 5:** Break audio URL temporarily (point at a 404), tap Listen — button should show an error state, console log the failure, and allow retry.

**Item 6:** Navigate to `/surah/2`. If the page still shows "Content temporarily unavailable," console log tells us the failure mode — fix and re-verify.

**Item 7:** Every page should render RadialNav at bottom-right. Tap anchor → orbit expands, labels hidden until hover. Tap a route → navigate + close. AppHeader still shows logo+name+logout at top. `/` and `/onboarding` should not show RadialNav.

---

## Out of Scope

- Observability / Sentry wiring
- Per-resource granular error surfaces on the surah page (audio vs. verses)
- New tests — these are all UX changes best verified manually
- Logout-as-orbit-item — rejected in favor of keeping AppHeader thin
- Migration from pnpm or Next version changes
