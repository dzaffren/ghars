"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DidApply = "yes_fully" | "partly" | "not_today";

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
  verseKey,
  surahName,
  ayahNumber,
  existingReflectionId,
  existingDidApply,
  existingText,
  windowClosesAt,
}: Props) {
  const router = useRouter();
  const [didApply, setDidApply] = useState<DidApply | null>(
    existingDidApply ?? null
  );
  const [text, setText] = useState(existingText ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [syncStatus, setSyncStatus] = useState<
    "synced" | "retry_queued" | null
  >(null);

  const windowClosed = windowClosesAt
    ? new Date() >= new Date(windowClosesAt)
    : false;
  const canSubmit = didApply !== null && text.length >= 40 && !windowClosed;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    const url = existingReflectionId
      ? `/api/reflections/${existingReflectionId}`
      : "/api/reflections";
    const method = existingReflectionId ? "PATCH" : "POST";
    const body: Record<string, unknown> = { did_apply: didApply, text };
    if (!existingReflectionId) body.mission_id = missionId;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    setSubmitting(false);

    if (res.ok) {
      setSyncStatus(
        json.sync_status === "retry_queued" ? "retry_queued" : "synced"
      );
      setDone(true);
      setTimeout(() => router.push("/grove"), 1500);
    } else {
      alert(
        json.error?.message ?? "Could not save reflection. Please try again."
      );
    }
  }

  if (done) {
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

  if (windowClosed && existingText) {
    return (
      <div
        className="rounded-2xl p-6 shadow-sm"
        style={{ backgroundColor: "white" }}
      >
        <p
          className="text-xs uppercase tracking-widest mb-3"
          style={{ color: "var(--text-muted)" }}
        >
          Reflection (closed)
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
