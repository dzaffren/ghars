import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getReflectionById } from "@/lib/db/reflections";
import { isBookmarked } from "@/lib/db/journal";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const { id } = await params;
  const reflection = await getReflectionById(id);
  if (!reflection)
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const supabase = createAdminSupabaseClient();
  const { data: mission } = await supabase
    .from("missions")
    .select("daily_assignments(verse_key, user_id)")
    .eq("id", reflection.mission_id)
    .single();

  const da = mission?.daily_assignments as unknown as {
    verse_key: string;
    user_id: string;
  } | null;
  if (!da || da.user_id !== session.userId)
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const bookmarked = await isBookmarked(session.userId, da.verse_key);

  return NextResponse.json({
    ...reflection,
    reflection_id: reflection.id,
    verse_key: da.verse_key,
    is_bookmarked: bookmarked,
    is_editable: new Date() < new Date(reflection.window_closes_at),
  });
}
