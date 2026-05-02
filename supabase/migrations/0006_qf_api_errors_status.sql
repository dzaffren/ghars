-- Add status_code column to qf_api_errors so callers can record the HTTP status
-- of the QF response alongside the error body. Used by lib/qf/errors.ts.

alter table qf_api_errors
  add column if not exists status_code int;

create index if not exists idx_qf_api_errors_unresolved
  on qf_api_errors (created_at desc)
  where resolved_at is null;
