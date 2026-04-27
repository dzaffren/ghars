import { redirect, notFound } from "next/navigation";
import { getRequiredSession } from "@/lib/auth/session";
import { getValidQfAccessToken } from "@/lib/auth/qf-oauth";
import {
  fetchChapterVerses,
  fetchChapters,
  fetchChapterAudioUrl,
  type ChapterVerse,
} from "@/lib/qf/content-client";
import { getBookmarks } from "@/lib/qf/user-client";
import AppHeader from "@/components/AppHeader";
import SurahClient from "./SurahClient";

interface QFChapter {
  id: number;
  name_simple?: string;
  name_arabic?: string;
  verses_count?: number;
}

interface QFBookmarkRow {
  surah_number: number;
  ayah_number: number;
}

export default async function SurahPage({
  params,
  searchParams,
}: {
  params: Promise<{ chapterId: string }>;
  searchParams: Promise<{ ayah?: string }>;
}) {
  const { chapterId } = await params;
  const { ayah: ayahParam } = await searchParams;

  const session = await getRequiredSession();
  if (!session) redirect("/");

  const chId = parseInt(chapterId, 10);
  if (isNaN(chId) || chId < 1 || chId > 114) notFound();

  const initialHighlight = ayahParam ? parseInt(ayahParam, 10) : undefined;

  // Fetch chapter-specific data in parallel. On any failure, we still
  // render the page and let the client show a retry UI.
  let verses: ChapterVerse[] = [];
  let chapterName = `Surah ${chId}`;
  let audioUrl: string | null = null;
  let loadError = false;

  try {
    const [chaptersData, versesData, audio] = await Promise.all([
      fetchChapters(),
      fetchChapterVerses(chId),
      fetchChapterAudioUrl(chId),
    ]);
    verses = versesData;
    audioUrl = audio;
    const list: QFChapter[] = chaptersData?.chapters ?? [];
    const match = list.find((c) => Number(c.id) === chId);
    if (match?.name_simple) chapterName = match.name_simple;
  } catch (err) {
    console.error("[SurahPage] content fetch failed:", String(err));
    loadError = true;
  }

  // Load user's bookmarks (best-effort; empty set on any failure)
  const initialBookmarks = new Set<string>();
  try {
    const token = await getValidQfAccessToken(session.userId!);
    if (token) {
      const data = await getBookmarks(token);
      const raw: QFBookmarkRow[] = Array.isArray(data)
        ? data
        : (data?.data ?? data?.bookmarks ?? []);
      for (const b of raw) {
        if (
          typeof b?.surah_number === "number" &&
          typeof b?.ayah_number === "number"
        ) {
          initialBookmarks.add(`${b.surah_number}:${b.ayah_number}`);
        }
      }
    }
  } catch {
    // Non-critical; show page without pre-marked bookmarks
  }

  return (
    <div className="min-h-screen">
      <AppHeader variant="reflections" />
      <SurahClient
        chapterId={chId}
        chapterName={chapterName}
        verses={verses}
        audioUrl={audioUrl}
        initialBookmarks={Array.from(initialBookmarks)}
        initialHighlight={initialHighlight}
        loadError={loadError}
      />
    </div>
  );
}
