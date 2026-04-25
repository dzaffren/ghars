import { redirect } from "next/navigation";
import { getRequiredSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import CirclesList from "./CirclesList";

export default async function CirclesPage() {
  const session = await getRequiredSession();
  if (!session) redirect("/");

  const db = createServerClient();

  const { data: memberships } = await db
    .from("circle_members")
    .select("circle_id, circles(id, name, owner_id, created_at)")
    .eq("user_id", session.userId);

  const circleIds = (memberships ?? []).map((m) => m.circle_id);

  let memberCounts: Record<string, number> = {};
  if (circleIds.length) {
    const { data: counts } = await db
      .from("circle_members")
      .select("circle_id")
      .in("circle_id", circleIds);
    for (const row of counts ?? []) {
      memberCounts[row.circle_id] = (memberCounts[row.circle_id] ?? 0) + 1;
    }
  }

  const circles = (memberships ?? []).map((m) => {
    const c = Array.isArray(m.circles) ? m.circles[0] : m.circles;
    return {
      ...(c as {
        id: string;
        name: string;
        owner_id: string;
        created_at: string;
      }),
      memberCount: memberCounts[m.circle_id] ?? 1,
    };
  });

  return (
    <div className="min-h-screen">
      <AppHeader variant="circles" />
      <main className="mx-auto w-full max-w-md px-4 pb-10 pt-4 space-y-5">
        <div className="flex items-baseline justify-between">
          <h1 className="text-base font-semibold text-[var(--ink-soft)]">
            Garden circles
          </h1>
          <span className="text-xs text-muted-foreground">
            {circles.length}/3 joined
          </span>
        </div>
        <CirclesList circles={circles} userId={session.userId!} />
      </main>
    </div>
  );
}
