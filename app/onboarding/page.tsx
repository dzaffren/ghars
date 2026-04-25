"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { TreeState } from "@/components/GardenTree";

const GardenTree = dynamic(() => import("@/components/GardenTree"), {
  ssr: false,
});

const FOCUS_AREAS = [
  {
    id: "patience",
    label: "Patience",
    emoji: "🧘",
    desc: "Sabr — endurance through hardship",
  },
  {
    id: "gratitude",
    label: "Gratitude",
    emoji: "🤲",
    desc: "Shukr — thankfulness in all states",
  },
  {
    id: "charity",
    label: "Charity",
    emoji: "🤝",
    desc: "Sadaqah — giving what you love",
  },
  {
    id: "dhikr",
    label: "Remembrance",
    emoji: "📿",
    desc: "Dhikr — keeping Allah in mind",
  },
  {
    id: "kindness",
    label: "Kindness",
    emoji: "💚",
    desc: "Ihsan — excellence in all dealings",
  },
  {
    id: "honesty",
    label: "Honesty",
    emoji: "⚖️",
    desc: "Sidq — truth in word and deed",
  },
];

export default function OnboardingPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [reminderHour, setReminderHour] = useState(8);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  async function save() {
    if (!selected.length) {
      setError("Please choose at least one focus area.");
      return;
    }
    setSaving(true);
    setError("");

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ focusAreas: selected, timezone, reminderHour }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      setSaving(false);
      return;
    }

    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }

    router.push("/today");
  }

  // Tree grows a stage for each focus area selected, teasing the core mechanic.
  const treeState: TreeState = {
    growthPoints: selected.length * 10,
    currentStreak: 0,
    wilting: false,
  };

  return (
    <main className="min-h-svh bg-[var(--cream)] px-4 py-10">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 md:flex-row md:items-center md:gap-16">
        {/* Tree teaser: top on mobile, right on desktop */}
        <div className="flex items-center justify-center md:order-last md:flex-1">
          <div className="flex flex-col items-center gap-2">
            <GardenTree state={treeState} size={240} />
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--ink-soft)]/60">
              {selected.length === 0
                ? "your garden awaits"
                : selected.length === 1
                  ? "a seedling appears"
                  : selected.length === 2
                    ? "growing stronger"
                    : "roots are deep"}
            </p>
          </div>
        </div>

        {/* Form: bottom on mobile, left on desktop */}
        <div className="space-y-7 md:flex-1">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-[#1a3a2a]">
              Personalise your garden
            </h1>
            <p className="text-sm text-[var(--ink-soft)]">
              Choose up to 3 areas you want to focus on. Your daily missions
              will be weighted toward these themes.
            </p>
          </div>

          {/* Focus area grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {FOCUS_AREAS.map((area) => {
              const active = selected.includes(area.id);
              return (
                <button
                  key={area.id}
                  onClick={() => toggle(area.id)}
                  className={cn(
                    "rounded-xl border-2 px-4 py-4 text-left transition-all",
                    active
                      ? "border-primary bg-[var(--green-fog)]"
                      : "border-border bg-white hover:border-accent"
                  )}
                >
                  <div className="mb-1 text-2xl">{area.emoji}</div>
                  <div className="text-sm font-semibold text-[#1a3a2a]">
                    {area.label}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {area.desc}
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-[var(--ink-soft)]/60">
            {selected.length}/3 selected
          </p>

          {/* Reminder time */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-primary">
              Daily reminder time
            </label>
            <div className="flex items-center gap-4">
              <Slider
                min={4}
                max={22}
                step={1}
                value={[reminderHour]}
                onValueChange={([v]) => setReminderHour(v)}
                className="flex-1"
              />
              <span className="w-16 text-right font-mono text-sm text-foreground">
                {reminderHour.toString().padStart(2, "0")}:00
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              We&apos;ll send a push notification with your verse + mission at
              this time each morning.
            </p>
          </div>

          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}

          <Button
            onClick={save}
            disabled={!selected.length || saving}
            size="lg"
            className="w-full rounded-xl"
          >
            {saving ? "Setting up your garden…" : "Plant my first seed →"}
          </Button>
        </div>
      </div>
    </main>
  );
}
