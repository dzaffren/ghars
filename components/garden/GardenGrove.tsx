"use client";

import dynamic from "next/dynamic";
import SpeciesPlant, { type Species } from "./SpeciesPlant";

const GardenTree = dynamic(() => import("@/components/GardenTree"), {
  ssr: false,
});

// ── Types ─────────────────────────────────────────────────────────

interface GardenPlantState {
  growthPoints: number;
  currentStreak: number;
  wilting: boolean;
}

interface PlantSlot {
  species: Species;
  stage: 1 | 2 | 3 | 4 | 5;
  wordsTowardNextStage: number;
  unlocked: boolean;
}

interface Props {
  gardenState: GardenPlantState;
  plants: PlantSlot[];
  lockedCount: number;
  isVerified?: boolean;
  knownWordCount: number;
  nextUnlockThreshold: number;
}

// ── Locked slot placeholder ───────────────────────────────────────

function LockedSlot({ label }: { label: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 opacity-40 grayscale"
      style={{ width: 120, height: 120 }}
      aria-label={`Locked plant slot: ${label}`}
    >
      <div
        className="rounded-full bg-gray-300 flex items-center justify-center"
        style={{ width: 72, height: 72 }}
      >
        <span className="text-3xl select-none" aria-hidden="true">
          🌿
        </span>
      </div>
      <span className="text-xs text-center text-gray-500 font-medium leading-tight px-1">
        {label}
      </span>
    </div>
  );
}

// ── GardenGrove ───────────────────────────────────────────────────

export default function GardenGrove({
  gardenState,
  plants,
  lockedCount,
  isVerified = false,
  knownWordCount,
  nextUnlockThreshold,
}: Props) {
  const wordsNeeded = Math.max(0, nextUnlockThreshold - knownWordCount);

  return (
    <div
      className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
      role="region"
      aria-label="Garden grove"
    >
      {/* Reflection plant (the existing GardenTree) */}
      <div className="flex-none flex flex-col items-center gap-1">
        <GardenTree state={gardenState} size={140} isVerified={isVerified} />
      </div>

      {/* Unlocked species plants */}
      {plants.map((plant) => (
        <div
          key={plant.species}
          className="flex-none flex flex-col items-center gap-1"
        >
          <SpeciesPlant
            species={plant.species}
            stage={plant.stage}
            size={120}
            isVerified={isVerified}
          />
        </div>
      ))}

      {/* Locked placeholder slots */}
      {lockedCount > 0 && (
        <div className="flex-none flex flex-col items-center justify-center">
          <LockedSlot
            label={
              wordsNeeded > 0 ? `${wordsNeeded} words to unlock` : "Locked"
            }
          />
        </div>
      )}
      {lockedCount > 1 &&
        Array.from({ length: lockedCount - 1 }).map((_, i) => (
          <div
            key={i}
            className="flex-none flex flex-col items-center justify-center"
          >
            <LockedSlot label="Locked" />
          </div>
        ))}
    </div>
  );
}
