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
    if (tafsirHtml !== null) return; // already fetched
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
      className="rounded-2xl p-5 shadow-sm flex flex-col gap-3"
      style={{ backgroundColor: "white" }}
    >
      {/* Arabic */}
      <p
        className="text-xl leading-relaxed text-right font-arabic"
        dir="rtl"
        style={{ color: "var(--foreground)" }}
      >
        {result.arabic}
      </p>

      {/* Translation */}
      <p
        className="text-sm leading-relaxed"
        style={{ color: "var(--foreground)" }}
      >
        {result.translation}
      </p>

      {/* Verse reference */}
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        {result.verse_key}
      </p>

      {/* Reason */}
      <p className="text-xs italic" style={{ color: "var(--text-muted)" }}>
        ✦ {result.reason}
      </p>

      {/* Tafsir toggle */}
      <button
        onClick={handleTafsirToggle}
        className="flex items-center gap-1 text-xs font-medium self-start"
        style={{ color: "var(--grove-green)" }}
      >
        Tafsir{" "}
        {tafsirOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      <AnimatePresence>
        {tafsirOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
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

      {/* Action row */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={handleBookmark}
          disabled={bookmarked || bookmarking}
          aria-label={bookmarked ? "Bookmarked" : "Bookmark this verse"}
          className="p-2 rounded-full transition-colors"
          style={{
            color: bookmarked ? "var(--grove-green)" : "var(--text-muted)",
            backgroundColor: bookmarked
              ? "rgba(45,106,79,0.08)"
              : "transparent",
          }}
        >
          <Bookmark size={16} fill={bookmarked ? "currentColor" : "none"} />
        </button>

        <button
          onClick={handleAssign}
          disabled={assigning || assigned}
          className="ml-auto text-sm font-semibold px-4 py-2 rounded-xl transition-opacity disabled:opacity-50"
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
  );
}
