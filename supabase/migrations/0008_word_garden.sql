-- Word Garden: learner deck, review audit log, per-species plant state, gardens extension

-- ── 1. user_words: learner deck ──────────────────────────────────────────────

create table user_words (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references users(id) on delete cascade,
  verse_key         text        not null,
  word_position     int         not null,
  arabic            text        not null,
  transliteration   text        not null default '',
  meaning           text        not null default '',
  root              text,
  audio_url         text,
  -- SM-2 scheduling fields
  interval_days     int         not null default 1,
  ease_factor       float       not null default 2.5,
  repetitions       int         not null default 0,
  due_at            timestamptz not null default now(),
  last_reviewed_at  timestamptz,
  status            text        not null default 'learning'
                    check (status in ('learning', 'known', 'mature')),
  created_at        timestamptz not null default now()
);

-- Dedup: one card per (user, arabic, root) when root is known
create unique index user_words_dedup_with_root
  on user_words (user_id, arabic, root)
  where root is not null;

-- Dedup: one card per (user, arabic) when root is unknown
create unique index user_words_dedup_no_root
  on user_words (user_id, arabic)
  where root is null;

-- ── 2. word_reviews: audit log ───────────────────────────────────────────────

create table word_reviews (
  id            bigserial   primary key,
  user_id       uuid        not null references users(id) on delete cascade,
  user_word_id  uuid        not null references user_words(id) on delete cascade,
  rating        text        not null check (rating in ('again', 'hard', 'good', 'easy')),
  reviewed_at   timestamptz not null default now()
);

-- ── 3. garden_plants: per-species state ─────────────────────────────────────

create table garden_plants (
  user_id               uuid        not null references users(id) on delete cascade,
  species               text        not null check (species in ('olive', 'palm', 'fig', 'pomegranate')),
  unlocked_at           timestamptz not null default now(),
  stage                 int         not null default 1 check (stage >= 1 and stage <= 5),
  words_toward_next_stage int       not null default 0,
  primary key (user_id, species)
);

-- ── 4. gardens extension ─────────────────────────────────────────────────────

alter table gardens add column if not exists known_word_count   int not null default 0;
alter table gardens add column if not exists next_unlock_at     int not null default 10;

-- ── Row Level Security ───────────────────────────────────────────────────────

alter table user_words    enable row level security;
alter table word_reviews  enable row level security;
alter table garden_plants enable row level security;

-- No permissive policies = anon key is blocked.
-- Service role bypasses RLS by design (Supabase default).

-- ── Indexes ──────────────────────────────────────────────────────────────────

create index on user_words    (user_id, due_at);      -- due-word queries
create index on user_words    (user_id, status);      -- stats
create index on word_reviews  (user_word_id);         -- history
create index on garden_plants (user_id);              -- grove rendering
