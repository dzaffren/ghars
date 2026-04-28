# Post-Hackathon Bug Fixes & Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship seven bug fixes and polishes: silent next-day mission failure, radial nav geometry, stale dhikr card on home, narrow display_name extraction, star-rating legend, consistent back button, and explore card + schema index.

**Architecture:** Ten targeted edits across server components, API routes, React client components, an OAuth callback, and one Supabase migration. No new abstractions; each change is local to one or two files. Manual verification (dev server + devtools mobile viewport) after each task — no new automated tests since all changes are UX/UI or diagnostic logging that existing types catch.

**Tech Stack:** Next.js 16 (see `AGENTS.md` — this is a fork, not the Next.js in your training), React 19, TypeScript, Supabase (Postgres + RLS), iron-session for auth, Tailwind + framer-motion + lucide-react for UI.

**Spec:** `docs/superpowers/specs/2026-04-28-post-hackathon-bug-fixes-design.md`

---

## File Structure

| File | Change | Responsibility |
|---|---|---|
| `lib/mission/generate.ts` | **modify** | Add tagged logging around LLM / QF / DB calls so failures are diagnosable |
| `app/today/page.tsx` | **modify** | Try/catch mission creation; pass `mission: null` on failure |
| `app/today/TodayClient.tsx` | **modify** | Widen `Mission` prop to nullable; render fallback card when null; render `<ExploreWidget />` |
| `components/RadialNav.tsx` | **modify** (lines 29–30) | Fix sweep range from 170°–290° to 100°–200° |
| `app/api/dhikr/route.ts` | **modify** | `revalidatePath("/today")` after successful RPC |
| `lib/auth/qf-oauth.ts` | **modify** | Widen `QFIdTokenClaims` with `preferred_username?` |
| `app/callback/route.ts` | **modify** | Broader `display_name` derivation; don't overwrite existing name with null |
| `app/reflections/[id]/page.tsx` | **modify** | Replace `DepthStars` with `DepthStarsWithLegend` |
| `components/AppHeader.tsx` | **modify** | Add left-side back arrow on non-home pages |
| `components/dashboard/ExploreWidget.tsx` | **create** | Dashboard full-width "Browse the Quran" quick-link |
| `supabase/migrations/0007_schema_polish.sql` | **create** | Add `circles.owner_id` index + document `activity_log` intent |

No test files added. Each task's verification uses `pnpm dev` + browser; for the migration, a `psql` check against the Supabase dev DB.

**Task ordering rationale:** Independent tasks go first (radial nav, dhikr revalidate, explore widget, migration, display name) so early commits are low-risk and ship even if later tasks stall. Mission-failure diagnostic is last because it's the deepest change.

---

## Task 1: Pre-flight sanity check

**Files:** none

- [ ] **Step 1: Confirm dev environment is ready**

Run:
```bash
node --version && pnpm --version
```

Expected: Node 20+ and pnpm (any recent version).

- [ ] **Step 2: Install dependencies if needed**

Run:
```bash
pnpm install
```

Expected: no errors; if `node_modules` already satisfied, pnpm says "Already up to date."

- [ ] **Step 3: Verify the spec is where we expect it**

Run:
```bash
ls docs/superpowers/specs/2026-04-28-post-hackathon-bug-fixes-design.md
```

Expected: prints the path.

- [ ] **Step 4: Read Next.js-specific notes**

The project uses a forked Next.js. Read `AGENTS.md` and, if needed, `node_modules/next/dist/docs/` before any Next-API-heavy task (we use `revalidatePath` in Task 3 — its signature in this fork may differ).

No commit in this task.

---

## Task 2: Fix radial-nav geometry

**Files:**
- Modify: `components/RadialNav.tsx:29-30`

- [ ] **Step 1: Read the current file to confirm starting state**

Run:
```bash
head -35 components/RadialNav.tsx
```

Expected: shows the constants block with `START_DEG = 170`, `END_DEG = 290`.

- [ ] **Step 2: Edit the sweep constants**

