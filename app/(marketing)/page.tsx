export default function WelcomePage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ backgroundColor: "var(--sand)" }}
    >
      <h1
        className="text-3xl font-bold mb-2"
        style={{ color: "var(--grove-green)" }}
      >
        Ghars
      </h1>
      <p
        className="text-center max-w-sm mb-1"
        style={{ color: "var(--text-muted)" }}
      >
        غَرْس — Plant a tree for every honest reflection on an ayah.
      </p>
      <p className="mt-8 text-sm" style={{ color: "var(--text-muted)" }}>
        Coming soon — onboarding in progress.
      </p>
    </main>
  );
}
