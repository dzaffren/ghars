-- Enable RLS on all user-owned tables.
-- The server always uses the service_role key which bypasses these policies,
-- so production behaviour is unchanged. This is defence-in-depth: the anon
-- key (exposed in NEXT_PUBLIC_SUPABASE_ANON_KEY) is now fully locked out even
-- if it is accidentally used in a client-side context.

alter table users             enable row level security;
alter table gardens           enable row level security;
alter table daily_missions    enable row level security;
alter table reflections       enable row level security;
alter table dhikr_log         enable row level security;
alter table circles           enable row level security;
alter table circle_members    enable row level security;
alter table circle_invites    enable row level security;

-- No permissive policies = anon key is blocked on every table.
-- Service role bypasses RLS by design (Supabase default).
-- When/if we add Supabase Auth in a future version, add policies here keyed on auth.uid().