In `components/RadialNav.tsx`, replace the two constants *and the preceding comment* so both the comment and values reflect the new range.

Find (lines 25–31):

```ts
// Anchored bottom-right — orbit opens up-left into the safe thumb zone.
// 180° = straight left, 270° = straight up. Start at 170° so the first
// item tucks slightly below horizontal to avoid any chrome pinned to the
// bottom edge. 120° sweep (vs. the previous 90°) gives items breathing room.
const START_DEG = 170;
const END_DEG = 290;
const RADIUS = 132;
```

Replace with:

```ts
// Anchored bottom-right — orbit opens into the upper-left quadrant.
// The math-angle convention (x = cos, y = -sin) used below means:
//   90°  = straight up      (y = -R)
//   180° = straight left    (x = -R, y = 0)
//   200° = left + slightly below horizontal
//   100° = up + slightly right-of-vertical
// Sweeping 100° → 200° keeps all items above/left of the anchor so they
// remain inside the viewport even on short mobile screens.
const START_DEG = 100;
const END_DEG = 200;
const RADIUS = 132;
```

- [ ] **Step 3: Start the dev server in the background**

Run:
```bash
pnpm dev
```

Wait until it prints `Ready` (or similar). Leave it running for the rest of the tasks.

- [ ] **Step 4: Verify in a mobile viewport**

Open `http://localhost:3000/today` in Chrome. Devtools → toggle device toolbar → iPhone 14.
Tap the bottom-right Ghars logo anchor. All six items (Home, Explore, Tasbih, Circles, History, Journal) should be visible above/left of the anchor. None should be clipped by the bottom of the viewport.

Tap the backdrop → orbit closes. Tap an item → navigates, orbit closes.

- [ ] **Step 5: Commit**

```bash
git add components/RadialNav.tsx
git commit -m "fix: correct radial nav sweep so all six items stay on-screen"
```

---

## Task 3: Revalidate /today after dhikr increment

**Files:**
- Modify: `app/api/dhikr/route.ts`

- [ ] **Step 1: Read the current route to find the insertion point**

Run:
```bash
cat app/api/dhikr/route.ts
```

Locate the `POST` handler. The last statements before `return NextResponse.json({...})` are the growth-points update block and a `logEvent` call. We insert `revalidatePath` after `logEvent`.

- [ ] **Step 2: Add the import**

At the top of `app/api/dhikr/route.ts`, add:

```ts
import { revalidatePath } from "next/cache";
```

Place it after the other `next/*` imports so the import group stays grouped.

- [ ] **Step 3: Call revalidatePath before returning**

After the `logEvent("dhikr_increment", ...)` call and before the final `return NextResponse.json({...})`, add:

```ts
revalidatePath("/today");
```

So the tail of the POST handler reads:

```ts
  logEvent("dhikr_increment", {
    userId: session.userId,
    type,
    count: row[type],
    justCompleted: row.just_completed,
  });

  revalidatePath("/today");

  return NextResponse.json({
    subhan: row.subhan,
    alhamd: row.alhamd,
    akbar: row.akbar,
    completed: row.completed,
    justCompleted: row.just_completed,
    targets: TARGETS,
  });
```

- [ ] **Step 4: Verify in the browser**

With dev server still running: open `/today`, note the TasbihWidget count (e.g. 0/100). Navigate to `/dhikr` via radial nav, tap Subhan 5 times. Navigate back to `/today`.

Expected: TasbihWidget shows the updated count (5/100). Before this fix it would still show 0/100 until a hard reload.

- [ ] **Step 5: Commit**

```bash
git add app/api/dhikr/route.ts
git commit -m "fix: invalidate /today cache after dhikr increment"
```

---

## Task 4: Create ExploreWidget

**Files:**
- Create: `components/dashboard/ExploreWidget.tsx`

- [ ] **Step 1: Inspect the existing widget pattern**

Run:
```bash
cat components/dashboard/DashboardCard.tsx
```

