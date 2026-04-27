"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  Flame,
  Bookmark,
  BookmarkCheck,
  AlertTriangle,
  Loader2,
  Check,
} from "lucide-react";
import AudioPlayer from "@/components/AudioPlayer";
import ReflectionForm from "@/components/ReflectionForm";
import MissionCelebration from "@/components/MissionCelebration";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GradientCard } from "@/components/ui/gradient-card";
import AppHeader from "@/components/AppHeader";
import TasbihWidget from "@/components/dashboard/TasbihWidget";
import CirclesWidget, {
  type CirclePreview,
} from "@/components/dashboard/CirclesWidget";
import WordWidget from "@/components/dashboard/WordWidget";
import JournalWidget, {
  type JournalEntryPreview,
} from "@/components/dashboard/JournalWidget";
import HeatmapStripWidget from "@/components/dashboard/HeatmapStripWidget";
import { getStageProgress } from "@/lib/garden/stages";
import type { TreeState } from "@/components/GardenTree";
import type { VerseWord } from "@/lib/qf/content-client";

const GardenTree = dynamic(() => import("@/components/GardenTree"), {
  ssr: false,
});

// ── Types ────────────────────────────────────────────────────────

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

interface TasbihData {
  subhan: number;
  alhamd: number;
  akbar: number;
  completed: boolean;
}

interface Props {
  mission: Mission;
  garden: Garden;
  alreadyCompleted: boolean;
  displayName: string;
  wordOfDay?: VerseWord | null;
  weeklyTheme?: string | null;
  tasbihToday: TasbihData;
  circlePreview: CirclePreview[];
  journalEntry: JournalEntryPreview | null;
  completedDates14: string[];
}

// ── Local helpers ─────────────────────────────────────────────────

function BookmarkIcon({
  state,
}: {
  state: "idle" | "syncing" | "synced" | "failed";
}) {
  if (state === "syncing")
    return <Loader2 size={15} className="animate-spin" />;
  if (state === "synced") return <BookmarkCheck size={15} />;
  if (state === "failed") return <AlertTriangle size={15} />;
  return <Bookmark size={15} />;
}

function StreakPill({ streak }: { streak: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-primary/8 px-3 py-1.5">
      <Flame size={13} className="text-amber-500 shrink-0" aria-hidden />
      <span className="text-sm font-bold tabular-nums text-primary leading-none">
        {streak}
      </span>
      <span className="text-[10px] text-muted-foreground leading-none">
        streak
      </span>
    </div>
  );
}

function ProgressBar({
  currentStageName,
  nextStageName,
  progressPct,
  growthPoints,
  nextThreshold,
}: {
  currentStageName: string;
  nextStageName: string;
  progressPct: number;
  growthPoints: number;
  nextThreshold: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="w-[72px] shrink-0 text-right text-[11px] font-medium text-[var(--ink-soft)]">
          {currentStageName}
        </span>
        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--cream-deep)]">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct * 100}%` }}
            transition={{ duration: 0.8, ease: [0.34, 1.1, 0.64, 1] }}
          />
        </div>
        <span className="w-[72px] shrink-0 text-[11px] font-medium text-[var(--ink-soft)]">
          {nextStageName}
        </span>
      </div>
      <p className="text-right text-[11px] text-[var(--ink-soft)]/50 pr-1">
        {growthPoints} / {nextThreshold} pts
      </p>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────

