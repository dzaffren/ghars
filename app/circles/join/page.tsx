"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";

export default function JoinCirclePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function join() {
    if (code.trim().length !== 6) {
      setError("Code must be exactly 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/circles/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Invalid code");
      setLoading(false);
      return;
    }
    router.push(`/circles/${data.circleId}`);
  }

  return (
    <div className="min-h-screen">
      <AppHeader variant="circles" />
      <main className="mx-auto w-full max-w-md px-4 pt-10">
        <div className="rounded-2xl border border-[var(--green-fog)] bg-white/80 p-6 space-y-5">
          <div className="space-y-1">
            <h1 className="text-base font-bold text-[#1a3a2a]">
              Join a circle
            </h1>
            <p className="text-xs text-muted-foreground">
              Enter the 6-character invite code from a circle member.
            </p>
          </div>

          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase().slice(0, 6));
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && join()}
            placeholder="ABCDE6"
            className="w-full rounded-xl border border-[var(--green-fog)] bg-[var(--cream)] px-4 py-3 text-center text-2xl font-bold tracking-[0.4em] text-[#1a3a2a] uppercase focus:border-primary focus:outline-none"
            maxLength={6}
          />

          {error && (
            <p className="text-center text-xs text-destructive">{error}</p>
          )}

          <button
            onClick={join}
            disabled={code.length !== 6 || loading}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Joining…" : "Join circle"}
          </button>
        </div>
      </main>
    </div>
  );
}
