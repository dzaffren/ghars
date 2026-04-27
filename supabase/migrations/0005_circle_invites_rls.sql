-- Defence-in-depth INSERT policy for circle_invites.
--
-- Today the server always uses the service_role key (which bypasses RLS),
-- so generation works regardless of policies. But 0004_rls.sql enabled RLS
-- on this table with no permissive policies, meaning if the server were
-- ever refactored to use the anon key (or a future Supabase-Auth session),
-- even the circle owner would be silently blocked from creating an invite
-- and /api/circles/[id]/invite would fall into its retry loop then error.
--
-- This policy allows the circle owner to insert a new invite for a circle
-- they own. SELECT / UPDATE on circle_invites remain service-role-only,
-- which is correct — invite codes should never be listable by anon.
--
-- These policies key off `auth.uid()`. They are inert under the current
-- custom iron-session auth (auth.uid() is NULL), but become active the
-- moment the app adopts Supabase Auth.

create policy "circle owners can insert invites"
  on circle_invites
  for insert
  to authenticated
  with check (
    exists (
      select 1 from circles c
      where c.id = circle_invites.circle_id
        and c.owner_id = auth.uid()
    )
  );
