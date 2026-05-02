"use client";

import { useEffect, useState } from "react";

interface Props {
  verse_key: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function TafsirFullDrawer({ verse_key, open, onOpenChange }: Props) {
  const [text, setText] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (open && !loaded) {
      fetch(`/api/content/tafsir/${verse_key}?full=true`)
        .then((r) => r.json())
        .then((d) => {
          setText(d.text ?? "");
          setLoaded(true);
        })
        .catch(() => {
          setText("Tafsir could not be loaded.");
          setLoaded(true);
        });
    }
  }, [open, loaded, verse_key]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={() => onOpenChange(false)}
    >
      <div
        className="mt-auto rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto"
        style={{ backgroundColor: "white" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold" style={{ color: "var(--grove-green)" }}>
            Full Tafsir — Ibn Kathir
          </h3>
          <button
            onClick={() => onOpenChange(false)}
            className="text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Close
          </button>
        </div>
        <p
          className="text-sm leading-relaxed whitespace-pre-wrap"
          style={{ color: "var(--foreground)" }}
        >
          {loaded ? text : "Loading…"}
        </p>
      </div>
    </div>
  );
}
