-- Add constraints to reflections table (already created in 0001_initial.sql)
ALTER TABLE reflections
  ADD CONSTRAINT IF NOT EXISTS reflections_text_min_length CHECK (length(text) >= 40),
  ADD CONSTRAINT IF NOT EXISTS reflections_text_max_length CHECK (length(text) <= 2000),
  ADD CONSTRAINT IF NOT EXISTS reflections_did_apply_valid
    CHECK (did_apply IN ('yes_fully', 'partly', 'not_today'));

CREATE UNIQUE INDEX IF NOT EXISTS reflections_mission_id_uniq ON reflections (mission_id);
CREATE INDEX IF NOT EXISTS reflections_window_closes_at_idx ON reflections (window_closes_at);

-- qf_api_errors already created in 0001_initial.sql; add missing columns if needed
ALTER TABLE qf_api_errors
  ADD COLUMN IF NOT EXISTS related_id uuid REFERENCES reflections(id),
  ADD COLUMN IF NOT EXISTS status_code int,
  ADD COLUMN IF NOT EXISTS error_body text,
  ADD COLUMN IF NOT EXISTS attempts int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_retry_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS qf_api_errors_retry_idx ON qf_api_errors (resolved_at, next_retry_at)
  WHERE resolved_at IS NULL;
