-- Ghars: Daily Quran Mission app schema

create extension if not exists "pgcrypto";

-- Users keyed by QF OIDC `sub`
create table users (
  id uuid primary key default gen_random_uuid(),
  qf_sub text unique not null,
  email text,
  display_name text,
  timezone text not null default 'UTC',
  reminder_hour int not null default 8 check (reminder_hour >= 0 and reminder_hour <= 23),
  focus_areas text[] not null default '{}',
  qf_access_token text,
  qf_refresh_token text,
  qf_token_expires_at timestamptz,
  push_subscription jsonb,
  qf_goal_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One mission per user per local-date
create table daily_missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  local_date date not null,
  verse_key text not null,
  verse_arabic text not null,
  verse_translation text not null,
  tafsir_snippet text,
  audio_url text,
  mission_text text not null,
  focus_area text,
  created_at timestamptz not null default now(),
  unique (user_id, local_date)
);

-- Reflections (one per mission on completion)
create table reflections (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null unique references daily_missions(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  text text not null,
  photo_path text,
  llm_verdict text not null check (llm_verdict in ('accepted', 'soft_nudge')),
  llm_feedback text,
  depth_score int check (depth_score >= 1 and depth_score <= 5),
  created_at timestamptz not null default now()
);

-- Garden state (one row per user, denormalised for fast reads)
create table gardens (
  user_id uuid primary key references users(id) on delete cascade,
  growth_points int not null default 0,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_completed_date date,
  wilting boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Activity log (fallback when QF Activity/Goals endpoint is unavailable)
create table activity_log (
  id bigserial primary key,
  user_id uuid not null references users(id) on delete cascade,
  event text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

-- Indexes
create index on daily_missions (user_id, local_date desc);
create index on reflections (user_id, created_at desc);
create index on activity_log (user_id, created_at desc);

-- Auto-update updated_at on users
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger users_updated_at before update on users
  for each row execute function update_updated_at();

create trigger gardens_updated_at before update on gardens
  for each row execute function update_updated_at();
