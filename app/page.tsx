import { redirect } from "next/navigation";
import { getRequiredSession } from "@/lib/auth/session";
import Image from "next/image";

export default async function Home() {
  const session = await getRequiredSession();
  if (session) redirect("/today");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo / Hero */}
        <div className="space-y-3">
          <div className="flex justify-center">
            <Image
              src="/icons/logo.png"
              alt="Ghars logo"
              width={120}
              height={120}
              priority
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[#1a3a2a]">
            Ghars
          </h1>
          <p className="text-lg text-[#555]" dir="rtl" lang="ar">
            غَرْس
          </p>
          <p className="text-base text-[#555] max-w-sm mx-auto">
            One Quranic verse. One daily mission. Watch your tree of deeds grow.
          </p>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <a
            href="/api/auth/init"
            className="block w-full rounded-xl bg-[#2d6a4f] text-white font-semibold py-4 px-6 hover:bg-[#1b4332] transition-colors text-center"
          >
            Sign in with Quran Foundation
          </a>
          <p className="text-xs text-[#aaa]">
            Uses your Quran.com account. No new password needed.
          </p>
        </div>

        {/* Feature list */}
        <div className="grid grid-cols-1 gap-3 text-left text-sm text-[#555]">
          {[
            ["🌿", "One actionable verse, every day"],
            ["✍️", "Reflect on what you did — your garden grows"],
            ["📿", "Aligned with your goals: patience, gratitude, kindness…"],
            ["🔔", "Morning reminder at your chosen time"],
          ].map(([icon, text]) => (
            <div
              key={text}
              className="flex items-start gap-3 rounded-lg bg-white/60 px-4 py-3 border border-[#52b788]/20"
            >
              <span>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Ibrahim 14:24 reference */}
        <blockquote className="border-l-4 border-[#52b788] pl-4 text-left italic text-sm text-[#666]">
          &ldquo;A good word is like a good tree — its roots are firm and its
          branches reach the sky…&rdquo;
          <cite className="block mt-1 not-italic text-[#999]">
            — Quran 14:24
          </cite>
        </blockquote>
      </div>
    </main>
  );
}
