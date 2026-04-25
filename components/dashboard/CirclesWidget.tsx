"use client";

import dynamic from "next/dynamic";
import DashboardCard from "./DashboardCard";
import type { TreeState } from "@/components/GardenTree";

const GardenTree = dynamic(() => import("@/components/GardenTree"), {
  ssr: false,
});

export interface CircleMemberPreview {
  displayName: string;
  growthPoints: number;
  currentStreak: number;
  wilting: boolean;
}

export interface CirclePreview {
  id: string;
  name: string;
  members: CircleMemberPreview[];
}

interface Props {
  circles: CirclePreview[];
}

export default function CirclesWidget({ circles }: Props) {
  const hasCircles = circles.length > 0;
  // Show up to 3 members from the first circle
  const preview = circles[0];
  const members = preview?.members.slice(0, 3) ?? [];

  return (
    <DashboardCard href="/circles">
      <p className="mb-3 text-[10px] font-medium uppercase tracking-wide text-[var(--ink-soft)]/60">
        Circles
      </p>
      {!hasCircles ? (
        <p className="text-xs text-muted-foreground">
          No circles yet. Create or join one.
        </p>
      ) : (
        <>
          <p className="mb-2 text-[11px] font-medium text-[#1a3a2a] truncate">
            {preview.name}
          </p>
          <div className="flex items-end gap-2">
            {members.map((m, i) => {
              const state: TreeState = {
                growthPoints: m.growthPoints,
                currentStreak: m.currentStreak,
                wilting: m.wilting,
              };
              return (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <GardenTree state={state} size={44} />
                  <p className="text-[9px] text-muted-foreground truncate w-10 text-center">
                    {m.displayName.split(" ")[0]}
                  </p>
                </div>
              );
            })}
            {members.length === 0 && (
              <p className="text-xs text-muted-foreground">Invite friends</p>
            )}
          </div>
        </>
      )}
    </DashboardCard>
  );
}
