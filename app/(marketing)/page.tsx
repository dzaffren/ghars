import Link from "next/link";
import { DemoButton } from "./_components/DemoButton";

export default function WelcomePage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-6 gap-8"
      style={{ backgroundColor: "var(--sand)" }}
    >
      <div className="text-center max-w-xs">
        <h1
          className="text-4xl font-bold mb-1"
          style={{ color: "var(--grove-green)" }}
        >
          Ghars
        </h1>
        <p className="text-lg" style={{ color: "var(--grove-green-light)" }}>
          غَرْس
        </p>
        <p
          className="mt-4 text-base font-medium"
          style={{ color: "var(--foreground)" }}
        >
          One ayah a day. One small action. One growing grove.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <a
          href="/onboarding"
          className="block w-full text-center py-3 px-6 rounded-xl font-semibold text-white"
          style={{ backgroundColor: "var(--grove-green)" }}
          data-testid="get-started-btn"
        >
          Get started
        </a>

        <a
          href="/api/auth/start"
          className="block w-full text-center py-3 px-6 rounded-xl font-semibold border"
          style={{
            borderColor: "var(--grove-green)",
            color: "var(--grove-green)",
          }}
          data-testid="sign-in-btn"
        >
          I already have an account
        </a>

        <DemoButton />
      </div>
    </main>
  );
}
