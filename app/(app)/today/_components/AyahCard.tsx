interface Props {
  arabic: string;
  translation: string;
  surah_name: string;
  ayah_number: number;
}

export function AyahCard({
  arabic,
  translation,
  surah_name,
  ayah_number,
}: Props) {
  return (
    <div
      className="rounded-2xl p-6 shadow-sm"
      style={{ backgroundColor: "white" }}
    >
      <p
        className="text-xs uppercase tracking-widest mb-4"
        style={{ color: "var(--text-muted)" }}
      >
        {surah_name} · {ayah_number}
      </p>
      <p
        className="text-2xl leading-loose text-right mb-4"
        dir="rtl"
        lang="ar"
        translate="no"
        data-testid="ayah-arabic"
      >
        {arabic}
      </p>
      <p
        className="text-base leading-relaxed"
        style={{ color: "var(--foreground)" }}
        data-testid="ayah-translation"
      >
        {translation}
      </p>
    </div>
  );
}
