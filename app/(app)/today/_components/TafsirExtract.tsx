interface Props {
  extract: string;
  onExpand: () => void;
}

export function TafsirExtract({ extract, onExpand }: Props) {
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: "#f0f7f4" }}>
      <p
        className="text-xs uppercase tracking-widest mb-2"
        style={{ color: "var(--grove-green)" }}
      >
        Tafsir (Ibn Kathir)
      </p>
      <p
        className="text-sm leading-relaxed"
        style={{ color: "var(--foreground)" }}
        data-testid="tafsir-extract"
      >
        {extract}
      </p>
      <button
        onClick={onExpand}
        className="mt-2 text-xs underline"
        style={{ color: "var(--grove-green-light)" }}
        data-testid="tafsir-full-trigger"
      >
        Read full tafsir
      </button>
    </div>
  );
}
