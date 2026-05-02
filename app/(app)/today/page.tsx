"use client";

import { useEffect, useState } from "react";
import { AyahCard } from "./_components/AyahCard";
import { TafsirExtract } from "./_components/TafsirExtract";
import { TafsirFullDrawer } from "./_components/TafsirFullDrawer";
import { AudioPlayer } from "./_components/AudioPlayer";
import { MissionCard } from "./_components/MissionCard";

interface TodayData {
  assignment_id: string;
  verse_key: string;
  surah_name: string;
  ayah_number: number;
  arabic: string;
  translation: string;
  tafsir_extract: string;
  audio_url: string;
  prompts: [string, string];
  mission: {
    mission_id: string;
    selected_prompt: string;
    is_custom: boolean;
    committed_at: string;
  } | null;
}

export default function TodayPage() {
  const [data, setData] = useState<TodayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tafsirOpen, setTafsirOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [committing, setCommitting] = useState(false);

  useEffect(() => {
    const today = new Date();
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    fetch(`/api/today?local_date=${localDate}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error.code);
          setLoading(false);
          return;
        }
        setData(d);
        if (d.mission) setSelectedPrompt(d.mission.selected_prompt);
        setLoading(false);
      })
      .catch(() => {
        setError("QF_CONTENT_UNAVAILABLE");
        setLoading(false);
      });
  }, []);

  async function handleCommit() {
    if (!data || !selectedPrompt) return;
    setCommitting(true);
    const res = await fetch("/api/today/commit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assignment_id: data.assignment_id,
        selected_prompt: selectedPrompt,
        is_custom: isCustom,
      }),
    });
    const json = await res.json();
    if (res.ok) {
      setData((prev) =>
        prev
          ? {
              ...prev,
              mission: {
                mission_id: json.mission_id,
                selected_prompt: selectedPrompt,
                is_custom: isCustom,
                committed_at: json.committed_at,
              },
            }
          : prev
      );
    } else {
      alert(json.error?.message ?? "Could not save mission. Please try again.");
    }
    setCommitting(false);
  }

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--sand)" }}
      >
        <p style={{ color: "var(--text-muted)" }}>Loading today&apos;s ayah…</p>
      </div>
    );

  if (error === "CORPUS_EMPTY" || error === "QF_CONTENT_UNAVAILABLE")
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ backgroundColor: "var(--sand)" }}
      >
        <div className="text-center max-w-xs" data-testid="unavailable-card">
          <p
            className="text-lg font-medium mb-2"
            style={{ color: "var(--grove-green)" }}
          >
            We&apos;ll be back in a moment, in sha Allah
          </p>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Please try again shortly.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="py-2 px-6 rounded-lg text-white"
            style={{ backgroundColor: "var(--grove-green)" }}
          >
            Try again
          </button>
        </div>
      </div>
    );

  if (!data) return null;

  const committed = !!data.mission;

  return (
    <main
      className="min-h-screen p-6 pb-24"
      style={{ backgroundColor: "var(--sand)" }}
    >
      <div className="max-w-sm mx-auto flex flex-col gap-6">
        <AyahCard
          arabic={data.arabic}
          translation={data.translation}
          surah_name={data.surah_name}
          ayah_number={data.ayah_number}
        />
        <AudioPlayer src={data.audio_url} />
        <TafsirExtract
          extract={data.tafsir_extract}
          onExpand={() => setTafsirOpen(true)}
        />
        <TafsirFullDrawer
          verse_key={data.verse_key}
          open={tafsirOpen}
          onOpenChange={setTafsirOpen}
        />
        <MissionCard
          prompts={data.prompts}
          mode={committed ? "committed" : "pre_commit"}
          committed_text={data.mission?.selected_prompt}
          selectedPrompt={selectedPrompt}
          onSelect={(p, custom) => {
            setSelectedPrompt(p);
            setIsCustom(custom);
          }}
          onCommit={handleCommit}
          committing={committing}
        />
        {committed && (
          <p
            className="text-center text-sm"
            style={{ color: "var(--text-muted)" }}
            data-testid="evening-cue"
          >
            Come back this evening to reflect on how it went.
          </p>
        )}
      </div>
    </main>
  );
}