This confirms the `href`-prop wrapper pattern other widgets use (`JournalWidget`, `TasbihWidget`, etc. all pass `href` and children). `ExploreWidget` follows the same shape.

- [ ] **Step 2: Create the widget**

Write `components/dashboard/ExploreWidget.tsx`:

```tsx
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

- [ ] **Step 3: Render it from TodayClient**

In `app/today/TodayClient.tsx`:

a. Add the import with the other dashboard-widget imports near the top of the file (next to `HeatmapStripWidget`):

```tsx
import ExploreWidget from "@/components/dashboard/ExploreWidget";
```

b. Insert `<ExploreWidget />` between the 2×2 grid and the `<HeatmapStripWidget />`. Find the existing block near the end of the right column:

```tsx
<div className="space-y-3">
  <div className="grid grid-cols-2 gap-3">
    <TasbihWidget {...tasbihToday} />
    <CirclesWidget circles={circlePreview} />
    <WordWidget word={wordOfDay ?? null} />
    <JournalWidget entry={journalEntry} />
  </div>
  <HeatmapStripWidget
    completedDates={completedDates}
    totalDone={completedDates.length}
  />
</div>
```

Change to:

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

- [ ] **Step 4: Verify in the browser**

Reload `/today`. Between the 2×2 widget grid and the heatmap strip, a "Browse the Quran" card should appear with a compass icon and "All 114 surahs" caption. Tap → lands on `/explore`.

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/ExploreWidget.tsx app/today/TodayClient.tsx
git commit -m "feat: surface Explore as a dashboard quick link on /today"
```

---

## Task 5: Add schema index migration

**Files:**
- Create: `supabase/migrations/0007_schema_polish.sql`

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/0007_schema_polish.sql`:

```sql
-- Post-hackathon schema polish.
-- Non-destructive: adds indexes / comments only, no schema changes.

-- circles.owner_id is filtered in the circle-detail and invite-route
-- ownership checks. Standard FK index; small rows today, future-proofs.
create index if not exists circles_owner_id_idx on circles (owner_id);

-- activity_log is written from lib/mission/judge.ts but never read by the
-- app today. Document the intent so a future reader doesn't mistake the
-- table for dead code and drop it. No pruning policy yet.
comment on table activity_log is
  'Append-only event log. Write-only from the app today. Future pruning policy TBD.';
```

- [ ] **Step 2: Apply the migration**

If you have the Supabase CLI linked to the dev project:

```bash
supabase db push
```

If not, run the SQL directly against the dev DB (the Supabase dashboard SQL editor, or `psql` with the project connection string). Do **not** run against production.

- [ ] **Step 3: Verify the index exists**

Run the following SQL in the dashboard or psql:

```sql
select indexname from pg_indexes where tablename = 'circles';
```

Expected: the list includes `circles_owner_id_idx` (alongside the primary-key index).

And for the comment:

```sql
select obj_description('activity_log'::regclass);
```

Expected: returns the append-only log description string.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0007_schema_polish.sql
git commit -m "fix(db): add circles.owner_id index and document activity_log intent"
```

---

## Task 6: Broaden display_name extraction

**Files:**
- Modify: `lib/auth/qf-oauth.ts`
- Modify: `app/callback/route.ts`

- [ ] **Step 1: Widen the ID-token claims interface**

In `lib/auth/qf-oauth.ts`, locate the `QFIdTokenClaims` interface (around line 150). Add `preferred_username` to it:

```ts
export interface QFIdTokenClaims {
  sub: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  preferred_username?: string;
  picture?: string;
  nonce?: string;
  iss: string;
  aud: string | string[];
  exp: number;
  iat: number;
}
```

`decodeIdToken` already parses the full JSON, so no parser change is needed — the extra field just flows through.

- [ ] **Step 2: Add the derivation helper in the callback**

In `app/callback/route.ts`, add this helper above the `GET` export (after the existing imports):

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

- [ ] **Step 3: Split the upsert so null doesn't overwrite an existing name**

