"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, ChevronLeft, ChevronRight } from "lucide-react";

type DidApply = "yes_fully" | "partly" | "not_today";

interface BookmarkedAyah {
  verse_key: string;
  created_at: string;
}

interface CalendarMark {
  local_date: string;
  did_apply: DidApply;
  reflection_id: string;
}

interface Entry {
  reflection_id: string;
  verse_key: string;
  local_date: string;
  did_apply: string;
  preview: string;
  is_bookmarked: boolean;
}

interface MissionNode {
  selected_prompt: string;
  reflections: ReflectionNode | ReflectionNode[] | null | undefined;
}
interface ReflectionNode {
  did_apply: string;
  text: string;
  reflection_answers?:
    | { ayah_insight: string; noticing: string }
    | { ayah_insight: string; noticing: string }[]
    | null;
}
interface DaySheetData {
  verse_key: string;
  missions: MissionNode | MissionNode[] | null;
}

function first<T>(value: T | T[] | null | undefined): T | undefined {
  if (value == null) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default function JournalPage() {
  const router = useRouter();
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [weeks, setWeeks] = useState<{ id: number; week_number: number }[]>([]);
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<BookmarkedAyah[]>([]);

  useEffect(() => {
    fetch("/api/weeks")
      .then((r) => r.json())
      .then((d) => setWeeks(d.weeks ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/bookmarks")
      .then((r) => r.json())
      .then((d) => setBookmarkedAyahs(d.bookmarks ?? []))
      .catch(() => {});
  }, []);

  return (
    <main
      className="min-h-screen p-6 pb-28"
      style={{ backgroundColor: "var(--sand)" }}
    >
      <div className="max-w-sm mx-auto flex flex-col gap-4">
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--grove-green)" }}
        >
          Journal
        </h1>

        {weeks.length > 0 && (
          <button
            onClick={() => router.push(`/week/${weeks[0].id}`)}
            className="w-full rounded-xl bg-primary px-5 py-3 text-left text-sm font-medium text-primary-foreground transition-all hover:brightness-90"
            data-testid="weekly-review-card"
          >
            Week {weeks[0].week_number} — see what Allah guided you through →
          </button>
        )}

        {bookmarkedAyahs.length > 0 && (
          <BookmarkedAyahsSection
            ayahs={bookmarkedAyahs}
            onRemove={(verseKey) =>
              setBookmarkedAyahs((prev) =>
                prev.filter((a) => a.verse_key !== verseKey)
              )
            }
          />
        )}

        <div
          className="inline-flex rounded-full p-1 self-start"
          style={{ backgroundColor: "white" }}
          data-testid="view-toggle"
        >
          {(["calendar", "list"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-colors"
              style={{
                backgroundColor:
                  view === v ? "var(--grove-green)" : "transparent",
                color: view === v ? "white" : "var(--text-muted)",
              }}
              data-testid={`view-${v}`}
            >
              {v}
            </button>
          ))}
        </div>

        {view === "calendar" ? <CalendarView /> : <ListView />}
      </div>
    </main>
  );
}

function BookmarkedAyahsSection({
  ayahs,
  onRemove,
}: {
  ayahs: BookmarkedAyah[];
  onRemove: (verseKey: string) => void;
}) {
  async function handleRemove(verseKey: string) {
    await fetch("/api/bookmarks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verse_key: verseKey }),
    });
    onRemove(verseKey);
  }

  return (
    <div
      className="rounded-2xl p-4 shadow-sm flex flex-col gap-3"
      style={{ backgroundColor: "white" }}
      data-testid="bookmarked-ayahs-section"
    >
      <p
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: "var(--grove-green)" }}
      >
        Bookmarked Ayahs
      </p>
      {ayahs.map((ayah) => (
        <div
          key={ayah.verse_key}
          className="flex items-center justify-between"
          data-testid={`bookmarked-ayah-${ayah.verse_key}`}
        >
          <p
            className="text-sm font-medium"
            style={{ color: "var(--foreground)" }}
          >
            {ayah.verse_key}
          </p>
          <button
            onClick={() => handleRemove(ayah.verse_key)}
            aria-label={`Remove bookmark for ${ayah.verse_key}`}
            className="p-1 rounded-md transition-colors hover:bg-black/5"
            style={{ color: "var(--grove-green)" }}
          >
            <Bookmark size={16} fill="currentColor" />
          </button>
        </div>
      ))}
    </div>
  );
}

