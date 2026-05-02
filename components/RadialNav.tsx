"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Home, BookOpen, Settings } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const TABS = [
  { href: "/today", icon: Home, label: "Today" },
  { href: "/journal", icon: BookOpen, label: "Journal" },
  { href: "/settings", icon: Settings, label: "Settings" },
] as const;

// Anchored bottom-right — orbit opens into the upper-left quadrant.
// The math-angle convention (x = cos, y = -sin) used below means:
//   90°  = straight up      (y = -R)
//   100° = up + slightly right-of-vertical
//   180° = straight left    (x = -R, y = 0)
// Sweeping 100° → 180° keeps all items at y ≤ 0 (at or above the anchor
// center), so nothing can clip below the viewport on short mobile screens
// even with a home-indicator safe area.
const START_DEG = 100;
const END_DEG = 180;
const RADIUS = 132;
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

  // First-visit pulse: draws attention to the anchor for new users
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
      // localStorage blocked in private mode / third-party context — skip
    }
  }, [reduceMotion]);

  if (HIDE_ON.includes(pathname)) return null;

  const transition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 340, damping: 24 };

  return (
    <>
      {/* Backdrop — full viewport, tap to close */}
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

      <div ref={ref} className="fixed bottom-4 right-4 z-50">
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
                    ...transition,
                    delay: reduceMotion ? 0 : i * 0.04,
                  }}
                  onClick={() => router.push(href)}
                  className={`group absolute flex items-center justify-center rounded-full transition-colors
                    ${
                      isActive
                        ? "w-12 h-12 -ml-6 -mb-6 bg-primary text-white shadow-[0_0_20px_rgba(45,106,79,0.35)]"
                        : "w-11 h-11 -ml-[22px] -mb-[22px] bg-[rgba(250,247,240,0.95)] border border-[var(--green-fog)] text-[var(--ink-soft)] shadow-[0_3px_12px_-3px_rgba(45,106,79,0.25)] hover:text-primary hover:scale-110"
                    }`}
                  aria-label={label}
                >
                  <Icon
                    size={isActive ? 18 : 16}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  {/* Label — placed above the icon so it doesn't get
                      clipped by the viewport bottom (anchor sits at
                      bottom-4). Visible on hover/focus, or always for
                      the currently active route. */}
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

        {/* Centre — button + arching app name */}
        <div className="relative flex items-center justify-center">
          {/* Arching "Ghars" text above the button */}
          <svg
            width="80"
            height="44"
            viewBox="0 0 80 44"
            className="absolute bottom-full mb-[-6px] pointer-events-none select-none"
            aria-hidden="true"
          >
            <defs>
              {/* Arc path: semicircle across the top */}
              <path id="arch" d="M 8,38 A 32,32 0 0,1 72,38" fill="none" />
            </defs>
            <text
              fontSize="9"
              fontWeight="600"
              letterSpacing="2.5"
              fill="rgba(45,106,79,0.7)"
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
              bg-[#faf7f0] border shadow-[0_6px_22px_-6px_rgba(45,106,79,0.35)]
              ${
                open
                  ? "border-primary/50 shadow-[0_6px_26px_-4px_rgba(45,106,79,0.45)]"
                  : "border-[rgba(45,106,79,0.3)] hover:border-primary/50"
              }`}
            aria-label={open ? "Close menu" : "Open navigation"}
            aria-expanded={open}
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
      </div>
    </>
  );
}
