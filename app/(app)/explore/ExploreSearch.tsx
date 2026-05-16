"use client";

import { useState, FormEvent } from "react";
import { Search } from "lucide-react";

const SUGGESTIONS = [
  "patience in difficulty",
  "gratitude for small things",
  "trusting Allah's plan",
  "being a better person",
];

interface Props {
  onSearch: (query: string) => void;
  loading: boolean;
}

export function ExploreSearch({ onSearch, loading }: Props) {
  const [query, setQuery] = useState("");

  function submit(q: string) {
    const trimmed = q.trim();
    if (!trimmed || loading) return;
    onSearch(trimmed);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit(query);
  }

  function handleChip(s: string) {
    setQuery(s);
    submit(s);
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="a theme, feeling, or situation…"
          maxLength={200}
          className="flex-1 rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2"
          style={{
            borderColor: "rgba(45,106,79,0.3)",
            backgroundColor: "white",
            color: "var(--foreground)",
          }}
        />
        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="flex items-center justify-center w-12 h-12 rounded-xl text-white disabled:opacity-40"
          style={{ backgroundColor: "var(--grove-green)" }}
          aria-label="Search"
        >
          <Search size={18} />
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => handleChip(s)}
            disabled={loading}
            className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40"
            style={{
              backgroundColor: "rgba(45,106,79,0.08)",
              color: "var(--grove-green)",
              border: "1px solid rgba(45,106,79,0.2)",
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
