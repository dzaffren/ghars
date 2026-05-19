-- Per-user daily search quota to guard against LLM cost overruns.
alter table users
  add column if not exists search_count_today  int         not null default 0,
  add column if not exists search_quota_reset_at timestamptz not null default now();
