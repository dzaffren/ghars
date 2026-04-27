import { NextRequest, NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { fetchVerse } from "@/lib/qf/content-client";

export async function GET(req: NextRequest) {
  const session = await getRequiredSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const key = req.nextUrl.searchParams.get("key");
  if (!key || !/^\d+:\d+$/.test(key)) {
    return NextResponse.json(
      { error: "valid ?key=surah:ayah required" },
      { status: 400 }
    );
  }

  try {
    const data = await fetchVerse(key);
    return NextResponse.json({ tafsir: data.tafsirSnippet ?? "" });
  } catch (err) {
    console.error("[GET /api/verse]", String(err));
    return NextResponse.json({ error: "Tafsir unavailable" }, { status: 502 });
  }
}
