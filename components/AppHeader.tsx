"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { History, Home, BookOpen, Users, Compass, LogOut } from "lucide-react";

async function signOut() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/";
}

type Variant =
  | "today"
  | "history"
  | "reflections"
  | "dhikr"
  | "circles"
  | "explore";

interface Props {
  variant?: Variant;
  className?: string;
}

const NAV_LINKS: Record<
  Variant,
  { href: string; icon: React.ReactNode; label: string }[]
> = {
  today: [
    { href: "/explore", icon: <Compass size={15} />, label: "Explore" },
    { href: "/history", icon: <History size={15} />, label: "History" },
  ],
  history: [
    { href: "/today", icon: <Home size={15} />, label: "Today" },
    { href: "/explore", icon: <Compass size={15} />, label: "Explore" },
  ],
  reflections: [
    { href: "/today", icon: <Home size={15} />, label: "Today" },
    { href: "/explore", icon: <Compass size={15} />, label: "Explore" },
  ],
  dhikr: [{ href: "/today", icon: <Home size={15} />, label: "Today" }],
  circles: [
    { href: "/today", icon: <Home size={15} />, label: "Today" },
    { href: "/circles/join", icon: <Users size={15} />, label: "Join" },
  ],
  explore: [
    { href: "/today", icon: <Home size={15} />, label: "Today" },
    { href: "/reflections", icon: <BookOpen size={15} />, label: "Journal" },
  ],
};

export default function AppHeader({ variant, className = "" }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 24);
  });

  const navLinks = variant ? NAV_LINKS[variant] : [];

  return (
    <motion.header
      initial={{ y: -56, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 26, delay: 0.08 }}
      className={`sticky top-0 z-40 w-full ${className}`}
    >
      {/* Frosted glass layer */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          backgroundColor: scrolled
            ? "rgba(250,247,240,0.88)"
            : "rgba(250,247,240,0)",
          borderBottomColor: scrolled
            ? "rgba(82,183,136,0.18)"
            : "rgba(82,183,136,0)",
          backdropFilter: scrolled ? "blur(14px)" : "blur(0px)",
        }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{ borderBottomWidth: 1, borderBottomStyle: "solid" }}
      />

      {/* Content row */}
      <div className="relative mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <Link href="/today" className="flex items-center gap-2.5">
          <Image
            src="/icons/logo.png"
            alt=""
            width={26}
            height={26}
            priority
            className="select-none"
          />
          <span className="text-base font-semibold tracking-tight text-[#1a3a2a]/85">
            Ghars
          </span>
        </Link>

        <motion.div
          className="flex items-center gap-1"
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 22,
            delay: 0.22,
          }}
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              icon={link.icon}
              label={link.label}
            />
          ))}

          {variant && (
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-[var(--ink-soft)] transition-colors hover:bg-[var(--green-fog)] hover:text-[#1a3a2a]"
              title="Sign out"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          )}
        </motion.div>
      </div>
    </motion.header>
  );
}

function NavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--ink-soft)] transition-colors hover:bg-[var(--green-fog)] hover:text-[#1a3a2a]"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
