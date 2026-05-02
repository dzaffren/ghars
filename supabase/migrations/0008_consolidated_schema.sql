-- Consolidated schema — replaces migrations 0001–0007.
-- Run this on a fresh database after dropping all existing tables.

create extension if not exists pgcrypto;

-- ─── Core tables ────────────────────────────────────────────────────────────

create table users (
  id                                    uuid        primary key default gen_random_uuid(),
  qf_user_id                            text        unique not null,
  email                                 text        unique,
  display_name                          text,
  is_demo                               boolean     not null default false,
  translation_id                        text        not null default '131',
  morning_time                          text        not null default '08:00',
  evening_time                          text        not null default '21:00',
  paused                                boolean     not null default false,
  tz                                    text        not null default 'UTC',
  seed                                  int         not null default 0,
  answered_reflection_disclosure_seen   boolean     not null default false,
  last_opened_at                        timestamptz,
  created_at                            timestamptz not null default now()
);

create table qf_sessions (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references users(id) on delete cascade,
  access_token      text        not null,
  refresh_token     text,
  access_expires_at timestamptz not null,
  created_at        timestamptz not null default now()
);

create table corpus_entries (
  id                  serial      primary key,
  verse_key           text        unique not null,
  theme               text        not null,
  tafsir_extract      text        not null check(char_length(tafsir_extract) <= 200),
  action_prompt_1     text        not null,
  action_prompt_2     text        not null,
  human_reviewed_at   timestamptz not null
);

create table daily_assignments (
  id                uuid  primary key default gen_random_uuid(),
  user_id           uuid  not null references users(id) on delete cascade,
  local_date        date  not null,
  corpus_entry_id   int   not null references corpus_entries(id),
  verse_key         text  not null,
  unique(user_id, local_date)
);

create table missions (
  id              uuid    primary key default gen_random_uuid(),
  assignment_id   uuid    unique not null references daily_assignments(id) on delete cascade,
  selected_prompt text    not null check(char_length(selected_prompt) between 1 and 280),
  is_custom       boolean not null default false,
  committed_at    timestamptz not null default now()
);

create table reflections (
  id               uuid        primary key default gen_random_uuid(),
  mission_id       uuid        unique not null references missions(id) on delete cascade,
  did_apply        text        not null check(did_apply in ('yes_fully', 'partly', 'not_today')),
  text             text        not null check(char_length(text) between 40 and 2000),
  qf_note_id       text,
  submitted_at     timestamptz not null default now(),
  window_closes_at timestamptz not null
);

create table bookmarks_mirror (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references users(id) on delete cascade,
  verse_key      text not null,
  qf_bookmark_id text,
  reflection_id  uuid references reflections(id),
  created_at     timestamptz not null default now(),
  unique(user_id, verse_key)
);

create table weekly_reviews (
  id                    serial      primary key,
  user_id               uuid        not null references users(id) on delete cascade,
  week_number           int         not null,
  first_reflection_id   uuid        not null references reflections(id),
  seventh_reflection_id uuid        not null references reflections(id),
  completed_at          timestamptz not null default now(),
  unique(user_id, week_number)
);

create table push_subscriptions (
  id         uuid    primary key default gen_random_uuid(),
  user_id    uuid    not null references users(id) on delete cascade,
  endpoint   text    not null,
  p256dh     text    not null,
  auth       text    not null,
  user_agent text,
  created_at timestamptz not null default now(),
  unique(user_id, endpoint)
);

create table push_dispatch_log (
  id        uuid    primary key default gen_random_uuid(),
  user_id   uuid    not null references users(id) on delete cascade,
  kind      text    not null check(kind in ('morning', 'evening')),
  sent_at   timestamptz not null default now(),
  sent_date date    not null default current_date
);

create table qf_api_errors (
  id            uuid    primary key default gen_random_uuid(),
  user_id       uuid    references users(id) on delete set null,
  endpoint      text    not null,
  payload       jsonb,
  related_id    uuid    references reflections(id),
  status_code   int,
  error_message text,
  error_body    text,
  retry_count   int     not null default 0,
  attempts      int     not null default 0,
  next_retry_at timestamptz not null default now(),
  resolved_at   timestamptz,
  created_at    timestamptz not null default now()
);

create table reflection_answers (
  id            uuid        primary key default gen_random_uuid(),
  reflection_id uuid        not null references reflections(id) on delete cascade,
  user_id       uuid        not null references users(id) on delete cascade,
  ayah_insight  text        not null check(char_length(ayah_insight) between 80 and 360),
  noticing      text        not null check(char_length(noticing) between 30 and 180),
  model         text        not null,
  generated_at  timestamptz not null default now()
);

create table reflection_answer_attempts (
  id            uuid        primary key default gen_random_uuid(),
  reflection_id uuid        not null references reflections(id) on delete cascade,
  user_id       uuid        not null references users(id) on delete cascade,
  status        text        not null check(status in ('in_progress', 'failed', 'given_up')),
  error_code    text,
  started_at    timestamptz not null default now(),
  ended_at      timestamptz
);

-- ─── Indexes ────────────────────────────────────────────────────────────────

