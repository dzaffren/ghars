"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Home, BookOpen, Settings } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

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
          className="absolute pointer-events-none rounded-full"
          style={{
            width: s.size,
            height: s.size,
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

// 3 tabs: Journal left (135°), Today top (90°), Settings right (45°)
const TABS = [
  { href: "/journal", icon: BookOpen, label: "Journal", deg: 135 },
  { href: "/today", icon: Home, label: "Today", deg: 90 },
  { href: "/settings", icon: Settings, label: "Settings", deg: 45 },
] as const;

const RADIUS = 110; // distance from button centre to orbit item centre
const BTN_SIZE = 56; // px — h-14 w-14
const HIDE_ON = ["/", "/onboarding", "/callback"];
const SEEN_KEY = "ghars_radial_seen";

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
      /* ignore */
    }
  }, [reduceMotion]);

  if (HIDE_ON.includes(pathname)) return null;

  const spring = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 340, damping: 24 };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
            className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Root: centred at bottom, sized exactly to the button */}
      <div
        ref={ref}
        className="fixed z-50"
        style={{
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          width: BTN_SIZE,
          height: BTN_SIZE,
        }}
      >
        {/* Orbit items — positioned via transform from button centre */}
        <AnimatePresence>
          {open &&
            TABS.map(({ href, icon: Icon, label, deg }, i) => {
              const rad = (deg * Math.PI) / 180;
              // Target offsets from button centre (CSS y-axis flipped)
              const tx = RADIUS * Math.cos(rad);
              const ty = -RADIUS * Math.sin(rad);
              const isActive =
                pathname === href || pathname.startsWith(href + "/");
              const size = isActive ? 48 : 44;

              return (
                <motion.button
                  key={href}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                  animate={{ opacity: 1, x: tx, y: ty, scale: 1 }}
                  exit={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                  transition={{ ...spring, delay: reduceMotion ? 0 : i * 0.04 }}
                  onClick={() => router.push(href)}
                  className="group absolute flex items-center justify-center rounded-full transition-colors"
                  style={{
                    width: size,
                    height: size,
                    // Centre the item on the button's centre point
                    top: (BTN_SIZE - size) / 2,
                    left: (BTN_SIZE - size) / 2,
                    backgroundColor: isActive
                      ? "var(--grove-green-light)"
                      : "rgba(250,247,240,0.97)",
                    color: isActive ? "#fff" : "#5b6b62",
                    border: isActive ? "none" : "1px solid rgba(45,106,79,0.2)",
                    boxShadow: isActive
                      ? "0 0 20px rgba(45,106,79,0.35)"
                      : "0 3px 12px -3px rgba(45,106,79,0.25)",
                  }}
                  aria-label={label}
                >
                  <Icon
                    size={isActive ? 18 : 16}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
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

        {/* GHARS arch — tight curve above button, viewBox tall enough to fit the peak.
            Geometry: r=38, chord=60 (endpoints at x=10 and x=70).
            Peak rises 38 - sqrt(38² - 30²) = ~14.7px above baseline.
            Baseline at y=42, so peak at y≈27.3 — all fits in 48-tall viewBox. */}
        <svg
          width="80"
          height="48"
          viewBox="0 0 80 48"
          className="pointer-events-none select-none"
          style={{
            position: "fixed",
            // Button top = 24 + 56 = 80 from screen bottom.
            // Baseline y=42 is 6px from SVG bottom. Place SVG bottom 2px above button top
            // so letters' baseline sits ~8px above the button edge, close but not touching.
            bottom: 24 + BTN_SIZE + 2,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 51,
          }}
          aria-hidden="true"
        >
          <defs>
            <path id="ghars-arch" d="M 10,42 A 38,38 0 0,1 70,42" fill="none" />
          </defs>
          <text
            fontSize="10"
            fontWeight="700"
            letterSpacing="2.5"
            fill="var(--grove-green)"
            fontFamily="inherit"
          >
            <textPath href="#ghars-arch" startOffset="50%" textAnchor="middle">
              GHARS
            </textPath>
          </text>
        </svg>

        {/* Centre button */}
        <motion.button
          onClick={() => setOpen((o) => !o)}
          whileTap={{ scale: 0.92 }}
          animate={pulse ? { scale: [1, 1.08, 1, 1.08, 1] } : { scale: 1 }}
          transition={
            pulse ? { duration: 2.2, ease: "easeInOut" } : { duration: 0.2 }
          }
          className="relative flex items-center justify-center rounded-full bg-[#faf7f0] overflow-visible"
          style={{
            width: BTN_SIZE,
            height: BTN_SIZE,
            border: open
              ? "1.5px solid rgba(45,106,79,0.5)"
              : "1.5px solid rgba(45,106,79,0.3)",
            boxShadow: open
              ? "0 6px 26px -4px rgba(45,106,79,0.45)"
              : "0 6px_22px -6px rgba(45,106,79,0.35)",
          }}
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
    </>
  );
}
