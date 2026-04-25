"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export interface TreeState {
  growthPoints: number;
  currentStreak: number;
  wilting: boolean;
}

type Stage = 0 | 1 | 2 | 3 | 4;

function getStage(points: number): Stage {
  if (points >= 50) return 4;
  if (points >= 25) return 3;
  if (points >= 10) return 2;
  if (points >= 3) return 1;
  return 0;
}

// ── SVG stage illustrations ──────────────────────────────────────
// All draw on a 120×140 viewBox. Soil base at y≈129.

function Soil() {
  return (
    <ellipse
      cx="60"
      cy="130"
      rx="24"
      ry="7"
      fill="#c8a97a"
      fillOpacity="0.45"
    />
  );
}

function Flower({
  cx,
  cy,
  small = false,
}: {
  cx: number;
  cy: number;
  small?: boolean;
}) {
  const dist = small ? 6 : 8;
  const pr = small ? 4.5 : 5.5;
  const angles = [0, 72, 144, 216, 288];
  return (
    <g>
      {angles.map((a, i) => (
        <circle
          key={i}
          cx={cx + Math.cos((a * Math.PI) / 180) * dist}
          cy={cy + Math.sin((a * Math.PI) / 180) * dist}
          r={pr}
          fill="#fce8e0"
        />
      ))}
      <circle cx={cx} cy={cy} r={small ? 3.5 : 4.5} fill="#f5c842" />
    </g>
  );
}

const STEM_GREEN = "#3a9c6e";
const LEAF_MID = "#52b788";
const LEAF_DARK = "#4f9472";

// Stage 0 — Seed: buried oval + tiny green peek
function PlantStage0() {
  return (
    <>
      <Soil />
      <ellipse
        cx="60"
        cy="121"
        rx="9.5"
        ry="6.5"
        fill="#7a5430"
        transform="rotate(-12 60 121)"
      />
      <line
        x1="60"
        y1="122"
        x2="60"
        y2="113"
        stroke={LEAF_MID}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </>
  );
}

// Stage 1 — Sprout: short stem + 2 small leaves
function PlantStage1() {
  return (
    <>
      <Soil />
      {/* Stem */}
      <path
        d="M60,128 Q58,112 60,92"
        stroke={STEM_GREEN}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* Left leaf */}
      <ellipse
        cx="48"
        cy="98"
        rx="14"
        ry="7.5"
        fill={LEAF_MID}
        transform="rotate(-45 48 98)"
      />
      {/* Right leaf */}
      <ellipse
        cx="72"
        cy="98"
        rx="14"
        ry="7.5"
        fill={LEAF_MID}
        transform="rotate(45 72 98)"
      />
    </>
  );
}

// Stage 2 — Small plant: taller stem + 4 leaves
function PlantStage2() {
  return (
    <>
      <Soil />
      {/* Main stem */}
      <path
        d="M60,128 Q57,106 60,70"
        stroke={STEM_GREEN}
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Lower branches */}
      <path
        d="M60,116 Q47,109 41,97"
        stroke={STEM_GREEN}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M60,102 Q73,95 79,83"
        stroke={STEM_GREEN}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Lower leaves */}
      <ellipse
        cx="40"
        cy="94"
        rx="15"
        ry="8"
        fill={LEAF_MID}
        transform="rotate(-35 40 94)"
      />
      <ellipse
        cx="80"
        cy="81"
        rx="15"
        ry="8"
        fill={LEAF_MID}
        transform="rotate(30 80 81)"
      />
      {/* Upper leaves */}
      <ellipse
        cx="52"
        cy="66"
        rx="12"
        ry="7"
        fill={LEAF_MID}
        transform="rotate(-20 52 66)"
      />
      <ellipse
        cx="68"
        cy="64"
        rx="12"
        ry="7"
        fill={LEAF_MID}
        transform="rotate(20 68 64)"
      />
    </>
  );
}

