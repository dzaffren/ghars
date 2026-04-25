import { Check } from "lucide-react";
import DashboardCard from "./DashboardCard";

interface Props {
  subhan: number;
  alhamd: number;
  akbar: number;
  completed: boolean;
}

const TOTAL = 100;

export default function TasbihWidget({
  subhan,
  alhamd,
  akbar,
  completed,
}: Props) {
  const done = subhan + alhamd + akbar;
  const pct = Math.min(1, done / TOTAL);
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  return (
    <DashboardCard href="/dhikr">
      <p className="mb-3 text-[10px] font-medium uppercase tracking-wide text-[var(--ink-soft)]/60">
        Daily Tasbih
      </p>
      <div className="flex items-center gap-3">
        {/* Circular arc */}
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          className="-rotate-90"
          aria-hidden
        >
          <circle
            cx="24"
            cy="24"
            r={r}
            fill="none"
            stroke="var(--cream-deep)"
            strokeWidth="5"
          />
          <circle
            cx="24"
            cy="24"
            r={r}
            fill="none"
            stroke={completed ? "#2d6a4f" : "#52b788"}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
          />
        </svg>
        <div>
          <p className="text-xl font-bold tabular-nums text-[#1a3a2a] leading-none">
            {done}
            <span className="text-xs text-muted-foreground font-normal">
              /{TOTAL}
            </span>
          </p>
          {completed ? (
            <div className="mt-0.5 flex items-center gap-1 text-primary">
              <Check size={11} aria-hidden />
              <span className="text-[11px] font-medium">Done today</span>
            </div>
          ) : (
            <p className="mt-0.5 text-[11px] text-[var(--ink-soft)]/65">
              Tap to continue
            </p>
          )}
        </div>
      </div>
    </DashboardCard>
  );
}
