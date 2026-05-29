"use client";

import { useEffect, useState } from "react";
import { AyahCard } from "./_components/AyahCard";
import { TafsirFullDrawer } from "./_components/TafsirFullDrawer";
import { MissionCard } from "./_components/MissionCard";
import { ReflectView } from "./reflect/ReflectView";
import GardenPlant, { type TreeState } from "@/components/GardenPlant";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { getStageProgress } from "@/lib/garden/stages";

interface TodayData {
  assignment_id: string;
  verse_key: string;
  surah_name: string;
  ayah_number: number;
  arabic: string;
  translation: string;
  tafsir_extract: string | null;
  audio_url: string;
  prompts: string[];
  theme_label?: string;
  mission: {
    mission_id: string;
    selected_prompt: string;
    is_custom: boolean;
    committed_at: string;
  } | null;
  reflection: {
    reflection_id: string;
    did_apply: "yes_fully" | "partly" | "not_today";
    text: string;
    submitted_at: string;
    window_closes_at: string;
  } | null;
}

interface GroveSnapshot {
  trees: unknown[];
  streak_days: number;
}

export default function TodayPage() {
  const [data, setData] = useState<TodayData | null>(null);
  const [grove, setGrove] = useState<GroveSnapshot | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tafsirOpen, setTafsirOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [committing, setCommitting] = useState(false);

  useEffect(() => {
    const today = new Date();
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    Promise.all([
      fetch(`/api/today?local_date=${localDate}`).then((r) => r.json()),
      fetch(`/api/grove`)
        .then((r) => r.json())
        .catch(() => null),
      fetch(`/api/users/me`)
        .then((r) => r.json())
        .catch(() => null),
    ])
      .then(([d, g, me]) => {
        if (d.error) {
          setError(d.error.code);
          setLoading(false);
          return;
        }
        setData(d);
        if (g && !g.error) setGrove(g);
        if (me?.display_name) setDisplayName(me.display_name);
        if (d.mission) setSelectedPrompt(d.mission.selected_prompt);
        setLoading(false);
      })
      .catch(() => {
        setError("QF_CONTENT_UNAVAILABLE");
        setLoading(false);
      });
  }, []);

  function refreshGrove() {
    fetch("/api/grove")
      .then((r) => r.json())
      .then((g) => {
        if (g && !g.error) setGrove(g);
      })
      .catch(() => {});
  }

  const treeState: TreeState = {
    growthPoints: (grove?.trees?.length ?? 0) * 5,
    currentStreak: grove?.streak_days ?? 0,
    wilting: false,
  };

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
        <HeroStrip treeState={treeState} displayName={displayName} />

        <AyahCard
          arabic={data.arabic}
          translation={data.translation}
          surah_name={data.surah_name}
          ayah_number={data.ayah_number}
          audio_url={data.audio_url}
          tafsir_extract={data.tafsir_extract}
          onExpandTafsir={() => setTafsirOpen(true)}
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
          <ReflectView
            missionId={data.mission!.mission_id}
            missionText={data.mission!.selected_prompt}
            verseKey={data.verse_key}
            surahName={data.surah_name}
            ayahNumber={data.ayah_number}
            existingReflectionId={data.reflection?.reflection_id}
            existingDidApply={data.reflection?.did_apply}
            existingText={data.reflection?.text}
            windowClosesAt={data.reflection?.window_closes_at}
            onGroveUpdate={refreshGrove}
          />
        )}
      </div>
    </main>
  );
}

function HeroStrip({
  treeState,
  displayName,
}: {
  treeState: TreeState;
  displayName: string | null;
}) {
  const { currentStageName, nextStageName, progressPct, nextThreshold } =
    getStageProgress(treeState.growthPoints);

  return (
    <section className="space-y-3" data-testid="today-garden">
      <div className="flex items-start justify-between">
        <p className="text-sm font-semibold" style={{ color: "#1a3a2a" }}>
          {displayName
            ? `As-salamu alaykum, ${displayName.split(" ")[0]}`
            : "As-salamu alaykum"}
        </p>
        <div
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{ backgroundColor: "rgba(45,106,79,0.08)" }}
        >
          <Flame size={13} className="text-amber-500 shrink-0" aria-hidden />
          <span
            className="text-sm font-bold tabular-nums leading-none"
            style={{ color: "var(--grove-green-light)" }}
          >
            {treeState.currentStreak}
          </span>
          <span
            className="text-[10px] leading-none"
            style={{ color: "var(--text-muted)" }}
          >
            streak
          </span>
        </div>
      </div>

      <div className="relative flex justify-center">
        <GardenPlant state={treeState} size={200} />
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span
            className="w-[72px] shrink-0 text-right text-[11px] font-medium"
            style={{ color: "var(--ink-soft, #5b6b62)" }}
          >
            {currentStageName}
          </span>
          <div
            className="relative h-1.5 flex-1 overflow-hidden rounded-full"
            style={{ backgroundColor: "var(--cream-deep, #f3ede0)" }}
          >
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ backgroundColor: "var(--grove-green-light)" }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct * 100}%` }}
              transition={{ duration: 0.8, ease: [0.34, 1.1, 0.64, 1] }}
            />
          </div>
          <span
            className="w-[72px] shrink-0 text-[11px] font-medium"
            style={{ color: "var(--ink-soft, #5b6b62)" }}
          >
            {nextStageName}
          </span>
        </div>
        <p
          className="text-right text-[11px] pr-1"
          style={{ color: "rgba(91,107,98,0.5)" }}
        >
          {treeState.growthPoints} / {nextThreshold} pts
        </p>
      </div>
    </section>
  );
}
