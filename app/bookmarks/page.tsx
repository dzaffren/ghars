import { redirect } from "next/navigation";
import Link from "next/link";
import { getRequiredSession } from "@/lib/auth/session";
import { getValidQfAccessToken } from "@/lib/auth/qf-oauth";
import { getBookmarks } from "@/lib/qf/user-client";
import AppHeader from "@/components/AppHeader";
import { Bookmark } from "lucide-react";

interface QFBookmark {
  surah_number: number;
  ayah_number: number;
  collection_id?: string;
}

function verseKey(b: QFBookmark) {
  return `${b.surah_number}:${b.ayah_number}`;
}

export default async function BookmarksPage() {
  const session = await getRequiredSession();
  if (!session) redirect("/");

  const token = await getValidQfAccessToken(session.userId!);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let bookmarks: QFBookmark[] = [];

  if (token) {
    try {
      const data = await getBookmarks(token);
      // QF returns { data: [...] } or { bookmarks: [...] } depending on version
      const raw = data?.data ?? data?.bookmarks ?? data ?? [];
      bookmarks = Array.isArray(raw) ? raw : [];
    } catch {
      // Best-effort — show empty state if QF is unavailable
    }
  }

  return (
    <div className="min-h-screen">
      <AppHeader variant="reflections" />
      <main className="mx-auto w-full max-w-md px-4 pb-8 pt-4 space-y-5">
        <div className="flex items-baseline justify-between">
          <h1 className="text-base font-semibold text-[var(--ink-soft)]">
            Bookmarked verses
          </h1>
          <span className="text-xs text-muted-foreground">
            {bookmarks.length} saved
          </span>
        </div>

        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Bookmark size={32} className="text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              No bookmarks yet. Tap the{" "}
              <Bookmark size={14} className="inline" /> icon on any verse in
              Today to save it here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {bookmarks.map((b) => {
              const key = verseKey(b);
              const chapterId = b.surah_number;
              const ayah = b.ayah_number;
              return (
                <Link
                  key={`${b.surah_number}-${b.ayah_number}`}
                  href={`/surah/${chapterId}?ayah=${ayah}`}
                  className="flex items-center justify-between rounded-2xl border border-[var(--green-fog)] bg-white/80 px-4 py-3.5 shadow-[0_1px_8px_-4px_rgba(45,106,79,0.10)] transition-shadow hover:shadow-[0_4px_16px_-4px_rgba(45,106,79,0.14)]"
                >
                  <div>
                    <p className="text-sm font-medium text-[#1a3a2a]">
                      Surah {chapterId}, Verse {ayah}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{key}</p>
                  </div>
                  <Bookmark
                    size={14}
                    className="text-primary/50 flex-shrink-0"
                  />
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
