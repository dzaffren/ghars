"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Bookmark,
  BookmarkCheck,
  Loader2,
  RefreshCw,
} from "lucide-react";
import AudioPlayer from "@/components/AudioPlayer";
import ArabicText from "@/components/words/ArabicText";
import WordSheet from "@/components/words/WordSheet";
import type { ChapterVerse } from "@/lib/qf/content-client";

type ViewMode = "both" | "arabic" | "translation";
type TafsirState =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "text"; text: string };

interface Props {
  chapterId: number;
  chapterName: string;
  verses: ChapterVerse[];
  audioUrl: string | null;
  initialBookmarks: string[];
  initialHighlight?: number;
  loadError?: boolean;
}

export default function SurahClient({
  chapterId,
  chapterName,
  verses,
  audioUrl,
  initialBookmarks,
  initialHighlight,
  loadError,
}: Props) {
  const router = useRouter();
  const [view, setView] = useState<ViewMode>("both");
  const [bookmarks, setBookmarks] = useState<Set<string>>(
    () => new Set(initialBookmarks)
  );
  const [tafsir, setTafsir] = useState<Record<string, TafsirState>>({});
  const [pendingBookmark, setPendingBookmark] = useState<Set<string>>(
    new Set()
  );
  const [wordSheet, setWordSheet] = useState<{
    verseKey: string;
    position: number;
  } | null>(null);

  // Scroll to the highlighted verse on mount
  useEffect(() => {
    if (!initialHighlight) return;
    const el = document.getElementById(`ayah-${initialHighlight}`);
    if (el) {
      // Allow layout to settle, then smooth-scroll
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }, [initialHighlight]);

  async function handleBookmark(verseKey: string) {
    if (pendingBookmark.has(verseKey)) return;
    // Optimistic toggle
    const wasSaved = bookmarks.has(verseKey);
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (wasSaved) {
        next.delete(verseKey);
      } else {
        next.add(verseKey);
      }
      return next;
    });
    setPendingBookmark((prev) => new Set(prev).add(verseKey));

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verseKey }),
      });
      const data = await res.json();
      if (!data?.ok) {
        // Roll back on failure
        setBookmarks((prev) => {
          const next = new Set(prev);
          if (wasSaved) {
            next.add(verseKey);
          } else {
            next.delete(verseKey);
          }
          return next;
        });
      }
    } catch {
      setBookmarks((prev) => {
        const next = new Set(prev);
        if (wasSaved) {
          next.add(verseKey);
        } else {
          next.delete(verseKey);
        }
        return next;
      });
    } finally {
      setPendingBookmark((prev) => {
        const next = new Set(prev);
        next.delete(verseKey);
        return next;
      });
    }
  }

  async function toggleTafsir(verseKey: string) {
    const current = tafsir[verseKey];
    // If open (loading or loaded), close it. If in error state, retry instead.
    if (current && current.kind !== "error") {
      setTafsir((prev) => {
        const next = { ...prev };
        delete next[verseKey];
        return next;
      });
      return;
    }

    setTafsir((prev) => ({ ...prev, [verseKey]: { kind: "loading" } }));
    try {
      const res = await fetch(`/api/verse?key=${encodeURIComponent(verseKey)}`);
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = await res.json();
      const text: string = typeof data?.tafsir === "string" ? data.tafsir : "";
      setTafsir((prev) => ({
        ...prev,
        [verseKey]:
          text.length > 0 ? { kind: "text", text } : { kind: "error" },
      }));
    } catch {
      setTafsir((prev) => ({ ...prev, [verseKey]: { kind: "error" } }));
    }
  }

  if (loadError) {
    return (
      <main className="mx-auto w-full max-w-md px-4 pb-12 pt-4 space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-xs text-[var(--ink-soft)] hover:text-primary"
        >
          <ChevronLeft size={14} />
          Back
        </button>
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 rounded-2xl border border-[var(--green-fog)] bg-white/80 px-6 py-12 text-center">
          <p className="text-sm font-medium text-[#1a3a2a]">
            Content temporarily unavailable
          </p>
          <p className="text-xs text-muted-foreground max-w-xs">
            We couldn&apos;t load {chapterName} right now. Check your connection
            and try again.
          </p>
          <button
            onClick={() => router.refresh()}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-white px-4 py-2 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            <RefreshCw size={13} />
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 pb-12 pt-4 space-y-4">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-xs text-[var(--ink-soft)] hover:text-primary"
      >
        <ChevronLeft size={14} />
        Back
      </button>

      {/* Heading */}
      <div className="space-y-0.5">
        <h1 className="text-lg font-bold text-[#1a3a2a]">{chapterName}</h1>
        <p className="text-xs text-muted-foreground">
          Surah {chapterId} · {verses.length} verses
        </p>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-full border border-[var(--green-fog)] bg-white/80 p-0.5 text-[11px] font-medium">
          {(["arabic", "both", "translation"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setView(mode)}
              className={`rounded-full px-3 py-1.5 capitalize transition-colors ${
                view === mode
                  ? "bg-primary text-white"
                  : "text-[var(--ink-soft)] hover:text-primary"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Audio player */}
      {audioUrl && (
        <div className="flex">
          <AudioPlayer url={audioUrl} label="Listen to surah" tone="light" />
        </div>
      )}

      {/* Verse list */}
      <div className="space-y-3">
        {verses.map((verse) => {
          const isHighlighted =
            initialHighlight !== undefined &&
            verse.verse_number === initialHighlight;
          const saved = bookmarks.has(verse.verse_key);
          const pending = pendingBookmark.has(verse.verse_key);
          const tState = tafsir[verse.verse_key];
          const tafsirOpen = tState !== undefined;

          return (
            <div
              key={verse.verse_key}
              id={`ayah-${verse.verse_number}`}
              className={`rounded-2xl border px-4 py-4 space-y-3 transition-colors ${
                isHighlighted
                  ? "border-primary bg-[var(--green-fog)] shadow-[0_0_0_2px_rgba(45,106,79,0.15)]"
                  : "border-[var(--green-fog)] bg-white/80"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--green-fog)] text-[10px] font-semibold text-primary">
                  {verse.verse_number}
                </span>
                {view !== "translation" && (
                  <ArabicText
                    text={verse.text_uthmani}
                    verseKey={verse.verse_key}
                    className="text-right leading-loose flex-1"
                    onWordTap={(vk, pos) =>
                      setWordSheet({ verseKey: vk, position: pos })
                    }
                  />
                )}
                <button
                  onClick={() => handleBookmark(verse.verse_key)}
                  disabled={pending}
                  aria-label={saved ? "Remove bookmark" : "Bookmark verse"}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                    saved
                      ? "text-primary"
                      : "text-[var(--ink-soft)]/40 hover:text-primary"
                  }`}
                >
                  {pending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : saved ? (
                    <BookmarkCheck size={14} />
                  ) : (
                    <Bookmark size={14} />
                  )}
                </button>
              </div>

              {view !== "arabic" && (
                <p className="text-sm leading-relaxed text-[var(--ink-soft)]/85 pl-8">
                  {verse.translation}
                </p>
              )}

              <div className="pl-8">
                <button
                  onClick={() => toggleTafsir(verse.verse_key)}
                  className="text-[11px] font-medium text-primary/80 hover:text-primary transition-colors"
                >
                  {tafsirOpen ? "Hide tafsir" : "Show tafsir"}
                </button>
                {tafsirOpen && tState && (
                  <div className="mt-2 rounded-xl border border-[var(--green-fog)] bg-[var(--cream-deep)]/40 px-3 py-2">
                    {tState.kind === "loading" && (
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Loader2 size={12} className="animate-spin" />
                        Loading…
                      </div>
                    )}
                    {tState.kind === "error" && (
                      <p className="text-[11px] text-muted-foreground italic">
                        Tafsir unavailable.
                      </p>
                    )}
                    {tState.kind === "text" && (
                      <>
                        <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-primary/60">
                          Ibn Kathir
                        </p>
                        <p className="text-xs leading-relaxed text-[var(--ink-soft)]/85">
                          {tState.text}
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <WordSheet
        verseKey={wordSheet?.verseKey ?? ""}
        position={wordSheet?.position ?? 1}
        isOpen={!!wordSheet}
        onClose={() => setWordSheet(null)}
      />
    </main>
  );
}
