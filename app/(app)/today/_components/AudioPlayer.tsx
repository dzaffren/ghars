"use client";

import { useRef, useState } from "react";

interface Props {
  src: string;
}

export function AudioPlayer({ src }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!src) return null;

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  }

  function onTimeUpdate() {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgress((audio.currentTime / audio.duration) * 100);
  }

  return (
    <div
      className="flex items-center gap-3 rounded-xl p-4"
      style={{ backgroundColor: "white" }}
    >
      <button
        onClick={togglePlay}
        className="w-10 h-10 rounded-full flex items-center justify-center text-white"
        style={{ backgroundColor: "var(--grove-green)" }}
        data-testid="audio-play"
        aria-label={playing ? "Pause recitation" : "Play recitation"}
      >
        {playing ? "⏸" : "▶"}
      </button>
      <div
        className="flex-1 h-1 rounded-full"
        style={{ backgroundColor: "#e5e7eb" }}
      >
        <div
          className="h-1 rounded-full"
          style={{
            width: `${progress}%`,
            backgroundColor: "var(--grove-green)",
          }}
        />
      </div>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={onTimeUpdate}
        onEnded={() => setPlaying(false)}
      />
    </div>
  );
}
