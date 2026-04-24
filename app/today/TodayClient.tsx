"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import AudioPlayer from "@/components/AudioPlayer";
import ReflectionForm from "@/components/ReflectionForm";
import type { TreeState } from "@/components/Tree";

const Tree = dynamic(() => import("@/components/Tree"), { ssr: false });

interface Mission {
  id: string;
  verse_key: string;
  verse_arabic: string;
  verse_translation: string;
  tafsir_snippet: string | null;
  audio_url: string | null;
  mission_text: string;
  focus_area: string | null;
}

interface Garden {
  growth_points: number;
  current_streak: number;
  longest_streak: number;
  wilting: boolean;
}

interface Props {
  mission: Mission;
  garden: Garden;
  alreadyCompleted: boolean;
  displayName: string;
}

export default function TodayClient({
  mission,
  garden: initialGarden,
  alreadyCompleted,
  displayName,
}: Props) {
  const [garden, setGarden] = useState<Garden>(initialGarden);
  const [completed, setCompleted] = useState(alreadyCompleted);
  const [showTafsir, setShowTafsir] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const treeState: TreeState = {
    growthPoints: garden.growth_points,
    currentStreak: garden.current_streak,
    wilting: garden.wilting,
  };

  function handleAccepted(result: { growthPoints: number; currentStreak: number }) {
    setGarden((g) => ({
      ...g,
      growth_points: result.growthPoints,
      current_streak: result.currentStreak,
      wilting: false,
    }));
    setCompleted(true);
  }

  async function handleBookmark() {
    await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verseKey: mission.verse_key }),
    });
    setBookmarked(true);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 py-3 border-b border-[#52b788]/20 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <span className="font-bold text-[#1a3a2a]">🌱 Ghars</span>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/history" className="text-[#555] hover:text-[#1a3a2a]">
            History
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button className="text-[#555] hover:text-[#1a3a2a]">Sign out</button>
          </form>
        </div>
      </nav>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-6">
        {/* Greeting + streak */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#1a3a2a]">
              {displayName ? `As-salamu alaykum, ${displayName.split(" ")[0]}` : "As-salamu alaykum"}
            </h1>
            <p className="text-sm text-[#555]">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          {garden.current_streak > 0 && (
            <div className="text-center">
              <div className="text-2xl font-bold text-[#2d6a4f]">
                {garden.current_streak}
              </div>
              <div className="text-xs text-[#555]">day streak</div>
            </div>
          )}
        </div>

        {/* Tree */}
        <div className="flex justify-center">
          <Tree state={treeState} />
        </div>

        {/* Garden stats */}
        <div className="flex gap-3 justify-center text-center">
          <div className="flex-1 rounded-xl bg-white border border-[#52b788]/20 py-3 px-4">
            <div className="text-lg font-bold text-[#2d6a4f]">{garden.growth_points}</div>
            <div className="text-xs text-[#555]">growth pts</div>
          </div>
          <div className="flex-1 rounded-xl bg-white border border-[#52b788]/20 py-3 px-4">
            <div className="text-lg font-bold text-[#2d6a4f]">{garden.current_streak}</div>
            <div className="text-xs text-[#555]">streak</div>
          </div>
          <div className="flex-1 rounded-xl bg-white border border-[#52b788]/20 py-3 px-4">
            <div className="text-lg font-bold text-[#2d6a4f]">{garden.longest_streak}</div>
            <div className="text-xs text-[#555]">best</div>
          </div>
        </div>

        {/* Mission card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white border border-[#52b788]/30 overflow-hidden shadow-sm"
        >
          {/* Verse */}
          <div className="bg-[#1a3a2a] px-5 py-5 text-white space-y-3">
            <div className="flex items-center justify-between text-xs opacity-60">
              <span>Verse {mission.verse_key}</span>
              {mission.focus_area && (
                <span className="capitalize bg-white/20 rounded-full px-2 py-0.5">
                  {mission.focus_area}
                </span>
              )}
            </div>
            <p className="arabic-text text-right leading-loose">
              {mission.verse_arabic}
            </p>
            <p className="text-sm leading-relaxed opacity-90">
              {mission.verse_translation}
            </p>
            <div className="flex items-center gap-3">
              {mission.audio_url && (
                <AudioPlayer
                  url={mission.audio_url}
                  label="Listen"
                />
              )}
              <button
                onClick={() => setShowTafsir((v) => !v)}
                className="text-xs opacity-60 hover:opacity-100"
              >
                {showTafsir ? "Hide tafsir" : "See tafsir"}
              </button>
              <button
                onClick={handleBookmark}
                className={`ml-auto text-lg ${bookmarked ? "opacity-100" : "opacity-40 hover:opacity-80"}`}
                title="Bookmark this verse"
              >
                {bookmarked ? "🔖" : "🏷️"}
              </button>
            </div>
          </div>

          {/* Tafsir */}
          {showTafsir && mission.tafsir_snippet && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="bg-[#f5f0e8] px-5 py-4 text-sm text-[#555] leading-relaxed border-b border-[#52b788]/20"
            >
              <p className="font-medium text-[#333] mb-1 text-xs uppercase tracking-wide">
                Ibn Kathir
              </p>
              {mission.tafsir_snippet}
            </motion.div>
          )}

          {/* Mission */}
          <div className="px-5 py-5 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-[#2d6a4f] font-medium mb-2">
                Today&apos;s mission
              </p>
              <p className="text-base font-medium text-[#1a1a1a] leading-relaxed">
                {mission.mission_text}
              </p>
            </div>

            {completed ? (
              <div className="rounded-xl bg-[#d8f3dc] border border-[#52b788] px-4 py-3 text-sm text-[#1b4332] font-medium">
                ✓ Mission complete for today. Come back tomorrow!
              </div>
            ) : (
              <ReflectionForm
                missionId={mission.id}
                onAccepted={handleAccepted}
              />
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
