-- supabase/migrations/0009_explore_assignments.sql
ALTER TABLE daily_assignments
  ALTER COLUMN corpus_entry_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS exploration_prompt text;

COMMENT ON COLUMN daily_assignments.corpus_entry_id IS
  'NULL when assignment is exploration-sourced (see exploration_prompt).';
COMMENT ON COLUMN daily_assignments.exploration_prompt IS
  'Action prompt for exploration-sourced assignments. NULL for corpus-sourced.';