Still in `app/callback/route.ts`, find the existing upsert block (starts at "const { data: user, error } = await db.from("users").upsert(..."). Replace it with:

```ts
const { data: user, error } = await db
  .from("users")
  .upsert(
    {
      qf_sub: claims.sub,
      email: claims.email ?? null,
      qf_access_token: tokens.access_token,
      qf_refresh_token: tokens.refresh_token,
      qf_token_expires_at: expiresAt,
    },
    { onConflict: "qf_sub" }
  )
  .select("id, focus_areas, qf_goal_id, display_name")
  .single();

if (error || !user) {
  console.error("DB upsert error:", error);
  return NextResponse.redirect(new URL("/?error=db_error", req.url));
}

const derivedName = deriveDisplayName(claims);
if (derivedName && !user.display_name) {
  await db
    .from("users")
    .update({ display_name: derivedName })
    .eq("id", user.id);
}
```

Note the changes from the current code:
- `display_name` removed from the upsert payload (no more overwrite-with-null risk)
- `display_name` added to the `.select(...)` so we can gate the update
- New `deriveDisplayName` call + conditional update after the error check

The rest of the callback (session save, redirect logic) stays untouched.

- [ ] **Step 4: Verify end-to-end**

Manual flow (requires a real QF account to test fully):

```bash
# In the DB, manually null out display_name for your test user:
# update users set display_name = null where id = '<your-uuid>';
```

Log out of the app, log back in via QF. Check the users row:

```sql
select display_name from users where id = '<your-uuid>';
```

Expected: populated (from `name`, `preferred_username`, or email local-part).

Open `/circles/<id>` — your member card should show the real name, not "Member."

- [ ] **Step 5: Commit**

```bash
git add lib/auth/qf-oauth.ts app/callback/route.ts
git commit -m "fix(auth): broaden display_name extraction and avoid null overwrites"
```

---

## Task 7: Back button in AppHeader

**Files:**
- Modify: `components/AppHeader.tsx`

- [ ] **Step 1: Add the ArrowLeft import**

In `components/AppHeader.tsx`, update the lucide-react import on line 8:

Change:

```tsx
import { LogOut } from "lucide-react";
```

To:

```tsx
import { ArrowLeft, LogOut } from "lucide-react";
```

- [ ] **Step 2: Add the back arrow to the logo row**

In `components/AppHeader.tsx`, locate the logo row (lines 49–77 region — the `<div className="relative mx-auto max-w-md px-4">` block). Replace the inner `<div className="flex items-center justify-between py-2.5">` block with:

```tsx
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
      <Image
        src="/logo.png"
        alt=""
        width={24}
        height={24}
        priority
        className="select-none"
      />
      <span className="text-sm font-semibold tracking-tight text-[#1a3a2a]/85">
        Ghars
      </span>
    </Link>
  </div>
  {showNav && (
    <form action="/api/auth/logout" method="POST">
      <button
        type="submit"
        aria-label="Log out"
        className="flex items-center justify-center rounded-md p-1.5 text-[#1a3a2a]/60 transition-colors hover:text-[#1a3a2a]"
      >
        <LogOut size={16} strokeWidth={1.7} />
      </button>
    </form>
  )}
</div>
```

The `showNav` flag already hides both the arrow and the logout button on `/` and `/onboarding` via the existing `HIDE_NAV_ON` const at line 10.

- [ ] **Step 3: Decide whether to remove hand-rolled back links**

Run:
```bash
grep -rn "ChevronLeft" app/
```

Expected matches:
- `app/reflections/[id]/page.tsx:6` — links to `/reflections` (parent list, **not** home). **Keep it.**
- `app/surah/[chapterId]/SurahClient.tsx:6,150,180` — `router.back()`. **Keep it** (browser-history back is distinct from home).

Neither is redundant with the header back-to-home arrow. No edits here.

- [ ] **Step 4: Verify in the browser**

