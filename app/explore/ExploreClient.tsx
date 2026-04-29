"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";
import ArabicText from "@/components/words/ArabicText";
import WordSheet from "@/components/words/WordSheet";
import type { SearchResult } from "@/lib/qf/semantic-search";

const SUGGESTIONS = [
  "patience in hardship",
  "gratitude and thankfulness",
  "trust in Allah",
  "forgiveness and mercy",
  "remembrance of Allah",
  "kindness to parents",
];

export default function ExploreClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [wordSheet, setWordSheet] = useState<{
    verseKey: string;
    position: number;
  } | null>(null);

  async function search(q: string) {
    if (!q.trim() || q.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/explore?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results ?? []);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 600);
  }

  function handleSuggestion(s: string) {
    setQuery(s);
    search(s);
  }

  return (
    <div className="space-y-5">
      {/* Search input */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50"
        />
        <input
          value={query}
          onChange={handleChange}
          placeholder="Search by theme, topic, or feeling…"
          className="w-full rounded-2xl border border-[var(--green-fog)] bg-white/80 py-3 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        {loading && (
          <Loader2
            size={14}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground/50"
          />
        )}
      </div>

      {/* Suggestion chips (shown when no query) */}
      {!query && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSuggestion(s)}
              className="rounded-full bg-[var(--green-fog)] px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/15 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {searched && results.length === 0 && !loading && (
        <p className="text-center text-sm text-muted-foreground py-8">
          No verses found. Try a different topic.
        </p>
      )}
      <div className="space-y-3">
        {results
          .filter((r) => /^\d+:\d+$/.test(r.verseKey))
          .map((r) => {
            const [chapter, ayah] = r.verseKey.split(":").map(Number);
            return (
              <Link
                key={r.verseKey}
                href={`/surah/${chapter}?ayah=${ayah}`}
                className="block rounded-2xl border border-[var(--green-fog)] bg-white/80 overflow-hidden shadow-[0_2px_12px_-4px_rgba(45,106,79,0.08)] hover:shadow-[0_4px_18px_-4px_rgba(45,106,79,0.14)] transition-shadow"
              >
                <div className="bg-gradient-to-br from-[#1a3a2a] to-[#26563f] px-4 py-3 text-white space-y-2">
                  <p className="text-[11px] opacity-50">{r.verseKey}</p>
                  <div onClick={(e) => e.preventDefault()}>
                    <ArabicText
                      text={r.arabic}
                      verseKey={r.verseKey}
                      className="text-right leading-loose text-base"
                      onWordTap={(vk, pos) => {
                        setWordSheet({ verseKey: vk, position: pos });
                      }}
                    />
                  </div>
                  <p className="text-xs leading-relaxed opacity-85">
                    {r.translation}
                  </p>
                </div>
                <div className="px-4 py-2 flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground">
                    Tap to read full surah →
                  </p>
                </div>
              </Link>
            );
          })}
      </div>

      <WordSheet
        verseKey={wordSheet?.verseKey ?? ""}
        position={wordSheet?.position ?? 1}
        isOpen={!!wordSheet}
        onClose={() => setWordSheet(null)}
      />
    </div>
  );
}
