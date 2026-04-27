-- Atomic dhikr increment function
-- Replaces the non-atomic SELECT → compute → UPSERT pattern in
-- /api/dhikr. The old flow lost increments when two taps on different
-- dhikr types raced: both reads saw the same pre-state, then each write
-- set only its field and the later write clobbered the earlier one.
--
-- This function locks the row with FOR UPDATE, increments one field if
-- under its target, marks completed when all three targets are met, and
-- returns the new state plus a just_completed flag for the caller to
-- award garden growth points.

create or replace function dhikr_increment(
  p_user_id uuid,
  p_local_date date,
  p_type text
) returns table (
  subhan int,
  alhamd int,
  akbar int,
  completed boolean,
  just_completed boolean
)
language plpgsql
as $$
declare
  v_target int;
  v_subhan int;
  v_alhamd int;
  v_akbar int;
  v_completed boolean;
  v_just_completed boolean := false;
begin
  v_target := case p_type
    when 'subhan' then 33
    when 'alhamd' then 33
    when 'akbar' then 34
    else 0
  end;
  if v_target = 0 then
    raise exception 'invalid dhikr type: %', p_type;
  end if;

  insert into dhikr_log (user_id, local_date)
  values (p_user_id, p_local_date)
  on conflict (user_id, local_date) do nothing;

  select dl.subhan, dl.alhamd, dl.akbar, dl.completed
    into v_subhan, v_alhamd, v_akbar, v_completed
  from dhikr_log dl
  where dl.user_id = p_user_id and dl.local_date = p_local_date
  for update;

  if v_completed then
    return query select v_subhan, v_alhamd, v_akbar, v_completed, false;
    return;
  end if;

  if p_type = 'subhan' and v_subhan < 33 then
    v_subhan := v_subhan + 1;
  elsif p_type = 'alhamd' and v_alhamd < 33 then
    v_alhamd := v_alhamd + 1;
  elsif p_type = 'akbar' and v_akbar < 34 then
    v_akbar := v_akbar + 1;
  end if;

  if v_subhan >= 33 and v_alhamd >= 33 and v_akbar >= 34 then
    v_completed := true;
    v_just_completed := true;
  end if;

  update dhikr_log
    set subhan = v_subhan,
        alhamd = v_alhamd,
        akbar = v_akbar,
        completed = v_completed,
        updated_at = now()
    where user_id = p_user_id and local_date = p_local_date;

  return query select v_subhan, v_alhamd, v_akbar, v_completed, v_just_completed;
end;
$$;
