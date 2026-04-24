import { NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { refreshAccessToken } from "@/lib/auth/qf-oauth";

export async function POST() {
  const session = await getRequiredSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createServerClient();
  const { data: user } = await db
    .from("users")
    .select("qf_refresh_token, qf_token_expires_at")
    .eq("id", session.userId)
    .single();

  if (!user?.qf_refresh_token) {
    return NextResponse.json({ error: "No refresh token" }, { status: 400 });
  }

  try {
    const tokens = await refreshAccessToken(user.qf_refresh_token);
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    await db
      .from("users")
      .update({
        qf_access_token: tokens.access_token,
        qf_refresh_token: tokens.refresh_token,
        qf_token_expires_at: expiresAt,
      })
      .eq("id", session.userId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Token refresh error:", err);
    return NextResponse.json({ error: "Refresh failed" }, { status: 500 });
  }
}