create index idx_daily_assignments_user_date  on daily_assignments(user_id, local_date desc);
create index idx_missions_assignment          on missions(assignment_id);
create index idx_reflections_mission          on reflections(mission_id);
create index idx_reflections_submitted        on reflections(submitted_at desc);
create index idx_reflections_window           on reflections(window_closes_at);
create index idx_reflections_text_gin         on reflections using gin(to_tsvector('english', text));
create index idx_bookmarks_user               on bookmarks_mirror(user_id);
create index idx_push_subs_user               on push_subscriptions(user_id);
create index idx_push_dispatch_user_kind_day  on push_dispatch_log(user_id, kind, sent_date);
create unique index push_dispatch_log_uniq    on push_dispatch_log(user_id, kind, sent_date);
create index idx_qf_api_errors_unresolved     on qf_api_errors(created_at desc) where resolved_at is null;
create index idx_qf_api_errors_retry          on qf_api_errors(resolved_at, next_retry_at) where resolved_at is null;
create unique index reflection_answers_uniq   on reflection_answers(reflection_id);
create index reflection_answers_user_idx      on reflection_answers(user_id);
create index reflection_attempts_user_idx     on reflection_answer_attempts(user_id, started_at);

-- ─── Functions & triggers ───────────────────────────────────────────────────

-- Atomic assignment upsert helper
create or replace function upsert_daily_assignment(
  p_user_id         uuid,
  p_local_date      date,
  p_corpus_entry_id int,
  p_verse_key       text
) returns uuid language plpgsql as $$
declare v_id uuid;
begin
  insert into daily_assignments(user_id, local_date, corpus_entry_id, verse_key)
  values (p_user_id, p_local_date, p_corpus_entry_id, p_verse_key)
  on conflict (user_id, local_date) do nothing;

  select id into v_id
  from daily_assignments
  where user_id = p_user_id and local_date = p_local_date;

  return v_id;
end;
$$;

-- Auto-materialise a weekly_review row on every 7th reflection
create or replace function fn_materialise_weekly_review()
returns trigger language plpgsql as $$
declare
  v_user_id uuid;
  v_count   int;
  v_week    int;
  v_first   uuid;
begin
  select da.user_id into v_user_id
  from missions m
  join daily_assignments da on da.id = m.assignment_id
  where m.id = new.mission_id;

  if v_user_id is null then return new; end if;

  select count(*) into v_count
  from reflections r
  join missions m on m.id = r.mission_id
  join daily_assignments da on da.id = m.assignment_id
  where da.user_id = v_user_id;

  if v_count % 7 <> 0 then return new; end if;

  v_week := v_count / 7;

  select r.id into v_first
  from reflections r
  join missions m on m.id = r.mission_id
  join daily_assignments da on da.id = m.assignment_id
  where da.user_id = v_user_id
  order by r.submitted_at desc
  limit 1 offset 6;

  insert into weekly_reviews(user_id, week_number, first_reflection_id, seventh_reflection_id)
  values (v_user_id, v_week, coalesce(v_first, new.id), new.id)
  on conflict (user_id, week_number) do nothing;

  return new;
end;
$$;

create trigger trg_weekly_review
after insert on reflections
for each row execute function fn_materialise_weekly_review();

-- ─── Row-level security ─────────────────────────────────────────────────────

alter table users                       enable row level security;
alter table qf_sessions                 enable row level security;
alter table corpus_entries              enable row level security;
alter table daily_assignments           enable row level security;
alter table missions                    enable row level security;
alter table reflections                 enable row level security;
alter table bookmarks_mirror            enable row level security;
alter table weekly_reviews              enable row level security;
alter table push_subscriptions          enable row level security;
alter table push_dispatch_log           enable row level security;
alter table qf_api_errors               enable row level security;
alter table reflection_answers          enable row level security;
alter table reflection_answer_attempts  enable row level security;

create policy "corpus_read_reviewed"  on corpus_entries             for select using (human_reviewed_at is not null);
create policy "users_self_all"        on users                      for all    using (true) with check (true);
create policy "sessions_self_all"     on qf_sessions                for all    using (true) with check (true);
create policy "assignments_self_all"  on daily_assignments          for all    using (true) with check (true);
create policy "missions_self_all"     on missions                   for all    using (true) with check (true);
create policy "reflections_self_all"  on reflections                for all    using (true) with check (true);
create policy "bookmarks_self_all"    on bookmarks_mirror           for all    using (true) with check (true);
create policy "reviews_self_all"      on weekly_reviews             for all    using (true) with check (true);
create policy "push_self_all"         on push_subscriptions         for all    using (true) with check (true);
create policy "dispatch_self_all"     on push_dispatch_log          for all    using (true) with check (true);
create policy "errors_self_all"       on qf_api_errors              for all    using (true) with check (true);
create policy "answers_self_all"      on reflection_answers         for all    using (true) with check (true);
create policy "attempts_self_all"     on reflection_answer_attempts for all    using (true) with check (true);

-- ─── Grants ─────────────────────────────────────────────────────────────────

grant all on all tables    in schema public to postgres, service_role;
grant all on all sequences in schema public to postgres, service_role;
alter default privileges in schema public grant all on tables    to postgres, service_role;
alter default privileges in schema public grant all on sequences to postgres, service_role;
