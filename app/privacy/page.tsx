export default function Privacy() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12 space-y-6 text-[#333]">
      <h1 className="text-2xl font-bold text-[#1a3a2a]">Privacy Policy</h1>
      <p className="text-sm text-[#555]">Effective: April 2026</p>

      <section className="space-y-3 text-sm leading-relaxed">
        <h2 className="font-semibold text-base">What we collect</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Your Quran Foundation account identifier (sub) and display name — for authentication only</li>
          <li>Daily mission reflections you write — stored privately, visible only to you</li>
          <li>Optional reflection photos — stored in encrypted cloud storage, private to you</li>
          <li>Garden state (streak, growth points) — required to show your progress</li>
          <li>Reminder time and timezone — required to send your chosen push notification</li>
          <li>Push subscription token — required to send push notifications to your device</li>
        </ul>
      </section>

      <section className="space-y-3 text-sm leading-relaxed">
        <h2 className="font-semibold text-base">What we don&apos;t do</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>We do not sell your data to anyone</li>
          <li>We do not share your reflections with other users</li>
          <li>We do not use your data for advertising</li>
          <li>We do not retain data after account deletion</li>
        </ul>
      </section>

      <section className="space-y-3 text-sm leading-relaxed">
        <h2 className="font-semibold text-base">Third-party services</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Quran Foundation</strong> — authentication and Quran content APIs</li>
          <li><strong>Supabase</strong> — database and file storage (EU region)</li>
          <li><strong>Vercel</strong> — hosting and serverless functions</li>
          <li><strong>Anthropic</strong> — AI processing of reflection text (anonymised)</li>
        </ul>
      </section>

      <section className="text-sm leading-relaxed">
        <h2 className="font-semibold text-base mb-2">Contact</h2>
        <p>
          Questions? Email{" "}
          <a href="mailto:ahmaddzafranmohamadbustaman@gmail.com" className="text-[#2d6a4f] underline">
            ahmaddzafranmohamadbustaman@gmail.com
          </a>
        </p>
      </section>
    </main>
  );
}