Navigate `/today → /dhikr`. Header shows back arrow on the left → tap → lands on `/today`.
On `/today` itself, no back arrow (logo still tappable).
On `/` and `/onboarding`, no back arrow, no logout (unchanged).
On `/reflections/<id>`, the header has a back arrow *and* a "Journal" chevron back-link above the verse card. Both are intentional — header goes home, in-page chevron goes to journal list.

- [ ] **Step 5: Commit**

```bash
git add components/AppHeader.tsx
git commit -m "feat: add back-to-home arrow in header on non-home pages"
```

---

## Task 8: Star-rating legend on reflection detail

**Files:**
- Modify: `app/reflections/[id]/page.tsx`

- [ ] **Step 1: Add the Info icon import**

In `app/reflections/[id]/page.tsx`, update the lucide-react import on line 6:

Change:

```tsx
import { ChevronLeft } from "lucide-react";
```

To:

```tsx
import { ChevronLeft, Info } from "lucide-react";
```

- [ ] **Step 2: Replace DepthStars with DepthStarsWithLegend**

In the same file, replace the existing `DepthStars` function (lines 21–35):

```tsx
function DepthStars({ score }: { score: number | null }) {
  if (!score) return null;
  return (
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
  );
}
```

With:

```tsx
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
        <Info
          size={12}
          className="text-muted-foreground/60"
          aria-label="What do the stars mean?"
        />
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

- [ ] **Step 3: Update the call site**

In the same file, find `<DepthStars score={ref.depth_score ?? null} />` (around line 134). Replace with:

```tsx
<DepthStarsWithLegend score={ref.depth_score ?? null} />
```

- [ ] **Step 4: Verify in the browser**

Submit a reflection on `/today` (or load a page whose reflection has a score). Navigate to the reflection detail via the Journal widget. Next to the stars, an info icon appears. Tap it — legend popover appears below. Tap again — it collapses.

If another element on the page sits close to the stars and the popover overlaps awkwardly on mobile, accept it for now; adjust `absolute right-0` position only if visibly bad.

- [ ] **Step 5: Commit**

```bash
git add app/reflections/[id]/page.tsx
git commit -m "feat: add depth-star legend popover on reflection detail"
```

---

## Task 9: Tagged logging in mission generator

**Files:**
- Modify: `lib/mission/generate.ts`

- [ ] **Step 1: Rewrite the function body with per-step try/catch**

Open `lib/mission/generate.ts`. Replace the current body of `getOrCreateTodaysMission` (from the `// LLM picks verse + mission` comment through the return statement) with:

```ts
  // LLM picks verse + mission
  let picked;
  try {
    const llm = await getLLMProvider();
    picked = await llm.pickMission({
      focusAreas: user.focus_areas ?? [],
      recentVerseKeys: recentKeys,
      actionablePool,
    });
  } catch (err) {
    console.error("[mission/generate] LLM pickMission failed", { userId, err });
    throw new Error("mission_llm_failed");
  }

  // Fetch full verse data (Arabic + translation + tafsir + audio)
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

  // Store mission
  const { data: mission, error: insertErr } = await db
    .from("daily_missions")
    .insert({
      user_id: userId,
      local_date: localDate,
      verse_key: picked.verseKey,
      verse_arabic: verseData.arabic,
      verse_translation: verseData.translation,
      tafsir_snippet: verseData.tafsirSnippet,
      audio_url: verseData.audioUrl,
      mission_text: picked.missionText,
      focus_area: picked.focusArea,
    })
    .select()
    .single();

  if (insertErr) {
    console.error("[mission/generate] insert failed", { userId, insertErr });
    throw new Error("mission_insert_failed");
  }
  return mission;
```

Note: the `const llm = await getLLMProvider();` line moved inside the try block, and the insert-error path now logs with a tagged error string.

- [ ] **Step 2: Sanity check — type-check the file**

Run:
```bash
pnpm tsc --noEmit
```

Expected: no new errors. If there are existing errors from other files, they should be unchanged.

- [ ] **Step 3: Commit**

