-- Atomic dhikr increment function
-- Replaces the non-atomic SELECT → compute → UPSERT pattern in
-- /api/dhikr. The old flow lost increments when two taps on different
-- dhikr types raced: both reads saw the same pre-state, then each write
-- set only its field and the later write clobbered the earlier one.
--
-- Uses INSERT ... ON CONFLICT DO UPDATE RETURNING to atomically
-- create-or-lock the row in a single statement, then immediately
-- re-selects with FOR UPDATE (now a no-op on the locked row) to get a
-- consistent view. SECURITY INVOKER + fixed search_path to prevent
-- search_path hijack from untrusted roles.

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
security invoker
set search_path = public, pg_temp
as $$
declare
  v_subhan int;
  v_alhamd int;
  v_akbar int;
  v_completed boolean;
  v_just_completed boolean := false;
begin
  if p_type not in ('subhan', 'alhamd', 'akbar') then
    raise exception 'invalid dhikr type: %', p_type;
  end if;

  -- Create-or-lock in one statement. The conflicting row is locked by
  -- ON CONFLICT DO UPDATE, so concurrent callers serialize here.
  insert into dhikr_log (user_id, local_date)
  values (p_user_id, p_local_date)
  on conflict (user_id, local_date)
    do update set updated_at = dhikr_log.updated_at
  returning dhikr_log.subhan, dhikr_log.alhamd, dhikr_log.akbar, dhikr_log.completed
    into v_subhan, v_alhamd, v_akbar, v_completed;

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
