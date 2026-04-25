-- Garden circles — small private groups (max 5 members) to share plant progress.
-- Privacy: only plant stage + streak is shared, never reflection text.

create table circles (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null check (char_length(trim(name)) between 1 and 40),
  owner_id   uuid        not null references users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table circle_members (
  circle_id  uuid        not null references circles(id) on delete cascade,
  user_id    uuid        not null references users(id) on delete cascade,
  joined_at  timestamptz not null default now(),
  primary key (circle_id, user_id)
);

-- Single-use invite codes; expire after 7 days
create table circle_invites (
  code       text        primary key check (char_length(code) = 6),
  circle_id  uuid        not null references circles(id) on delete cascade,
  created_by uuid        not null references users(id) on delete cascade,
  expires_at timestamptz not null default now() + interval '7 days',
  used       boolean     not null default false
);

create index on circle_members (user_id);
create index on circle_invites (circle_id);
