import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { addBookmark, removeBookmark } from "@/lib/db/journal";
import { addQFBookmark, removeQFBookmark } from "@/lib/qf/bookmarks";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const { verse_key, reflection_id } = await request.json();
  if (!verse_key)
    return NextResponse.json({ error: "MISSING_VERSE_KEY" }, { status: 400 });

  // Local mirror first (canonical)
  await addBookmark(session.userId, verse_key, reflection_id);

  // QF sync (best-effort)
  const qfId = await addQFBookmark(
    session.accessToken,
    verse_key,
    session.userId
  );
  if (qfId) {
    const supabase = createAdminSupabaseClient();
    await supabase
      .from("bookmarks_mirror")
      .update({ qf_bookmark_id: qfId })
      .eq("user_id", session.userId)
      .eq("verse_key", verse_key);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const { verse_key } = await request.json();
  if (!verse_key)
    return NextResponse.json({ error: "MISSING_VERSE_KEY" }, { status: 400 });

  // Get QF bookmark ID before deleting mirror
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from("bookmarks_mirror")
    .select("qf_bookmark_id")
    .eq("user_id", session.userId)
    .eq("verse_key", verse_key)
    .single();

  await removeBookmark(session.userId, verse_key);

  if (data?.qf_bookmark_id) {
    await removeQFBookmark(
      session.accessToken,
      data.qf_bookmark_id,
      session.userId
    );
  }

  return NextResponse.json({ ok: true });
}
