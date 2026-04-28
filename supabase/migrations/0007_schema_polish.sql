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
