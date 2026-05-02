import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sendPush, type PushSubscription } from "@/lib/push";

const WINDOW_MINUTES = 5;

export async function GET(request: NextRequest) {
  // Verify cron secret
  const secret =
    request.headers.get("x-cron-secret") ??
    request.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const supabase = await createServerSupabaseClient();
  const now = new Date();
  const nowHHMM = `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}`;

  // Simple window: push if user's morning_time or evening_time is within WINDOW_MINUTES of now UTC
  // (full tz-aware scheduling deferred to post-hackathon)
  const plusWindow = new Date(now.getTime() + WINDOW_MINUTES * 60 * 1000);
  const plusHHMM = `${String(plusWindow.getUTCHours()).padStart(2, "0")}:${String(plusWindow.getUTCMinutes()).padStart(2, "0")}`;

  const { data: users } = await supabase
    .from("users")
    .select("id, morning_time, evening_time, paused")
    .eq("paused", false)
    .or(
      `morning_time.gte.${nowHHMM},morning_time.lte.${plusHHMM},evening_time.gte.${nowHHMM},evening_time.lte.${plusHHMM}`
    );

  let sent = 0;
  for (const user of users ?? []) {
    const kind =
      user.morning_time >= nowHHMM && user.morning_time <= plusHHMM
        ? "morning"
        : "evening";

    // Check suppression: already sent today?
    const today = now.toISOString().slice(0, 10);
    const { count } = await supabase
      .from("push_dispatch_log")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("kind", kind)
      .gte("sent_at", `${today}T00:00:00Z`);

    if (count && count > 0) continue;

    // Get subscriptions
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", user.id);

    for (const sub of subs ?? []) {
      try {
        await sendPush(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          {
            title: "Ghars",
            body:
              kind === "morning"
                ? "Your ayah is ready — spend a moment with it."
                : "How did it go today? Reflect on your ayah.",
            url: kind === "morning" ? "/today" : "/today?phase=reflect",
          }
        );
        await supabase
          .from("push_dispatch_log")
          .insert({ user_id: user.id, kind });
        sent++;
      } catch (e: unknown) {
        // 410 Gone = stale subscription, delete it
        if (e instanceof Error && e.message.includes("410")) {
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", sub.endpoint);
        }
      }
    }
  }

  return NextResponse.json({ ok: true, sent });
}