```bash
git add lib/mission/generate.ts
git commit -m "fix: tag mission-generator failures so logs pinpoint the failing step"
```

---

## Task 10: Graceful fallback when mission creation fails

**Files:**
- Modify: `app/today/page.tsx`
- Modify: `app/today/TodayClient.tsx`

- [ ] **Step 1: Wrap the mission call in page.tsx**

In `app/today/page.tsx`, around line 34 (`const mission = await getOrCreateTodaysMission(uid);`), replace with:

```ts
  await checkWilting(uid);
  let mission: Awaited<ReturnType<typeof getOrCreateTodaysMission>> | null = null;
  try {
    mission = await getOrCreateTodaysMission(uid);
  } catch (err) {
    console.error("[today/page] getOrCreateTodaysMission failed", { uid, err });
  }
```

- [ ] **Step 2: Guard the downstream queries that depend on `mission`**

Still in `app/today/page.tsx`, the `Promise.all` below references `mission.id` (in the reflection query) and `mission.verse_key` (in `fetchVerseWords`). Only run those when `mission` exists.

Restructure the block so the reflection lookup and `fetchVerseWords` are conditional:

Find (existing `Promise.all` block near line 50 onward). Replace the body of the page from just after the try/catch above, down through the `Promise.all` destructure, with this version:

```ts
  const localDate = getLocalDate(user.timezone ?? "UTC");
  const today14Start = new Date();
  today14Start.setDate(today14Start.getDate() - 13);
  const from14 = today14Start.toISOString().slice(0, 10);

  const [
    { data: garden },
    reflectionResult,
    verseWords,
    { data: dhikrRow },
    { data: circleMemberships },
    { data: latestReflection },
    { data: heatmapMissions },
  ] = await Promise.all([
    db
      .from("gardens")
      .select("growth_points, current_streak, longest_streak, wilting")
      .eq("user_id", uid)
      .single(),
    mission
      ? db
          .from("reflections")
          .select("llm_verdict")
          .eq("mission_id", mission.id)
          .single()
      : Promise.resolve({ data: null }),
    mission ? fetchVerseWords(mission.verse_key) : Promise.resolve([] as VerseWord[]),
    db
      .from("dhikr_log")
      .select("subhan, alhamd, akbar, completed")
      .eq("user_id", uid)
      .eq("local_date", localDate)
      .single(),
    db
      .from("circle_members")
      .select("circle_id, circles(id, name)")
      .eq("user_id", uid)
      .limit(1),
    db
      .from("reflections")
      .select(
        "id, missions:mission_id(id, local_date, mission_text), depth_score"
      )
      .eq("user_id", uid)
      .eq("llm_verdict", "accepted")
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    db
      .from("daily_missions")
      .select("local_date, reflections(llm_verdict)")
      .eq("user_id", uid)
      .gte("local_date", from14),
  ]);

  const reflection = reflectionResult.data;
```

The rest of the file (circle preview build, journal entry build, heatmap dates, final return) stays unchanged *except* the props passed to `TodayClient` — `mission` is now `Mission | null`. The existing `mission={mission}` call site becomes:

```tsx
return (
  <TodayClient
    mission={mission}
    garden={garden ?? { growth_points: 0, current_streak: 0, longest_streak: 0, wilting: false }}
    alreadyCompleted={alreadyCompleted}
    displayName={user.display_name ?? ""}
    wordOfDay={wordOfDay}
    weeklyTheme={weeklyTheme}
    tasbihToday={dhikrRow ?? { subhan: 0, alhamd: 0, akbar: 0, completed: false }}
    circlePreview={circlePreview}
    journalEntry={journalEntry}
    completedDates14={completedDates}
    localDate={localDate}
  />
);
```

No attribute change; the type widens via `TodayClient`'s updated prop (Step 3).

- [ ] **Step 3: Widen `Mission` prop in TodayClient**

In `app/today/TodayClient.tsx`, locate the `Props` interface. Change:

