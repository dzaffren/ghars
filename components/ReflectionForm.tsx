"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Send } from "lucide-react";
import MarkerReveal from "@/components/MarkerReveal";
import type { MarkerBundle } from "@/lib/llm/types";

// ReflectionForm v2 — wired to the five-marker judge.
//
// State machine:
//   idle       — textarea + submit button (default)
//   submitting — spinner, form locked
//   pending    — judge outage; neutral banner below the submitted text
//   scored     — happy path; inline MarkerReveal below the submitted text
//
// The `nudge` / `accepted` dichotomy from v1 is gone. Every reflection is
// accepted; missing markers never block the user or trigger a retry.

interface ScoredResult {
  status: "scored";
  markerCount: number;
  markers: MarkerBundle;
  growthPoints: number;
  pointsEarned: number;
  currentStreak: number;
}

interface PendingResult {
  status: "pending";
  pendingMessage: string;
  growthPoints: number;
  pointsEarned: number;
  currentStreak: number;
}

interface Props {
  missionId: string;
  onScored: (result: ScoredResult) => void;
  onPending: (result: PendingResult) => void;
}

type FormState = "idle" | "submitting" | "pending" | "scored";

export default function ReflectionForm({
  missionId,
  onScored,
  onPending,
}: Props) {
  const [text, setText] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [scored, setScored] = useState<ScoredResult | null>(null);
  const [pending, setPending] = useState<PendingResult | null>(null);

  async function submit() {
    if (!text.trim() || state === "submitting") return;
    setState("submitting");
    setErrorMessage("");

    let res: Response;
    try {
      res = await fetch("/api/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId, reflectionText: text }),
      });
    } catch {
      // Network-level failure — no response body. Stay in idle so the user
      // can retry with the same text.
      setErrorMessage(
        "We couldn't reach the server. Check your connection and try again."
      );
      setState("idle");
      return;
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setErrorMessage(
        typeof data.error === "string"
          ? data.error
          : "Something went wrong. Try again."
      );
      setState("idle");
      return;
    }

    // Successful response is either 'scored' or 'pending'. The orchestrator
    // never returns anything else on a 2xx; fall through to scored for
    // forward-compat (new status values would still grow the plant).
    if (data.status === "pending") {
      const result: PendingResult = {
        status: "pending",
        pendingMessage: data.pendingMessage,
        growthPoints: data.growthPoints,
        pointsEarned: data.pointsEarned,
        currentStreak: data.currentStreak,
      };
      setPending(result);
      setState("pending");
      onPending(result);
      return;
    }

    const result: ScoredResult = {
      status: "scored",
      markerCount: data.markerCount,
      markers: data.markers,
      growthPoints: data.growthPoints,
      pointsEarned: data.pointsEarned,
      currentStreak: data.currentStreak,
    };
    setScored(result);
    setState("scored");
    onScored(result);
  }

  // Scored state — show the user's submitted text (read-only) above the
  // MarkerReveal. TodayClient's success block also renders a MarkerReveal,
  // but the one here animates in immediately after the submission.
  if (state === "scored" && scored) {
    return (
      <motion.div layout className="space-y-3" data-testid="reflection-scored">
        <div className="rounded-xl bg-white/10 px-4 py-3 text-sm leading-relaxed text-white/90">
          {text}
        </div>
        <div className="rounded-xl bg-white/8 px-4 py-4">
          <MarkerReveal
            markers={scored.markers}
            markerCount={scored.markerCount}
            animate={true}
          />
        </div>
      </motion.div>
    );
  }

  // Pending state — neutral banner only, no MarkerReveal. The user will
  // see a marker breakdown in the journal after lazy re-scoring.
  if (state === "pending" && pending) {
    return (
      <motion.div layout className="space-y-3">
        <div className="rounded-xl bg-white/10 px-4 py-3 text-sm leading-relaxed text-white/90">
          {text}
        </div>
        <div
          data-testid="pending-banner"
          className="rounded-xl bg-white/8 px-4 py-3 text-sm leading-relaxed text-white/90"
        >
          {pending.pendingMessage}
        </div>
      </motion.div>
    );
  }

  // idle / submitting — the editable form. The morning-intention prompt
  // (Story 2) will override the label; the default is spec's fallback
  // "What happened today?". ~20-char hint removed — the new judge rewards
  // concrete moments, not length.
  return (
    <motion.div layout className="space-y-3">
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-primary">
          What happened today?
        </span>
        <Textarea
          data-testid="reflection-textarea"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (errorMessage) setErrorMessage("");
          }}
          rows={5}
          className="min-h-[140px] resize-none border-[var(--green-fog)] focus-visible:border-[var(--green-mid)]"
          placeholder="Share what you did, felt, or noticed today..."
        />
        <div className="flex justify-end px-0.5 text-xs">
          <span
            className={
              text.length < 20
                ? "tabular-nums text-[var(--ink-soft)]/50"
                : "tabular-nums text-primary/80"
            }
          >
            {text.length}
          </span>
        </div>
      </label>

      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={submit}
        data-testid="reflection-submit"
        disabled={!text.trim() || state === "submitting"}
        className="group w-full gap-2 rounded-xl"
        size="lg"
      >
        {state === "submitting" ? (
          <>
            <Loader2 className="animate-spin" />
            Reflecting…
          </>
        ) : (
          <>
            Submit reflection
            <Send className="size-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </Button>
    </motion.div>
  );
}
