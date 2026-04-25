"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Send } from "lucide-react";

interface Props {
  missionId: string;
  onAccepted: (result: {
    growthPoints: number;
    currentStreak: number;
    nextStep?: string;
  }) => void;
}

export default function ReflectionForm({ missionId, onAccepted }: Props) {
  const [text, setText] = useState("");
  const [photoPath] = useState<string | undefined>();
  const [state, setState] = useState<
    "idle" | "submitting" | "nudge" | "accepted"
  >("idle");
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
      onAccepted({
        growthPoints: data.growthPoints,
        currentStreak: data.currentStreak,
        nextStep: data.nextStep,
      });
    } else {
      setState("nudge");
    }
  }

  // "accepted" state: TodayClient.handleAccepted sets completed=true and
  // renders the success block itself — return null here to avoid a flash.
  if (state === "accepted") return null;

  return (
    <motion.div layout className="space-y-3">
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-primary">
          How did you apply today&apos;s verse?
        </span>
        <Textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (state === "nudge") setState("idle");
          }}
          rows={5}
          className="min-h-[140px] border-[var(--green-fog)] focus-visible:border-[var(--green-mid)] resize-none"
          placeholder="Share what you did, felt, or noticed today..."
        />
        <div className="flex justify-between text-xs px-0.5">
          <span className="text-[var(--ink-soft)]/70">
            ~20 chars helps the model understand
          </span>
          <span
            className={
              text.length < 20
                ? "text-[var(--ink-soft)]/50 tabular-nums"
                : "text-primary/80 tabular-nums"
            }
          >
            {text.length}
          </span>
        </div>
      </label>

      <AnimatePresence>
        {state === "nudge" && feedback && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Alert variant="warning">
              <AlertDescription>{feedback}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={submit}
        disabled={!text.trim() || state === "submitting"}
        className="w-full rounded-xl gap-2 group"
        size="lg"
      >
        {state === "submitting" ? (
          <>
            <Loader2 className="animate-spin" />
            Reflecting…
          </>
        ) : state === "nudge" ? (
          "Try again"
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
