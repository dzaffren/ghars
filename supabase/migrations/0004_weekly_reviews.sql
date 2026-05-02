-- weekly_reviews table already created in 0001_initial.sql
-- Add a DB trigger to materialise a weekly_review row on every 7th reflection insert

CREATE OR REPLACE FUNCTION fn_materialise_weekly_review()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_user_id uuid;
  v_count   int;
  v_week    int;
  v_first   uuid;
BEGIN
  -- Get user_id through mission → daily_assignment chain
  SELECT da.user_id INTO v_user_id
  FROM missions m
  JOIN daily_assignments da ON da.id = m.assignment_id
  WHERE m.id = NEW.mission_id;

  IF v_user_id IS NULL THEN RETURN NEW; END IF;

  -- Count this user's total reflections
  SELECT COUNT(*) INTO v_count
  FROM reflections r
  JOIN missions m ON m.id = r.mission_id
  JOIN daily_assignments da ON da.id = m.assignment_id
  WHERE da.user_id = v_user_id;

  -- Only act on multiples of 7
  IF v_count % 7 <> 0 THEN RETURN NEW; END IF;

  v_week := v_count / 7;

  -- Get the first reflection of this batch of 7
  SELECT r.id INTO v_first
  FROM reflections r
  JOIN missions m ON m.id = r.mission_id
  JOIN daily_assignments da ON da.id = m.assignment_id
  WHERE da.user_id = v_user_id
  ORDER BY r.submitted_at DESC
  LIMIT 1 OFFSET 6;

  INSERT INTO weekly_reviews (user_id, week_number, first_reflection_id, seventh_reflection_id)
  VALUES (v_user_id, v_week, COALESCE(v_first, NEW.id), NEW.id)
  ON CONFLICT (user_id, week_number) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_weekly_review
AFTER INSERT ON reflections
FOR EACH ROW EXECUTE FUNCTION fn_materialise_weekly_review();
