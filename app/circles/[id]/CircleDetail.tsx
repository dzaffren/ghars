"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Copy, Check, Link2, Wind, Flame } from "lucide-react";
import type { TreeState } from "@/components/GardenTree";

const GardenTree = dynamic(() => import("@/components/GardenTree"), {
  ssr: false,
});

interface Member {
  userId: string;
  displayName: string;
  isYou: boolean;
  isOwner: boolean;
  garden: { growthPoints: number; currentStreak: number; wilting: boolean };
}

interface Circle {
  id: string;
  name: string;
  owner_id: string;
}

interface Props {
  circle: Circle;
  members: Member[];
  currentUserId: string;
}

const STAGE_LABELS = ["Seed", "Sprout", "Small plant", "Flowering", "Fruiting"];
function stageLabel(pts: number) {
  if (pts >= 50) return STAGE_LABELS[4];
  if (pts >= 25) return STAGE_LABELS[3];
  if (pts >= 10) return STAGE_LABELS[2];
  if (pts >= 3) return STAGE_LABELS[1];
  return STAGE_LABELS[0];
}

function InviteButton({ circleId }: { circleId: string }) {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/circles/${circleId}/invite`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.code) {
        setError(data.error ?? "Could not generate invite code.");
        return;
      }
      setCode(data.code);
    } catch {
      setError("Could not generate invite code.");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (code) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-[var(--green-fog)] px-4 py-3">
        <span className="flex-1 font-mono text-lg font-bold tracking-[0.3em] text-primary">
          {code}
        </span>
        <button
          onClick={copy}
          className="rounded-lg p-1.5 hover:bg-primary/10 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <Check size={16} className="text-primary" />
          ) : (
            <Copy size={16} className="text-primary/60" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={generate}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--green-fog)] py-3 text-sm font-medium text-[var(--ink-soft)] hover:bg-[var(--green-fog)] transition-colors disabled:opacity-50"
      >
        <Link2 size={14} />
        {loading ? "Generating…" : "Get invite code"}
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default function CircleDetail({
  circle,
  members,
  currentUserId,
}: Props) {
  const isOwner = circle.owner_id === currentUserId;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-[#1a3a2a]">{circle.name}</h1>
        <p className="text-xs text-muted-foreground">
          {members.length} of 5 members
        </p>
      </div>

      {/* Invite code (owner only) */}
      {isOwner && members.length < 5 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)]/60">
            Invite someone
          </p>
          <InviteButton circleId={circle.id} />
          <p className="text-[10px] text-muted-foreground">
            Code expires in 7 days. Share it privately — anyone with the code
            can join.
          </p>
        </div>
      )}

      {/* Member grid */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)]/60">
          Members
        </p>
        {members.map((member) => {
          const treeState: TreeState = {
            growthPoints: member.garden.growthPoints,
            currentStreak: member.garden.currentStreak,
            wilting: member.garden.wilting,
          };
          return (
            <div
              key={member.userId}
              className={`flex items-center gap-4 rounded-2xl border px-4 py-4 ${
                member.isYou
                  ? "border-primary/30 bg-[var(--green-fog)]"
                  : "border-[var(--green-fog)] bg-white/80"
              }`}
            >
              {/* Mini plant */}
              <div className="shrink-0">
                <GardenTree state={treeState} size={72} />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#1a3a2a] truncate">
                    {member.displayName}
                    {member.isYou && (
                      <span className="ml-1 text-[10px] font-normal text-primary/60">
                        (you)
                      </span>
                    )}
                  </p>
                  {member.isOwner && (
                    <span className="text-[10px] text-primary/50">✦ owner</span>
                  )}
                </div>
                <p className="text-xs text-[var(--ink-soft)]/70 mt-0.5 flex items-center gap-1">
                  <span>{stageLabel(member.garden.growthPoints)}</span>
                  {member.garden.wilting && (
                    <span className="flex items-center gap-1">
                      <span>·</span>
                      <Wind size={12} className="inline" />
                      <span>wilting</span>
                    </span>
                  )}
                </p>
                <div className="mt-1.5 flex items-center gap-3">
                  <span className="text-xs font-medium text-primary flex items-center gap-1">
                    <Flame size={12} className="inline" />
                    {member.garden.currentStreak} streak
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {member.garden.growthPoints} pts
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Privacy note */}
      <p className="text-center text-[10px] text-muted-foreground/50">
        Only garden progress is shared — reflections are always private.
      </p>
    </div>
  );
}
