"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function LandingContent() {
  return (
    <motion.div
      className="relative max-w-xs w-full text-center space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Logo + name */}
      <motion.div variants={item} className="space-y-3">
        <div className="flex justify-center">
          <Image
            src="/logo.png"
            alt="Ghars logo"
            width={88}
            height={88}
            priority
          />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1a3a2a]">
          Ghars
        </h1>
        <p className="text-sm text-[#555]/70" dir="rtl" lang="ar">
          غَرْس
        </p>
        <p className="text-sm text-[#555]/80 leading-relaxed">
          One verse. One mission. Every day.
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div variants={item} className="space-y-3">
        <a
          href="/api/auth/init"
          className="flex items-center justify-center w-full rounded-xl py-3.5 px-6 text-sm font-semibold text-white transition-all duration-200 hover:brightness-90 active:scale-[0.98]"
          style={{ backgroundColor: "#2d6a4f" }}
        >
          Sign in with Quran Foundation
        </a>
        <p className="text-xs text-[#555]/50">
          Uses your Quran.com account · No new password needed
        </p>
      </motion.div>

      {/* Quote */}
      <motion.p
        variants={item}
        className="text-xs italic text-[#555]/60 leading-relaxed px-2"
      >
        &ldquo;A good word is like a good tree — its roots are firm and its
        branches reach the sky.&rdquo;{" "}
        <span className="not-italic text-[#2d6a4f]/60">— 14:24</span>
      </motion.p>

      {/* Legal links */}
      <motion.p
        variants={item}
        className="text-[10px] text-[#555]/40 space-x-3"
      >
        <a
          href="/privacy"
          className="hover:text-[#555]/70 underline underline-offset-2"
        >
          Privacy
        </a>
        <a
          href="/terms"
          className="hover:text-[#555]/70 underline underline-offset-2"
        >
          Terms
        </a>
      </motion.p>
    </motion.div>
  );
}
