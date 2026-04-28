import { Compass } from "lucide-react";
import DashboardCard from "./DashboardCard";

export default function ExploreWidget() {
  return (
    <DashboardCard href="/explore">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-[var(--green-fog)] p-2">
          <Compass size={20} className="text-primary" aria-hidden />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ink-soft)]/60">
            Explore
          </p>
          <p className="text-sm font-semibold text-[#1a3a2a] leading-tight">
            Browse the Quran
          </p>
          <p className="mt-0.5 text-[11px] text-[var(--ink-soft)]/65">
            All 114 surahs
          </p>
        </div>
      </div>
    </DashboardCard>
  );
}