```tsx
interface Props {
  mission: Mission;
  ...
}
```

To:

```tsx
interface Props {
  mission: Mission | null;
  ...
}
```

Then at the top of the component body (just inside the export default function), add an early-return branch rendering a fallback card when `mission` is null. Find the existing `return (<div className="relative min-h-screen">` and insert the null-check before it. Place this block right before the main `return`:

```tsx
  if (!mission) {
    return (
      <div className="relative min-h-screen">
        <AppHeader variant="today" />
        <main className="mx-auto w-full max-w-md px-4 pb-8 pt-6">
          <div className="rounded-2xl border border-[var(--green-fog)] bg-white/80 p-6 text-center space-y-3">
            <p className="text-sm font-semibold text-[#1a3a2a]">
              We couldn&apos;t prepare today&apos;s mission.
            </p>
            <p className="text-xs text-muted-foreground">
              This usually means a service we depend on is having a moment.
              Try again.
            </p>
            <button
              onClick={() => router.refresh()}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-white px-4 py-2 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              Try again
            </button>
          </div>
        </main>
      </div>
    );
  }
```

The fallback uses `router` — import it from `next/navigation` and call it at the top of the component:

a. Add the import (next to the existing framer-motion and other imports):

```tsx
import { useRouter } from "next/navigation";
```

b. At the top of the `TodayClient` function body, before any `useState` calls, add:

```tsx
const router = useRouter();
```

- [ ] **Step 4: Verify the happy path still renders**

With dev server running, reload `/today`. Mission card should render normally. Tasbih, Circles, Word, Journal, Explore, Heatmap all present.

- [ ] **Step 5: Force the error path**

Temporarily break the mission generator by editing `.env.local` and changing `QF_BASE_URL` to `http://invalid.example.test`. Reload `/today`.

Expected:
- Server console logs `[mission/generate] QF fetchVerse failed` (from Task 9's logging)
- Page shows the fallback card with "Try again" button
- Button reloads the page

Restore `QF_BASE_URL` in `.env.local`. Reload — mission renders normally.

- [ ] **Step 6: Type-check**

Run:
```bash
pnpm tsc --noEmit
```

Expected: no new errors related to `mission` nullability. If `TodayClient` has any direct `mission.xxx` accesses *after* the early return, TypeScript narrows the type to non-null there so no guards are needed.

- [ ] **Step 7: Commit**

```bash
git add app/today/page.tsx app/today/TodayClient.tsx
git commit -m "feat: graceful fallback on /today when mission creation fails"
```

---

## Task 11: Final verification pass

**Files:** none

- [ ] **Step 1: Full lint / type-check**

Run:
```bash
pnpm tsc --noEmit
```

Expected: no errors attributable to this feature.

- [ ] **Step 2: Run unit tests**

Run:
```bash
pnpm test
```

Expected: existing tests still pass. No new tests added in this bundle.

- [ ] **Step 3: Manual regression sweep in the browser**

With `pnpm dev` running:

1. `/today` renders with all widgets including ExploreWidget
2. Radial nav: all six items visible above the anchor in mobile viewport
3. `/dhikr` → back to `/today` → TasbihWidget updates immediately
4. Login flow populates `display_name` (manual DB check)
5. Reflection detail: star info icon expands legend
6. Back arrow in `AppHeader` visible on `/dhikr`, `/circles`, `/explore`; hidden on `/today`, `/`, `/onboarding`
7. No regressions in `/circles/<id>`, `/surah/<id>`, `/history`

- [ ] **Step 4: Summary commit (optional)**

If you made any small adjustments during the regression sweep, commit them:

```bash
git status
# if clean, skip
git add <files>
git commit -m "chore: final polish from regression sweep"
```

No commit if nothing changed.

---

## Out of scope (from the spec)

- No new automated tests (changes are UX / logging)
- No observability wiring
- No RLS policy expansion
- No activity_log retention / pruning
- No radial nav redesign beyond the geometry fix
- No schema changes beyond the owner_id index + comment
