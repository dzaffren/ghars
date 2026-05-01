"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  filterReflections,
  getRef,
  type ReflectionEntry,
  type ReflectionLike,
} from "@/lib/reflections/filter";
import type { MarkerBundle } from "@/lib/llm/types";

type Entry = ReflectionEntry;

const FOCUS_AREAS = [
  "patience",
  "gratitude",
  "charity",
  "dhikr",
  "kindness",
  "honesty",
];

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

// ── MarkerCountBadge ─────────────────────────────────────────────────
// Replaces the pre-v2 `DepthStars` component. No colour grading, no
// stars — the rubric displays marker count as a neutral "N of 5" chip,
// and `pending` reflections surface a soft grey "Pending" label until
// the lazy-rescore call completes. The copy and the testids below are
// load-bearing for the journal E2E suite.
function MarkerCountBadge({
  count,
  status,
}: {
  count: number | null;
  status: "scored" | "pending";
}) {
  if (status === "pending") {
    return (
      <span
        data-testid="marker-pending-badge"
        className="text-[10px] text-muted-foreground"
      >
        Pending
      </span>
    );
  }
  return (
    <span
      data-testid="marker-count-badge"
      className="text-[10px] text-muted-foreground"
    >
      {count ?? 0} of 5
    </span>
  );
}

// Local mutable shape of a reflection after a successful lazy rescore.
// Stored in state so the badge can flip from "Pending" to "N of 5"
// without the user having to refresh the page.
type LocalRefState = {
  marker_count: number | null;
  markers_json: MarkerBundle | null;
  status: "scored" | "pending";
};

export default function ReflectionArchive({ entries }: { entries: Entry[] }) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // ── Lazy rescore state ────────────────────────────────────────────
  // Keyed by reflection id; hydrated from props and updated when a
  // rescore POST resolves 200. Kept as a separate map so we don't have
  // to deep-merge the whole entry tree on every tick.
  const [localRefs, setLocalRefs] = useState<Record<string, LocalRefState>>(
    () => {
      const initial: Record<string, LocalRefState> = {};
      for (const entry of entries) {
        const ref = getRef(entry);
        if (ref) {
          initial[ref.id] = {
            marker_count: ref.marker_count,
            markers_json: ref.markers_json,
            status: ref.status,
          };
        }
      }
      return initial;
    }
  );

  const filtered = useMemo(
    () => filterReflections(entries, { activeFilter, search }),
    [entries, activeFilter, search]
  );

  // ── Kick off lazy rescores for any pending entries on mount ───────
  //
  // Each pending reflection triggers a fire-and-forget POST to
  // /api/reflection/:id/rescore. `Promise.allSettled` ensures one
  // failure doesn't starve the others; 200 flips the entry to scored
  // in local state, 503 leaves it pending for the next page load.
  useEffect(() => {
    const pendingIds: string[] = [];
    for (const entry of entries) {
      const ref = getRef(entry);
      if (ref && ref.status === "pending") {
        pendingIds.push(ref.id);
      }
    }
    if (pendingIds.length === 0) return;

    let cancelled = false;

    Promise.allSettled(
      pendingIds.map(async (id) => {
        const res = await fetch(`/api/reflection/${id}/rescore`, {
          method: "POST",
        });
        if (!res.ok) {
          // 503 JUDGE_UNAVAILABLE → leave pending; 409 ALREADY_SCORED
          // is theoretically reachable if a parallel tab rescored — fall
          // through and do nothing, the next mount will pick up the new
          // state from the server.
          throw new Error(`rescore ${id} failed: ${res.status}`);
        }
        const data = (await res.json()) as {
          status: "scored";
          markerCount: number;
          markers: MarkerBundle;
        };
        if (cancelled) return;
        setLocalRefs((prev) => ({
          ...prev,
          [id]: {
            marker_count: data.markerCount,
            markers_json: data.markers,
            status: data.status,
          },
        }));
      })
    ).catch(() => {
      /* allSettled never rejects but defensive for linter */
    });

    return () => {
      cancelled = true;
    };
    // entries is stable for the life of the page (SSR input); run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            const ref: ReflectionLike | null = getRef(entry);
            const liveState =
              ref && localRefs[ref.id]
                ? localRefs[ref.id]
                : ref
                  ? {
                      marker_count: ref.marker_count,
                      markers_json: ref.markers_json,
                      status: ref.status,
                    }
                  : null;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                data-testid={`journal-entry-${entry.id}`}
              >
                <Link href={`/reflections/${entry.id}`}>
                  <div className="rounded-2xl border bg-white/90 p-4 shadow-[0_2px_12px_-4px_rgba(45,106,79,0.08)] transition-shadow hover:shadow-[0_4px_20px_-4px_rgba(45,106,79,0.14)]">
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
                        <MarkerCountBadge
                          count={liveState?.marker_count ?? null}
                          status={liveState?.status ?? "scored"}
                        />
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
