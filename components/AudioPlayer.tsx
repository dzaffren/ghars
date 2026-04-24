"use client";

import { useState, useRef } from "react";

interface Props {
  url: string;
  label?: string;
}

export default function AudioPlayer({ url, label = "Listen to recitation" }: Props) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function toggle() {
    if (!audioRef.current) {
      setLoading(true);
      audioRef.current = new Audio(url);
      audioRef.current.onended = () => setPlaying(false);
      audioRef.current.oncanplay = () => setLoading(false);
    }

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      setLoading(true);
      try {
        await audioRef.current.play();
        setPlaying(true);
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 text-sm text-[#2d6a4f] hover:text-[#1b4332] font-medium py-1.5 px-3 rounded-full border border-[#52b788]/40 hover:border-[#2d6a4f] transition-colors"
      aria-label={playing ? "Pause recitation" : label}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : playing ? (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
      {playing ? "Pause" : label}
    </button>
  );
}
