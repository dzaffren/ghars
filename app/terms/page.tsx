export default function Terms() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12 space-y-6 text-[#333]">
      <h1 className="text-2xl font-bold text-[#1a3a2a]">Terms of Service</h1>
      <p className="text-sm text-[#555]">Effective: April 2026</p>

      <section className="space-y-3 text-sm leading-relaxed">
        <h2 className="font-semibold text-base">Using Ghars</h2>
        <p>
          Ghars is a personal spiritual habit application. By using it you agree to use it
          respectfully and in accordance with Islamic ethics and applicable local laws.
        </p>
        <p>
          You may not attempt to abuse, scrape, reverse-engineer, or disrupt the service.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed">
        <h2 className="font-semibold text-base">Content</h2>
        <p>
          Quranic text, translations, tafsir, and audio are sourced from the Quran Foundation
          APIs. We do not claim ownership of Quranic content.
        </p>
        <p>
          Your reflections belong to you. We store them to power your history and garden — we
          do not reproduce them publicly.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed">
        <h2 className="font-semibold text-base">Availability</h2>
        <p>
          Ghars is provided &ldquo;as-is&rdquo; during the Quran Foundation Hackathon and beyond.
          We make no guarantees of uptime but aim to keep it available.
        </p>
      </section>

      <section className="text-sm leading-relaxed">
        <h2 className="font-semibold text-base mb-2">Contact</h2>
        <p>
          Questions?{" "}
          <a href="mailto:ahmaddzafranmohamadbustaman@gmail.com" className="text-[#2d6a4f] underline">
            ahmaddzafranmohamadbustaman@gmail.com
          </a>
        </p>
      </section>
    </main>
  );
}
