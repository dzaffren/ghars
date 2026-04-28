# Post-Hackathon Bug Fixes & Polish — Design

**Date:** 2026-04-28
**Status:** Draft — awaiting review

## Context

Seven issues reported after the first bug-fix bundle. Some relate to regressions exposed by the radial-nav promotion; others are UX gaps (display name, star explanation, back button); one is a suspected data-layer bug (next-day mission). Bundled together because they target the same codebase in the same sitting, are individually small, and share no risky coupling.

This spec supersedes nothing — it adds to the prior 2026-04-28 spec (`2026-04-28-bug-fixes-and-radial-nav-design.md`). Several items in the prior spec were shipped but are still reported as broken; analysis below distinguishes "prior fix was insufficient" from "new issue."

## Items

1. **Mission not created next day** — silent failure in `getOrCreateTodaysMission()` hides root cause
2. **Radial nav positions wrong** — geometry math renders items 3–6 below the viewport
3. **Dhikr card stale on home** — server-component RSC cache not invalidated after increment
4. **Circle member shows "Member"** — `display_name` extraction too narrow + null overwrites existing value
5. **Star rating unexplained** — add tooltip/legend to reflection detail page
6. **No consistent back button** — add back chevron to `AppHeader` on non-home pages
7. **Explore missing from home + schema audit** — add `ExploreWidget` full-width card; audit + fix critical schema issues

---

## Item 1: Mission Not Created Next Day

### Root cause (hypothesis)

`/today` calls `getOrCreateTodaysMission()` on every load. This is the only path that creates a mission — the cron only fires at users' reminder hours and is orthogonal. If a user visits `/today` the next day and sees no new mission, the create path is throwing silently inside `lib/mission/generate.ts`. Three likely failure modes:

1. `llm.pickMission()` throws (OpenAI/Anthropic rate limit, missing key, invalid response shape)
2. `fetchVerse(verseKey)` throws (QF Content API down — the bug we diagnosed in the prior spec)
3. `db.from("daily_missions").insert(...)` errors (unique-constraint race, RLS, null column)

Because the function throws bare strings and `/today`'s page component doesn't catch, the page renders Next's error boundary or an empty state.

### Fix

**A. Add diagnostic logging in `lib/mission/generate.ts`** to distinguish the three modes. Each external call gets its own try/catch that logs context and re-throws a tagged error:

```ts
let picked;
try {
  picked = await llm.pickMission({
    focusAreas: user.focus_areas ?? [],
    recentVerseKeys: recentKeys,
    actionablePool,
  });
} catch (err) {
  console.error("[mission/generate] LLM pickMission failed", { userId, err });
  throw new Error("mission_llm_failed");
}

let verseData;
try {
  verseData = await fetchVerse(picked.verseKey);
} catch (err) {
  console.error("[mission/generate] QF fetchVerse failed", {
    userId,
    verseKey: picked.verseKey,
    err,
  });
  throw new Error("mission_verse_fetch_failed");
}

// Insert — already has error handling but make it tagged
const { data: mission, error: insertErr } = await db
  .from("daily_missions")
  .insert({ ... })
  .select()
  .single();
if (insertErr) {
  console.error("[mission/generate] insert failed", { userId, insertErr });
  throw new Error("mission_insert_failed");
}
return mission;
```

**B. Graceful degradation in `app/today/page.tsx`** — wrap the `getOrCreateTodaysMission()` call in try/catch, log the error, and pass `mission: null` to `TodayClient`. Add a fallback UI card in `TodayClient.tsx` when `mission` is null: "We couldn't prepare today's mission. Try again →" with a button that calls `router.refresh()`.

This requires widening the `Mission` prop in `TodayClient.tsx` from `Mission` to `Mission | null` and guarding every downstream access (`mission.verse_key`, `mission.audio_url`, etc.). When `mission` is null, the hero strip still renders (garden, streak, progress bar) and only the mission card area swaps to the fallback.

This gives us logs for diagnosis and prevents a blank-screen experience while we track down the underlying cause.

### Verification

- Reload `/today`. If a mission exists, no change visible.
- To force the error path during dev, temporarily break `QF_BASE_URL` in `.env.local`, visit `/today` — should see the fallback card, and server console should log `mission_verse_fetch_failed` with verse key.
- Restore env, reload — mission should generate normally.

---

## Item 2: Radial Nav Geometry Bug

### Root cause

`components/RadialNav.tsx` places orbit items at:

```ts
const x = RADIUS * Math.cos(rad);
const y = -RADIUS * Math.sin(rad);
```

Comment claims "270° = straight up, 180° = left." With the code's formula:
- 0° → right (x=+R, y=0)
- 90° → **up** (y=-R) ✓
- 180° → left ✓
- 270° → **down** (y=+R) ✗ — off-screen below the anchor