function CalendarView() {
  const [cursor, setCursor] = useState<Date>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [marks, setMarks] = useState<Map<string, DidApply>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthLabel = useMemo(
    () =>
      cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
    [cursor]
  );

  const fromISO = toISO(cursor);
  const toMonthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
  const toISOStr = toISO(toMonthEnd);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/journal/calendar?from=${fromISO}&to=${toISOStr}`)
      .then((r) => r.json())
      .then((d: { marks?: CalendarMark[] }) => {
        if (cancelled) return;
        const m = new Map<string, DidApply>();
        for (const mk of d.marks ?? []) m.set(mk.local_date, mk.did_apply);
        setMarks(m);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fromISO, toISOStr]);

  const grid = useMemo(() => buildMonthGrid(cursor), [cursor]);

  function shiftMonth(delta: number) {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));
  }

  const todayISO = toISO(new Date());

  return (
    <>
      <div
        className="rounded-2xl p-4 shadow-sm"
        style={{ backgroundColor: "white" }}
        data-testid="calendar-view"
      >
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
            className="p-1 rounded-md"
            style={{ color: "var(--text-muted)" }}
            data-testid="calendar-prev"
          >
            <ChevronLeft size={20} />
          </button>
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--grove-green)" }}
            data-testid="calendar-month-label"
          >
            {monthLabel}
          </p>
          <button
            onClick={() => shiftMonth(1)}
            aria-label="Next month"
            className="p-1 rounded-md"
            style={{ color: "var(--text-muted)" }}
            data-testid="calendar-next"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <p
              key={i}
              className="text-[10px] font-medium text-center"
              style={{ color: "var(--text-muted)" }}
            >
              {d}
            </p>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {grid.map((cell, i) => {
            if (!cell) return <div key={i} className="aspect-square" />;
            const iso = cell.iso;
            const mark = marks.get(iso);
            const isToday = iso === todayISO;
            return (
              <button
                key={i}
                disabled={!mark}
                onClick={() => mark && setSelectedDate(iso)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
                  mark
                    ? "hover:bg-black/5 cursor-pointer"
                    : "cursor-default opacity-60"
                }`}
                style={{
                  backgroundColor: isToday ? "rgba(45,106,79,0.08)" : undefined,
                  color: "var(--foreground)",
                }}
                data-testid={mark ? `calendar-day-${iso}` : undefined}
                aria-label={
                  mark
                    ? `Reflection on ${iso}, ${didApplyLabel(mark)}`
                    : `No reflection on ${iso}`
                }
              >
                <span
                  className="leading-none"
                  style={{ fontWeight: isToday ? 700 : 400 }}
                >
                  {cell.day}
                </span>
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: mark ? dotColor(mark) : "transparent",
                  }}
                  aria-hidden
                />
              </button>
            );
          })}
        </div>

        {loading && (
          <p
            className="text-[11px] text-center mt-3"
            style={{ color: "var(--text-muted)" }}
          >
            Loading…
          </p>
        )}
      </div>

      <Legend />

      {selectedDate && (
        <DaySheet date={selectedDate} onClose={() => setSelectedDate(null)} />
      )}
    </>
  );
}

