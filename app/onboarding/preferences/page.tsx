"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TRANSLATIONS = [
  { id: "131", label: "The Clear Quran (Mustafa Khattab)" },
  { id: "85", label: "Sahih International" },
  { id: "20", label: "Pickthall" },
];

export default function PreferencesPage() {
  const router = useRouter();
  const [translationId, setTranslationId] = useState("131");
  const [morningTime, setMorningTime] = useState("08:00");
  const [eveningTime, setEveningTime] = useState("21:00");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/onboarding/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        translation_id: translationId,
        morning_time: morningTime,
        evening_time: eveningTime,
      }),
    });
    if (res.ok) {
      router.push("/today");
    } else {
      setLoading(false);
      alert("Failed to save preferences. Please try again.");
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ backgroundColor: "var(--sand)" }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xs flex flex-col gap-6"
      >
        <h2
          className="text-2xl font-bold"
          style={{ color: "var(--grove-green)" }}
        >
          Your preferences
        </h2>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--foreground)" }}
          >
            Translation
          </label>
          <select
            value={translationId}
            onChange={(e) => setTranslationId(e.target.value)}
            className="w-full border rounded-lg p-3 text-sm"
            data-testid="translation-picker"
          >
            {TRANSLATIONS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--foreground)" }}
          >
            Morning reminder
          </label>
          <input
            type="time"
            value={morningTime}
            onChange={(e) => setMorningTime(e.target.value)}
            className="w-full border rounded-lg p-3 text-sm"
            data-testid="morning-time-picker"
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--foreground)" }}
          >
            Evening reminder
          </label>
          <input
            type="time"
            value={eveningTime}
            onChange={(e) => setEveningTime(e.target.value)}
            className="w-full border rounded-lg p-3 text-sm"
            data-testid="evening-time-picker"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 rounded-xl font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: "var(--grove-green)" }}
          data-testid="start-btn"
        >
          {loading ? "Saving..." : "Start my first day"}
        </button>
      </form>
    </main>
  );
}
