import { cookies } from "next/headers";
import { createAdminSupabaseClient } from "./supabase/server";

const SESSION_COOKIE = "ghars_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function getSession(): Promise<{
  sessionId: string;
  userId: string;
  accessToken: string;
  refreshToken: string | null;
  accessExpiresAt: Date;
} | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("qf_sessions")
    .select("id, user_id, access_token, refresh_token, access_expires_at")
    .eq("id", sessionId)
    .single();

  if (error || !data) return null;

  return {
    sessionId: data.id,
    userId: data.user_id,
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? null,
    accessExpiresAt: new Date(data.access_expires_at),
  };
}

export async function createSession(params: {
  userId: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}): Promise<string> {
  const supabase = createAdminSupabaseClient();
  const expiresAt = new Date(Date.now() + params.expiresIn * 1000);

  const { data, error } = await supabase
    .from("qf_sessions")
    .insert({
      user_id: params.userId,
      access_token: params.accessToken,
      refresh_token: params.refreshToken ?? null,
      access_expires_at: expiresAt.toISOString(),
    })
    .select("id")
    .single();

  if (error || !data)
    throw new Error(`Failed to create session: ${error?.message}`);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, data.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return data.id;
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return;

  const supabase = createAdminSupabaseClient();
  await supabase.from("qf_sessions").delete().eq("id", sessionId);

  cookieStore.delete(SESSION_COOKIE);
}
