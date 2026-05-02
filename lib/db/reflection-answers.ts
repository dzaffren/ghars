import { createAdminSupabaseClient } from "../supabase/server";

export interface AnswerRow {
  id: string;
  reflection_id: string;
  user_id: string;
  ayah_insight: string;
  noticing: string;
  model: string;
  generated_at: string;
}

export async function getAnswerByReflectionId(
  reflectionId: string
): Promise<AnswerRow | null> {
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from("reflection_answers")
    .select(
      "id, reflection_id, user_id, ayah_insight, noticing, model, generated_at"
    )
    .eq("reflection_id", reflectionId)
    .maybeSingle();
  return (data as AnswerRow | null) ?? null;
}

export async function insertAnswer(params: {
  reflectionId: string;
  userId: string;
  ayahInsight: string;
  noticing: string;
  model: string;
}): Promise<AnswerRow> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("reflection_answers")
    .insert({
      reflection_id: params.reflectionId,
      user_id: params.userId,
      ayah_insight: params.ayahInsight,
      noticing: params.noticing,
      model: params.model,
    })
    .select()
    .single();
  if (error || !data) {
    throw new Error(`Answer insert failed: ${error?.message}`);
  }
  return data as AnswerRow;
}

export async function insertAttempt(params: {
  reflectionId: string;
  userId: string;
  status: "in_progress" | "failed" | "given_up";
  errorCode?: string;
}): Promise<string> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("reflection_answer_attempts")
    .insert({
      reflection_id: params.reflectionId,
      user_id: params.userId,
      status: params.status,
      error_code: params.errorCode ?? null,
      ended_at:
        params.status === "in_progress" ? null : new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error || !data) {
    throw new Error(`Attempt insert failed: ${error?.message}`);
  }
  return data.id;
}

export async function countTodaysAttemptsForUser(
  userId: string
): Promise<number> {
  const supabase = createAdminSupabaseClient();
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const { count, error } = await supabase
    .from("reflection_answer_attempts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("started_at", startOfDay.toISOString());
  if (error) {
    throw new Error(`Attempt count failed: ${error.message}`);
  }
  return count ?? 0;
}

export async function markDisclosureSeen(userId: string): Promise<void> {
  const supabase = createAdminSupabaseClient();
  await supabase
    .from("users")
    .update({ answered_reflection_disclosure_seen: true })
    .eq("id", userId);
}

export async function getDisclosureSeen(userId: string): Promise<boolean> {
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from("users")
    .select("answered_reflection_disclosure_seen")
    .eq("id", userId)
    .single();
  return !!data?.answered_reflection_disclosure_seen;
}
