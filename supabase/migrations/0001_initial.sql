create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  qf_user_id text unique not null,
  email text unique,
  display_name text,
  is_demo boolean not null default false,
  translation_id text not null default '131',
  morning_time text not null default '08:00',
  evening_time text not null default '21:00',
  paused boolean not null default false,
  tz text not null default 'UTC',
  last_opened_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists qf_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  access_token text not null,
  refresh_token text,
  access_expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists corpus_entries (
  id serial primary key,
  verse_key text unique not null,
  theme text not null,
  tafsir_extract text not null check(char_length(tafsir_extract) <= 200),
  action_prompt_1 text not null,
  action_prompt_2 text not null,
  human_reviewed_at timestamptz not null
);

create table if not exists daily_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  local_date date not null,
  corpus_entry_id int not null references corpus_entries(id),
  verse_key text not null,
  unique(user_id, local_date)
);

create table if not exists missions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid unique not null references daily_assignments(id) on delete cascade,
  selected_prompt text not null check(char_length(selected_prompt) between 1 and 280),
  is_custom boolean not null default false,
  committed_at timestamptz not null default now()
);

create table if not exists reflections (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid unique not null references missions(id) on delete cascade,
  did_apply text not null check(did_apply in ('yes_fully', 'partly', 'not_today')),
  text text not null check(char_length(text) >= 40),
  qf_note_id text,
  submitted_at timestamptz not null default now(),
  window_closes_at timestamptz not null
);

create table if not exists bookmarks_mirror (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  verse_key text not null,
  qf_bookmark_id text,
  reflection_id uuid references reflections(id),
  created_at timestamptz not null default now(),
  unique(user_id, verse_key)
);

create table if not exists weekly_reviews (
  id serial primary key,
  user_id uuid not null references users(id) on delete cascade,
  week_number int not null,
  first_reflection_id uuid not null references reflections(id),
  seventh_reflection_id uuid not null references reflections(id),
  completed_at timestamptz not null default now(),
  unique(user_id, week_number)
);

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  unique(user_id, endpoint)
);

create table if not exists qf_api_errors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  endpoint text not null,
  payload jsonb,
  error_message text,
  retry_count int not null default 0,
  next_retry_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_daily_assignments_user_date on daily_assignments(user_id, local_date desc);
create index if not exists idx_missions_assignment on missions(assignment_id);
create index if not exists idx_reflections_mission on reflections(mission_id);
create index if not exists idx_reflections_submitted on reflections(submitted_at desc);
create index if not exists idx_bookmarks_user on bookmarks_mirror(user_id);
create index if not exists idx_push_subs_user on push_subscriptions(user_id);
create index if not exists idx_reflections_text_gin on reflections using gin(to_tsvector('english', text));

alter table users enable row level security;
alter table qf_sessions enable row level security;
alter table daily_assignments enable row level security;
alter table missions enable row level security;
alter table reflections enable row level security;
alter table bookmarks_mirror enable row level security;
alter table weekly_reviews enable row level security;
alter table push_subscriptions enable row level security;
alter table qf_api_errors enable row level security;
alter table corpus_entries enable row level security;

create policy "corpus_read_reviewed" on corpus_entries for select using (human_reviewed_at is not null);
create policy "users_self_all" on users for all using (true) with check (true);
create policy "sessions_self_all" on qf_sessions for all using (true) with check (true);
create policy "assignments_self_all" on daily_assignments for all using (true) with check (true);
create policy "missions_self_all" on missions for all using (true) with check (true);
create policy "reflections_self_all" on reflections for all using (true) with check (true);
create policy "bookmarks_self_all" on bookmarks_mirror for all using (true) with check (true);
create policy "reviews_self_all" on weekly_reviews for all using (true) with check (true);
create policy "push_self_all" on push_subscriptions for all using (true) with check (true);
create policy "errors_self_all" on qf_api_errors for all using (true) with check (true);
