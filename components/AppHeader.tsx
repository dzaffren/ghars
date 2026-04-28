"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ArrowLeft, LogOut } from "lucide-react";

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
          <div className="flex items-center gap-2">
            {showNav && pathname !== "/today" && (
              <Link
                href="/today"
                aria-label="Back to home"
                className="flex items-center justify-center rounded-md p-1.5 text-[#1a3a2a]/60 transition-colors hover:text-[#1a3a2a]"
              >
                <ArrowLeft size={18} strokeWidth={1.8} />
              </Link>
            )}
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
          </div>
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
      </div>
    </motion.header>
  );
}
