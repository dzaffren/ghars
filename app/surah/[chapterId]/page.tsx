import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getRequiredSession } from "@/lib/auth/session";
import { fetchChapterVerses } from "@/lib/qf/content-client";
import AppHeader from "@/components/AppHeader";
import { ChevronLeft } from "lucide-react";

// Chapter names (first 30 — enough for bookmarked surahs in a typical user)
const CHAPTER_NAMES: Record<number, string> = {
  1: "Al-Fatihah",
  2: "Al-Baqarah",
  3: "Ali 'Imran",
  4: "An-Nisa",
  5: "Al-Ma'idah",
  6: "Al-An'am",
  7: "Al-A'raf",
  8: "Al-Anfal",
  9: "At-Tawbah",
  10: "Yunus",
  11: "Hud",
  12: "Yusuf",
  13: "Ar-Ra'd",
  14: "Ibrahim",
  15: "Al-Hijr",
  16: "An-Nahl",
  17: "Al-Isra",
  18: "Al-Kahf",
  19: "Maryam",
  20: "Ta-Ha",
  21: "Al-Anbiya",
  22: "Al-Hajj",
  23: "Al-Mu'minun",
  24: "An-Nur",
  25: "Al-Furqan",
  26: "Ash-Shu'ara",
  27: "An-Naml",
  28: "Al-Qasas",
  29: "Al-'Ankabut",
  30: "Ar-Rum",
  36: "Ya-Sin",
  49: "Al-Hujurat",
  55: "Ar-Rahman",
  67: "Al-Mulk",
  93: "Ad-Duhaa",
  94: "Ash-Sharh",
  112: "Al-Ikhlas",
  113: "Al-Falaq",
  114: "An-Nas",
};

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

  const highlightAyah = ayahParam ? parseInt(ayahParam, 10) : null;

  let verses;
  try {
    verses = await fetchChapterVerses(chId);
  } catch {
    notFound();
  }

  const chapterName = CHAPTER_NAMES[chId] ?? `Surah ${chId}`;

  return (
    <div className="min-h-screen">
      <AppHeader variant="reflections" />
      <main className="mx-auto w-full max-w-md px-4 pb-12 pt-4 space-y-4">
        {/* Back */}
        <Link
          href="/bookmarks"
          className="flex items-center gap-1 text-xs text-[var(--ink-soft)] hover:text-primary"
        >
          <ChevronLeft size={14} />
          Bookmarks
        </Link>

        {/* Heading */}
        <div className="space-y-0.5">
          <h1 className="text-lg font-bold text-[#1a3a2a]">{chapterName}</h1>
          <p className="text-xs text-muted-foreground">
            Surah {chId} · {verses.length} verses
          </p>
        </div>

        {/* Verse list */}
        <div className="space-y-3">
          {verses.map((verse) => {
            const isHighlighted =
              highlightAyah !== null && verse.verse_number === highlightAyah;
            return (
              <div
                key={verse.verse_key}
                id={`ayah-${verse.verse_number}`}
                className={`rounded-2xl border px-4 py-4 space-y-2 transition-colors ${
                  isHighlighted
                    ? "border-primary bg-[var(--green-fog)] shadow-[0_0_0_2px_rgba(45,106,79,0.15)]"
                    : "border-[var(--green-fog)] bg-white/80"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--green-fog)] text-[10px] font-semibold text-primary">
                    {verse.verse_number}
                  </span>
                  <p className="arabic-text text-right leading-loose flex-1">
                    {verse.text_uthmani}
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-[var(--ink-soft)]/85 pl-8">
                  {verse.translation}
                </p>
              </div>
            );
          })}
        </div>
      </main>

      {/* Auto-scroll to highlighted ayah */}
      {highlightAyah && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var el = document.getElementById('ayah-${highlightAyah}');
                if(el) el.scrollIntoView({behavior:'smooth', block:'center'});
              })();
            `,
          }}
        />
      )}
    </div>
  );
}
