import Link from "next/link";

interface Props {
  completedDates: string[]; // YYYY-MM-DD strings
  totalDone: number;
}

const COLS = 7;

function buildDays(completedSet: Set<string>, today: string, count: number) {
  const days: { date: string; done: boolean; isToday: boolean }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    days.push({ date: ds, done: completedSet.has(ds), isToday: ds === today });
  }
  return days;
}

export default function HeatmapStripWidget({
  completedDates,
  totalDone,
}: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const count = 14;
  const set = new Set(completedDates);
  const days = buildDays(set, today, count);

  const rows: (typeof days)[] = [];
  for (let i = 0; i < days.length; i += COLS) {
    rows.push(days.slice(i, i + COLS));
  }

  return (
    <Link href="/history" className="block">
      <div className="rounded-2xl border border-[var(--green-fog)] bg-white/78 px-4 py-3 shadow-[0_2px_12px_-4px_rgba(45,106,79,0.08)] hover:shadow-[0_4px_18px_-4px_rgba(45,106,79,0.14)] transition-shadow">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--ink-soft)]/60">
            Last {count} days
          </p>
          <p className="text-[10px] text-muted-foreground">
            {totalDone}/{count} done
          </p>
        </div>
        <div className="space-y-1.5">
          {rows.map((row, ri) => (
            <div key={ri} className="flex gap-1.5">
              {row.map((day) => (
                <div
                  key={day.date}
                  title={day.date}
                  className={[
                    "flex-1 h-4 rounded-full transition-colors",
                    day.done
                      ? "bg-primary"
                      : day.isToday
                        ? "border-2 border-primary/40 bg-transparent"
                        : "bg-[var(--cream-deep)]",
                  ].join(" ")}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}