function Legend() {
  const items: { label: string; did: DidApply }[] = [
    { label: "Yes, fully", did: "yes_fully" },
    { label: "Partly", did: "partly" },
    { label: "Not today", did: "not_today" },
  ];
  return (
    <div
      className="flex items-center gap-4 justify-center mt-1"
      data-testid="calendar-legend"
    >
      {items.map((it) => (
        <div key={it.did} className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: dotColor(it.did) }}
            aria-hidden
          />
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {it.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function DaySheet({ date, onClose }: { date: string; onClose: () => void }) {
  const [data, setData] = useState<DaySheetData | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "error">(
    "loading"
  );

  useEffect(() => {
    setStatus("loading");
    fetch(`/api/grove/day/${date}`)
      .then(async (r) => {
        if (r.status === 404) {
          setStatus("empty");
          return;
        }
        if (!r.ok) {
          setStatus("error");
          return;
        }
        const body = (await r.json()) as DaySheetData;
        setData(body);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [date]);

  const mission = first(data?.missions);
  const reflection = first(mission?.reflections);
  const answer = first(reflection?.reflection_answers);

  return (
    <div
      className="fixed inset-0 z-50"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="absolute bottom-0 left-0 right-0 rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto bg-card"
        style={{ backgroundColor: "white" }}
        onClick={(e) => e.stopPropagation()}
        data-testid="day-sheet"
      >
        <div className="flex justify-between items-center mb-4">
          <p className="font-semibold" style={{ color: "var(--grove-green)" }}>
            {date}
          </p>
          <button
            onClick={onClose}
            className="text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Close
          </button>
        </div>
        {status === "loading" && (
          <p
            className="text-sm text-center py-6"
            style={{ color: "var(--text-muted)" }}
          >
            Loading…
          </p>
        )}
        {status === "empty" && (
          <p
            className="text-sm text-center py-6"
            style={{ color: "var(--text-muted)" }}
          >
            No journal entry for this day.
          </p>
        )}
        {status === "error" && (
          <p
            className="text-sm text-center py-6"
            style={{ color: "var(--text-muted)" }}
          >
            Could not load this day. Please try again.
          </p>
        )}
        {status === "ready" && data && (
          <>
            <p
              className="text-xs uppercase tracking-widest mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              {data.verse_key}
            </p>
            {mission && (
              <p
                className="text-sm italic mb-3"
                style={{ color: "var(--text-muted)" }}
              >
                Mission: {mission.selected_prompt}
              </p>
            )}
            {reflection && (
              <p
                className="text-sm leading-relaxed mb-4"
                style={{ color: "var(--foreground)" }}
              >
                {reflection.text}
              </p>
            )}
            {answer && (
              <div
                className="rounded-xl p-4 text-sm text-white"
                style={{
                  background:
                    "linear-gradient(160deg, #1a3a2a 0%, #1f4434 55%, #26563f 100%)",
                }}
                data-testid="day-sheet-answer"
              >
                <p className="leading-relaxed mb-3 text-white/90">
                  {answer.ayah_insight}
                </p>
                <p className="text-[10px] font-medium uppercase tracking-wide text-white/65 mb-1">
                  What I noticed
                </p>
                <p className="leading-relaxed text-white/90">
                  {answer.noticing}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ListView() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "bookmarked">("all");
  const [query, setQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const fetchEntries = useCallback(
    async (q?: string) => {
      setLoading(true);
      const params = new URLSearchParams({
        page: "1",
        page_size: "25",
        filter,
      });
      if (q) params.set("q", q);
      const res = await fetch(`/api/journal?${params}`);
      const data = await res.json();
      setEntries(data.entries ?? []);
      setLoading(false);
    },
    [filter]
  );

  useEffect(() => {
    fetchEntries(query || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchEntries, filter]);

  async function toggleBookmark(entry: Entry) {
    const method = entry.is_bookmarked ? "DELETE" : "POST";
    await fetch("/api/bookmarks", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        verse_key: entry.verse_key,
        reflection_id: entry.reflection_id,
      }),
    });
    setEntries((prev) =>
      prev.map((e) =>
        e.reflection_id === entry.reflection_id
          ? { ...e, is_bookmarked: !e.is_bookmarked }
          : e
      )
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        type="search"
        placeholder="Search reflections…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && fetchEntries(query)}
        className="w-full border rounded-xl p-3 text-sm"
        data-testid="journal-search"
      />

      <div className="flex gap-2">
        {(["all", "bookmarked"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-full text-sm font-medium"
            style={{
              backgroundColor: filter === f ? "var(--grove-green)" : "white",
              color: filter === f ? "white" : "var(--text-muted)",
            }}
            data-testid={`filter-${f}`}
          >
            {f === "all" ? "All" : "Bookmarked"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center py-8" style={{ color: "var(--text-muted)" }}>
          Loading…
        </p>
      ) : entries.length === 0 ? (
        <div className="text-center py-12" data-testid="journal-empty">
          <p style={{ color: "var(--text-muted)" }}>
            {filter === "bookmarked"
              ? "No bookmarked reflections yet."
              : "Your reflections will appear here — start with today's ayah."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3" data-testid="journal-list">
          {entries.map((entry) => (
            <div
              key={entry.reflection_id}
              className="rounded-2xl p-4 shadow-sm"
              style={{ backgroundColor: "white" }}
              data-testid={`journal-entry-${entry.reflection_id}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p
                    className="text-xs font-medium"
                    style={{ color: "var(--grove-green)" }}
                  >
                    {entry.verse_key}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {entry.local_date}
                  </p>
                </div>
                <button
                  onClick={() => toggleBookmark(entry)}
                  className="text-lg"
                  aria-label={
                    entry.is_bookmarked ? "Remove bookmark" : "Bookmark"
                  }
                  data-testid={`bookmark-btn-${entry.reflection_id}`}
                >
                  {entry.is_bookmarked ? "⭐" : "☆"}
                </button>
              </div>
              <p
                className="mt-2 text-sm leading-relaxed line-clamp-3"
                style={{ color: "var(--foreground)" }}
              >
                {entry.preview}
              </p>
              <button
                onClick={() => setSelectedDate(entry.local_date)}
                className="mt-2 text-xs underline"
                style={{ color: "var(--grove-green-light)" }}
              >
                Read full reflection
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedDate && (
        <DaySheet date={selectedDate} onClose={() => setSelectedDate(null)} />
      )}
    </div>
  );
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildMonthGrid(cursor: Date): ({ day: number; iso: string } | null)[] {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const offset = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: ({ day: number; iso: string } | null)[] = [];
  for (let i = 0; i < offset; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push({
      day: d,
      iso: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(
        2,
        "0"
      )}`,
    });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function dotColor(did: DidApply): string {
  switch (did) {
    case "yes_fully":
      return "#2d6a4f";
    case "partly":
      return "#d4a017";
    case "not_today":
      return "#9aa893";
  }
}

function didApplyLabel(did: DidApply): string {
  return did === "yes_fully"
    ? "Yes, fully"
    : did === "partly"
      ? "Partly"
      : "Not today";
}
