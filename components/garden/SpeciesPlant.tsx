"use client";

import type React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export type Species = "olive" | "palm" | "fig" | "pomegranate";

interface Props {
  species: Species;
  stage: 1 | 2 | 3 | 4 | 5;
  size?: number;
  className?: string;
  isVerified?: boolean;
}

// ── Sparkle positions (mirrored from GardenPlant.tsx) ────────────
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

// ── Accent colours per species (for halo gradient) ───────────────
const HALO: Record<Species, string> = {
  olive: "rgba(122,158,104,0.20)",
  palm: "rgba(212,160,23,0.20)",
  fig: "rgba(122,79,122,0.20)",
  pomegranate: "rgba(212,74,42,0.20)",
};

// ── Soil base (shared) ────────────────────────────────────────────
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

// ══════════════════════════════════════════════════════════════════
// OLIVE  (trunk #7a5c38, leaves #7a9e68, olives #3d5a2b)
// ══════════════════════════════════════════════════════════════════
const OT = "#7a5c38";
const OL = "#7a9e68";
const OO = "#3d5a2b";

function OliveStage1() {
  return (
    <>
      <Soil />
      <rect x="57" y="110" width="6" height="20" rx="3" fill={OT} />
      <ellipse
        cx="48"
        cy="104"
        rx="11"
        ry="7"
        fill={OL}
        transform="rotate(-30 48 104)"
      />
      <ellipse
        cx="72"
        cy="104"
        rx="11"
        ry="7"
        fill={OL}
        transform="rotate(30 72 104)"
      />
    </>
  );
}

function OliveStage2() {
  return (
    <>
      <Soil />
      <rect x="57" y="90" width="6" height="40" rx="3" fill={OT} />
      <path
        d="M60,115 Q46,108 42,98"
        stroke={OT}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M60,105 Q74,98 78,88"
        stroke={OT}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse
        cx="41"
        cy="95"
        rx="12"
        ry="6.5"
        fill={OL}
        transform="rotate(-35 41 95)"
      />
      <ellipse
        cx="79"
        cy="86"
        rx="12"
        ry="6.5"
        fill={OL}
        transform="rotate(35 79 86)"
      />
      <ellipse
        cx="52"
        cy="83"
        rx="11"
        ry="6"
        fill={OL}
        transform="rotate(-20 52 83)"
      />
      <ellipse
        cx="68"
        cy="83"
        rx="11"
        ry="6"
        fill={OL}
        transform="rotate(20 68 83)"
      />
    </>
  );
}

function OliveStage3() {
  return (
    <>
      <Soil />
      <rect x="57" y="72" width="6" height="58" rx="3" fill={OT} />
      <path
        d="M60,120 Q44,112 38,100"
        stroke={OT}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M60,108 Q76,100 82,90"
        stroke={OT}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M60,90 Q44,82 40,70"
        stroke={OT}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M60,80 Q76,72 80,60"
        stroke={OT}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse
        cx="37"
        cy="97"
        rx="13"
        ry="7"
        fill={OL}
        transform="rotate(-35 37 97)"
      />
      <ellipse
        cx="83"
        cy="88"
        rx="13"
        ry="7"
        fill={OL}
        transform="rotate(35 83 88)"
      />
      <ellipse
        cx="39"
        cy="68"
        rx="12"
        ry="6.5"
        fill={OL}
        transform="rotate(-25 39 68)"
      />
      <ellipse
        cx="81"
        cy="58"
        rx="12"
        ry="6.5"
        fill={OL}
        transform="rotate(25 81 58)"
      />
      <ellipse
        cx="52"
        cy="64"
        rx="11"
        ry="6"
        fill={OL}
        transform="rotate(-15 52 64)"
      />
      <ellipse
        cx="68"
        cy="58"
        rx="11"
        ry="6"
        fill={OL}
        transform="rotate(15 68 58)"
      />
    </>
  );
}

function OliveStage4() {
  return (
    <>
      <OliveStage3 />
      <circle cx="36" cy="90" r="4" fill={OO} />
      <circle cx="84" cy="80" r="4" fill={OO} />
      <circle cx="44" cy="62" r="3.5" fill={OO} />
      <circle cx="78" cy="52" r="3.5" fill={OO} />
    </>
  );
}

