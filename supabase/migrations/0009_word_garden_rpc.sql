-- Atomic increment of known_word_count for word garden.
-- Returns new count and current threshold so the caller can check milestones.
create or replace function increment_known_word_count(p_user_id uuid)
returns table(known_word_count int, next_unlock_threshold int)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Ensure row exists before incrementing
  insert into gardens (user_id, known_word_count, next_unlock_threshold)
  values (p_user_id, 0, 10)
  on conflict (user_id) do nothing;

  update gardens
  set known_word_count = gardens.known_word_count + 1
  where user_id = p_user_id;

  return query
  select g.known_word_count, g.next_unlock_threshold
  from gardens g
  where g.user_id = p_user_id;
end;
$$;
