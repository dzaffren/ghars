"use client";

import { GradientCard } from "@/components/ui/gradient-card";

interface Props {
  ayahInsight: string;
  noticing: string;
  verseKey: string;
  surahName?: string;
  ayahNumber?: number;
  showDisclosure?: boolean;
  onPlantTree?: () => void;
}

export function AnswerCard({
  ayahInsight,
  noticing,
  verseKey,
  surahName,
  ayahNumber,
  showDisclosure,
  onPlantTree,
}: Props) {
  const heading =
    surahName && ayahNumber ? `${surahName} · ${ayahNumber}` : verseKey;

  return (
    <GradientCard className="w-full">
      <div
        className="flex flex-col gap-4 px-5 py-5 text-white"
        data-testid="answer-card"
      >
        <p className="text-[10px] uppercase tracking-widest text-white/55">
          {heading}
        </p>

        <p
          className="text-base leading-relaxed text-white"
          data-testid="answer-ayah-insight"
        >
          {ayahInsight}
        </p>

        <div
          className="flex flex-col gap-1.5 rounded-xl bg-white/10 px-4 py-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}
        >
          <p className="text-[10px] font-medium uppercase tracking-wide text-white/65">
            What I noticed
          </p>
          <p
            className="text-sm leading-relaxed text-white/90"
            data-testid="answer-noticing"
          >
            {noticing}
          </p>
        </div>

        {onPlantTree && (
          <button
            onClick={onPlantTree}
            className="w-full rounded-xl bg-white/90 py-3 text-sm font-semibold text-[#1a3a2a] transition-colors hover:bg-white"
            data-testid="plant-tree-btn"
          >
            Plant today&apos;s tree
          </button>
        )}

        {showDisclosure && (
          <p className="text-[10px] italic leading-relaxed text-white/50">
            Your reflections are sent to an AI service to generate this note.
            They are not used for anything else.
          </p>
        )}
      </div>
    </GradientCard>
  );
}