function OliveStage5() {
  return (
    <>
      <OliveStage3 />
      {/* abundant olives */}
      <circle cx="34" cy="91" r="4.5" fill={OO} />
      <circle cx="40" cy="86" r="3.5" fill={OO} />
      <circle cx="84" cy="80" r="4.5" fill={OO} />
      <circle cx="82" cy="90" r="3.5" fill={OO} />
      <circle cx="44" cy="62" r="4" fill={OO} />
      <circle cx="50" cy="57" r="3" fill={OO} />
      <circle cx="78" cy="52" r="4" fill={OO} />
      <circle cx="72" cy="56" r="3" fill={OO} />
      <circle cx="60" cy="48" r="4.5" fill={OO} />
      <circle cx="55" cy="44" r="3" fill="#5a8040" />
    </>
  );
}

// ══════════════════════════════════════════════════════════════════
// PALM  (trunk #c8a46a, fronds #4a7c4e, dates #d4a017)
// ══════════════════════════════════════════════════════════════════
const PT = "#c8a46a";
const PF = "#4a7c4e";
const PD = "#d4a017";

function PalmStage1() {
  return (
    <>
      <Soil />
      <rect x="57" y="100" width="6" height="30" rx="2" fill={PT} />
      {/* simple frond marks on trunk */}
      <line
        x1="57"
        y1="112"
        x2="63"
        y2="110"
        stroke="#b8904a"
        strokeWidth="1"
      />
      <line
        x1="57"
        y1="118"
        x2="63"
        y2="116"
        stroke="#b8904a"
        strokeWidth="1"
      />
      {/* 2 drooping fronds */}
      <path
        d="M60,100 Q48,90 38,82"
        stroke={PF}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M60,100 Q72,90 82,82"
        stroke={PF}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* frond leaflets */}
      <ellipse
        cx="42"
        cy="84"
        rx="9"
        ry="4"
        fill={PF}
        transform="rotate(-20 42 84)"
      />
      <ellipse
        cx="78"
        cy="84"
        rx="9"
        ry="4"
        fill={PF}
        transform="rotate(20 78 84)"
      />
    </>
  );
}

function PalmStage2() {
  return (
    <>
      <Soil />
      <rect x="57" y="75" width="6" height="55" rx="2" fill={PT} />
      <line x1="57" y1="85" x2="63" y2="83" stroke="#b8904a" strokeWidth="1" />
      <line x1="57" y1="92" x2="63" y2="90" stroke="#b8904a" strokeWidth="1" />
      <line x1="57" y1="99" x2="63" y2="97" stroke="#b8904a" strokeWidth="1" />
      {/* 4 fronds */}
      <path
        d="M60,75 Q44,63 32,54"
        stroke={PF}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M60,75 Q76,63 88,54"
        stroke={PF}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M60,75 Q48,60 44,48"
        stroke={PF}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M60,75 Q72,60 76,48"
        stroke={PF}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse
        cx="36"
        cy="56"
        rx="10"
        ry="4.5"
        fill={PF}
        transform="rotate(-15 36 56)"
      />
      <ellipse
        cx="84"
        cy="56"
        rx="10"
        ry="4.5"
        fill={PF}
        transform="rotate(15 84 56)"
      />
      <ellipse
        cx="47"
        cy="46"
        rx="9"
        ry="4"
        fill={PF}
        transform="rotate(-30 47 46)"
      />
      <ellipse
        cx="73"
        cy="46"
        rx="9"
        ry="4"
        fill={PF}
        transform="rotate(30 73 46)"
      />
    </>
  );
}

function PalmStage3() {
  return (
    <>
      <Soil />
      <rect x="57" y="55" width="6" height="75" rx="2" fill={PT} />
      {[70, 80, 90, 100, 108, 118].map((y, i) => (
        <line
          key={i}
          x1="57"
          y1={y}
          x2="63"
          y2={y - 2}
          stroke="#b8904a"
          strokeWidth="1"
        />
      ))}
      {/* 6 fronds */}
      <path
        d="M60,55 Q40,38 24,28"
        stroke={PF}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M60,55 Q80,38 96,28"
        stroke={PF}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M60,55 Q44,38 38,24"
        stroke={PF}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M60,55 Q76,38 82,24"
        stroke={PF}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M60,55 Q52,36 50,20"
        stroke={PF}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M60,55 Q68,36 70,20"
        stroke={PF}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse
        cx="28"
        cy="29"
        rx="11"
        ry="4.5"
        fill={PF}
        transform="rotate(-10 28 29)"
      />
      <ellipse
        cx="92"
        cy="29"
        rx="11"
        ry="4.5"
        fill={PF}
        transform="rotate(10 92 29)"
      />
      <ellipse
        cx="41"
        cy="23"
        rx="9"
        ry="4"
        fill={PF}
        transform="rotate(-25 41 23)"
      />
      <ellipse
        cx="79"
        cy="23"
        rx="9"
        ry="4"
        fill={PF}
        transform="rotate(25 79 23)"
      />
      <ellipse
        cx="52"
        cy="18"
        rx="8"
        ry="4"
        fill={PF}
        transform="rotate(-40 52 18)"
      />
      <ellipse
        cx="68"
        cy="18"
        rx="8"
        ry="4"
        fill={PF}
        transform="rotate(40 68 18)"
      />
    </>
  );
}

