import { redirect } from "next/navigation";
import { getRequiredSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function HistoryPage() {
  const session = await getRequiredSession();
  if (!session) redirect("/");

  const db = createServerClient();

  const { data: missions } = await db
    .from("daily_missions")
    .select(
      `
      id, local_date, verse_key, mission_text, focus_area, verse_translation,
      reflections(llm_verdict, depth_score, text)
    `
    )
    .eq("user_id", session.userId)
    .order("local_date", { ascending: false })
    .limit(30);

  const { data: garden } = await db
    .from("gardens")
    .select("growth_points, current_streak, longest_streak")
    .eq("user_id", session.userId)
    .single();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-4 py-3 border-b border-[#52b788]/20 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <Link href="/today" className="font-bold text-[#1a3a2a]">
          ← Ghars
        </Link>
        <span className="text-sm text-[#555]">My history</span>
      </nav>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-6">
        {/* Summary */}
        {garden && (
          <div className="flex gap-3 justify-center text-center">
            <div className="flex-1 rounded-xl bg-white border border-[#52b788]/20 py-3 px-4">
              <div className="text-lg font-bold text-[#2d6a4f]">
                {garden.growth_points}
              </div>
              <div className="text-xs text-[#555]">growth pts</div>
            </div>
            <div className="flex-1 rounded-xl bg-white border border-[#52b788]/20 py-3 px-4">
              <div className="text-lg font-bold text-[#2d6a4f]">
                {garden.current_streak}
              </div>
              <div className="text-xs text-[#555]">current streak</div>
            </div>
            <div className="flex-1 rounded-xl bg-white border border-[#52b788]/20 py-3 px-4">
              <div className="text-lg font-bold text-[#2d6a4f]">
                {garden.longest_streak}
              </div>
              <div className="text-xs text-[#555]">best streak</div>
            </div>
          </div>
        )}

        {/* Mission log */}
        <div className="space-y-3">
          {!missions?.length && (
            <p className="text-center text-[#aaa] py-8">
              No missions yet. Come back after completing your first one!
            </p>
          )}
          {missions?.map((m) => {
            const ref = Array.isArray(m.reflections)
              ? m.reflections[0]
              : m.reflections;
            const completed = ref?.llm_verdict === "accepted";

            return (
              <div
                key={m.id}
                className={`rounded-xl border bg-white px-4 py-4 space-y-2 ${
                  completed
                    ? "border-[#52b788]/40"
                    : "border-gray-200 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="text-xs text-[#999]">{m.local_date}</div>
                  <div className="flex items-center gap-2">
                    {m.focus_area && (
                      <span className="text-xs capitalize bg-[#d8f3dc] text-[#1b4332] rounded-full px-2 py-0.5">
                        {m.focus_area}
                      </span>
                    )}
                    <span className="text-xs text-[#999]">{m.verse_key}</span>
                    {completed ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-gray-300">○</span>
                    )}
                  </div>
                </div>
                <p className="text-sm font-medium text-[#1a3a2a]">
                  {m.mission_text}
                </p>
                {ref?.text && (
                  <p className="text-xs text-[#666] italic line-clamp-2">
                    &ldquo;{ref.text}&rdquo;
                  </p>
                )}
                {completed && ref?.depth_score && (
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-xs ${
                          i < ref.depth_score
                            ? "text-[#d4a017]"
                            : "text-gray-200"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
