import { NextRequest, NextResponse } from "next/server";
import { getVerseByKey, getTranslation, getAudioUrl } from "@/lib/qf/content";

const VERSE_KEY_RE = /^\d{1,3}:\d{1,3}$/;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  if (!VERSE_KEY_RE.test(key)) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_VERSE_KEY",
          message: "verse_key must match {chapter}:{verse}",
        },
      },
      { status: 400 }
    );
  }
  try {
    const [verse, translation, audio] = await Promise.all([
      getVerseByKey(key),
      getTranslation(key),
      getAudioUrl(key),
    ]);
    return NextResponse.json(
      {
        ...verse,
        translation: translation.text,
        translation_id: "131",
        tafsir_extract: null,
        audio_url: audio.audio_url,
      },
      { headers: { "Cache-Control": "public, s-maxage=86400" } }
    );
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "QF_CONTENT_UNAVAILABLE",
          message: "Quran content service is temporarily unreachable",
        },
      },
      { status: 503 }
    );
  }
}
