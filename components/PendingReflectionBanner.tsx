"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { MarkerBundle } from "@/lib/llm/types";

// Client-side banner shown on the reflection detail page when the
// underlying reflection is still `status='pending'` (judge was
// unavailable at submission time). Renders the fixed spec copy and a
// small retry button that hits POST /api/reflection/:id/rescore.
//
// The detail page passes `router.refresh()` as `onScored` so the server
// component re-renders with the newly-populated marker bundle. On a
// 503, we surface a soft inline message and let the user try again.

export interface PendingReflectionBannerProps {
  reflectionId: string;
  onScored?: (markers: MarkerBundle, markerCount: number) => void;
}

type UIState =
  | { kind: "idle" }
  | { kind: "retrying" }
  | { kind: "unavailable" };

export default function PendingReflectionBanner({
  reflectionId,
  onScored,
}: PendingReflectionBannerProps) {
  const [state, setState] = useState<UIState>({ kind: "idle" });

  async function retry() {
    setState({ kind: "retrying" });
    try {
      const res = await fetch(`/api/reflection/${reflectionId}/rescore`, {
        method: "POST",
      });
      if (res.status === 503) {
        setState({ kind: "unavailable" });
        return;
      }
      if (!res.ok) {
        // Any other non-ok (e.g. 409 ALREADY_SCORED) still means the
        // entry is no longer pending from our vantage point; surface a
        // refresh so the caller can pick up the fresh state.
        onScored?.(
          {} as MarkerBundle,
          0 /* caller should refresh from server */
        );
        return;
      }
      const data = (await res.json()) as {
        status: "scored";
        markerCount: number;
        markers: MarkerBundle;
      };
      onScored?.(data.markers, data.markerCount);
    } catch {
      setState({ kind: "unavailable" });
    }
  }

  return (
    <div
      data-testid="pending-banner"
      className="rounded-2xl border border-[var(--green-fog)] bg-[var(--cream-deep)] px-5 py-4 space-y-2"
    >
      <p className="text-sm font-medium text-[var(--ink-soft)]">
        5 markers pending — we&apos;ll score this when we&apos;re back online
      </p>
      <div className="flex items-center gap-3">
        <Button
          data-testid="pending-banner-retry"
          variant="outline"
          size="sm"
          onClick={retry}
          disabled={state.kind === "retrying"}
        >
          {state.kind === "retrying" ? "Retrying…" : "Retry"}
        </Button>
        {state.kind === "unavailable" && (
          <span className="text-xs text-muted-foreground">
            Still unavailable — try again shortly
          </span>
        )}
      </div>
    </div>
  );
}
