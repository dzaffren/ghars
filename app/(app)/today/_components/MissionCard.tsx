"use client";

import { useState } from "react";

interface Props {
  prompts: [string, string];
  mode: "pre_commit" | "committed";
  committed_text?: string;
  selectedPrompt: string;
  onSelect: (prompt: string, isCustom: boolean) => void;
  onCommit: () => Promise<void>;
  committing: boolean;
}

export function MissionCard({
  prompts,
  mode,
  committed_text,
  selectedPrompt,
  onSelect,
  onCommit,
  committing,
}: Props) {
  const [customText, setCustomText] = useState("");
  const [usingCustom, setUsingCustom] = useState(false);

  if (mode === "committed") {
    return (
      <div
        className="rounded-2xl p-6 shadow-sm"
        style={{ backgroundColor: "white" }}
      >
        <p
          className="text-xs uppercase tracking-widest mb-3"
          style={{ color: "var(--grove-green)" }}
        >
          Today&apos;s mission
        </p>
        <p
          className="text-base font-medium"
          style={{ color: "var(--foreground)" }}
        >
          {committed_text}
        </p>
        <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
          Committed ✓
        </p>
      </div>
    );
  }

  const canCommit = usingCustom
    ? customText.trim().length > 0
    : selectedPrompt.length > 0;

  return (
    <div
      className="rounded-2xl p-6 shadow-sm"
      style={{ backgroundColor: "white" }}
    >
      <p
        className="text-xs uppercase tracking-widest mb-4"
        style={{ color: "var(--grove-green)" }}
      >
        Choose your mission
      </p>
      <div className="flex flex-col gap-3 mb-4">
        {prompts.map((p, i) => (
          <label key={i} className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="mission"
              checked={!usingCustom && selectedPrompt === p}
              onChange={() => {
                setUsingCustom(false);
                onSelect(p, false);
              }}
              className="mt-1"
              data-testid={`mission-option-${i + 1}`}
            />
            <span
              className="text-sm leading-relaxed"
              style={{ color: "var(--foreground)" }}
            >
              {p}
            </span>
          </label>
        ))}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="radio"
            name="mission"
            checked={usingCustom}
            onChange={() => {
              setUsingCustom(true);
              onSelect(customText, true);
            }}
            className="mt-1"
          />
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            Write your own…
          </span>
        </label>
      </div>

      {usingCustom && (
        <div className="mb-4">
          <textarea
            value={customText}
            onChange={(e) => {
              setCustomText(e.target.value);
              onSelect(e.target.value, true);
            }}
            maxLength={280}
            rows={3}
            placeholder="What will you do today because of this ayah?"
            className="w-full border rounded-lg p-3 text-sm resize-none"
            data-testid="mission-custom-input"
          />
          <p
            className="text-xs text-right mt-1"
            style={{ color: "var(--text-muted)" }}
          >
            {customText.length}/280
          </p>
        </div>
      )}

      <button
        onClick={onCommit}
        disabled={!canCommit || committing}
        className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50"
        style={{ backgroundColor: "var(--grove-green)" }}
        data-testid="commit-button"
      >
        {committing ? "Committing…" : "Commit to this mission"}
      </button>
    </div>
  );
}
