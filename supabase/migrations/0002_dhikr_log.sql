-- Dhikr (tasbih) daily counter
-- Tracks SubhanAllah / Alhamdulillah / Allahu Akbar counts per user per day.
-- When all three reach their targets (33 / 33 / 34), completed = true and
-- +3 growth points are awarded to the garden (handled in the API route).

create table dhikr_log (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references users(id) on delete cascade,
  local_date   date        not null,
  subhan       int         not null default 0 check (subhan >= 0),
  alhamd       int         not null default 0 check (alhamd >= 0),
  akbar        int         not null default 0 check (akbar >= 0),
  completed    boolean     not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (user_id, local_date)
);

create index on dhikr_log (user_id, local_date desc);

create trigger dhikr_log_updated_at before update on dhikr_log
  for each row execute function update_updated_at();
