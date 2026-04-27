import { redirect, notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { getRequiredSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import CircleDetail from "./CircleDetail";

export default async function CircleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: circleId } = await params;
  const session = await getRequiredSession();
  if (!session) redirect("/");

  const db = createServerClient();

  // Verify user is a member of this circle
  const { data: membership } = await db
    .from("circle_members")
    .select("circle_id")
    .eq("circle_id", circleId)
    .eq("user_id", session.userId)
    .single();

  if (!membership) notFound();

  // Fetch circle info
  const { data: circle } = await db
    .from("circles")
    .select("id, name, owner_id")
    .eq("id", circleId)
    .single();

  if (!circle) notFound();

  // Fetch members then gardens via explicit queries. Supabase's embedded
  // resource syntax can silently drop rows when the relationship chain
  // (circle_members → users → gardens) isn't resolved — we saw the detail
  // view show 0 members while the list view showed the correct count.
  const { data: memberRows } = await db
    .from("circle_members")
    .select("user_id, users(display_name)")
    .eq("circle_id", circleId);

  const userIds = (memberRows ?? []).map((m) => m.user_id);
  const { data: gardenRows } = userIds.length
    ? await db
        .from("gardens")
        .select("user_id, growth_points, current_streak, wilting")
        .in("user_id", userIds)
    : {
        data: [] as Array<{
          user_id: string;
          growth_points: number;
          current_streak: number;
          wilting: boolean;
        }>,
      };

  const gardenMap = new Map(
    (gardenRows ?? []).map((g) => [g.user_id, g] as const)
  );

  const memberData = (memberRows ?? []).map((m) => {
    const u = Array.isArray(m.users) ? m.users[0] : m.users;
    const g = gardenMap.get(m.user_id);
    return {
      userId: m.user_id,
      displayName:
        (u as { display_name: string | null } | null)?.display_name ?? "Member",
      isYou: m.user_id === session.userId,
      isOwner: m.user_id === circle.owner_id,
      garden: {
        growthPoints: g?.growth_points ?? 0,
        currentStreak: g?.current_streak ?? 0,
        wilting: g?.wilting ?? false,
      },
    };
  });

  // Sort: you first, then by streak desc
  memberData.sort((a, b) => {
    if (a.isYou) return -1;
    if (b.isYou) return 1;
    return b.garden.currentStreak - a.garden.currentStreak;
  });

  return (
    <div className="min-h-screen">
      <AppHeader variant="circles" />
      <main className="mx-auto w-full max-w-md px-4 pb-10 pt-4 space-y-5">
        <CircleDetail
          circle={circle as { id: string; name: string; owner_id: string }}
          members={memberData}
          currentUserId={session.userId!}
        />
      </main>
    </div>
  );
}