Current `START_DEG = 170, END_DEG = 290` puts the last items at `sin(290°) = -0.94` → `y = +0.94*R` → below the viewport. Only Home (170°) and Explore (~194°) stay on-screen.

### Fix

Sweep through the range where `sin(rad)` is positive (so `-RADIUS * sin(rad)` is negative and items render *above* the anchor). Items anchored bottom-right should open into the "up + left" quadrant:

```ts
const START_DEG = 100; // nearly straight up, slight right-of-up
const END_DEG = 200;   // left and slightly down-left
```

100°→200° sweep gives 100° of arc across 6 items (~20° between each). All items have negative y (above anchor) and distribute naturally across the upper-left quadrant and horizontal axis.

No other `RadialNav.tsx` changes — active styling, backdrop, labels, first-visit pulse, hide-on-landing logic all remain.

### Verification

- Open `/today` in a mobile viewport (e.g. iPhone 14 in devtools).
- Tap the logo anchor at bottom-right. All 6 items (Home, Explore, Tasbih, Circles, History, Journal) should be visible above the anchor.
- Each label should be reachable and not clipped by the viewport edges.
- Tap the backdrop → orbit closes.

---

## Item 3: Dhikr Card Stale on Home

### Root cause

`/today` is a server component. Next.js caches the RSC payload. When the user:

1. Opens `/today` (caches the payload with dhikr counts = 0)
2. Navigates to `/dhikr`, increments via `/api/dhikr`
3. Navigates back to `/today` (soft nav reuses cached RSC)

…the `TasbihWidget` shows the stale count. The DB is correct; the UI lags.

### Fix

In `app/api/dhikr/route.ts` POST, after the RPC succeeds, call `revalidatePath("/today")`:

```ts
import { revalidatePath } from "next/cache";

// ...after successful row update, before NextResponse.json:
revalidatePath("/today");

return NextResponse.json({ ... });
```

One import, one line. Next soft nav to `/today` will re-run the server component.

### Verification

- Open `/today`, note Tasbih count (e.g. 0/100).
- Navigate to `/dhikr`, tap buttons 5 times.
- Navigate back to `/today` via the radial nav.
- TasbihWidget should show 5/100, not 0/100.

---

## Item 4: Circle Member Shows "Member" Instead of Real Name

### Root cause

Two compounding issues in `app/callback/route.ts`:

