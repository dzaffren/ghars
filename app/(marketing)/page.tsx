import LandingVideo from "./_components/LandingVideo";
import LandingContent from "./_components/LandingContent";

export default function WelcomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center px-4 py-16">
      <LandingVideo />

      {/* Soft cream wash so text stays readable over the video */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(250,247,240,0.60) 0%, rgba(250,247,240,0.30) 40%, transparent 75%)",
        }}
      />

      <LandingContent />
    </main>
  );
}
