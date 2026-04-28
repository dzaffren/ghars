import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCodeForTokens, decodeIdToken } from "@/lib/auth/qf-oauth";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";

function deriveDisplayName(claims: {
  name?: string | null;
  given_name?: string | null;
  preferred_username?: string | null;
  email?: string | null;
}): string | null {
  const candidates = [
    claims.name,
    claims.given_name,
    claims.preferred_username,
    claims.email?.split("@")[0],
  ];
  for (const c of candidates) {
    const trimmed = c?.trim();
    if (trimmed) return trimmed;
  }
  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value;
  const verifier = cookieStore.get("pkce_verifier")?.value;
  const storedNonce = cookieStore.get("oidc_nonce")?.value;

  cookieStore.delete("oauth_state");
  cookieStore.delete("pkce_verifier");
  cookieStore.delete("oidc_nonce");

  if (errorParam) {
    return NextResponse.redirect(new URL(`/?error=${errorParam}`, req.url));
  }

  if (!code || !verifier || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL("/?error=invalid_state", req.url));
  }

  try {
    const tokens = await exchangeCodeForTokens(code, verifier);
    const claims = decodeIdToken(tokens.id_token);

    if (storedNonce && claims.nonce !== storedNonce) {
      console.error("[callback] nonce mismatch — possible token replay");
      return NextResponse.redirect(new URL("/?error=invalid_nonce", req.url));
    }

    const db = createServerClient();
    const expiresAt = new Date(
      Date.now() + tokens.expires_in * 1000
    ).toISOString();

    const { data: user, error } = await db
      .from("users")
      .upsert(
        {
          qf_sub: claims.sub,
          email: claims.email ?? null,
          qf_access_token: tokens.access_token,
          qf_refresh_token: tokens.refresh_token,
          qf_token_expires_at: expiresAt,
        },
        { onConflict: "qf_sub" }
      )
      .select("id, focus_areas, qf_goal_id, display_name")
      .single();

    if (error || !user) {
      console.error("DB upsert error:", error);
      return NextResponse.redirect(new URL("/?error=db_error", req.url));
    }

    const derivedName = deriveDisplayName(claims);
    if (derivedName && !user.display_name) {
      const { error: nameErr } = await db
        .from("users")
        .update({ display_name: derivedName })
        .eq("id", user.id);
      if (nameErr) {
        console.error("[callback] display_name backfill failed", nameErr);
      }
    }

    await db
      .from("gardens")
      .upsert({ user_id: user.id }, { onConflict: "user_id" });

    const session = await getSession();
    session.userId = user.id;
    session.qfSub = claims.sub;
    session.email = claims.email ?? undefined;
    session.displayName = claims.name ?? undefined;
    await session.save();

    const isNew = !user.focus_areas?.length;
    const redirect = isNew ? "/onboarding" : "/today";
    return NextResponse.redirect(new URL(redirect, req.url));
  } catch (err) {
    console.error("Auth callback error:", err);
    return NextResponse.redirect(new URL("/?error=auth_failed", req.url));
  }
}
