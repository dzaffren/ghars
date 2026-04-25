import { redirect } from "next/navigation";
import { getRequiredSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import ReflectionArchive from "./ReflectionArchive";

export default async function ReflectionsPage() {
  const session = await getRequiredSession();
  if (!session) redirect("/");

  const db = createServerClient();

  const { data: missions } = await db
    .from("daily_missions")
    .select(
      `id, local_date, verse_key, verse_translation, mission_text, focus_area,
       reflections(id, text, llm_verdict, llm_feedback, depth_score)`
    )
    .eq("user_id", session.userId)
    .order("local_date", { ascending: false })
    .limit(90);

  // Only show missions that have at least an attempted reflection
  const entries = (missions ?? []).filter((m) => {
    const ref = Array.isArray(m.reflections) ? m.reflections[0] : m.reflections;
    return ref !== null && ref !== undefined;
  });

  return (
    <div className="min-h-screen">
      <AppHeader variant="reflections" />
      <main className="mx-auto w-full max-w-md px-4 pb-8 pt-4">
        <div className="mb-5 flex items-baseline justify-between">
          <h1 className="text-base font-semibold text-[var(--ink-soft)]">
            Reflection journal
          </h1>
          <span className="text-xs text-muted-foreground">
            {entries.length} entries
          </span>
        </div>
        <ReflectionArchive entries={entries} />
      </main>
    </div>
  );
}
