-- Story 1 Task 2: application-rubric judge v2.
-- Replaces the depth score + accept/nudge verdict with a five-marker rubric.

alter table reflections drop column if exists llm_verdict;
alter table reflections drop column if exists depth_score;

alter table reflections add column marker_count int;
alter table reflections add column markers_json jsonb;
alter table reflections add column status text not null default 'pending';

alter table reflections
  add constraint reflections_marker_count_range
  check (marker_count is null or (marker_count between 0 and 5));

alter table reflections
  add constraint reflections_status_values
  check (status in ('scored', 'pending'));

create index if not exists reflections_status_idx on reflections (user_id, status);

comment on column reflections.marker_count is 'Number of application markers present (0-5). NULL while status=pending.';
comment on column reflections.markers_json is 'Per-marker detail: five keys (specific_moment, behavioral_change, temporal_anchor, honest_friction, next_step), each {present: boolean, triggering_phrase?: string, coaching_prompt?: string}.';
comment on column reflections.status is 'scored (judge ran successfully) or pending (judge unavailable; awaiting rescore).';
