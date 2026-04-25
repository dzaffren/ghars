"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Reflection {
  id: string;
  text: string;
  llm_verdict: string;
  llm_feedback: string | null;
  depth_score: number | null;
}

interface Entry {
  id: string;
  local_date: string;
  verse_key: string;
  verse_translation: string;
  mission_text: string;
  focus_area: string | null;
  reflections: Reflection | Reflection[] | null;
}

const FOCUS_AREAS = [
  "patience",
  "gratitude",
  "charity",
  "dhikr",
  "kindness",
  "honesty",
];

function getRef(entry: Entry): Reflection | null {
  if (!entry.reflections) return null;
  return Array.isArray(entry.reflections)
    ? entry.reflections[0]
    : entry.reflections;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function DepthStars({ score }: { score: number | null }) {
  if (!score) return null;
  return (
    <span className="flex gap-px">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`text-[10px] ${i < score ? "text-[#d4a017]" : "text-muted-foreground/25"}`}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function ReflectionArchive({ entries }: { entries: Entry[] }) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = entries;
    if (activeFilter) {
      list = list.filter((e) => e.focus_area === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => {
        const ref = getRef(e);
        return (
          e.mission_text.toLowerCase().includes(q) ||
          e.verse_translation.toLowerCase().includes(q) ||
          (ref?.text ?? "").toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [entries, activeFilter, search]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search reflections…"
        className="w-full rounded-xl border border-[var(--green-fog)] bg-white/80 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
      />

      {/* Focus area filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter(null)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            activeFilter === null
              ? "bg-primary text-white"
              : "bg-[var(--green-fog)] text-[var(--ink-soft)] hover:bg-primary/10"
          }`}
        >
          All
        </button>
        {FOCUS_AREAS.filter((a) => entries.some((e) => e.focus_area === a)).map(
          (area) => (
            <button
              key={area}
              onClick={() =>
                setActiveFilter(activeFilter === area ? null : area)
              }
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                activeFilter === area
                  ? "bg-primary text-white"
                  : "bg-[var(--green-fog)] text-[var(--ink-soft)] hover:bg-primary/10"
              }`}
            >
              {area}
            </button>
          )
        )}
      </div>

      {/* Entry list */}
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {search || activeFilter ? "No matches found." : "No reflections yet."}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry, i) => {
            const ref = getRef(entry);
            const accepted = ref?.llm_verdict === "accepted";
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
              >
                <Link href={`/reflections/${entry.id}`}>
                  <div
                    className={`rounded-2xl border bg-white/90 p-4 shadow-[0_2px_12px_-4px_rgba(45,106,79,0.08)] transition-shadow hover:shadow-[0_4px_20px_-4px_rgba(45,106,79,0.14)] ${!accepted ? "opacity-70" : ""}`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <span className="text-[11px] text-[var(--ink-soft)]/65">
                        {formatDate(entry.local_date)}
                      </span>
                      <div className="flex items-center gap-2">
                        {entry.focus_area && (
                          <span className="rounded-full bg-[var(--green-fog)] px-2 py-0.5 text-[10px] capitalize text-primary">
                            {entry.focus_area}
                          </span>
                        )}
                        {accepted ? (
                          <DepthStars score={ref?.depth_score ?? null} />
                        ) : (
                          <span className="text-[10px] text-muted-foreground/50">
                            ○ incomplete
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="mb-1.5 text-sm font-medium leading-snug text-[#1a3a2a]">
                      {entry.mission_text}
                    </p>
                    {ref?.text && (
                      <p className="text-xs italic text-muted-foreground line-clamp-2">
                        &ldquo;{ref.text}&rdquo;
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
