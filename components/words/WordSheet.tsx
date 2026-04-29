"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Loader2, X } from "lucide-react";

interface LookupResult {
  word: {
    arabic: string;
    transliteration: string;
    meaning: string;
    root: string | null;
  };
  inDeck: boolean;
  deckEntry: {
    due_at: string;
  } | null;
}

interface Props {
  verseKey: string;
  position: number;
  onClose: () => void;
  isOpen: boolean;
}

function daysUntilDue(dueAt: string): number {
  const ms = new Date(dueAt).getTime() - Date.now();
  return Math.max(1, Math.ceil(ms / 86400000));
}

export default function WordSheet({
  verseKey,
  position,
  onClose,
  isOpen,
}: Props) {
  const [data, setData] = useState<LookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [addState, setAddState] = useState<"idle" | "adding" | "added">("idle");

  useEffect(() => {
    if (!isOpen) {
      setData(null);
      setError(false);
      setAddState("idle");
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    fetch(
      `/api/words/lookup?verse_key=${encodeURIComponent(verseKey)}&position=${position}`,
      { signal: controller.signal }
    )
      .then((r) => {
        if (!r.ok) throw new Error("lookup failed");
        return r.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        if ((err as DOMException).name === "AbortError") return;
        setError(true);
        setLoading(false);
      });
    return () => controller.abort();
  }, [isOpen, verseKey, position]);

  async function handleAdd() {
    if (!data) return;
    setAddState("adding");
    try {
      const res = await fetch("/api/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verse_key: verseKey,
          word_position: position,
          arabic: data.word.arabic,
          transliteration: data.word.transliteration,
          meaning: data.word.meaning,
          root: data.word.root,
        }),
      });
      if (!res.ok) throw new Error("add failed");
      setAddState("added");
      // Update local state to show "in deck"
      setData((prev) =>
        prev
          ? {
              ...prev,
              inDeck: true,
              deckEntry: { due_at: new Date().toISOString() },
            }
          : prev
      );
    } catch {
      setAddState("idle");
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            className="fixed bottom-0 inset-x-0 z-50 flex justify-center"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="w-full max-w-md bg-white rounded-t-2xl shadow-xl pb-8">
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-[var(--green-fog,#c8d8c0)]" />
              </div>

              {/* Close button */}
              <div className="flex justify-end px-4 pt-1">
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="text-[var(--ink-soft)] hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 pb-8 pt-2 flex flex-col gap-4 min-h-[180px]">
                {loading && (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--ink-soft)]" />
                  </div>
                )}

                {error && !loading && (
                  <p className="text-sm text-red-600 text-center py-8">
                    Could not load word. Please try again.
                  </p>
                )}

                {data && !loading && (
                  <>
                    <div className="flex flex-col items-center gap-2">
                      <p className="arabic-text text-center">
                        {data.word.arabic}
                      </p>
                      <p className="text-sm text-[var(--ink-soft)]">
                        {data.word.transliteration}
                      </p>
                      <p className="text-base font-medium text-center">
                        {data.word.meaning}
                      </p>
                      {data.word.root && (
                        <p className="text-xs text-[var(--ink-soft)]">
                          Root: {data.word.root}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-center">
                      {data.inDeck && data.deckEntry ? (
                        <p className="text-sm text-emerald-700 font-medium">
                          In your deck · next review in{" "}
                          {daysUntilDue(data.deckEntry.due_at)}d
                        </p>
                      ) : addState === "added" ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 text-sm font-medium">
                          <Check className="w-4 h-4" />
                          Added to deck
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          disabled={addState === "adding"}
                          onClick={handleAdd}
                          className="rounded-xl"
                        >
                          {addState === "adding" && (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          )}
                          Add to deck
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
