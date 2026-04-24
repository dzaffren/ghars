"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const FOCUS_AREAS = [
  { id: "patience", label: "Patience", emoji: "🧘", desc: "Sabr — endurance through hardship" },
  { id: "gratitude", label: "Gratitude", emoji: "🤲", desc: "Shukr — thankfulness in all states" },
  { id: "charity", label: "Charity", emoji: "🤝", desc: "Sadaqah — giving what you love" },
  { id: "dhikr", label: "Remembrance", emoji: "📿", desc: "Dhikr — keeping Allah in mind" },
  { id: "kindness", label: "Kindness", emoji: "💚", desc: "Ihsan — excellence in all dealings" },
  { id: "honesty", label: "Honesty", emoji: "⚖️", desc: "Sidq — truth in word and deed" },
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

    // Request push notification permission
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }

    router.push("/today");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="text-4xl">🌱</div>
          <h1 className="text-2xl font-bold text-[#1a3a2a]">
            Personalise your garden
          </h1>
          <p className="text-sm text-[#555]">
            Choose up to 3 areas you want to focus on. Your daily missions will
            be weighted toward these themes.
          </p>
        </div>

        {/* Focus area grid */}
        <div className="grid grid-cols-2 gap-3">
          {FOCUS_AREAS.map((area) => {
            const active = selected.includes(area.id);
            return (
              <button
                key={area.id}
                onClick={() => toggle(area.id)}
                className={`rounded-xl border-2 px-4 py-4 text-left transition-all ${
                  active
                    ? "border-[#2d6a4f] bg-[#d8f3dc]"
                    : "border-[#52b788]/30 bg-white hover:border-[#52b788]"
                }`}
              >
                <div className="text-2xl mb-1">{area.emoji}</div>
                <div className="font-semibold text-sm text-[#1a3a2a]">
                  {area.label}
                </div>
                <div className="text-xs text-[#666] mt-0.5">{area.desc}</div>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-center text-[#aaa]">
          {selected.length}/3 selected
        </p>

        {/* Reminder time */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#2d6a4f]">
            Daily reminder time
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={4}
              max={22}
              value={reminderHour}
              onChange={(e) => setReminderHour(Number(e.target.value))}
              className="flex-1 accent-[#2d6a4f]"
            />
            <span className="text-sm font-mono w-16 text-right text-[#333]">
              {reminderHour.toString().padStart(2, "0")}:00
            </span>
          </div>
          <p className="text-xs text-[#aaa]">
            We&apos;ll send a push notification with your verse + mission at
            this time each morning.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        <button
          onClick={save}
          disabled={!selected.length || saving}
          className="w-full rounded-xl bg-[#2d6a4f] text-white font-semibold py-4 hover:bg-[#1b4332] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "Setting up your garden…" : "Plant my first seed →"}
        </button>
      </div>
    </main>
  );
}
