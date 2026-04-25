"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Plus, LogIn } from "lucide-react";

interface Circle {
  id: string;
  name: string;
  owner_id: string;
  memberCount: number;
}

interface Props {
  circles: Circle[];
  userId: string;
}

export default function CirclesList({ circles, userId }: Props) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function createCircle() {
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/circles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to create");
      setSaving(false);
      return;
    }
    router.push(`/circles/${data.circle.id}`);
  }

  return (
    <div className="space-y-4">
      {/* Circle cards */}
      {circles.length === 0 && !creating && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <Users size={36} className="text-muted-foreground/30" />
          <div>
            <p className="text-sm font-medium text-[var(--ink-soft)]">
              No circles yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Create one or join a friend&apos;s circle with an invite code.
            </p>
          </div>
        </div>
      )}

      {circles.map((c) => (
        <Link key={c.id} href={`/circles/${c.id}`}>
          <div className="flex items-center justify-between rounded-2xl border border-[var(--green-fog)] bg-white/80 px-4 py-4 shadow-[0_1px_8px_-4px_rgba(45,106,79,0.10)] hover:shadow-[0_4px_16px_-4px_rgba(45,106,79,0.14)] transition-shadow">
            <div>
              <p className="text-sm font-semibold text-[#1a3a2a]">{c.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {c.memberCount} member{c.memberCount !== 1 ? "s" : ""}
                {c.owner_id === userId ? " · you created this" : ""}
              </p>
            </div>
            <Users size={16} className="text-primary/50 shrink-0" />
          </div>
        </Link>
      ))}

      {/* Create form */}
      {creating ? (
        <div className="rounded-2xl border border-[var(--green-fog)] bg-white/80 p-4 space-y-3">
          <p className="text-sm font-medium text-[#1a3a2a]">Name your circle</p>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createCircle()}
            maxLength={40}
            placeholder="e.g. Family, Study buddies…"
            className="w-full rounded-xl border border-[var(--green-fog)] bg-[var(--cream)] px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={createCircle}
              disabled={!name.trim() || saving}
              className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {saving ? "Creating…" : "Create circle"}
            </button>
            <button
              onClick={() => {
                setCreating(false);
                setName("");
                setError("");
              }}
              className="rounded-xl border border-border px-4 py-2.5 text-sm text-[var(--ink-soft)] hover:bg-[var(--green-fog)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          {circles.length < 3 && (
            <button
              onClick={() => setCreating(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--green-fog)] py-3 text-sm font-medium text-primary hover:bg-[var(--green-fog)] transition-colors"
            >
              <Plus size={15} />
              Create circle
            </button>
          )}
          <Link
            href="/circles/join"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--green-fog)] py-3 text-sm font-medium text-[var(--ink-soft)] hover:bg-[var(--green-fog)] transition-colors"
          >
            <LogIn size={15} />
            Join with code
          </Link>
        </div>
      )}
    </div>
  );
}
