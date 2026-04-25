import { redirect } from "next/navigation";
import { getRequiredSession } from "@/lib/auth/session";
import AppHeader from "@/components/AppHeader";
import ExploreClient from "./ExploreClient";

export default async function ExplorePage() {
  const session = await getRequiredSession();
  if (!session) redirect("/");

  return (
    <div className="min-h-screen">
      <AppHeader variant="explore" />
      <main className="mx-auto w-full max-w-md px-4 pb-10 pt-4 space-y-4">
        <div>
          <h1 className="text-base font-semibold text-[var(--ink-soft)]">
            Explore the Quran
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Search by theme — AI finds the most relevant verses.
          </p>
        </div>
        <ExploreClient />
      </main>
    </div>
  );
}
