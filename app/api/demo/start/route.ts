import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSession } from "@/lib/session";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST() {
  const supabase = await createServerSupabaseClient();

  // Create a demo user
  const demoId = `demo_${Date.now()}`;
  const { data: user, error } = await supabase
    .from("users")
    .insert({
      qf_user_id: demoId,
      email: `${demoId}@demo.ghars`,
      display_name: "Demo User",
      is_demo: true,
      last_opened_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !user) {
    return NextResponse.json(
      { error: "DEMO_CREATION_FAILED" },
      { status: 500 }
    );
  }

  // Create session with placeholder token (demo users don't have QF tokens)
  await createSession({
    userId: user.id,
    accessToken: "demo_token",
    expiresIn: 86400 * 7,
  });

  // TODO: seed demo data (7 days of grove) — full implementation in spec-content-corpus story
  // For now, redirect to grove (empty state acceptable in scaffold phase)

  return NextResponse.json({ redirect: "/grove" });
}

// Suppress unused import warning — APP_URL kept for future use in error redirects
void APP_URL;
