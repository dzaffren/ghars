"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GradientCard } from "@/components/ui/gradient-card";

interface Props {
  arabic: string;
  translation: string;
  surah_name: string;
  ayah_number: number;
  audio_url: string;
  tafsir_extract: string | null;
  onExpandTafsir: () => void;
}

export function AyahCard({
  arabic,
  translation,
  surah_name,
  ayah_number,
  audio_url,
  tafsir_extract,
  onExpandTafsir,
}: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTafsir, setShowTafsir] = useState(false);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  }

  function onTimeUpdate() {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgress((audio.currentTime / audio.duration) * 100);
  }

  return (
    <GradientCard className="w-full">
      <div className="flex flex-col gap-3 px-5 py-4 text-white">
        <p className="text-xs opacity-50">
          Verse {surah_name} · {ayah_number}
        </p>

        <p
          className="text-2xl leading-loose text-right text-white"
          dir="rtl"
          lang="ar"
          translate="no"
          data-testid="ayah-arabic"
        >
          {arabic}
        </p>

        <p
          className="text-sm leading-relaxed text-white/90"
          data-testid="ayah-translation"
        >
          {translation}
        </p>

        <div className="flex items-center gap-3">
          {audio_url && (
            <button
              onClick={togglePlay}
              className="flex items-center gap-1.5 rounded-full border border-white/20 px-2.5 py-1 text-xs text-white/85 transition-colors hover:bg-white/10 hover:text-white"
              data-testid="audio-play"
              aria-label={playing ? "Pause recitation" : "Play recitation"}
            >
              <span className="text-[10px] leading-none">
                {playing ? "⏸" : "▶"}
              </span>
              <span className="leading-none">Listen</span>
            </button>
          )}
          {audio_url && progress > 0 && (
            <div className="h-1 w-16 rounded-full bg-white/15">
              <div
                className="h-1 rounded-full bg-white/70"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          {tafsir_extract && (
            <button
              onClick={() => setShowTafsir((v) => !v)}
              className="text-xs text-white/75 transition-colors hover:text-white"
              data-testid={showTafsir ? "tafsir-hide" : "tafsir-reveal"}
            >
              {showTafsir ? "Hide tafsir" : "See tafsir"}
            </button>
          )}
          {audio_url && (
            <audio
              ref={audioRef}
              src={audio_url}
              onTimeUpdate={onTimeUpdate}
              onEnded={() => setPlaying(false)}
            />
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {showTafsir && (
          <motion.div
            key="tafsir"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.2, delay: 0.05 },
            }}
            className="overflow-hidden border-t border-white/10"
          >
            <div className="px-5 py-3 text-sm leading-relaxed text-white/70">
              <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-white/65">
                Ibn Kathir · ayah {ayah_number}
              </p>
              <p data-testid="tafsir-extract">{tafsir_extract}</p>
              <button
                onClick={onExpandTafsir}
                className="mt-2 text-xs text-white/80 underline underline-offset-2 hover:text-white"
                data-testid="tafsir-full-trigger"
              >
                Read full tafsir
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GradientCard>
  );
}
