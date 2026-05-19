export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1
        className="text-3xl font-bold mb-2"
        style={{ color: "var(--grove-green)" }}
      >
        Privacy Policy
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
        Last updated: 18 May 2026
      </p>

      <Section title="1. Overview">
        Ghars is committed to protecting your privacy. This policy explains what
        data we collect, how we use it, and your rights. Ghars is a hackathon
        project and does not sell or share your data with third parties.
      </Section>

      <Section title="2. Data We Collect">
        When you sign in via Quran Foundation OAuth, we receive and store your
        QF user ID, email address, and display name. Within the app we store
        your preferences (translation choice, reminder times), daily mission
        selections, and evening reflections. We also store a session token to
        keep you signed in.
      </Section>

      <Section title="3. Quran Foundation Integration">
        Ghars uses Quran Foundation APIs to read and write data to your QF
        account on your behalf. Specifically, when you complete a reflection,
        Ghars may create a bookmark and a note on your Quran Foundation account
        linked to that day&apos;s verse, and log an activity day toward your QF
        streak. This data is governed by the Quran Foundation&apos;s own privacy
        policy.
      </Section>

      <Section title="4. AI Features">
        When you use the Explore search feature, your search query is sent to
        Anthropic&apos;s Claude API to generate verse suggestions. Queries are
        not stored beyond the API call. Anthropic&apos;s data handling is
        governed by their privacy policy.
      </Section>

      <Section title="5. Data Storage">
        Your account data, reflections, and missions are stored in a secure
        Supabase (PostgreSQL) database. Session tokens are stored as httpOnly
        cookies in your browser.
      </Section>

      <Section title="6. Data Retention">
        Your data is retained for as long as your account exists. You may
        request deletion of your account and all associated data by contacting
        us at the email below.
      </Section>

      <Section title="7. Your Rights">
        You have the right to access, correct, or delete your personal data. To
        exercise these rights, contact us directly. We will respond within 30
        days.
      </Section>

      <Section title="8. Cookies">
        Ghars uses a single session cookie (<code>ghars_session</code>) to
        authenticate your requests. No tracking or advertising cookies are used.
      </Section>

      <Section title="9. Contact">
        For privacy enquiries or data deletion requests:{" "}
        <a
          href="mailto:ahmaddzafranmohamadbustaman@gmail.com"
          className="underline"
          style={{ color: "var(--grove-green)" }}
        >
          ahmaddzafranmohamadbustaman@gmail.com
        </a>
      </Section>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <h2
        className="text-lg font-semibold mb-1"
        style={{ color: "var(--foreground)" }}
      >
        {title}
      </h2>
      <p
        className="text-sm leading-relaxed"
        style={{ color: "var(--text-muted)" }}
      >
        {children}
      </p>
    </section>
  );
}
