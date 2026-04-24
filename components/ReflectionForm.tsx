"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  missionId: string;
  onAccepted: (result: { growthPoints: number; currentStreak: number }) => void;
}

export default function ReflectionForm({ missionId, onAccepted }: Props) {
  const [text, setText] = useState("");
  const [photoPath] = useState<string | undefined>();
  const [state, setState] = useState<"idle" | "submitting" | "nudge" | "accepted">("idle");
  const [feedback, setFeedback] = useState("");

  async function submit() {
    if (!text.trim() || state === "submitting") return;
    setState("submitting");

    const res = await fetch("/api/reflection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ missionId, reflectionText: text, photoPath }),
    });

    const data = await res.json();

    if (!res.ok) {
      setFeedback(data.error ?? "Something went wrong.");
      setState("nudge");
      return;
    }

    setFeedback(data.feedback ?? "");

    if (data.verdict === "accepted") {
      setState("accepted");
      onAccepted({ growthPoints: data.growthPoints, currentStreak: data.currentStreak });
    } else {
      setState("nudge");
    }
  }

  if (state === "accepted") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <div className="text-5xl mb-3">🌱</div>
        <h3 className="text-lg font-semibold text-[#1b4332]">Mission complete!</h3>
        {feedback && <p className="text-sm text-[#555] mt-2 max-w-xs mx-auto">{feedback}</p>}
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-sm font-medium text-[#2d6a4f]">
          How did you apply today&apos;s verse?
        </span>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (state === "nudge") setState("idle");
          }}
          rows={4}
          placeholder="Share what you did, felt, or noticed today..."
          className="mt-1.5 w-full rounded-xl border border-[#52b788]/40 bg-white px-4 py-3 text-sm text-[#1a1a1a] placeholder-[#aaa] focus:border-[#2d6a4f] focus:outline-none focus:ring-1 focus:ring-[#2d6a4f] resize-none"
        />
      </label>

      <AnimatePresence>
        {state === "nudge" && feedback && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800"
          >
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={submit}
        disabled={!text.trim() || state === "submitting"}
        className="w-full rounded-xl bg-[#2d6a4f] text-white font-medium py-3 px-6 hover:bg-[#1b4332] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {state === "submitting" ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Reflecting…
          </span>
        ) : state === "nudge" ? (
          "Try again"
        ) : (
          "Submit reflection"
        )}
      </button>
    </div>
  );
}
