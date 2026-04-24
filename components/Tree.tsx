"use client";

import { motion, AnimatePresence } from "framer-motion";

export interface TreeState {
  growthPoints: number;
  currentStreak: number;
  wilting: boolean;
}

// Growth stages: 0-4 based on growth_points
function getStage(points: number): 0 | 1 | 2 | 3 | 4 {
  if (points >= 50) return 4;
  if (points >= 25) return 3;
  if (points >= 10) return 2;
  if (points >= 3) return 1;
  return 0;
}

function getLeafColor(wilting: boolean, streak: number): string {
  if (wilting) return "#8a9e80";
  if (streak >= 14) return "#1b4332";
  if (streak >= 7) return "#2d6a4f";
  if (streak >= 3) return "#40916c";
  return "#52b788";
}

interface Props {
  state: TreeState;
  className?: string;
}

export default function Tree({ state, className = "" }: Props) {
  const stage = getStage(state.growthPoints);
  const leafColor = getLeafColor(state.wilting, state.currentStreak);
  const trunkColor = state.wilting ? "#8a7055" : "#6b4c2a";

  return (
    <motion.div
      className={`flex items-end justify-center ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <svg
        viewBox="0 0 200 240"
        width="200"
        height="240"
        aria-label={`Tree at growth stage ${stage + 1} of 5${state.wilting ? ", wilting" : ""}`}
      >
        {/* Ground */}
        <ellipse cx="100" cy="225" rx="60" ry="8" fill="#d4b896" opacity="0.5" />

        {/* Trunk */}
        <AnimatePresence>
          {stage >= 0 && (
            <motion.rect
              key="trunk"
              x="92"
              y={220 - stageTrunkHeight[stage]}
              width="16"
              height={stageTrunkHeight[stage]}
              rx="4"
              fill={trunkColor}
              initial={{ scaleY: 0, originY: 1 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

        {/* Branches (stage 2+) */}
        <AnimatePresence>
          {stage >= 2 && (
            <motion.g
              key="branches"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <line x1="100" y1="160" x2="70" y2="135" stroke={trunkColor} strokeWidth="6" strokeLinecap="round" />
              <line x1="100" y1="155" x2="130" y2="130" stroke={trunkColor} strokeWidth="6" strokeLinecap="round" />
              {stage >= 3 && (
                <>
                  <line x1="100" y1="130" x2="65" y2="105" stroke={trunkColor} strokeWidth="5" strokeLinecap="round" />
                  <line x1="100" y1="125" x2="135" y2="100" stroke={trunkColor} strokeWidth="5" strokeLinecap="round" />
                </>
              )}
            </motion.g>
          )}
        </AnimatePresence>

        {/* Foliage blobs */}
        <AnimatePresence>
          {stageLeafGroups[stage].map((leaf, i) => (
            <motion.ellipse
              key={`${stage}-${i}`}
              cx={leaf.cx}
              cy={leaf.cy}
              rx={leaf.rx}
              ry={leaf.ry}
              fill={leafColor}
              opacity={state.wilting ? 0.6 : 0.9}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: state.wilting ? 0.6 : 0.9,
                cy: state.wilting ? leaf.cy + 3 : leaf.cy,
              }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
              style={{ transformOrigin: `${leaf.cx}px ${leaf.cy}px` }}
            />
          ))}
        </AnimatePresence>

        {/* Fruit dots (stage 4, streak 7+) */}
        {stage === 4 && !state.wilting && state.currentStreak >= 7 && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {fruitDots.map((d, i) => (
              <circle key={i} cx={d.cx} cy={d.cy} r={4} fill="#d4a017" />
            ))}
          </motion.g>
        )}

        {/* Wilting droop indicator */}
        {state.wilting && (
          <motion.text
            x="100"
            y="20"
            textAnchor="middle"
            fontSize="18"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            🍂
          </motion.text>
        )}
      </svg>
    </motion.div>
  );
}

const stageTrunkHeight: Record<0 | 1 | 2 | 3 | 4, number> = {
  0: 20,
  1: 40,
  2: 60,
  3: 80,
  4: 95,
};

const stageLeafGroups: Record<0 | 1 | 2 | 3 | 4, Array<{ cx: number; cy: number; rx: number; ry: number }>> = {
  0: [],
  1: [{ cx: 100, cy: 175, rx: 22, ry: 18 }],
  2: [
    { cx: 100, cy: 155, rx: 30, ry: 24 },
    { cx: 72, cy: 128, rx: 20, ry: 16 },
    { cx: 128, cy: 123, rx: 20, ry: 16 },
  ],
  3: [
    { cx: 100, cy: 140, rx: 35, ry: 28 },
    { cx: 68, cy: 115, rx: 26, ry: 20 },
    { cx: 132, cy: 110, rx: 26, ry: 20 },
    { cx: 67, cy: 90, rx: 20, ry: 16 },
    { cx: 133, cy: 85, rx: 20, ry: 16 },
  ],
  4: [
    { cx: 100, cy: 125, rx: 42, ry: 35 },
    { cx: 65, cy: 100, rx: 30, ry: 24 },
    { cx: 135, cy: 95, rx: 30, ry: 24 },
    { cx: 62, cy: 72, rx: 24, ry: 20 },
    { cx: 138, cy: 68, rx: 24, ry: 20 },
    { cx: 100, cy: 65, rx: 28, ry: 22 },
  ],
};

const fruitDots = [
  { cx: 82, cy: 115 },
  { cx: 118, cy: 108 },
  { cx: 100, cy: 95 },
  { cx: 70, cy: 88 },
  { cx: 130, cy: 82 },
];
