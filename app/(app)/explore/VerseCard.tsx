"use client";

import { useState } from "react";
import { Bookmark, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VerseResult {
  verse_key: string;
  reason: string;
  action_prompt: string;
  arabic: string;
  translation: string;
}

interface Props {
  result: VerseResult;
  localDate: string;
  onAssigned: (assignedFor: "today" | "tomorrow") => void;
}

export function VerseCard({ result, localDate, onAssigned }: Props) {
  const [tafsirOpen, setTafsirOpen] = useState(false);
  const [tafsirHtml, setTafsirHtml] = useState<string | null>(null);
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assigned, setAssigned] = useState(false);

  async function handleTafsirToggle() {
    if (tafsirOpen) {
      setTafsirOpen(false);
      return;
    }
    setTafsirOpen(true);
    if (tafsirHtml !== null) return;
    setTafsirLoading(true);
    try {
      const res = await fetch(`/api/content/tafsir/${result.verse_key}`);
      const data = await res.json();
      setTafsirHtml(data.text ?? null);
    } catch {
      setTafsirHtml(null);
    } finally {
      setTafsirLoading(false);
    }
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
    <div
      className="rounded-2xl p-6 shadow-sm"
      style={{ backgroundColor: "white" }}
    >
      {/* Section label — matches MissionCard "Today's mission" style */}
      <p
        className="text-xs uppercase tracking-widest mb-3"
        style={{ color: "var(--grove-green)" }}
      >
        {result.verse_key}
      </p>

      {/* Arabic */}
      <p
        className="text-2xl leading-loose text-right mb-3"
        dir="rtl"
        lang="ar"
        translate="no"
        style={{ color: "var(--foreground)" }}
      >
        {result.arabic}
      </p>

      {/* Translation */}
      <p
        className="text-base font-medium leading-relaxed mb-2"
        style={{ color: "var(--foreground)" }}
      >
        {result.translation}
      </p>

      {/* Reason */}
      <p className="text-xs italic mb-4" style={{ color: "var(--text-muted)" }}>
        ✦ {result.reason}
      </p>

      {/* Tafsir + bookmark row */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={handleTafsirToggle}
          className="flex items-center gap-1 text-xs font-medium"
          style={{ color: "var(--grove-green)" }}
        >
          Tafsir{" "}
          {tafsirOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        <button
          onClick={handleBookmark}
          disabled={bookmarked || bookmarking}
          aria-label={bookmarked ? "Bookmarked" : "Bookmark this verse"}
          className="ml-auto p-1.5 rounded-full transition-colors"
          style={{
            color: bookmarked ? "var(--grove-green)" : "var(--text-muted)",
            backgroundColor: bookmarked
              ? "rgba(45,106,79,0.08)"
              : "transparent",
          }}
        >
          <Bookmark size={15} fill={bookmarked ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Tafsir expand */}
      <AnimatePresence>
        {tafsirOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-4"
          >
            {tafsirLoading ? (
              <div
                className="h-16 rounded-lg animate-pulse"
                style={{ backgroundColor: "var(--cream-deep, #f3ede0)" }}
              />
            ) : tafsirHtml ? (
              <div
                className="text-xs leading-relaxed prose prose-sm max-w-none"
                style={{ color: "var(--text-muted)" }}
                dangerouslySetInnerHTML={{ __html: tafsirHtml }}
              />
            ) : (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Tafsir unavailable for this verse.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-width assign button — matches MissionCard commit button */}
      <button
        onClick={handleAssign}
        disabled={assigning || assigned}
        className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50"
        style={{
          backgroundColor: assigned
            ? "rgba(45,106,79,0.15)"
            : "var(--grove-green)",
          color: assigned ? "var(--grove-green)" : "white",
        }}
      >
        {assigned ? "Mission set ✓" : assigning ? "Setting…" : "Set as mission"}
      </button>
    </div>
  );
}
