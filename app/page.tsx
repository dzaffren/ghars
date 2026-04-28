import { redirect } from "next/navigation";
import { getRequiredSession } from "@/lib/auth/session";
import LandingContent from "@/components/LandingContent";
import LandingVideo from "@/components/LandingVideo";

export default async function Home() {
  const session = await getRequiredSession();
  if (session) redirect("/today");

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
