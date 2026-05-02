-- push_subscriptions already created in 0001_initial.sql
-- Add any missing columns and a dispatch log table

CREATE TABLE IF NOT EXISTS push_dispatch_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('morning', 'evening')),
  sent_at timestamptz NOT NULL DEFAULT now(),
  sent_date date NOT NULL DEFAULT CURRENT_DATE
);

CREATE UNIQUE INDEX IF NOT EXISTS push_dispatch_log_user_kind_day_uniq
  ON push_dispatch_log (user_id, kind, sent_date);
