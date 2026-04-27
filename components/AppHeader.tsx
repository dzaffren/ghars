"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import {
  Home,
  Compass,
  BookMarked,
  Users,
  History,
  LogOut,
} from "lucide-react";

const TABS = [
  { href: "/today", icon: Home, label: "Today" },
  { href: "/explore", icon: Compass, label: "Explore" },
  { href: "/dhikr", icon: BookMarked, label: "Tasbih" },
  { href: "/circles", icon: Users, label: "Circles" },
  { href: "/history", icon: History, label: "History" },
] as const;

const HIDE_NAV_ON = ["/", "/onboarding"];

interface Props {
  className?: string;
  variant?: string;
}

export default function AppHeader({ className = "" }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const showNav = !HIDE_NAV_ON.includes(pathname);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 24);
  });

  return (
    <motion.header
      initial={{ y: -56, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 26, delay: 0.08 }}
      className={`sticky top-0 z-40 w-full ${className}`}
    >
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

      <div className="relative mx-auto max-w-md px-4">
        {/* Logo row */}
        <div className="flex items-center justify-between py-2.5">
          <Link href="/today" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt=""
              width={24}
              height={24}
              priority
              className="select-none"
            />
            <span className="text-sm font-semibold tracking-tight text-[#1a3a2a]/85">
              Ghars
            </span>
          </Link>
          {showNav && (
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                aria-label="Log out"
                className="flex items-center justify-center rounded-md p-1.5 text-[#1a3a2a]/60 transition-colors hover:text-[#1a3a2a]"
              >
                <LogOut size={16} strokeWidth={1.7} />
              </button>
            </form>
          )}
        </div>

        {/* Nav tabs row */}
        {showNav && (
          <div className="flex items-stretch border-t border-[var(--green-fog)]/60">
            {TABS.map(({ href, icon: Icon, label }) => {
              const active =
                pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                    active
                      ? "text-primary"
                      : "text-[var(--ink-soft)]/50 hover:text-[var(--ink-soft)]"
                  }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={active ? 2.2 : 1.7}
                    className="transition-all"
                  />
                  <span
                    className={`text-[9px] font-medium tracking-wide ${
                      active ? "opacity-100" : "opacity-60"
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </motion.header>
  );
}
