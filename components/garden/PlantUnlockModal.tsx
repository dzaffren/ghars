"use client";

import { motion, AnimatePresence } from "framer-motion";
import SpeciesPlant, { type Species } from "./SpeciesPlant";

interface Props {
  species: Species;
  onClose: () => void;
  isOpen: boolean;
}

const SPECIES_AYAH: Record<Species, { ref: string; text: string }> = {
  olive: { ref: "Quran 95:1", text: "By the fig and the olive" },
  palm: { ref: "Quran 55:68", text: "Therein are fruits, and date-palms" },
  fig: { ref: "Quran 95:1", text: "By the fig and the olive" },
  pomegranate: { ref: "Quran 55:68", text: "And pomegranates" },
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function PlantUnlockModal({ species, onClose, isOpen }: Props) {
  const ayah = SPECIES_AYAH[species];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Card */}
          <motion.div
            className="relative z-10 mx-4 w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {/* Plant illustration */}
            <div className="flex justify-center mb-4">
              <SpeciesPlant
                species={species}
                stage={1}
                size={180}
                isVerified={true}
              />
            </div>

            {/* Title */}
            <h2 className="text-center text-2xl font-bold text-gray-900 mb-1">
              {capitalize(species)} Tree Unlocked!
            </h2>
            <p className="text-center text-gray-600 mb-5">
              You&apos;ve unlocked the {capitalize(species)} tree!
            </p>

            {/* Ayah reference */}
            <div className="rounded-2xl bg-amber-50 border border-amber-100 px-5 py-4 mb-6 text-center">
              <p className="text-sm text-amber-800 italic mb-1">
                &ldquo;{ayah.text}&rdquo;
              </p>
              <p className="text-xs text-amber-600 font-medium">{ayah.ref}</p>
            </div>

            {/* Continue button */}
            <button
              onClick={onClose}
              className="w-full rounded-2xl bg-green-600 py-3 text-base font-semibold text-white shadow-sm hover:bg-green-700 active:bg-green-800 transition-colors"
            >
              Continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
