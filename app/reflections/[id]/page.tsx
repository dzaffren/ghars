import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getRequiredSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import ArabicText from "@/components/words/ArabicText";
import PendingDetailCallout from "./PendingDetailCallout";
// MarkerReveal is authored by the parallel Task 4 agent. We import it
// statically so the detail page renders the per-marker breakdown in
// non-animating mode. Until the sibling branch merges, the module
// will not resolve locally — @ts-ignore (not expect-error) so the
// directive remains inert once the real component lands.
// @ts-ignore — Task 4 introduces this component; resolves on merge.
import MarkerReveal from "@/components/MarkerReveal";
import { ChevronLeft } from "lucide-react";
import type { MarkerBundle } from "@/lib/llm/types";

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
      reflections(id, text, marker_count, markers_json, status, created_at)
    `
    )
    .eq("id", id)
    .eq("user_id", session.userId)
    .single();

  if (!mission) notFound();

  const ref = Array.isArray(mission.reflections)
    ? mission.reflections[0]
    : mission.reflections;

  // Narrow the Supabase row once so the render tree only has to branch
  // on `status`. `markers_json` comes back as `any` from the json column
  // — we trust the API-side validation performed on write.
  type ReflectionRow = {
    id: string;
    text: string;
    marker_count: number | null;
    markers_json: MarkerBundle | null;
    status: "scored" | "pending";
    created_at: string;
  };
  const reflection: ReflectionRow | null = ref
    ? (ref as unknown as ReflectionRow)
    : null;

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
            <ArabicText
              text={mission.verse_arabic}
              verseKey={mission.verse_key}
              className="text-right leading-loose"
            />
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
        {reflection ? (
          <div className="space-y-3">
            <div className="rounded-2xl border border-[var(--green-fog)] bg-white/80 px-5 py-4 space-y-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--ink-soft)]">
                Your reflection
              </p>
              <p className="text-sm leading-relaxed text-foreground">
                {reflection.text}
              </p>
            </div>

            {/* Marker breakdown or pending banner depending on status.
                The MarkerReveal renders in static (non-animating) mode
                — the animation plays exactly once on submission, per
                the spec. */}
            {reflection.status === "scored" &&
            reflection.marker_count !== null &&
            reflection.markers_json ? (
              <MarkerReveal
                markers={reflection.markers_json}
                markerCount={reflection.marker_count}
                animate={false}
              />
            ) : (
              <PendingDetailCallout reflectionId={reflection.id} />
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
