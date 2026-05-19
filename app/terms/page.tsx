export default function TermsPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1
        className="text-3xl font-bold mb-2"
        style={{ color: "var(--grove-green)" }}
      >
        Terms of Service
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
        Last updated: 18 May 2026
      </p>

      <Section title="1. About Ghars">
        Ghars is a daily Quran reflection application that helps users build a
        consistent practice of engaging with the Quran. It is submitted as part
        of the Quran Foundation Hackathon 2026 and is provided free of charge.
      </Section>

      <Section title="2. Acceptance of Terms">
        By accessing or using Ghars, you agree to be bound by these Terms of
        Service. If you do not agree, please do not use the app.
      </Section>

      <Section title="3. Eligibility">
        You must have a valid Quran Foundation account to use Ghars. By signing
        in, you confirm that your use of the Quran Foundation platform complies
        with their terms.
      </Section>

      <Section title="4. User Conduct">
        You agree to use Ghars only for personal, non-commercial Quranic
        reflection. You must not attempt to abuse, scrape, or overload the
        service, or use it in any way that violates applicable law or the Quran
        Foundation API terms.
      </Section>

      <Section title="5. AI-Generated Content">
        The Explore feature uses an AI language model (Claude by Anthropic) to
        suggest relevant Quran verses. These suggestions are provided for
        personal reflection only and do not constitute religious rulings or
        scholarly advice. Always verify against authoritative sources.
      </Section>

      <Section title="6. Availability">
        Ghars is provided as-is and may be modified, suspended, or discontinued
        at any time without notice. We make no guarantees of uptime or continued
        availability.
      </Section>

      <Section title="7. Limitation of Liability">
        To the fullest extent permitted by law, Ghars and its developers are not
        liable for any indirect, incidental, or consequential damages arising
        from your use of the app.
      </Section>

      <Section title="8. Changes">
        These terms may be updated at any time. Continued use of the app
        constitutes acceptance of the updated terms.
      </Section>

      <Section title="9. Contact">
        For questions about these terms, contact:{" "}
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