// Stage 3 — Flowering: tall stem + 4 leaves + 2 flowers
function PlantStage3() {
  return (
    <>
      <Soil />
      {/* Main stem */}
      <path
        d="M60,128 Q57,98 60,50"
        stroke={STEM_GREEN}
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Lower branches */}
      <path
        d="M60,116 Q46,108 40,95"
        stroke={STEM_GREEN}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M60,102 Q74,94 80,81"
        stroke={STEM_GREEN}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Upper branches */}
      <path
        d="M60,78 Q46,70 42,56"
        stroke={STEM_GREEN}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M60,66 Q74,58 78,44"
        stroke={STEM_GREEN}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* 4 leaves */}
      <ellipse
        cx="39"
        cy="92"
        rx="15"
        ry="8"
        fill={LEAF_MID}
        transform="rotate(-35 39 92)"
      />
      <ellipse
        cx="81"
        cy="79"
        rx="15"
        ry="8"
        fill={LEAF_MID}
        transform="rotate(30 81 79)"
      />
      <ellipse
        cx="41"
        cy="54"
        rx="12"
        ry="7"
        fill={LEAF_DARK}
        transform="rotate(-25 41 54)"
      />
      <ellipse
        cx="79"
        cy="42"
        rx="12"
        ry="7"
        fill={LEAF_DARK}
        transform="rotate(25 79 42)"
      />
      {/* Top bud cluster */}
      <ellipse cx="60" cy="46" rx="10" ry="7" fill={LEAF_MID} />
      {/* Flowers */}
      <Flower cx={42} cy={53} />
      <Flower cx={79} cy={41} />
    </>
  );
}

// Stage 4 — Fruiting: stage 3 + gold fruit
function PlantStage4() {
  return (
    <>
      <PlantStage3 />
      {/* Gold fruit dots */}
      <circle cx="37" cy="83" r="5.5" fill="#d4a017" />
      <circle cx="83" cy="71" r="5.5" fill="#d4a017" />
      <circle cx="60" cy="36" r="6.5" fill="#d4a017" />
    </>
  );
}

// ── Sparkle positions ────────────────────────────────────────────
const SPARKLE_CONFIG = [
  { angle: 0, cls: "sparkle-1", size: 12 },
  { angle: 45, cls: "sparkle-2", size: 9 },
  { angle: 90, cls: "sparkle-3", size: 11 },
  { angle: 135, cls: "sparkle-4", size: 8 },
  { angle: 180, cls: "sparkle-5", size: 12 },
  { angle: 225, cls: "sparkle-6", size: 9 },
  { angle: 270, cls: "sparkle-7", size: 11 },
  { angle: 315, cls: "sparkle-8", size: 8 },
];

// ── Main component ───────────────────────────────────────────────

interface Props {
  state: TreeState;
  size?: number;
  className?: string;
  isVerified?: boolean;
}

export default function GardenPlant({
  state,
  size = 240,
  className = "",
  isVerified = false,
}: Props) {
  const stage = getStage(state.growthPoints);
  const reduced = useReducedMotion();
  const sparkleRadius = size * 0.47;
  const center = size / 2;

  const svgW = Math.round(size * 0.72);
  const svgH = Math.round(size * 0.84);

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-label={`Garden plant at stage ${stage + 1} of 5${state.wilting ? ", wilting" : ""}`}
    >
      {/* ── Ambient glow halo (blurred radial, always-on) ── */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background: state.wilting
            ? "radial-gradient(circle, rgba(154,168,147,0.22) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(82,183,136,0.20) 15%, rgba(212,160,23,0.07) 55%, transparent 70%)",
          filter: "blur(20px)",
        }}
        animate={
          reduced
            ? {}
            : isVerified
              ? { opacity: [1, 1.4, 1], scale: [1, 1.08, 1] }
              : { opacity: [0.75, 1, 0.75] }
        }
        transition={
          isVerified
            ? { duration: 1.2, ease: "easeInOut" }
            : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
        }
      />

      {/* ── Sparkle glints (CSS animated) ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {SPARKLE_CONFIG.map(({ angle, cls, size: fs }) => {
          const rad = (angle * Math.PI) / 180;
          const x = center + Math.cos(rad) * sparkleRadius;
          const y = center + Math.sin(rad) * sparkleRadius;
          return (
            <span
              key={angle}
              className={`sparkle ${cls} absolute select-none`}
              style={{
                left: x,
                top: y,
                fontSize: fs,
                color: angle % 90 === 0 ? "#d4a017" : "#52b788",
                lineHeight: 1,
              }}
            >
              ✦
            </span>
          );
        })}
      </div>

      {/* ── Plant SVG with stage transition ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={reduced ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduced ? undefined : { opacity: 0, scale: 0.88 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative z-10 flex items-center justify-center"
          style={{
            filter: state.wilting
              ? "saturate(0.35) brightness(0.88)"
              : undefined,
          }}
        >
          <svg
            viewBox="0 0 120 140"
            width={svgW}
            height={svgH}
            aria-hidden="true"
            overflow="visible"
          >
            {stage === 0 && <PlantStage0 />}
            {stage === 1 && <PlantStage1 />}
            {stage === 2 && <PlantStage2 />}
            {stage === 3 && <PlantStage3 />}
            {stage === 4 && <PlantStage4 />}
          </svg>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
