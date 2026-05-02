import Link from "next/link";

export default function OnboardingPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ backgroundColor: "var(--sand)" }}
    >
      <div className="max-w-xs w-full">
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: "var(--grove-green)" }}
        >
          How Ghars works
        </h2>

        <div className="flex flex-col gap-5 mb-8">
          <Step number={1} title="Morning">
            Open the app and read today&rsquo;s ayah. Choose one small action to
            take today.
          </Step>
          <Step number={2} title="Through the day">
            Carry the mission. No pressure — just awareness.
          </Step>
          <Step number={3} title="Evening">
            Come back and reflect. What happened? Even &ldquo;not today&rdquo;
            is honest.
          </Step>
          <Step number={4} title="A grove grows">
            Each honest reflection plants a tree. Over weeks, you see the Quran
            shaping how you live.
          </Step>
        </div>

        <a
          href="/api/auth/start"
          className="block w-full text-center py-3 px-6 rounded-xl font-semibold text-white"
          style={{ backgroundColor: "var(--grove-green)" }}
          data-testid="create-account-btn"
        >
          Create my account
        </a>
      </div>
    </main>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 items-start">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
        style={{ backgroundColor: "var(--grove-green)" }}
      >
        {number}
      </div>
      <div>
        <p className="font-semibold" style={{ color: "var(--foreground)" }}>
          {title}
        </p>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          {children}
        </p>
      </div>
    </div>
  );
}
