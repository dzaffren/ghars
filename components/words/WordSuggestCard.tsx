"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";

interface Suggestion {
  position: number;
  arabic: string;
  transliteration: string;
  meaning: string;
  reason: string;
}

interface Props {
  suggestions: Suggestion[];
  verseKey: string;
  onDismiss: () => void;
  onAdded: (count: number) => void;
}

type Phase = "idle" | "loading" | "success";

export default function WordSuggestCard({
  suggestions,
  verseKey,
  onDismiss,
  onAdded,
}: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function handleAddAll() {
    setPhase("loading");
    const results = await Promise.allSettled(
      suggestions.map((s) =>
        fetch("/api/words", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            verse_key: verseKey,
            word_position: s.position,
            arabic: s.arabic,
            transliteration: s.transliteration,
            meaning: s.meaning,
            root: null,
          }),
        }).then((r) => {
          if (!r.ok) throw new Error("add failed");
        })
      )
    );
    const added = results.filter((r) => r.status === "fulfilled").length;
    setPhase("success");
    timerRef.current = setTimeout(() => onAdded(added), 900);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="rounded-2xl border border-[var(--green-fog)] bg-white shadow-sm p-4 flex flex-col gap-3"
    >
      <p className="text-xs font-semibold text-[var(--ink-soft)] uppercase tracking-wide">
        Words to learn from this verse
      </p>

      <div className="flex flex-col gap-3">
        {suggestions.map((s) => (
          <div
            key={s.position}
            className="rounded-xl bg-[var(--cream-deep,#f7f5ef)] p-3 flex flex-col gap-1"
          >
            <div className="flex items-baseline gap-2">
              <span className="arabic-text text-base leading-tight">
                {s.arabic}
              </span>
              <span className="text-xs text-[var(--ink-soft)]">
                {s.transliteration}
              </span>
            </div>
            <p className="text-sm font-medium">{s.meaning}</p>
            <p className="text-xs text-[var(--ink-soft)] italic">{s.reason}</p>
          </div>
        ))}
      </div>

      {phase === "success" ? (
        <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium py-1">
          <Check className="w-4 h-4" />
          Added!
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            disabled={phase === "loading"}
            onClick={handleAddAll}
            className="bg-[var(--primary)] text-white hover:opacity-90 rounded-xl"
          >
            {phase === "loading" && (
              <Loader2 className="w-3 h-3 animate-spin" />
            )}
            Add all
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={phase === "loading"}
            onClick={onDismiss}
            className="text-[var(--ink-soft)]"
          >
            Not today
          </Button>
        </div>
      )}
    </motion.div>
  );
}
