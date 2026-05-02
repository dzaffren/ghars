"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnswerCard } from "../_components/AnswerCard";

type DidApply = "yes_fully" | "partly" | "not_today";

type Phase =
  | "idle"
  | "awaiting_answer"
  | "answer"
  | "fallen_through"
  | "planting";

interface AnswerPayload {
  ayah_insight: string;
  noticing: string;
  model: string;
  generated_at: string;
}

const ANSWER_TOTAL_TIMEOUT_MS = 8000;
const ANSWER_POLL_INTERVAL_MS = 1500;

interface Props {
  missionId: string;
  missionText: string;
  verseKey: string;
  surahName: string;
  ayahNumber: number;
  existingReflectionId?: string;
  existingDidApply?: DidApply;
  existingText?: string;
  windowClosesAt?: string;
}

export function ReflectView({
  missionId,
  missionText,
  surahName,
  ayahNumber,
  existingReflectionId,
  existingDidApply,
  existingText,
  windowClosesAt,
}: Props) {
  const router = useRouter();
  const [didApply, setDidApply] = useState<DidApply | null>(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [answer, setAnswer] = useState<AnswerPayload | null>(null);
  const [showDisclosure, setShowDisclosure] = useState(false);
  const [syncStatus, setSyncStatus] = useState<
    "synced" | "retry_queued" | null
  >(null);

  const alreadySubmitted = !!existingReflectionId;
  const windowClosed = windowClosesAt
    ? new Date() >= new Date(windowClosesAt)
    : false;
  const canSubmit =
    !alreadySubmitted &&
    didApply !== null &&
    text.length >= 40 &&
    !windowClosed;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    const res = await fetch("/api/reflections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mission_id: missionId,
        did_apply: didApply,
        text,
      }),
    });
    const json = await res.json();
    setSubmitting(false);

    if (res.ok) {
      setSyncStatus(
        json.sync_status === "retry_queued" ? "retry_queued" : "synced"
      );
      setPhase("awaiting_answer");
      startAnswerFlow(json.reflection_id);
    } else {
      alert(
        json.error?.message ?? "Could not save reflection. Please try again."
      );
    }
  }

  async function startAnswerFlow(reflectionId: string) {
    const deadline = Date.now() + ANSWER_TOTAL_TIMEOUT_MS;
    let payload: AnswerPayload | null = null;

    try {
      const first = await fetch(`/api/reflections/${reflectionId}/answer`, {
        method: "POST",
      });
      const body = (await first.json()) as {
        status?: "ready" | "pending" | "unavailable";
        answer?: AnswerPayload;
        poll_after_ms?: number;
      };

      if (body.status === "ready" && body.answer) {
        payload = body.answer;
      } else if (body.status === "pending") {
        const interval = body.poll_after_ms ?? ANSWER_POLL_INTERVAL_MS;
        while (Date.now() < deadline && !payload) {
          await new Promise((r) => setTimeout(r, interval));
          const poll = await fetch(`/api/reflections/${reflectionId}/answer`);
          const pj = (await poll.json()) as {
            status?: "ready" | "unavailable";
            answer?: AnswerPayload;
          };
          if (pj.status === "ready" && pj.answer) {
            payload = pj.answer;
            break;
          }
          if (pj.status === "unavailable") break;
        }
      }
    } catch {
      // fall through
    }

    if (payload) {
      setAnswer(payload);
      // Fire-and-forget disclosure check and flip.
      try {
        const me = await fetch("/api/users/me");
        if (me.ok) {
          const meJson = (await me.json()) as {
            answered_reflection_disclosure_seen?: boolean;
          };
          if (!meJson.answered_reflection_disclosure_seen) {
            setShowDisclosure(true);
            fetch("/api/users/me", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                answered_reflection_disclosure_seen: true,
              }),
            }).catch(() => {});
          }
        } else {
          // If the GET endpoint isn't wired up, show the disclosure and
          // optimistically mark it seen — the PATCH is idempotent.
          setShowDisclosure(true);
          fetch("/api/users/me", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              answered_reflection_disclosure_seen: true,
            }),
          }).catch(() => {});
        }
      } catch {
        /* disclosure is best-effort */
      }
      setPhase("answer");
    } else {
      setPhase("fallen_through");
      setTimeout(() => router.push("/today"), 1500);
    }
  }

  function handlePlantTree() {
    setPhase("planting");
    setTimeout(() => router.push("/today"), 1500);
  }

  if (phase === "awaiting_answer") {
    return (
      <div
        className="flex flex-col items-center gap-3 py-12"
        data-testid="answer-holding-state"
      >
        <div
          className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"
          style={{ color: "var(--grove-green-light)" }}
          aria-hidden
        />
        <p
          className="text-center text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Reflecting on your words…
        </p>
      </div>
    );
  }

  if (phase === "answer" && answer) {
    return (
      <AnswerCard
        ayahInsight={answer.ayah_insight}
        noticing={answer.noticing}
        verseKey={`${surahName} · ${ayahNumber}`}
        surahName={surahName}
        ayahNumber={ayahNumber}
        showDisclosure={showDisclosure}
        onPlantTree={handlePlantTree}
      />
    );
  }

  if (phase === "fallen_through" || phase === "planting") {
    return (
      <div
        className="flex flex-col items-center gap-4 py-12"
        data-testid="tree-growth-animation"
      >
        <div className="text-6xl">🌱</div>
        <p
          className="text-center font-medium"
          style={{ color: "var(--grove-green)" }}
        >
          {didApply === "not_today"
            ? "Honesty plants a sapling."
            : "Your tree has grown."}
        </p>
        {syncStatus === "retry_queued" && (
          <p
            className="text-xs text-center"
            style={{ color: "var(--text-muted)" }}
          >
            Saved locally — we&apos;ll sync when you&apos;re back online.
          </p>
        )}
      </div>
    );
  }

  if (alreadySubmitted) {
    const didApplyLabel =
      existingDidApply === "yes_fully"
        ? "Yes, fully"
        : existingDidApply === "partly"
          ? "Partly"
          : "Not today";
    return (
      <div
        className="rounded-2xl p-6 shadow-sm"
        style={{ backgroundColor: "white" }}
        data-testid="reflection-submitted"
      >
        <p
          className="text-xs uppercase tracking-widest mb-3"
          style={{ color: "var(--grove-green)" }}
        >
          Reflection submitted ✓
        </p>
        <p
          className="text-sm font-medium mb-2"
          style={{ color: "var(--grove-green)" }}
        >
          {surahName} · {ayahNumber}
        </p>
        <p
          className="text-sm italic mb-3"
          style={{ color: "var(--text-muted)" }}
        >
          {missionText}
        </p>
        <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
          Did you act on it? <strong>{didApplyLabel}</strong>
        </p>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--foreground)" }}
        >
          {existingText}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Reminder of the ayah + mission */}
      <div
        className="rounded-xl p-4 text-sm"
        style={{ backgroundColor: "#f0f7f4" }}
      >
        <p className="font-medium mb-1" style={{ color: "var(--grove-green)" }}>
          {surahName} · {ayahNumber}
        </p>
        <p style={{ color: "var(--text-muted)" }}>
          Your mission: {missionText}
        </p>
      </div>

      {/* Did you act on it? */}
      <div
        className="rounded-2xl p-6 shadow-sm"
        style={{ backgroundColor: "white" }}
      >
        <p
          className="text-sm font-semibold mb-4"
          style={{ color: "var(--foreground)" }}
        >
          Did you act on it?
        </p>
        <div className="flex flex-col gap-3">
          {(
            [
              ["yes_fully", "Yes, fully"],
              ["partly", "Partly"],
              ["not_today", "Not today"],
            ] as [DidApply, string][]
          ).map(([val, label]) => (
            <label key={val} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="did_apply"
                value={val}
                checked={didApply === val}
                onChange={() => setDidApply(val)}
                disabled={submitting || windowClosed}
                data-testid={`did-apply-${val}`}
              />
              <span className="text-sm" style={{ color: "var(--foreground)" }}>
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Reflection textarea */}
      <div
        className="rounded-2xl p-6 shadow-sm"
        style={{ backgroundColor: "white" }}
      >
        <p
          className="text-sm font-semibold mb-3"
          style={{ color: "var(--foreground)" }}
        >
          What happened?
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          maxLength={2000}
          placeholder="What did you try? What did it feel like? What did you learn?"
          className="w-full border rounded-lg p-3 text-sm resize-none"
          disabled={submitting || windowClosed}
          data-testid="reflection-textarea"
        />
        <div className="flex justify-between mt-1">
          <p
            className="text-xs"
            style={{
              color: text.length < 40 ? "#ef4444" : "var(--text-muted)",
            }}
          >
            {text.length < 40
              ? `${40 - text.length} more characters needed`
              : ""}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {text.length}/2000
          </p>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50"
        style={{ backgroundColor: "var(--grove-green)" }}
        data-testid="submit-reflection-btn"
      >
        {submitting ? "Saving…" : "Submit reflection"}
      </button>
    </div>
  );
}