function PalmStage4() {
  return (
    <>
      <PalmStage3 />
      {/* date clusters */}
      <circle cx="50" cy="58" r="4" fill={PD} />
      <circle cx="56" cy="62" r="3.5" fill={PD} />
      <circle cx="64" cy="62" r="3.5" fill={PD} />
      <circle cx="70" cy="58" r="4" fill={PD} />
    </>
  );
}

function PalmStage5() {
  return (
    <>
      <PalmStage3 />
      {/* hanging date clusters */}
      <circle cx="48" cy="60" r="4.5" fill={PD} />
      <circle cx="54" cy="64" r="4" fill={PD} />
      <circle cx="60" cy="66" r="4" fill={PD} />
      <circle cx="66" cy="64" r="4" fill={PD} />
      <circle cx="72" cy="60" r="4.5" fill={PD} />
      <circle cx="52" cy="56" r="3.5" fill="#e8b420" />
      <circle cx="60" cy="60" r="3" fill="#e8b420" />
      <circle cx="68" cy="56" r="3.5" fill="#e8b420" />
    </>
  );
}

// ══════════════════════════════════════════════════════════════════
// FIG  (trunk #6b5040, leaves #5a8a3c, figs #7a4f7a)
// ══════════════════════════════════════════════════════════════════
const FT = "#6b5040";
const FL = "#5a8a3c";
const FF = "#7a4f7a";

// Wide lobed leaf helper
function FigLeaf({
  cx,
  cy,
  r,
  angle,
}: {
  cx: number;
  cy: number;
  r: number;
  angle: number;
}) {
  // Simulate lobed leaf with overlapping ellipses
  const rad = (angle * Math.PI) / 180;
  const lx = cx + Math.cos(rad) * r * 0.3;
  const ly = cy + Math.sin(rad) * r * 0.3;
  return (
    <g>
      <ellipse
        cx={cx}
        cy={cy}
        rx={r}
        ry={r * 0.6}
        fill={FL}
        transform={`rotate(${angle} ${cx} ${cy})`}
      />
      <ellipse
        cx={lx - Math.sin(rad) * r * 0.4}
        cy={ly + Math.cos(rad) * r * 0.4}
        rx={r * 0.55}
        ry={r * 0.4}
        fill={FL}
        transform={`rotate(${angle + 30} ${lx - Math.sin(rad) * r * 0.4} ${ly + Math.cos(rad) * r * 0.4})`}
      />
      <ellipse
        cx={lx + Math.sin(rad) * r * 0.4}
        cy={ly - Math.cos(rad) * r * 0.4}
        rx={r * 0.55}
        ry={r * 0.4}
        fill={FL}
        transform={`rotate(${angle - 30} ${lx + Math.sin(rad) * r * 0.4} ${ly - Math.cos(rad) * r * 0.4})`}
      />
    </g>
  );
}

function FigStage1() {
  return (
    <>
      <Soil />
      <rect x="57" y="105" width="6" height="25" rx="3" fill={FT} />
      <FigLeaf cx={44} cy={100} r={13} angle={-40} />
      <FigLeaf cx={76} cy={100} r={13} angle={40} />
    </>
  );
}

function FigStage2() {
  return (
    <>
      <Soil />
      <rect x="57" y="88" width="6" height="42" rx="3" fill={FT} />
      <path
        d="M60,115 Q44,106 36,96"
        stroke={FT}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M60,105 Q76,96 84,86"
        stroke={FT}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <FigLeaf cx={35} cy={93} r={14} angle={-30} />
      <FigLeaf cx={85} cy={83} r={14} angle={30} />
      <FigLeaf cx={50} cy={82} r={12} angle={-20} />
      <FigLeaf cx={70} cy={80} r={12} angle={20} />
    </>
  );
}

