import { redirect } from "next/navigation";
import { getRequiredSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import AppHeader from "@/components/AppHeader";
import { getStreaks } from "@/lib/qf/user-client";
import { getValidQfAccessToken } from "@/lib/auth/qf-oauth";

export const dynamic = "force-dynamic";

// Build the last N days as YYYY-MM-DD strings (newest last for calendar order)
function buildDateRange(days: number): string[] {
  const result: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    result.push(d.toISOString().slice(0, 10));
  }
  return result;
}

// Group flat date array into weeks (rows of 7, starting from earliest date's weekday)
function groupIntoWeeks(
  dates: string[],
  completedSet: Set<string>,
  today: string
) {
  if (!dates.length) return [];
  // Pad the front to align to Sunday (0)
  const firstDate = new Date(dates[0] + "T00:00:00");
  const startDow = firstDate.getDay(); // 0=Sun
  const padded: (null | string)[] = Array(startDow)
    .fill(null)
    .concat(dates as string[]);
  const weeks: {
    date: string | null;
    completed: boolean;
    isToday: boolean;
  }[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(
      padded.slice(i, i + 7).map((d) => ({
        date: d,
        completed: d !== null && completedSet.has(d),
        isToday: d === today,
      }))
    );
  }
  return weeks;
}

const DOW_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default async function HistoryPage() {
  const session = await getRequiredSession();
  if (!session) redirect("/");

  const db = createServerClient();
  const today = new Date().toISOString().slice(0, 10);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 59);
  const sixtyDaysAgoStr = sixtyDaysAgo.toISOString().slice(0, 10);

  const qfToken = await getValidQfAccessToken(session.userId!);

  const [{ data: missions }, { data: garden }, qfStreaks] = await Promise.all([
    db
      .from("daily_missions")
      .select("local_date, reflections(llm_verdict)")
      .eq("user_id", session.userId)
      .gte("local_date", sixtyDaysAgoStr)
      .order("local_date", { ascending: true }),
    db
      .from("gardens")
      .select("growth_points, current_streak, longest_streak")
      .eq("user_id", session.userId)
      .single(),
    qfToken ? getStreaks(qfToken) : Promise.resolve(null),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const qfStreak: number | null = (qfStreaks as any)?.data?.streak ?? null;

  // Build a set of dates where the mission was completed
  const completedDates = new Set<string>(
    (missions ?? [])
      .filter((m) => {
        const ref = Array.isArray(m.reflections)
          ? m.reflections[0]
          : m.reflections;
        return ref?.llm_verdict === "accepted";
      })
      .map((m) => m.local_date as string)
  );

  const totalCompleted = completedDates.size;
  const dateRange = buildDateRange(60);
  const weeks = groupIntoWeeks(dateRange, completedDates, today);

  return (
    <div className="min-h-screen">
      <AppHeader variant="history" />

      <main className="mx-auto w-full max-w-md px-4 pb-8 pt-4">
        {/* Garden stats strip */}
        {garden && (
          <div className="mb-8 flex flex-wrap justify-center gap-3 text-center">
            {[
              { value: garden.growth_points, label: "growth pts" },
              { value: garden.current_streak, label: "streak" },
              { value: garden.longest_streak, label: "best" },
            ].map(({ value, label }) => (
              <Card
                key={label}
                className="flex-1 min-w-[76px] py-3 px-4 shadow-none"
              >
                <div className="text-lg font-bold text-primary">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </Card>
            ))}
            {qfStreak !== null && (
              <Card className="flex-1 min-w-[76px] py-3 px-4 shadow-none border-dashed">
                <div className="text-lg font-bold text-[#2d6a4f]/70">
                  {qfStreak}
                </div>
                <div className="text-xs text-muted-foreground">quran.com</div>
              </Card>
            )}
          </div>
        )}

        {/* Calendar heading */}
        <div className="mb-4 flex items-baseline justify-between">
          <h1 className="text-sm font-semibold text-[var(--ink-soft)]">
            Last 60 days
          </h1>
          <span className="text-xs text-muted-foreground">
            {totalCompleted} completed
          </span>
        </div>

        {/* Heatmap calendar */}
        <div className="rounded-2xl border border-border/50 bg-white/60 p-4 shadow-[0_2px_12px_-4px_rgba(45,106,79,0.08)]">
          {/* Day-of-week header */}
          <div className="mb-2 grid grid-cols-7 gap-1.5">
            {DOW_LABELS.map((d) => (
              <span
                key={d}
                className="text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Week rows */}
          <div className="flex flex-col gap-1.5">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1.5">
                {week.map((day, di) => {
                  if (!day.date) {
                    return <div key={di} className="aspect-square" />;
                  }
                  return (
                    <div
                      key={day.date}
                      title={day.date}
                      className={[
                        "aspect-square rounded-full transition-colors",
                        day.completed
                          ? "bg-primary shadow-[0_1px_4px_rgba(45,106,79,0.30)]"
                          : day.isToday
                            ? "border-2 border-primary/40 bg-transparent"
                            : "bg-[var(--cream-deep)]",
                      ].join(" ")}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-end gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" />
              Completed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--cream-deep)]" />
              Missed
            </span>
          </div>
        </div>

        {totalCompleted === 0 && (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Complete your first mission to start filling the calendar.
          </p>
        )}

        <div className="h-20" />
      </main>
    </div>
  );
}
