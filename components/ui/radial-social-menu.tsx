"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Home,
  Compass,
  BookMarked,
  Users,
  History,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TABS = [
  { href: "/today", icon: Home, label: "Today" },
  { href: "/explore", icon: Compass, label: "Explore" },
  { href: "/dhikr", icon: BookMarked, label: "Tasbih" },
  { href: "/circles", icon: Users, label: "Circles" },
  { href: "/history", icon: History, label: "History" },
  { href: "/reflections", icon: BookOpen, label: "Journal" },
] as const;

// Top-left corner: quarter-circle from straight down → straight right
// 270° = down, 360° = right — full 90° sweep, all items stay on screen
const START_DEG = 270;
const END_DEG = 360;
const RADIUS = 165;
const HIDE_ON = ["/", "/onboarding"];

function degToRad(d: number) {
  return (d * Math.PI) / 180;
}

export function RadialNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  // Close when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (HIDE_ON.includes(pathname)) return null;

  return (
    <div ref={ref} className="fixed top-4 left-4 z-50">
      {/* Orbit items */}
      <AnimatePresence>
        {open &&
          TABS.map(({ href, icon: Icon, label }, i) => {
            const t = TABS.length <= 1 ? 0 : i / (TABS.length - 1);
            const deg = START_DEG + t * (END_DEG - START_DEG);
            const rad = degToRad(deg);
            // In CSS: x right = positive, y down = positive → flip y
            const x = RADIUS * Math.cos(rad);
            const y = -RADIUS * Math.sin(rad);
            const isActive =
              pathname === href || pathname.startsWith(href + "/");

            return (
              <motion.button
                key={href}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                animate={{ opacity: 1, x, y, scale: 1 }}
                exit={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                transition={{
                  type: "spring",
                  stiffness: 340,
                  damping: 24,
                  delay: i * 0.04,
                }}
                onClick={() => router.push(href)}
                className={`absolute flex flex-col items-center justify-center gap-0.5 rounded-full transition-colors
                ${
                  isActive
                    ? "w-12 h-12 -ml-6 -mt-6 bg-primary text-white shadow-[0_4px_16px_-4px_rgba(45,106,79,0.5)]"
                    : "w-11 h-11 -ml-[22px] -mt-[22px] bg-[rgba(250,247,240,0.95)] border border-[var(--green-fog)] text-[var(--ink-soft)] shadow-md hover:text-primary hover:scale-110"
                }`}
                aria-label={label}
              >
                <Icon
                  size={isActive ? 17 : 15}
                  strokeWidth={isActive ? 2.2 : 1.7}
                />
                <span className="text-[8px] font-semibold leading-none tracking-wide">
                  {label}
                </span>
              </motion.button>
            );
          })}
      </AnimatePresence>

      {/* Centre — Ghars logo (always visible) */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.92 }}
        className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-full transition-all
          bg-[#faf7f0] border shadow-[0_4px_18px_-4px_rgba(45,106,79,0.28)]
          ${
            open
              ? "border-primary/50 shadow-[0_4px_20px_-4px_rgba(45,106,79,0.4)]"
              : "border-[rgba(45,106,79,0.3)] hover:border-primary/50"
          }`}
        aria-label={open ? "Close menu" : "Open navigation"}
      >
        <Image
          src="/logo.png"
          alt="Ghars"
          width={30}
          height={30}
          className="select-none"
        />
      </motion.button>
    </div>
  );
}
