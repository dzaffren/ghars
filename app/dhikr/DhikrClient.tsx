"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type DhikrType = "subhan" | "alhamd" | "akbar";

const DHIKR = [
  {
    type: "subhan" as DhikrType,
    arabic: "سُبْحَانَ اللَّه",
    transliteration: "SubhanAllah",
    meaning: "Glory be to Allah",
    target: 33,
    color: "#2d6a4f",
  },
  {
    type: "alhamd" as DhikrType,
    arabic: "الْحَمْدُ لِلَّه",
    transliteration: "Alhamdulillah",
    meaning: "All praise is to Allah",
    target: 33,
    color: "#1a3a2a",
  },
  {
    type: "akbar" as DhikrType,
    arabic: "اللَّهُ أَكْبَر",
    transliteration: "Allahu Akbar",
    meaning: "Allah is the Greatest",
    target: 34,
    color: "#d4a017",
  },
] as const;

interface Props {
  initial: {
    subhan: number;
    alhamd: number;
    akbar: number;
    completed: boolean;
  };
  localDate: string;
}

export default function DhikrClient({ initial, localDate }: Props) {
  const [counts, setCounts] = useState(initial);
  const [tapping, setTapping] = useState<DhikrType | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);

  async function tap(type: DhikrType) {
    if (counts.completed) return;
    const d = DHIKR.find((d) => d.type === type)!;
    if (counts[type] >= d.target) return;

    setTapping(type);
    setTimeout(() => setTapping(null), 180);

    const res = await fetch("/api/dhikr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, localDate }),
    });
    const data = await res.json();
    setCounts({
      subhan: data.subhan,
      alhamd: data.alhamd,
      akbar: data.akbar,
      completed: data.completed,
    });
    if (data.justCompleted) setJustCompleted(true);
  }

  const totalDone = counts.subhan + counts.alhamd + counts.akbar;
  const totalTarget = 33 + 33 + 34; // 100

  return (
    <div className="w-full space-y-5">
      {/* Overall progress arc */}
      <div className="flex flex-col items-center gap-1">
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="var(--cream-deep)"
              strokeWidth="8"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#2d6a4f"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              animate={{
                strokeDashoffset:
                  2 * Math.PI * 42 * (1 - totalDone / totalTarget),
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-[#1a3a2a]">
              {totalDone}
            </span>
            <span className="text-[10px] text-muted-foreground">
              / {totalTarget}
            </span>
          </div>
        </div>
        {counts.completed && (
          <p className="text-xs font-medium text-primary">
            +3 growth points earned ✦
          </p>
        )}
      </div>

      {/* Three dhikr counters */}
      {DHIKR.map((d) => {
        const count = counts[d.type];
        const done = count >= d.target;
        const pct = Math.min(1, count / d.target);

        return (
          <motion.button
            key={d.type}
            onClick={() => tap(d.type)}
            disabled={counts.completed || done}
            className={`w-full rounded-2xl border p-5 text-left transition-colors active:scale-[0.98] select-none ${
              done
                ? "border-primary/30 bg-[var(--green-fog)] cursor-default"
                : "border-[var(--green-fog)] bg-white/80 hover:shadow-[0_4px_20px_-4px_rgba(45,106,79,0.14)]"
            }`}
            animate={tapping === d.type ? { scale: 0.96 } : { scale: 1 }}
            transition={{ duration: 0.12 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p
                  className="arabic-text mb-0.5 leading-none"
                  style={{
                    fontSize: "1.4rem",
                    color: done ? "#2d6a4f" : d.color,
                  }}
                >
                  {d.arabic}
                </p>
                <p className="text-xs font-medium text-[var(--ink-soft)]">
                  {d.transliteration}
                </p>
                <p className="text-[11px] text-muted-foreground">{d.meaning}</p>
              </div>
              <div className="text-right">
                <span
                  className={`text-2xl font-bold tabular-nums ${done ? "text-primary" : "text-[#1a3a2a]"}`}
                >
                  {count}
                </span>
                <span className="text-sm text-muted-foreground">
                  /{d.target}
                </span>
                {done && <p className="text-xs text-primary mt-0.5">✓</p>}
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 rounded-full bg-[var(--cream-deep)] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                animate={{ width: `${pct * 100}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          </motion.button>
        );
      })}

      {/* Completion message */}
      <AnimatePresence>
        {counts.completed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-[var(--green-fog)] border border-primary/20 px-5 py-4 text-center space-y-1"
          >
            <p className="arabic-text text-xl text-[#1a3a2a]">
              بَارَكَ اللَّهُ فِيكَ
            </p>
            <p className="text-xs text-[var(--ink-soft)]">
              May Allah bless you — 100 done today.
            </p>
            {justCompleted && (
              <p className="text-xs font-medium text-primary">
                Your garden grew +3 points.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
