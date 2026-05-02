import { NextRequest, NextResponse } from "next/server";
import DOMPurify from "isomorphic-dompurify";
import { getFullTafsir } from "@/lib/qf/content";

const VERSE_KEY_RE = /^\d{1,3}:\d{1,3}$/;

const TAFSIR_ALLOWED_TAGS = [
  "p",
  "br",
  "h2",
  "h3",
  "h4",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "blockquote",
  "sup",
  "sub",
  "span",
];
const TAFSIR_ALLOWED_ATTR = ["dir", "lang"];

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
    const tafsir = await getFullTafsir(key);
    const safeHtml = DOMPurify.sanitize(tafsir.text ?? "", {
      ALLOWED_TAGS: TAFSIR_ALLOWED_TAGS,
      ALLOWED_ATTR: TAFSIR_ALLOWED_ATTR,
    });
    return NextResponse.json(
      { ...tafsir, text: safeHtml },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=86400, stale-while-revalidate=3600",
        },
      }
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