export default function TodayClient({
  mission,
  garden: initialGarden,
  alreadyCompleted,
  displayName,
  wordOfDay,
  weeklyTheme,
  tasbihToday,
  circlePreview,
  journalEntry,
  completedDates14,
}: Props) {
  const [garden, setGarden] = useState<Garden>(initialGarden);
  const [completed, setCompleted] = useState(alreadyCompleted);
  const [showTafsir, setShowTafsir] = useState(false);
  const [bookmarkState, setBookmarkState] = useState<
    "idle" | "syncing" | "synced" | "failed"
  >("idle");
  const [celebrationActive, setCelebrationActive] = useState(false);
  const [nextStep, setNextStep] = useState<string | null>(null);

  const treeState: TreeState = {
    growthPoints: garden.growth_points,
    currentStreak: garden.current_streak,
    wilting: garden.wilting,
  };

  const { currentStageName, nextStageName, progressPct, nextThreshold } =
    getStageProgress(garden.growth_points);

  const progressProps = {
    currentStageName,
    nextStageName,
    progressPct,
    growthPoints: garden.growth_points,
    nextThreshold,
  };

  function handleAccepted(result: {
    growthPoints: number;
    currentStreak: number;
    nextStep?: string;
  }) {
    setGarden((g) => ({
      ...g,
      growth_points: result.growthPoints,
      current_streak: result.currentStreak,
      wilting: false,
    }));
    setNextStep(result.nextStep ?? null);
    setCompleted(true);
    setCelebrationActive(true);
    setTimeout(() => setCelebrationActive(false), 2000);
  }

  async function handleBookmark() {
    if (bookmarkState === "syncing" || bookmarkState === "synced") return;
    setBookmarkState("syncing");
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verseKey: mission.verse_key }),
      });
      const data = await res.json();
      setBookmarkState(data.ok ? "synced" : "failed");
    } catch {
      setBookmarkState("failed");
    }
  }

  const firstName = displayName ? displayName.split(" ")[0] : "";
  const today14done = completedDates14.length;

  return (
    <div className="relative min-h-screen">
      <AppHeader variant="today" />

      <main className="mx-auto w-full max-w-5xl px-4 pb-8 pt-3 space-y-6">
        {/* ═══════════════════════════════════════════════════════
            HERO STRIP
            Mobile : greeting+streak row → plant centered → progress bar
            Desktop: 3-col grid [greeting | plant | streak] + progress bar below
        ═══════════════════════════════════════════════════════ */}

        {/* ── Mobile hero ── */}
        <section className="md:hidden space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-[#1a3a2a]">
                {firstName
                  ? `As-salamu alaykum, ${firstName}`
                  : "As-salamu alaykum"}
              </p>
              {weeklyTheme && (
                <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-primary/55 mt-0.5">
                  Week of {weeklyTheme}
                </p>
              )}
            </div>
            <StreakPill streak={garden.current_streak} />
          </div>

          <div className="relative w-full flex items-center justify-center">
            <GardenTree
              state={treeState}
              isVerified={celebrationActive}
              size={200}
            />
            <AnimatePresence>
              {celebrationActive && (
                <MissionCelebration key="mob-celebration" />
              )}
            </AnimatePresence>
          </div>

          <ProgressBar {...progressProps} />
        </section>

        {/* ── Desktop hero strip ── */}
        <section className="hidden md:block space-y-4">
          {/* 3-zone: greeting | plant | streak */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
            {/* Left: greeting + theme */}
            <div className="space-y-0.5">
              <p className="text-base font-semibold text-[#1a3a2a]">
                {firstName
                  ? `As-salamu alaykum, ${firstName}`
                  : "As-salamu alaykum"}
              </p>
              {weeklyTheme && (
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary/55">
                  Week of {weeklyTheme}
                </p>
              )}
            </div>

            {/* Center: plant (300px on desktop) */}
            <div className="relative flex justify-center">
              <GardenTree
                state={treeState}
                isVerified={celebrationActive}
                size={300}
              />
              <AnimatePresence>
                {celebrationActive && (
                  <MissionCelebration key="desk-celebration" />
                )}
              </AnimatePresence>
            </div>

            {/* Right: streak pill */}
            <div className="flex justify-end">
              <StreakPill streak={garden.current_streak} />
            </div>
          </div>

          {/* Progress bar — centred, constrained width so it doesn't sprawl */}
          <div className="mx-auto max-w-sm">
            <ProgressBar {...progressProps} />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            CONTENT — single tree (no mobile/desktop duplication)
            Mobile : stacked (mission → widgets 2×2 → heatmap)
            Desktop: 60/40 grid [mission | widget rail] + heatmap below
        ═══════════════════════════════════════════════════════ */}

        <div className="grid gap-4 md:grid-cols-[11fr_9fr] md:gap-6 md:items-start">
          {/* ── Mission card (left / top) ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GradientCard className="w-full">
              {/* Verse */}
              <div className="space-y-3 px-5 py-4 text-white">
                <div className="flex items-center justify-between text-xs">
                  <span className="opacity-50">Verse {mission.verse_key}</span>
                  {mission.focus_area && (
                    <Badge
                      variant="outline"
                      className="border-white/30 bg-white/20 capitalize text-white"
                    >
                      {mission.focus_area}
                    </Badge>
                  )}
                </div>
                <p className="arabic-text text-right leading-loose">
                  {mission.verse_arabic}
                </p>
                <p className="text-sm leading-relaxed opacity-90">
                  {mission.verse_translation}
                </p>
                <div className="flex items-center gap-2">
                  {mission.audio_url && (
                    <AudioPlayer
                      url={mission.audio_url}
                      label="Listen"
                      tone="dark"
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTafsir((v) => !v)}
                    className="px-0 text-white/75 hover:bg-white/10 hover:text-white text-xs"
                  >
                    {showTafsir ? "Hide tafsir" : "See tafsir"}
                  </Button>
                  <button
                    onClick={handleBookmark}
                    disabled={bookmarkState === "syncing"}
                    aria-label={
                      bookmarkState === "synced"
                        ? "Bookmarked"
                        : bookmarkState === "failed"
                          ? "Sync failed — retry"
                          : "Bookmark this verse"
                    }
                    className={`ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-white transition-opacity hover:bg-white/10 ${bookmarkState === "idle" ? "opacity-40" : "opacity-100"}`}
                  >
                    <BookmarkIcon state={bookmarkState} />
                  </button>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {showTafsir && mission.tafsir_snippet && (
                  <motion.div
                    key="tafsir"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                      opacity: { duration: 0.2, delay: 0.05 },
                    }}
                    className="overflow-hidden border-t border-white/10"
                  >
                    <div className="px-5 py-3 text-sm leading-relaxed text-white/70">
                      <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-white/65">
                        Ibn Kathir
                      </p>
                      {mission.tafsir_snippet}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mission + reflection */}
              <div className="bg-white/10 px-5 py-4 space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-white/75">
                  Today&apos;s mission
                </p>
                <p className="text-sm font-medium leading-relaxed text-white">
                  {mission.mission_text}
                </p>

                {completed ? (
                  <div className="rounded-xl bg-white/12 px-4 py-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Check size={14} className="text-white shrink-0" />
                      <p className="text-sm font-semibold text-white">
                        Mission complete!
                      </p>
                    </div>
                    {nextStep && (
                      <p className="text-xs italic text-white/70 border-t border-white/15 pt-2 leading-relaxed">
                        {nextStep}
                      </p>
                    )}
                    {!nextStep && (
                      <p className="text-xs text-white/75">
                        Come back tomorrow for a new mission.
                      </p>
                    )}
                  </div>
                ) : (
                  <ReflectionForm
                    missionId={mission.id}
                    onAccepted={handleAccepted}
                  />
                )}
              </div>
            </GradientCard>
          </motion.div>

          {/* ── Right column: widget 2×2 + heatmap below ── */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <TasbihWidget {...tasbihToday} />
              <CirclesWidget circles={circlePreview} />
              <WordWidget word={wordOfDay ?? null} />
              <JournalWidget entry={journalEntry} />
            </div>
            <HeatmapStripWidget
              completedDates={completedDates14}
              totalDone={today14done}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="flex justify-center gap-4">
          <a
            href="/privacy"
            className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground underline underline-offset-2"
          >
            Privacy
          </a>
          <a
            href="/terms"
            className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground underline underline-offset-2"
          >
            Terms
          </a>
        </footer>
      </main>
    </div>
  );
}
