import { createAdminSupabaseClient } from "../supabase/server";

export interface ReflectionRow {
  id: string;
  mission_id: string;
  did_apply: "yes_fully" | "partly" | "not_today";
  text: string;
  qf_note_id: string | null;
  submitted_at: string;
  window_closes_at: string;
}

export function computeWindowClosesAt(commitAt: Date, userTz: string): Date {
  // 3:00am local time the day after commit
  // Use a simple approach: get the date part in user tz, then add 1 day + 3 hours in UTC-offset terms
  // Simplified: just use midnight + 27 hours from commit (works for most timezones near UTC±12)
  const date = new Date(commitAt);
  date.setUTCHours(date.getUTCHours() + 27); // generous window
  date.setUTCMinutes(0);
  date.setUTCSeconds(0);
  date.setUTCMilliseconds(0);
  return date;
}

export async function getReflectionByMissionId(
  missionId: string
): Promise<ReflectionRow | null> {
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from("reflections")
    .select(
      "id, mission_id, did_apply, text, qf_note_id, submitted_at, window_closes_at"
    )
    .eq("mission_id", missionId)
    .single();
  return data as ReflectionRow | null;
}

export async function getReflectionById(
  reflectionId: string
): Promise<ReflectionRow | null> {
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from("reflections")
    .select(
      "id, mission_id, did_apply, text, qf_note_id, submitted_at, window_closes_at"
    )
    .eq("id", reflectionId)
    .single();
  return data as ReflectionRow | null;
}

export async function upsertReflection(params: {
  missionId: string;
  didApply: string;
  text: string;
  windowClosesAt: string;
  existingId?: string;
  qfNoteId?: string;
}): Promise<ReflectionRow> {
  const supabase = createAdminSupabaseClient();

  if (params.existingId) {
    const { data, error } = await supabase
      .from("reflections")
      .update({
        did_apply: params.didApply,
        text: params.text,
        ...(params.qfNoteId ? { qf_note_id: params.qfNoteId } : {}),
        submitted_at: new Date().toISOString(),
      })
      .eq("id", params.existingId)
      .select()
      .single();
    if (error || !data) throw new Error(`Update failed: ${error?.message}`);
    return data as ReflectionRow;
  }

  const { data, error } = await supabase
    .from("reflections")
    .insert({
      mission_id: params.missionId,
      did_apply: params.didApply,
      text: params.text,
      window_closes_at: params.windowClosesAt,
      ...(params.qfNoteId ? { qf_note_id: params.qfNoteId } : {}),
    })
    .select()
    .single();
  if (error || !data) throw new Error(`Insert failed: ${error?.message}`);
  return data as ReflectionRow;
}

export async function enqueueQfRetry(params: {
  userId: string;
  endpoint: string;
  payload: Record<string, unknown>;
  relatedId?: string;
  statusCode?: number;
  errorBody?: string;
}): Promise<void> {
  const supabase = createAdminSupabaseClient();
  await supabase.from("qf_api_errors").insert({
    user_id: params.userId,
    endpoint: params.endpoint,
    payload: params.payload,
    ...(params.relatedId ? { related_id: params.relatedId } : {}),
    ...(params.statusCode ? { status_code: params.statusCode } : {}),
    ...(params.errorBody
      ? { error_body: params.errorBody.slice(0, 4000) }
      : {}),
    next_retry_at: new Date().toISOString(),
  });
}
