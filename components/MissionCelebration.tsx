"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";

// 12 particles (toned-down from 20) — the canvas barakah burst is the main moment.
const PARTICLES = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * 360;
  const radians = (angle * Math.PI) / 180;
  const distance = 38 + (i % 3) * 16; // 38, 54, 70
  return {
    x: Math.cos(radians) * distance,
    y: Math.sin(radians) * distance - 16,
    delay: i * 0.04,
    size: i % 3 === 0 ? 6 : i % 3 === 1 ? 4.5 : 3.5,
  };
});

export default function MissionCelebration() {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden="true"
    >
      {/* Expanding glow ring — softer scale than before */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 100,
          height: 100,
          background:
            "radial-gradient(circle, rgba(212, 160, 23, 0.30) 0%, transparent 70%)",
        }}
        initial={{ scale: 0.5, opacity: 1 }}
        animate={{ scale: 2.6, opacity: 0 }}
        transition={{ duration: 0.85, ease: "easeIn" }}
      />

      {/* Gold particles */}
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: i % 4 === 0 ? "#52b788" : "#d4a017",
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.2 }}
          transition={{ duration: 1.0, delay: p.delay, ease: "easeOut" }}
        />
      ))}

      {/* Central flash */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 36,
          height: 36,
          background:
            "radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(212,160,23,0.35) 60%, transparent 100%)",
        }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 1.8, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
}
