-- Story 2 Task 1: morning intention field on the mission card.
-- Creates the daily_intentions table with lock semantics and RLS policies.
-- Also adds the intention_suggestion cache column to daily_missions.

create table daily_intentions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  local_date date not null,
  text text,
  skipped boolean not null default false,
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, local_date),
  check (text is null or char_length(trim(text)) between 1 and 240),
  check (
    (text is not null and skipped = false and locked_at is not null)
    or (text is null and skipped = true and locked_at is null)
    or (text is null and skipped = false and locked_at is null)
  )
);

create index daily_intentions_user_date_idx on daily_intentions (user_id, local_date desc);

alter table daily_missions add column intention_suggestion text;

comment on column daily_intentions.text is 'The locked intention (null while unset or after skip). Set only on confirm.';
comment on column daily_intentions.skipped is 'True if the user explicitly chose not to set an intention today. A skipped row may still be upgraded to a locked one later the same day.';
comment on column daily_intentions.locked_at is 'Timestamp when the intention was locked (null until confirmed). Once set, the intention cannot be changed for the rest of that calendar day.';
comment on column daily_missions.intention_suggestion is 'Cached AI-generated suggestion for the day intention field. Generated on first load of /today; reused on all subsequent loads the same day.';

-- RLS
alter table daily_intentions enable row level security;

create policy "users read own intentions" on daily_intentions
  for select using (auth.uid() = user_id);

create policy "users write own intentions" on daily_intentions
  for insert with check (auth.uid() = user_id);

create policy "users update own unlocked intentions" on daily_intentions
  for update using (auth.uid() = user_id and text is null);
