import { redirect } from "next/navigation";
import { getRequiredSession } from "@/lib/auth/session";
import LandingContent from "@/components/LandingContent";

export default async function Home() {
  const session = await getRequiredSession();
  if (session) redirect("/today");

  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center px-4 py-16">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster="/images/garden-loop-poster.jpg"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ background: "#faf7f0", opacity: 0.75 }}
      >
        <source
          src="/videos/garden-loop-mobile.mp4"
          type="video/mp4"
          media="(max-width: 768px)"
        />
        <source src="/videos/garden-loop.mp4" type="video/mp4" />
      </video>

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
