"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import AudioPlayer from "@/components/AudioPlayer";

interface WordProp {
  id: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  root: string | null;
  interval_days: number;
  ease_factor: number;
  repetitions: number;
  status: "learning" | "known" | "mature";
  audio_url: string | null;
}

interface Props {
  word: WordProp;
  onRated: (wordId: string, rating: "again" | "hard" | "good" | "easy") => void;
  isSubmitting?: boolean;
}

function nextInterval(
  word: WordProp,
  rating: "again" | "hard" | "good" | "easy"
): string {
  if (rating === "again") return "1d";
  if (rating === "hard") return `${Math.round(word.interval_days * 1.2)}d`;
  if (rating === "good") {
    const days =
      word.repetitions === 0
        ? 1
        : word.repetitions === 1
          ? 6
          : Math.round(word.interval_days * word.ease_factor);
    return `${days}d`;
  }
  // easy
  return `${Math.round(word.interval_days * word.ease_factor * 1.3)}d`;
}

const STATUS_BADGE: Record<WordProp["status"], string> = {
  learning: "bg-amber-100 text-amber-700 border-amber-200",
  known: "bg-green-100 text-green-700 border-green-200",
  mature: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const STATUS_LABEL: Record<WordProp["status"], string> = {
  learning: "Learning",
  known: "Known",
  mature: "Mature",
};

const RATING_STYLES: Record<string, string> = {
  again: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
  hard: "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",
  good: "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
  easy: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
};

const RATINGS = ["again", "hard", "good", "easy"] as const;

export default function WordReviewCard({
  word,
  onRated,
  isSubmitting = false,
}: Props) {
  const [flipped, setFlipped] = useState(false);

  function handleFlip() {
    if (!flipped) setFlipped(true);
  }

  function handleRate(rating: (typeof RATINGS)[number]) {
    if (isSubmitting) return;
    onRated(word.id, rating);
  }

  return (
    <div
      className="rounded-2xl border border-[var(--green-fog)] bg-white shadow-sm cursor-pointer select-none"
      onClick={handleFlip}
      role="button"
      aria-label={flipped ? "Word details" : "Tap to reveal meaning"}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!flipped) setFlipped(true);
        }
      }}
    >
      <div className="p-6 flex flex-col items-center gap-3 min-h-[220px] justify-center">
        <AnimatePresence mode="wait">
          {!flipped ? (
            <motion.div
              key="front"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-3 w-full"
            >
              <p className="arabic-text text-center">{word.arabic}</p>
              <p className="text-sm text-[var(--ink-soft)]">
                {word.transliteration}
              </p>
              {word.audio_url && (
                <span onClick={(e) => e.stopPropagation()}>
                  <AudioPlayer url={word.audio_url} label="Listen" />
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                className="mt-2 border-[var(--green-fog)] text-[var(--ink-soft)]"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFlip();
                }}
              >
                Show meaning
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="back"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-3 w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-base font-medium text-center">
                {word.meaning}
              </p>
              {word.root && (
                <p className="text-xs text-[var(--ink-soft)]">
                  Root: {word.root}
                </p>
              )}
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[word.status]}`}
              >
                {STATUS_LABEL[word.status]}
              </span>
              {word.audio_url && (
                <AudioPlayer url={word.audio_url} label="Listen" />
              )}
              <div className="grid grid-cols-4 gap-2 mt-3 w-full">
                {RATINGS.map((rating) => (
                  <button
                    key={rating}
                    disabled={isSubmitting}
                    onClick={() => handleRate(rating)}
                    className={`rounded-xl border px-2 py-2 text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-0.5 ${RATING_STYLES[rating]}`}
                  >
                    <span className="capitalize">{rating}</span>
                    <span className="font-normal opacity-75">
                      {nextInterval(word, rating)}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
