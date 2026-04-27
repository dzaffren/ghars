import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getOrCreateTodaysMission, getLocalDate } from "@/lib/mission/generate";
import webpush from "web-push";

function initWebPush() {
  if (
    process.env.VAPID_SUBJECT &&
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY
  ) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    return true;
  }
  return false;
}

export async function GET(req: NextRequest) {
  // Verify cron secret. Accept any of:
  //   - Authorization: Bearer <CRON_SECRET>  (Vercel Cron default)
  //   - x-cron-secret: <CRON_SECRET>         (manual curl testing)
  //   - ?secret=<CRON_SECRET>                (manual curl testing)
  const expected = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  const secret = req.headers.get("x-cron-secret");
  const query = req.nextUrl.searchParams.get("secret");
  const bearerOk = !!expected && authHeader === `Bearer ${expected}`;
  const headerOk = !!expected && secret === expected;
  const queryOk = !!expected && query === expected;
  if (!bearerOk && !headerOk && !queryOk) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const pushEnabled = initWebPush();
  const db = createServerClient();
  const currentHourUtc = new Date().getUTCHours();

  // Find users whose local reminder hour matches the current UTC hour
  const { data: users } = await db
    .from("users")
    .select("id, timezone, reminder_hour, push_subscription, focus_areas");

  if (!users?.length) return NextResponse.json({ processed: 0 });

  const results = await Promise.allSettled(
    users.map(
      async (user: {
        id: string;
        timezone: string;
        reminder_hour: number;
        push_subscription: PushSubscription | null;
        focus_areas: string[];
      }) => {
        // Check if now is user's reminder hour
        const localDate = getLocalDate(user.timezone);
        const localHour = getLocalHour(user.timezone);
        if (localHour !== user.reminder_hour) return null;

        // Generate today's mission (idempotent)
        const mission = await getOrCreateTodaysMission(user.id);
        if (!mission) return null;

        // Apply wilting check
        await applyWiltingCheck(user.id, db);

        // Send push notification if subscribed and VAPID configured
        if (pushEnabled && user.push_subscription) {
          try {
            await webpush.sendNotification(
              user.push_subscription as unknown as webpush.PushSubscription,
              JSON.stringify({
                title: "Your mission today",
                body: mission.mission_text,
                url: "/today",
              })
            );
          } catch (err: unknown) {
            if ((err as { statusCode?: number })?.statusCode === 410) {
              // Dead subscription — clear it
              await db
                .from("users")
                .update({ push_subscription: null })
                .eq("id", user.id);
            }
          }
        }

        return { userId: user.id, localDate };
      }
    )
  );

  const processed = results.filter(
    (r) => r.status === "fulfilled" && r.value !== null
  ).length;

  return NextResponse.json({ processed });
}

function getLocalHour(timezone: string): number {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    });
    return parseInt(formatter.format(now), 10);
  } catch {
    return new Date().getUTCHours();
  }
}

async function applyWiltingCheck(
  userId: string,
  db: ReturnType<typeof createServerClient>
) {
  const { data: garden } = await db
    .from("gardens")
    .select("last_completed_date, wilting")
    .eq("user_id", userId)
    .single();

  if (!garden?.last_completed_date) return;

  const yesterday = new Date(Date.now() - 86_400_000)
    .toISOString()
    .slice(0, 10);
  if (garden.last_completed_date < yesterday && !garden.wilting) {
    await db.from("gardens").update({ wilting: true }).eq("user_id", userId);
  }
}
