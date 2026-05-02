"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X } from "lucide-react";

interface Props {
  verse_key: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function TafsirFullDrawer({ verse_key, open, onOpenChange }: Props) {
  const [text, setText] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (open && !loaded) {
      fetch(`/api/content/tafsir/${verse_key}?full=true`)
        .then((r) => r.json())
        .then((d) => {
          setText(d.text ?? "");
          setLoaded(true);
        })
        .catch(() => {
          setFailed(true);
          setLoaded(true);
        });
    }
  }, [open, loaded, verse_key]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="tafsir-backdrop"
            className="fixed inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onOpenChange(false)}
            aria-hidden="true"
          />

          <motion.div
            key="tafsir-sheet"
            className="fixed inset-x-0 bottom-0 z-50 flex justify-center"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tafsir-title"
          >
            <div
              className="w-full max-w-2xl rounded-t-2xl pb-[env(safe-area-inset-bottom,0)] flex flex-col max-h-[85vh]"
              style={{
                backgroundColor: "var(--cream, #faf7f0)",
                boxShadow:
                  "0 -12px 40px -8px rgba(26,58,42,0.25), 0 -2px 8px rgba(26,58,42,0.06)",
                borderTop: "1px solid rgba(82,183,136,0.25)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center pt-3 pb-2">
                <div
                  className="w-10 h-1 rounded-full"
                  style={{ backgroundColor: "rgba(82,183,136,0.35)" }}
                />
              </div>

              <div
                className="flex items-start justify-between gap-4 px-6 pt-1 pb-3"
                style={{ borderBottom: "1px solid rgba(82,183,136,0.15)" }}
              >
                <div className="min-w-0">
                  <h3
                    id="tafsir-title"
                    className="text-base font-semibold leading-tight"
                    style={{ color: "var(--grove-green)" }}
                  >
                    Full Tafsir
                  </h3>
                  <p
                    className="text-[11px] uppercase tracking-widest mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Ibn Kathir · {verse_key}
                  </p>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  aria-label="Close tafsir"
                  className="shrink-0 rounded-full p-1.5 transition-colors hover:bg-black/5"
                  style={{ color: "var(--text-muted)" }}
                >
                  <X size={18} strokeWidth={1.8} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                {!loaded && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2
                      size={24}
                      className="animate-spin"
                      style={{ color: "var(--grove-green-light)" }}
                    />
                  </div>
                )}
                {loaded && failed && (
                  <p
                    className="text-sm text-center py-8"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Tafsir could not be loaded. Please try again.
                  </p>
                )}
                {loaded && !failed && (
                  <div
                    className="tafsir-prose"
                    style={{ color: "var(--foreground)" }}
                    dangerouslySetInnerHTML={{ __html: text }}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