function FigStage3() {
  return (
    <>
      <Soil />
      <rect x="57" y="68" width="6" height="62" rx="3" fill={FT} />
      <path
        d="M60,120 Q42,110 34,98"
        stroke={FT}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M60,108 Q78,98 86,86"
        stroke={FT}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M60,92 Q42,82 36,70"
        stroke={FT}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M60,80 Q78,70 84,58"
        stroke={FT}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <FigLeaf cx={33} cy={95} r={14} angle={-30} />
      <FigLeaf cx={87} cy={83} r={14} angle={30} />
      <FigLeaf cx={35} cy={68} r={13} angle={-25} />
      <FigLeaf cx={85} cy={56} r={13} angle={25} />
      <FigLeaf cx={50} cy={62} r={12} angle={-15} />
      <FigLeaf cx={70} cy={56} r={12} angle={15} />
    </>
  );
}

function FigStage4() {
  return (
    <>
      <FigStage3 />
      {/* figs */}
      <ellipse cx="32" cy="88" rx="5" ry="6" fill={FF} />
      <ellipse cx="88" cy="76" rx="5" ry="6" fill={FF} />
      <ellipse cx="36" cy="62" rx="4.5" ry="5.5" fill={FF} />
      <ellipse cx="85" cy="49" rx="4.5" ry="5.5" fill={FF} />
    </>
  );
}

function FigStage5() {
  return (
    <>
      <FigStage3 />
      {/* dense hanging figs */}
      <ellipse cx="30" cy="89" rx="5.5" ry="6.5" fill={FF} />
      <ellipse cx="38" cy="86" rx="5" ry="6" fill="#8a5f8a" />
      <ellipse cx="88" cy="77" rx="5.5" ry="6.5" fill={FF} />
      <ellipse cx="82" cy="82" rx="5" ry="6" fill="#8a5f8a" />
      <ellipse cx="34" cy="63" rx="5" ry="6" fill={FF} />
      <ellipse cx="43" cy="59" rx="4.5" ry="5.5" fill="#8a5f8a" />
      <ellipse cx="84" cy="50" rx="5" ry="6" fill={FF} />
      <ellipse cx="76" cy="54" rx="4.5" ry="5.5" fill="#8a5f8a" />
    </>
  );
}

// ══════════════════════════════════════════════════════════════════
// POMEGRANATE  (stem #6b4040, leaves #4a7040, fruits #d44a2a)
// ══════════════════════════════════════════════════════════════════
const GT = "#6b4040";
const GL = "#4a7040";
const GF = "#d44a2a";

function PomStage1() {
  return (
    <>
      <Soil />
      <path
        d="M60,128 Q59,116 60,98"
        stroke={GT}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      {/* narrow elongated leaves */}
      <ellipse
        cx="50"
        cy="104"
        rx="10"
        ry="4"
        fill={GL}
        transform="rotate(-50 50 104)"
      />
      <ellipse
        cx="70"
        cy="104"
        rx="10"
        ry="4"
        fill={GL}
        transform="rotate(50 70 104)"
      />
    </>
  );
}

function PomStage2() {
  return (
    <>
      <Soil />
      <path
        d="M60,128 Q58,108 60,80"
        stroke={GT}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M60,115 Q47,107 42,97"
        stroke={GT}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M60,105 Q73,97 78,87"
        stroke={GT}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse
        cx="42"
        cy="95"
        rx="10"
        ry="4"
        fill={GL}
        transform="rotate(-50 42 95)"
      />
      <ellipse
        cx="78"
        cy="85"
        rx="10"
        ry="4"
        fill={GL}
        transform="rotate(50 78 85)"
      />
      <ellipse
        cx="52"
        cy="76"
        rx="9"
        ry="4"
        fill={GL}
        transform="rotate(-40 52 76)"
      />
      <ellipse
        cx="68"
        cy="76"
        rx="9"
        ry="4"
        fill={GL}
        transform="rotate(40 68 76)"
      />
      {/* tiny buds */}
      <circle cx="45" cy="90" r="3" fill="#c83030" />
      <circle cx="75" cy="80" r="3" fill="#c83030" />
    </>
  );
}

