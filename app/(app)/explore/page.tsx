"use client";

import { useState } from "react";
import { ExploreSearch } from "./ExploreSearch";
import { VerseCard } from "./VerseCard";

interface VerseResult {
  verse_key: string;
  reason: string;
  action_prompt: string;
  arabic: string;
  translation: string;
  audio_url: string;
}

export default function ExplorePage() {
  const [results, setResults] = useState<VerseResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignedMessage, setAssignedMessage] = useState<string | null>(null);

  const localDate = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  async function handleSearch(query: string) {
    setLoading(true);
    setError(null);
    setAssignedMessage(null);

    try {
      const res = await fetch("/api/explore/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error?.message ?? "Something went wrong. Please try again."
        );
        setResults(null);
      } else {
        setResults(data.results);
      }
    } catch {
      setError("Could not reach the server. Please check your connection.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  function handleAssigned(assignedFor: "today" | "tomorrow") {
    setAssignedMessage(
      assignedFor === "today"
        ? "Set as today's mission. Go to Today to commit to it."
        : "Set for tomorrow — you've already committed to today's mission."
    );
  }

  return (
    <main
      className="min-h-screen p-6 pb-28"
      style={{ backgroundColor: "var(--sand)" }}
    >
      <div className="max-w-sm mx-auto flex flex-col gap-6">
        <div className="pt-2">
          <h1 className="text-2xl font-bold mb-1" style={{ color: "#1a3a2a" }}>
            What&apos;s on your heart today?
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Find a verse that speaks to where you are.
          </p>
        </div>

        <ExploreSearch onSearch={handleSearch} loading={loading} />

        {assignedMessage && (
          <div
            className="rounded-xl px-4 py-3 text-sm font-medium"
            style={{
              backgroundColor: "rgba(45,106,79,0.1)",
              color: "var(--grove-green)",
            }}
          >
            {assignedMessage}
          </div>
        )}

        {error && (
          <div
            className="rounded-xl px-4 py-3 text-sm"
            style={{
              backgroundColor: "rgba(200,60,60,0.08)",
              color: "#c83c3c",
            }}
          >
            {error}
          </div>
        )}

        {loading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl h-40 animate-pulse"
                style={{ backgroundColor: "rgba(45,106,79,0.08)" }}
              />
            ))}
          </div>
        )}

        {!loading && results && results.length > 0 && (
          <div className="flex flex-col gap-4">
            {results.map((r) => (
              <VerseCard
                key={r.verse_key}
                result={r}
                localDate={localDate}
                onAssigned={handleAssigned}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
