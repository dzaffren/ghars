import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getOrCreateTodaysMission } from "@/lib/mission/generate";

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

  const db = createServerClient();

  const { data: users } = await db.from("users").select("id");

  if (!users?.length) return NextResponse.json({ processed: 0 });

  const results = await Promise.allSettled(
    users.map(async (user: { id: string }) => {
      await getOrCreateTodaysMission(user.id);
      return { userId: user.id };
    })
  );

  const processed = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ processed, failed });
}
