import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCodeForTokens } from "@/lib/qf/oauth";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { createSession } from "@/lib/session";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${APP_URL}/?error=oauth_denied`);
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value;
  const verifier = cookieStore.get("pkce_verifier")?.value;

  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(`${APP_URL}/?error=invalid_state`);
  }
  if (!code || !verifier) {
    return NextResponse.redirect(`${APP_URL}/?error=missing_code`);
  }

  cookieStore.delete("pkce_verifier");
  cookieStore.delete("oauth_state");

  let tokens: Awaited<ReturnType<typeof exchangeCodeForTokens>>;
  try {
    tokens = await exchangeCodeForTokens({
      code,
      codeVerifier: verifier,
      redirectUri: `${APP_URL}/api/auth/callback`,
    });
  } catch (e) {
    console.error("Token exchange error:", e);
    return NextResponse.redirect(`${APP_URL}/?error=token_exchange_failed`);
  }

  // Decode JWT to get user info (sub claim)
  let qfUserId: string;
  let email: string | undefined;
  let displayName: string | undefined;

  try {
    if (tokens.id_token) {
      const payload = JSON.parse(
        Buffer.from(tokens.id_token.split(".")[1], "base64url").toString()
      );
      qfUserId = payload.sub;
      email = payload.email;
      displayName = payload.name ?? payload.preferred_username;
    } else {
      // Fallback: use access token sub claim
      const payload = JSON.parse(
        Buffer.from(tokens.access_token.split(".")[1], "base64url").toString()
      );
      qfUserId = payload.sub ?? `qf_${Date.now()}`;
      email = payload.email;
    }
  } catch {
    qfUserId = `qf_${Date.now()}`;
  }

  const supabase = createAdminSupabaseClient();

  // Upsert user
  const { data: user, error: userError } = await supabase
    .from("users")
    .upsert(
      { qf_user_id: qfUserId, email, display_name: displayName },
      { onConflict: "qf_user_id" }
    )
    .select("id, is_demo")
    .single();

  if (userError || !user) {
    console.error("User upsert failed:", userError);
    return NextResponse.redirect(`${APP_URL}/?error=user_creation_failed`);
  }

  await createSession({
    userId: user.id,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresIn: tokens.expires_in,
  });

  // Redirect: new users go to prefs, returning users go to today
  const { data: existingPrefs } = await supabase
    .from("users")
    .select("last_opened_at")
    .eq("id", user.id)
    .single();

  const isFirstLogin = !existingPrefs?.last_opened_at;

  // Update last_opened_at
  await supabase
    .from("users")
    .update({ last_opened_at: new Date().toISOString() })
    .eq("id", user.id);

  if (isFirstLogin) {
    return NextResponse.redirect(`${APP_URL}/onboarding/preferences`);
  }
  return NextResponse.redirect(`${APP_URL}/today`);
}
