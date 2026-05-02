"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type TreeVariant = "full" | "partial" | "sapling" | "withered";

interface Tree {
  reflection_id: string;
  verse_key: string;
  local_date: string;
  did_apply: string;
  short_preview: string;
  variant: TreeVariant;
}

interface GroveData {
  today_status: "awaiting_morning" | "awaiting_evening" | "complete";
  trees: Tree[];
  month_count: number;
  streak_days: number;
  free_pass_available: boolean;
}

const TREE_EMOJI: Record<TreeVariant, string> = {
  full: "🌳",
  partial: "🌲",
  sapling: "🌱",
  withered: "🍂",
};

export default function GrovePage() {
  const router = useRouter();
  const [data, setData] = useState<GroveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayView, setDayView] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch("/api/grove")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function openDayView(date: string) {
    setSelectedDate(date);
    const res = await fetch(`/api/grove/day/${date}`);
    const json = await res.json();
    setDayView(json);
  }

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--sand)" }}
      >
        <p style={{ color: "var(--text-muted)" }}>Loading your grove…</p>
      </div>
    );

  if (!data) return null;

  return (
    <main
      className="min-h-screen p-6 pb-24"
      style={{ backgroundColor: "var(--sand)" }}
    >
      <div className="max-w-sm mx-auto flex flex-col gap-6">
        {/* Today's status */}
        <TodayStatus
          status={data.today_status}
          onTap={() => router.push("/today")}
        />

        {/* Cumulative count — HERO */}
        <div className="text-center" data-testid="month-count">
          <p
            className="text-4xl font-bold"
            style={{ color: "var(--grove-green)" }}
          >
            {data.month_count}
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            ayat reflected on this month
          </p>
        </div>

        {/* Streak — secondary */}
        {data.streak_days > 0 && (
          <div className="text-center" data-testid="streak-badge">
            <p
              className="text-sm"
              style={{ color: "var(--grove-green-light)" }}
            >
              🌱 {data.streak_days}-day streak
            </p>
          </div>
        )}

        {/* Grove canvas */}
        {data.trees.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ backgroundColor: "white" }}
            data-testid="empty-grove"
          >
            <p className="text-4xl mb-3">🌱</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Your first tree will appear tonight after your evening reflection.
            </p>
          </div>
        ) : (
          <div
            className="rounded-2xl p-4 grid gap-3"
            style={{
              backgroundColor: "white",
              gridTemplateColumns: "repeat(auto-fill, minmax(56px, 1fr))",
            }}
            data-testid="grove-canvas"
          >
            {data.trees.map((tree) => (
              <button
                key={tree.reflection_id}
                onClick={() => openDayView(tree.local_date)}
                className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-gray-50 transition-colors"
                title={tree.local_date}
                data-testid={`tree-${tree.local_date}`}
              >
                <span className="text-2xl">{TREE_EMOJI[tree.variant]}</span>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {tree.local_date.slice(5)} {/* MM-DD */}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Day view sheet */}
      {selectedDate && dayView && (
        <DaySheet
          date={selectedDate}
          data={dayView}
          onClose={() => {
            setSelectedDate(null);
            setDayView(null);
          }}
        />
      )}
    </main>
  );
}

function TodayStatus({
  status,
  onTap,
}: {
  status: GroveData["today_status"];
  onTap: () => void;
}) {
  const messages = {
    awaiting_morning: {
      text: "Today's ayah is waiting →",
      bg: "var(--grove-green)",
      color: "white",
    },
    awaiting_evening: {
      text: "Come back this evening to reflect →",
      bg: "#e8f5e9",
      color: "var(--grove-green)",
    },
    complete: {
      text: "Today's tree is planted ✓",
      bg: "#e8f5e9",
      color: "var(--grove-green)",
    },
  };
  const m = messages[status];
  return (
    <button
      onClick={status !== "complete" ? onTap : undefined}
      className="w-full py-3 px-5 rounded-xl text-sm font-medium text-left"
      style={{ backgroundColor: m.bg, color: m.color }}
      data-testid="today-status"
    >
      {m.text}
    </button>
  );
}

function DaySheet({
  date,
  data,
  onClose,
}: {
  date: string;
  data: Record<string, unknown>;
  onClose: () => void;
}) {
  const missions = data.missions as unknown as
    | {
        selected_prompt: string;
        reflections: { did_apply: string; text: string }[];
      }[]
    | null;
  const mission = missions?.[0];
  const reflection = mission?.reflections?.[0];

  return (
    <div
      className="fixed inset-0 z-50"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="absolute bottom-0 left-0 right-0 rounded-t-2xl p-6 max-h-[70vh] overflow-y-auto"
        style={{ backgroundColor: "white" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <p className="font-semibold" style={{ color: "var(--grove-green)" }}>
            {date}
          </p>
          <button
            onClick={onClose}
            className="text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Close
          </button>
        </div>
        <p
          className="text-xs uppercase tracking-widest mb-2"
          style={{ color: "var(--text-muted)" }}
        >
          {data.verse_key as string}
        </p>
        {mission && (
          <>
            <p
              className="text-sm italic mb-3"
              style={{ color: "var(--text-muted)" }}
            >
              Mission: {mission.selected_prompt}
            </p>
            {reflection && (
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--foreground)" }}
              >
                {reflection.text}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
