import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getRequiredSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import { ChevronLeft } from "lucide-react";

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function DepthStars({ score }: { score: number | null }) {
  if (!score) return null;
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`text-sm ${i < score ? "text-[#d4a017]" : "text-muted-foreground/25"}`}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default async function ReflectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getRequiredSession();
  if (!session) redirect("/");

  const db = createServerClient();

  const { data: mission } = await db
    .from("daily_missions")
    .select(
      `
      id, local_date, verse_key, verse_arabic, verse_translation,
      tafsir_snippet, mission_text, focus_area,
      reflections(text, llm_verdict, llm_feedback, depth_score)
    `
    )
    .eq("id", id)
    .eq("user_id", session.userId)
    .single();

  if (!mission) notFound();

  const ref = Array.isArray(mission.reflections)
    ? mission.reflections[0]
    : mission.reflections;

  const accepted = ref?.llm_verdict === "accepted";

  return (
    <div className="min-h-screen">
      <AppHeader variant="reflections" />
      <main className="mx-auto w-full max-w-md px-4 pb-12 pt-4 space-y-5">
        {/* Back */}
        <Link
          href="/reflections"
          className="flex items-center gap-1 text-xs text-[var(--ink-soft)] hover:text-primary"
        >
          <ChevronLeft size={14} />
          Journal
        </Link>

        {/* Date + focus */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--ink-soft)]/65">
            {formatDate(mission.local_date)}
          </p>
          {mission.focus_area && (
            <span className="rounded-full bg-[var(--green-fog)] px-2.5 py-1 text-[10px] capitalize text-primary">
              {mission.focus_area}
            </span>
          )}
        </div>

        {/* Verse */}
        <div className="rounded-2xl bg-gradient-to-br from-[#1a3a2a] via-[#1f4434] to-[#26563f] px-5 py-5 text-white space-y-3">
          <p className="text-[11px] opacity-50">Verse {mission.verse_key}</p>
          {mission.verse_arabic && (
            <p className="arabic-text text-right leading-loose">
              {mission.verse_arabic}
            </p>
          )}
          <p className="text-sm leading-relaxed opacity-90">
            {mission.verse_translation}
          </p>
          {mission.tafsir_snippet && (
            <details className="text-xs text-white/60">
              <summary className="cursor-pointer hover:text-white/80">
                Ibn Kathir
              </summary>
              <p className="mt-2 leading-relaxed">{mission.tafsir_snippet}</p>
            </details>
          )}
        </div>

        {/* Mission */}
        <div className="rounded-2xl border border-[var(--green-fog)] bg-white/80 px-5 py-4 space-y-1">
          <p className="text-[10px] font-medium uppercase tracking-wide text-primary">
            Mission
          </p>
          <p className="text-sm font-medium leading-relaxed text-foreground">
            {mission.mission_text}
          </p>
        </div>

        {/* Reflection */}
        {ref ? (
          <div className="space-y-3">
            <div className="rounded-2xl border border-[var(--green-fog)] bg-white/80 px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--ink-soft)]">
                  Your reflection
                </p>
                <div className="flex items-center gap-2">
                  <DepthStars score={ref.depth_score ?? null} />
                  {!accepted && (
                    <span className="text-[10px] text-muted-foreground">
                      not completed
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm leading-relaxed text-foreground">
                {ref.text}
              </p>
            </div>

            {ref.llm_feedback && (
              <div className="rounded-2xl bg-[var(--cream-deep)] px-5 py-4 space-y-1">
                <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--ink-soft)]/60">
                  Feedback
                </p>
                <p className="text-sm italic text-[var(--ink-soft)]/80">
                  {ref.llm_feedback}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-6">
            No reflection was written for this mission.
          </p>
        )}
      </main>
    </div>
  );
}
