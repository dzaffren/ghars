-- Add user_seed for deterministic ayah rotation
alter table users add column if not exists seed int not null default 0;

-- Upsert helper: atomic assign-or-return
create or replace function upsert_daily_assignment(
  p_user_id uuid,
  p_local_date date,
  p_corpus_entry_id int,
  p_verse_key text
) returns uuid language plpgsql as $$
declare
  v_id uuid;
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
