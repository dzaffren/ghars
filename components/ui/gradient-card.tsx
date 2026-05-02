"use client";

import React, { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Prop types ────────────────────────────────────────────────────────────────
interface GradientCardProps {
  children: React.ReactNode;
  className?: string;
  // Glow colours (defaults to Ghars green + amber)
  glowLeft?: string;
  glowRight?: string;
  glowCenter?: string;
  borderGlow?: string;
  // Background
  bgGradient?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function GradientCard({
  children,
  className,
  glowLeft = "rgba(82,183,136,0.55)",
  glowRight = "rgba(212,160,23,0.45)",
  glowCenter = "rgba(45,106,79,0.45)",
  borderGlow = "rgba(82,183,136,0.80)",
  bgGradient = "linear-gradient(160deg, #1a3a2a 0%, #1f4434 55%, #26563f 100%)",
}: GradientCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const shouldReduce = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduce || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotation({
      x: -(y / rect.height) * 5,
      y: (x / rect.width) * 5,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn("relative overflow-hidden rounded-2xl", className)}
      style={{
        transformStyle: "preserve-3d",
        background: bgGradient,
        boxShadow: `0 -6px 60px 6px ${glowLeft.replace(/[\d.]+\)$/, "0.18)")}, 0 0 10px rgba(0,0,0,0.4)`,
      }}
      animate={
        shouldReduce
          ? {}
          : {
              y: isHovered ? -3 : 0,
              rotateX: rotation.x,
              rotateY: rotation.y,
            }
      }
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {/* ── Noise texture ── */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-20 mix-blend-overlay"
        aria-hidden
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Bottom glow (left + right) ── */}
      <motion.div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-2/3"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse at bottom right, ${glowRight} -10%, transparent 68%),
            radial-gradient(ellipse at bottom left,  ${glowLeft}  -10%, transparent 68%)
          `,
          filter: "blur(38px)",
        }}
        animate={shouldReduce ? {} : { opacity: isHovered ? 0.9 : 0.75 }}
        transition={{ duration: 0.4 }}
      />

      {/* ── Central bottom glow ── */}
      <motion.div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-2/3"
        aria-hidden
        style={{
          background: `radial-gradient(circle at bottom center, ${glowCenter} -10%, transparent 60%)`,
          filter: "blur(42px)",
        }}
        animate={
          shouldReduce ? {} : { opacity: isHovered ? 0.85 : 0.7, y: "10%" }
        }
        transition={{ duration: 0.4 }}
      />

      {/* ── Bottom edge glow (thin line) ── */}
      <motion.div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-30 h-[2px]"
        aria-hidden
        style={{
          background: `linear-gradient(90deg, rgba(255,255,255,0.04) 0%, ${borderGlow} 50%, rgba(255,255,255,0.04) 100%)`,
        }}
        animate={
          shouldReduce
            ? {}
            : {
                boxShadow: `0 0 18px 3px ${borderGlow.replace(/[\d.]+\)$/, "0.60)")}, 0 0 30px 5px ${borderGlow.replace(/[\d.]+\)$/, "0.40)")}`,
                opacity: isHovered ? 1 : 0.85,
              }
        }
        transition={{ duration: 0.4 }}
      />

      {/* ── Left corner glow ── */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 z-30 h-1/4 w-[1px] rounded-full"
        aria-hidden
        style={{
          background:
            "linear-gradient(to top, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%)",
        }}
      />

      {/* ── Right corner glow ── */}
      <div
        className="pointer-events-none absolute bottom-0 right-0 z-30 h-1/4 w-[1px] rounded-full"
        aria-hidden
        style={{
          background:
            "linear-gradient(to top, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%)",
        }}
      />

      {/* ── Glass reflection ── */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-30"
        aria-hidden
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 80%, rgba(255,255,255,0.04) 100%)",
        }}
        animate={shouldReduce ? {} : { opacity: isHovered ? 0.8 : 0.5 }}
        transition={{ duration: 0.4 }}
      />

      {/* ── Content slot ── */}
      <div className="relative z-40">{children}</div>
    </motion.div>
  );
}
