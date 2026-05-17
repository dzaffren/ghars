"use client";

import { useRef, useState } from "react";
import { Bookmark } from "lucide-react";
import { GradientCard } from "@/components/ui/gradient-card";

interface VerseResult {
  verse_key: string;
  reason: string;
  action_prompt: string;
  arabic: string;
  translation: string;
  audio_url: string;
}

interface Props {
  result: VerseResult;
  localDate: string;
  onAssigned: (assignedFor: "today" | "tomorrow") => void;
}

export function VerseCard({ result, localDate, onAssigned }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assigned, setAssigned] = useState(false);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  }

  function onTimeUpdate() {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgress((audio.currentTime / audio.duration) * 100);
  }

  async function handleBookmark() {
    if (bookmarked || bookmarking) return;
    setBookmarking(true);
    try {
      await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verse_key: result.verse_key }),
      });
      setBookmarked(true);
    } catch {
      // silent fail
    } finally {
      setBookmarking(false);
    }
  }

  async function handleAssign() {
    if (assigning || assigned) return;
    setAssigning(true);
    try {
      const res = await fetch("/api/explore/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verse_key: result.verse_key,
          action_prompt: result.action_prompt,
          local_date: localDate,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAssigned(true);
        onAssigned(data.assigned_for);
      }
    } catch {
      // silent fail
    } finally {
      setAssigning(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Green gradient card — matches AyahCard */}
      <GradientCard className="w-full">
        <div className="flex flex-col gap-3 px-5 py-4 text-white">
          <p className="text-xs opacity-50">{result.verse_key}</p>

          <p
            className="text-2xl leading-loose text-right text-white"
            dir="rtl"
            lang="ar"
            translate="no"
          >
            {result.arabic}
          </p>

          <p className="text-sm leading-relaxed text-white/90">
            {result.translation}
          </p>

          <div className="flex items-center gap-3">
            {result.audio_url && (
              <button
                onClick={togglePlay}
                className="flex items-center gap-1.5 rounded-full border border-white/20 px-2.5 py-1 text-xs text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                aria-label={playing ? "Pause recitation" : "Play recitation"}
              >
                <span className="text-[10px] leading-none">
                  {playing ? "⏸" : "▶"}
                </span>
                <span className="leading-none">Listen</span>
              </button>
            )}
            {result.audio_url && progress > 0 && (
              <div className="h-1 w-16 rounded-full bg-white/15">
                <div
                  className="h-1 rounded-full bg-white/70"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            {result.audio_url && (
              <audio
                ref={audioRef}
                src={result.audio_url}
                onTimeUpdate={onTimeUpdate}
                onEnded={() => setPlaying(false)}
              />
            )}
          </div>
        </div>
      </GradientCard>

      {/* Action card below — white, matches MissionCard */}
      <div
        className="rounded-2xl px-5 py-4 shadow-sm flex flex-col gap-3"
        style={{ backgroundColor: "white" }}
      >
        <p className="text-xs italic" style={{ color: "var(--text-muted)" }}>
          ✦ {result.reason}
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={handleBookmark}
            disabled={bookmarked || bookmarking}
            aria-label={bookmarked ? "Bookmarked" : "Bookmark this verse"}
            className="p-1.5 rounded-full transition-colors"
            style={{
              color: bookmarked ? "var(--grove-green)" : "var(--text-muted)",
              backgroundColor: bookmarked
                ? "rgba(45,106,79,0.08)"
                : "transparent",
            }}
          >
            <Bookmark size={15} fill={bookmarked ? "currentColor" : "none"} />
          </button>

          <button
            onClick={handleAssign}
            disabled={assigning || assigned}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
            style={{
              backgroundColor: assigned
                ? "rgba(45,106,79,0.1)"
                : "var(--grove-green)",
              color: assigned ? "var(--grove-green)" : "white",
            }}
          >
            {assigned
              ? "Mission set ✓"
              : assigning
                ? "Setting…"
                : "Set as mission"}
          </button>
        </div>
      </div>
    </div>
  );
}
