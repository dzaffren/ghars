"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Home, BookOpen, Settings } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// Sparkle particles orbiting the centre button
const SPARKLES = [
  { id: 0, size: 4, orbit: 30, startAngle: 0, duration: 3.2 },
  { id: 1, size: 3, orbit: 34, startAngle: 120, duration: 2.8 },
  { id: 2, size: 5, orbit: 28, startAngle: 240, duration: 3.6 },
  { id: 3, size: 3, orbit: 36, startAngle: 60, duration: 4.0 },
  { id: 4, size: 4, orbit: 32, startAngle: 200, duration: 2.6 },
];

function SparkleRing({ active }: { active: boolean }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion || !active) return null;
  return (
    <>
      {SPARKLES.map((s) => (
        <motion.div
          key={s.id}
          className="absolute pointer-events-none"
          style={{
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            backgroundColor: "rgba(45,106,79,0.5)",
            top: "50%",
            left: "50%",
            marginTop: -s.size / 2,
            marginLeft: -s.size / 2,
          }}
          animate={{
            x: [
              Math.cos((s.startAngle * Math.PI) / 180) * s.orbit,
              Math.cos(((s.startAngle + 180) * Math.PI) / 180) * s.orbit,
              Math.cos((s.startAngle * Math.PI) / 180) * s.orbit,
            ],
            y: [
              Math.sin((s.startAngle * Math.PI) / 180) * s.orbit,
              Math.sin(((s.startAngle + 180) * Math.PI) / 180) * s.orbit,
              Math.sin((s.startAngle * Math.PI) / 180) * s.orbit,
            ],
            opacity: [0.8, 0.3, 0.8],
            scale: [1, 0.5, 1],
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}

const TABS = [
  // Wider spread: 45° / 90° / 135° for a balanced semicircle
  // Journal upper-left, Today straight up, Settings upper-right
  { href: "/journal", icon: BookOpen, label: "Journal", deg: 135 },
  { href: "/today", icon: Home, label: "Today", deg: 90 },
  { href: "/settings", icon: Settings, label: "Settings", deg: 45 },
] as const;

const RADIUS = 120;
const HIDE_ON = ["/", "/onboarding", "/callback"];
const SEEN_KEY = "ghars_radial_seen";

function degToRad(d: number) {
  return (d * Math.PI) / 180;
}

export function RadialNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (reduceMotion) return;
    try {
      if (localStorage.getItem(SEEN_KEY) !== "1") {
        setPulse(true);
        localStorage.setItem(SEEN_KEY, "1");
        const t = setTimeout(() => setPulse(false), 2400);
        return () => clearTimeout(t);
      }
    } catch {
      // localStorage blocked — skip
    }
  }, [reduceMotion]);

  if (HIDE_ON.includes(pathname)) return null;

  const transition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 340, damping: 24 };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="radial-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
            className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Centre — bottom-centre of screen */}
      <div
        ref={ref}
        className="fixed bottom-6 left-1/2 z-50"
        style={{ transform: "translateX(-50%)" }}
      >
        {/* Orbit items */}
        <AnimatePresence>
          {open &&
            TABS.map(({ href, icon: Icon, label, deg }, i) => {
              const rad = degToRad(deg);
              // CSS: x right = +, y down = + → flip y for upward arc
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
                    ...transition,
                    delay: reduceMotion ? 0 : i * 0.04,
                  }}
                  onClick={() => router.push(href)}
                  className={`group absolute flex items-center justify-center rounded-full transition-colors
                    ${
                      isActive
                        ? "w-12 h-12 -ml-6 -mb-6 text-white shadow-[0_0_20px_rgba(45,106,79,0.35)]"
                        : "w-11 h-11 -ml-[22px] -mb-[22px] bg-[rgba(250,247,240,0.97)] border text-[#5b6b62] shadow-[0_3px_12px_-3px_rgba(45,106,79,0.25)] hover:scale-110"
                    }`}
                  style={
                    isActive
                      ? { backgroundColor: "var(--grove-green-light)" }
                      : { borderColor: "rgba(45,106,79,0.2)" }
                  }
                  aria-label={label}
                >
                  <Icon
                    size={isActive ? 18 : 16}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  {/* Label tooltip — above the icon */}
                  <span
                    className={`pointer-events-none absolute bottom-full mb-1.5 whitespace-nowrap rounded-full bg-[#1a3a2a] px-2 py-0.5 text-[9px] font-semibold text-white shadow-md transition-opacity ${
                      isActive
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                    }`}
                  >
                    {label}
                  </span>
                </motion.button>
              );
            })}
        </AnimatePresence>

        {/* Centre button + arching GHARS label */}
        <div className="relative flex items-center justify-center">
          {/* Arching "GHARS" text — overlaid on top half of button */}
          <svg
            width="64"
            height="28"
            viewBox="0 0 64 28"
            className="absolute bottom-[44px] left-1/2 pointer-events-none select-none"
            style={{ transform: "translateX(-50%)" }}
            aria-hidden="true"
          >
            <defs>
              {/* Arc baseline sits at y=28, radius 28 — text hugs just above button top */}
              <path id="arch" d="M 4,28 A 28,28 0 0,1 60,28" fill="none" />
            </defs>
            <text
              fontSize="10"
              fontWeight="700"
              letterSpacing="2.8"
              fill="rgba(45,106,79,0.75)"
              fontFamily="inherit"
            >
              <textPath href="#arch" startOffset="50%" textAnchor="middle">
                GHARS
              </textPath>
            </text>
          </svg>

          <motion.button
            onClick={() => setOpen((o) => !o)}
            whileTap={{ scale: 0.92 }}
            animate={pulse ? { scale: [1, 1.08, 1, 1.08, 1] } : { scale: 1 }}
            transition={
              pulse ? { duration: 2.2, ease: "easeInOut" } : { duration: 0.2 }
            }
            className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-full
              bg-[#faf7f0] border shadow-[0_6px_22px_-6px_rgba(45,106,79,0.35)] overflow-visible
              ${
                open
                  ? "border-primary/50 shadow-[0_6px_26px_-4px_rgba(45,106,79,0.45)]"
                  : "border-[rgba(45,106,79,0.3)] hover:border-primary/50"
              }`}
            aria-label={open ? "Close menu" : "Open navigation"}
            aria-expanded={open}
          >
            <SparkleRing active={!open} />
            <Image
              src="/logo.png"
              alt="Ghars"
              width={30}
              height={30}
              className="select-none relative z-10"
            />
          </motion.button>
        </div>
      </div>
    </>
  );
}