function PomStage3() {
  return (
    <>
      <Soil />
      <path
        d="M60,128 Q57,100 60,60"
        stroke={GT}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M60,118 Q44,108 38,96"
        stroke={GT}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M60,108 Q76,98 82,86"
        stroke={GT}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M60,90 Q44,80 40,68"
        stroke={GT}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M60,78 Q76,68 80,56"
        stroke={GT}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse
        cx="38"
        cy="94"
        rx="11"
        ry="4.5"
        fill={GL}
        transform="rotate(-50 38 94)"
      />
      <ellipse
        cx="82"
        cy="84"
        rx="11"
        ry="4.5"
        fill={GL}
        transform="rotate(50 82 84)"
      />
      <ellipse
        cx="40"
        cy="66"
        rx="10"
        ry="4"
        fill={GL}
        transform="rotate(-45 40 66)"
      />
      <ellipse
        cx="80"
        cy="54"
        rx="10"
        ry="4"
        fill={GL}
        transform="rotate(45 80 54)"
      />
      <ellipse
        cx="52"
        cy="58"
        rx="9"
        ry="4"
        fill={GL}
        transform="rotate(-35 52 58)"
      />
      <ellipse
        cx="68"
        cy="52"
        rx="9"
        ry="4"
        fill={GL}
        transform="rotate(35 68 52)"
      />
    </>
  );
}

function PomFruit({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  // Pomegranate: round body + crown
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={GF} />
      {/* crown on top */}
      <path
        d={`M${cx - r * 0.6},${cy - r * 0.8} Q${cx - r * 0.3},${cy - r * 1.3} ${cx},${cy - r * 0.8} Q${cx + r * 0.3},${cy - r * 1.3} ${cx + r * 0.6},${cy - r * 0.8}`}
        stroke="#5a3020"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx={cx - r * 0.3} cy={cy - r * 0.9} r="1" fill="#5a3020" />
      <circle cx={cx} cy={cy - r * 1.0} r="1" fill="#5a3020" />
      <circle cx={cx + r * 0.3} cy={cy - r * 0.9} r="1" fill="#5a3020" />
    </g>
  );
}

function PomStage4() {
  return (
    <>
      <PomStage3 />
      <PomFruit cx={36} cy={88} r={7} />
      <PomFruit cx={84} cy={78} r={7} />
    </>
  );
}

function PomStage5() {
  return (
    <>
      <PomStage3 />
      <PomFruit cx={34} cy={88} r={8} />
      <PomFruit cx={84} cy={78} r={8} />
      <PomFruit cx={40} cy={62} r={7} />
      <PomFruit cx={80} cy={50} r={7} />
      <PomFruit cx={60} cy={44} r={6} />
    </>
  );
}

// ── Stage component dispatch ──────────────────────────────────────
type StageFn = () => React.JSX.Element;

const STAGES: Record<Species, Record<1 | 2 | 3 | 4 | 5, StageFn>> = {
  olive: {
    1: OliveStage1,
    2: OliveStage2,
    3: OliveStage3,
    4: OliveStage4,
    5: OliveStage5,
  },
  palm: {
    1: PalmStage1,
    2: PalmStage2,
    3: PalmStage3,
    4: PalmStage4,
    5: PalmStage5,
  },
  fig: {
    1: FigStage1,
    2: FigStage2,
    3: FigStage3,
    4: FigStage4,
    5: FigStage5,
  },
  pomegranate: {
    1: PomStage1,
    2: PomStage2,
    3: PomStage3,
    4: PomStage4,
    5: PomStage5,
  },
};

// ── Main component ────────────────────────────────────────────────
export default function SpeciesPlant({
  species,
  stage,
  size = 160,
  className = "",
  isVerified = false,
}: Props) {
  const reduced = useReducedMotion();
  const sparkleRadius = size * 0.47;
  const center = size / 2;
  const svgW = Math.round(size * 0.72);
  const svgH = Math.round(size * 0.84);
  const haloColor = HALO[species];

  const StageSvg = STAGES[species][stage];

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-label={`${species} tree at stage ${stage} of 5`}
    >
      {/* Ambient halo */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${haloColor} 15%, transparent 70%)`,
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

      {/* Sparkles */}
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
                color:
                  angle % 90 === 0
                    ? "#d4a017"
                    : HALO[species].replace(/,[^,]+\)$/, ",1)"),
                lineHeight: 1,
              }}
            >
              ✦
            </span>
          );
        })}
      </div>

      {/* SVG with stage transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${species}-${stage}`}
          initial={reduced ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduced ? undefined : { opacity: 0, scale: 0.88 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative z-10 flex items-center justify-center"
        >
          <svg
            viewBox="0 0 120 140"
            width={svgW}
            height={svgH}
            aria-hidden="true"
            overflow="visible"
          >
            <StageSvg />
          </svg>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
