"use client";

import { useEffect, useState, useCallback } from "react";

interface Entry {
  reflection_id: string;
  verse_key: string;
  local_date: string;
  did_apply: string;
  preview: string;
  is_bookmarked: boolean;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "bookmarked">("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
    <main
      className="min-h-screen p-6 pb-24"
      style={{ backgroundColor: "var(--sand)" }}
    >
      <div className="max-w-sm mx-auto flex flex-col gap-4">
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--grove-green)" }}
        >
          Journal
        </h1>

        {/* Search */}
        <input
          type="search"
          placeholder="Search reflections…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchEntries(query)}
          className="w-full border rounded-xl p-3 text-sm"
          data-testid="journal-search"
        />

        {/* Filter toggle */}
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
          <p
            className="text-center py-8"
            style={{ color: "var(--text-muted)" }}
          >
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
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
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
                  onClick={() => setSelectedId(entry.reflection_id)}
                  className="mt-2 text-xs underline"
                  style={{ color: "var(--grove-green-light)" }}
                >
                  Read full reflection
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedId && (
        <div
          className="fixed inset-0 z-50"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setSelectedId(null)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto"
            style={{ backgroundColor: "white" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between mb-4">
              <p
                className="font-semibold"
                style={{ color: "var(--grove-green)" }}
              >
                Reflection
              </p>
              <button
                onClick={() => setSelectedId(null)}
                style={{ color: "var(--text-muted)" }}
              >
                Close
              </button>
            </div>
            {(() => {
              const e = entries.find((x) => x.reflection_id === selectedId);
              return e ? (
                <>
                  <p
                    className="text-xs mb-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {e.verse_key} · {e.local_date}
                  </p>
                  <p
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ color: "var(--foreground)" }}
                  >
                    {e.preview}
                  </p>
                </>
              ) : null;
            })()}
          </div>
        </div>
      )}
    </main>
  );
}
