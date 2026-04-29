"use client";

interface Props {
  text: string;
  verseKey: string;
  className?: string;
  onWordTap?: (verseKey: string, position: number) => void;
}

export default function ArabicText({
  text,
  verseKey,
  className = "",
  onWordTap,
}: Props) {
  const tokens = text.split(/\s+/).filter(Boolean);

  return (
    <p className={`arabic-text ${className}`}>
      {tokens.map((token, i) => {
        const position = i + 1;
        if (onWordTap) {
          return (
            <span
              key={i}
              data-position={position}
              className="cursor-pointer hover:underline decoration-primary/40"
              onClick={() => onWordTap(verseKey, position)}
            >
              {token}
              {i < tokens.length - 1 ? " " : ""}
            </span>
          );
        }
        return (
          <span key={i} data-position={position}>
            {token}
            {i < tokens.length - 1 ? " " : ""}
          </span>
        );
      })}
    </p>
  );
}
