---
name: admin-supabase-for-all-routes
description: All route handlers must use createAdminSupabaseClient, not createServerSupabaseClient
type: convention
captured: 2026-05-02
source: /learn, live debugging session
---

All Next.js API route handlers and server-side session utilities must use `createAdminSupabaseClient()` (service role key) from `lib/supabase/server.ts`, not `createServerSupabaseClient()` (anon key).

**Why:** Supabase RLS policies use `using (true)` which grants access to the `authenticated` role. The anon key operates as the `anon` role, which is blocked from all tables. Server-side route handlers are already authenticated via our own session cookie — they should bypass RLS entirely using the service role key.

**How to apply:** In every file under `app/api/` and `lib/db/`, import `createAdminSupabaseClient` and call it synchronously (no `await`). The `createServerSupabaseClient` (anon key) is only appropriate for client-side Supabase usage where the user's JWT is passed directly.