1. **Narrow extraction:** Only `claims.name ?? claims.given_name ?? null` is checked. If QF returns neither (some scopes don't include these), we store `null`.
2. **Null overwrites on re-login:** The upsert includes `display_name`, so a subsequent login that returns null for `name` and `given_name` will blank out a previously-set name.

### Fix

**A. Broaden extraction** with a helper in `app/callback/route.ts`:

```ts
function deriveDisplayName(claims: {
  name?: string | null;
  given_name?: string | null;
  preferred_username?: string | null;
  email?: string | null;
}): string | null {
  const candidates = [
    claims.name,
    claims.given_name,
    claims.preferred_username,
    claims.email?.split("@")[0],
  ];
  for (const c of candidates) {
    const trimmed = c?.trim();
    if (trimmed) return trimmed;
  }
  return null;
}
```

Widen the `decodeIdToken` return type in `lib/auth/qf-oauth.ts` to include `preferred_username?: string | null` (pulled through to the callback). No behavior change if QF doesn't emit it.

**B. Don't overwrite existing name with null.** Split the upsert:

```ts
// 1. Upsert always-safe fields
const { data: user, error } = await db
  .from("users")
  .upsert({
    qf_sub: claims.sub,
    email: claims.email ?? null,
    qf_access_token: tokens.access_token,
    qf_refresh_token: tokens.refresh_token,
    qf_token_expires_at: expiresAt,
  }, { onConflict: "qf_sub" })
  .select("id, focus_areas, display_name")
  .single();

if (error || !user) { /* existing error path */ }

// 2. Only set display_name when we derived one AND row doesn't already have one
const derivedName = deriveDisplayName(claims);
if (derivedName && !user.display_name) {
  await db.from("users").update({ display_name: derivedName }).eq("id", user.id);
}
```

### Backfill

Existing users whose `display_name` is currently null will be backfilled on their next login via the broadened extraction (email local-part is the last-resort fallback, which every user has). No separate migration is required.

### Verification

- Log out.
- Log back in with the test account. Check `users.display_name` in DB → should be populated (from `name`, `preferred_username`, or email local-part).
- Open a circle with multiple members → cards show real names instead of "Member."
- Manually null out a `display_name` in DB, log out and back in → `display_name` is re-populated on next login.

---

## Item 5: Star Explainer Tooltip

### Location

`app/reflections/[id]/page.tsx` renders `<DepthStars score={...} />` at lines 21–35. Users see 2★ or 3★ without context for what the scale means.

### Fix

Replace the bare `<DepthStars>` with a `<DepthStarsWithLegend>` component that uses native `<details>`/`<summary>` for a zero-dep, touch-friendly, accessible expander. Tapping the info icon reveals a small popover with the scale.

```tsx
import { Info } from "lucide-react";

function DepthStarsWithLegend({ score }: { score: number | null }) {
  if (!score) return null;
  return (
    <details className="relative">
      <summary className="flex cursor-pointer items-center gap-1 list-none">
        <span className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`text-sm ${i < score ? "text-[#d4a017]" : "text-muted-foreground/25"}`}
            >
              ★
            </span>
          ))}
        </span>
        <Info size={12} className="text-muted-foreground/60" aria-label="What do the stars mean?" />
      </summary>
      <div className="absolute right-0 z-10 mt-1.5 w-56 rounded-xl border border-[var(--green-fog)] bg-white/95 p-3 shadow-lg text-[11px] leading-snug space-y-1">
        <p className="font-semibold text-[#1a3a2a]">Reflection depth</p>
        <p className="text-muted-foreground">★ surface note</p>
        <p className="text-muted-foreground">★★ brief thought</p>
        <p className="text-muted-foreground">★★★ thoughtful</p>
        <p className="text-muted-foreground">★★★★ deep</p>
        <p className="text-muted-foreground">★★★★★ profound introspection</p>
      </div>
    </details>
  );
}
```

Copy can be refined after visual review. Legend labels above are placeholders intended to match an internal understanding of the 1–5 scale; adjust once the mapping is confirmed against `lib/mission/judge.ts`.

### Not changing

- The `JournalWidget` mini dots on `/today` — too small for an info affordance, and users will see the legend on the detail page.
- No DB or LLM prompt changes.

### Verification

- Submit a reflection on `/today`.
- Navigate to the reflection detail page from the Journal widget.
- Tap the info icon next to the stars → legend appears below.
- Tap again → legend collapses.

---

## Item 6: Back Button in AppHeader

### Current

`components/AppHeader.tsx` shows logo (links `/today`) + logout. A few detail pages (`app/reflections/[id]/page.tsx` line 74–80) hand-roll their own back link. Inconsistent.

### Fix

Add a left-side `ArrowLeft` in `AppHeader.tsx` linking to `/today`, visible on every authed route except `/today` itself. Delete the hand-rolled back links that become redundant.

```tsx
import { ArrowLeft, LogOut } from "lucide-react";

// Inside the render, update the logo row:
<div className="flex items-center justify-between py-2.5">
  <div className="flex items-center gap-2">
    {showNav && pathname !== "/today" && (
      <Link
        href="/today"
        aria-label="Back to home"
        className="flex items-center justify-center rounded-md p-1.5 text-[#1a3a2a]/60 transition-colors hover:text-[#1a3a2a]"
      >
        <ArrowLeft size={18} strokeWidth={1.8} />
      </Link>
    )}
    <Link href="/today" className="flex items-center gap-2">
      <Image src="/logo.png" alt="" width={24} height={24} priority className="select-none" />
      <span className="text-sm font-semibold tracking-tight text-[#1a3a2a]/85">
        Ghars
      </span>
    </Link>
  </div>
  {showNav && (
    <form action="/api/auth/logout" method="POST">
      {/* unchanged */}
    </form>
  )}
</div>
```

The existing `HIDE_NAV_ON = ["/", "/onboarding"]` check via `showNav` already hides the arrow (and logout) on landing/onboarding.

### Cleanup

Remove the manual back link in `app/reflections/[id]/page.tsx` (lines 74–80). Grep for any other hand-rolled back chevrons (`ChevronLeft` + Link to a parent route) and remove them — only delete ones that are redundant with the new header arrow. Keep any that navigate to non-home destinations.

### Verification

- Navigate `/today → /dhikr`. Header shows back arrow on the left; tap → lands on `/today`.
- On `/today`, no back arrow (logo still tappable).
- Reflection detail page: no duplicate back link above the card.
- Onboarding and landing pages unchanged (no back arrow, no logout).

---

## Item 7: Explore Card on Home + Schema Audit

### Part A — Explore card on home

`/today`'s dashboard has a 2×2 widget grid (`TasbihWidget`, `CirclesWidget`, `WordWidget`, `JournalWidget`) above a full-width `HeatmapStripWidget`. No Explore entry-point.

**Fix:** Add a new `components/dashboard/ExploreWidget.tsx` and render it as a full-width card between the 2×2 grid and the heatmap strip. Full-width (not a 5th grid cell) because it's a navigational entry-point, visually distinct from the progress widgets.

```tsx
// components/dashboard/ExploreWidget.tsx
import { Compass } from "lucide-react";
import DashboardCard from "./DashboardCard";

export default function ExploreWidget() {
  return (
    <DashboardCard href="/explore">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-[var(--green-fog)] p-2">
          <Compass size={20} className="text-primary" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ink-soft)]/60">
            Explore
          </p>
          <p className="text-sm font-semibold text-[#1a3a2a] leading-tight">
            Browse the Quran
          </p>
          <p className="mt-0.5 text-[11px] text-[var(--ink-soft)]/65">
            All 114 surahs
          </p>
        </div>
      </div>
    </DashboardCard>
  );
}
```

In `app/today/TodayClient.tsx`, insert `<ExploreWidget />` between the `<div className="grid grid-cols-2 gap-3">` block and the `<HeatmapStripWidget />`:

```tsx
<div className="space-y-3">
  <div className="grid grid-cols-2 gap-3">
    <TasbihWidget {...tasbihToday} />
    <CirclesWidget circles={circlePreview} />
    <WordWidget word={wordOfDay ?? null} />
    <JournalWidget entry={journalEntry} />
  </div>
  <ExploreWidget />
  <HeatmapStripWidget
    completedDates={completedDates}
    totalDone={completedDates.length}
  />
</div>
```

### Part B — Schema Audit

Audited six migration files, all API routes, and all server components that use the DB. Findings below, ordered by severity.

#### Fix in this bundle

- **Missing `circles.owner_id` index.** `app/api/circles/[id]/invite/route.ts` and the ownership check elsewhere filter on `owner_id`. Low rows today, but it's a standard FK index the schema should have. **Fix:** `create index on circles (owner_id);`
- **`activity_log` purpose undocumented.** `lib/mission/judge.ts:52` writes to it; nothing reads. Current intent is audit/future analytics. **Fix:** Add a table comment documenting that it is write-only for now. No pruning policy this pass.

#### Observations — skip this pass

- **No index on `daily_missions.verse_key`.** Recent-verse lookup already uses the composite `(user_id, local_date desc)` index. Not needed until analytics demands it.
- **No index on `circle_invites.expires_at`.** Join path filters by `expires_at > now() and not used`. Table is small; primary key on `code` covers lookup-by-code. Not needed.
- **RLS has enable-without-policies on most tables.** Server uses service_role which bypasses RLS; this is defence-in-depth for a future Supabase Auth migration. Add policies when/if that migration happens.
- **`dhikr_log.id`** is a UUID primary key on top of `unique (user_id, local_date)`. Redundant but harmless.
- **`daily_missions.audio_url` and `tafsir_snippet`** are nullable — matches QF API uncertainty.
- **`users.email`** is nullable. `deriveDisplayName` falls through to `null` if no claims produce a name; the resulting "Member" fallback is acceptable in the rare case.
- **`reflections.depth_score`** has check `>= 1 and <= 5` matching UI.

#### Migration file

New file `supabase/migrations/0007_schema_polish.sql`:

```sql
-- Post-hackathon schema polish.
-- Non-destructive: adds indexes only, no schema changes.

create index if not exists circles_owner_id_idx on circles (owner_id);

-- activity_log documentation: this is a write-only append log for future
-- analytics / debugging. No reads in the app today. No pruning policy yet.
comment on table activity_log is
  'Append-only event log. Write-only from the app today. Future pruning policy TBD.';
```

### Verification

- `/today` shows the Browse Quran card between the 2×2 grid and the heatmap strip. Tap → `/explore`.
- Run migration against the dev DB; confirm index exists: `select indexname from pg_indexes where tablename='circles';` should list `circles_owner_id_idx`.

---

## Files Touched

- `lib/mission/generate.ts` — tagged error logging
- `app/today/page.tsx` — catch mission-create failures
- `app/today/TodayClient.tsx` — fallback UI for null mission; render `ExploreWidget`
- `components/RadialNav.tsx` — fix sweep range to 100°–200°
- `app/api/dhikr/route.ts` — `revalidatePath("/today")`
- `app/callback/route.ts` — broader `display_name` derivation, no-overwrite semantics
- `lib/auth/qf-oauth.ts` — widen `decodeIdToken` claim type
- `app/reflections/[id]/page.tsx` — `DepthStarsWithLegend`, remove manual back link
- `components/AppHeader.tsx` — add back-arrow on non-home pages
- `components/dashboard/ExploreWidget.tsx` — **new**, dashboard quick-link card
- `supabase/migrations/0007_schema_polish.sql` — **new**, index + documentation migration

## Out of Scope

- No new tests — all changes are UX-level and best verified manually
- No observability wiring (Sentry, etc.)
- No RLS policy expansion (current server uses service_role)
- No activity_log pruning/retention policy
- No radial nav redesign beyond the geometry fix
- No schema changes beyond indexes
