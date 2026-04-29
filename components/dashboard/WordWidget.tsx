// Note: WordSheet wiring is skipped here because VerseWord does not carry a
// verse_key field — tapping to open WordSheet requires a verse_key. If/when
// VerseWord is extended with verse_key, convert this to "use client" and wire
// WordSheet similarly to SurahClient.
import DashboardCard from "./DashboardCard";
import type { VerseWord } from "@/lib/qf/content-client";

interface Props {
  word: VerseWord | null;
}

export default function WordWidget({ word }: Props) {
  return (
    <DashboardCard>
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-[var(--ink-soft)]/60">
        Word of the day
      </p>
      {!word ? (
        <p className="text-xs text-muted-foreground">No word today</p>
      ) : (
        <>
          <p
            className="arabic-text text-[#1a3a2a] leading-none mb-1"
            style={{ fontSize: "1.35rem" }}
          >
            {word.text_uthmani}
          </p>
          {word.transliteration && (
            <p className="text-[10px] font-mono text-muted-foreground">
              {word.transliteration}
            </p>
          )}
          <p className="mt-1 text-xs font-medium text-[#1a3a2a] truncate">
            {word.translation}
          </p>
        </>
      )}
    </DashboardCard>
  );
}
