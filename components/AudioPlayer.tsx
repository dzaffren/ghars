"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Pause, Play } from "lucide-react";

interface Props {
  url: string;
  label?: string;
  tone?: "light" | "dark";
}

export default function AudioPlayer({
  url,
  label = "Listen to recitation",
  tone = "light",
}: Props) {
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

  const darkClass =
    "border-transparent bg-white/12 text-white hover:bg-white/20 hover:border-transparent";
  const lightClass =
    "border-primary/40 text-primary hover:border-primary hover:bg-primary/10";

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      aria-label={playing ? "Pause recitation" : label}
      className={`rounded-full ${tone === "dark" ? darkClass : lightClass}`}
    >
      {loading ? (
        <Loader2 className="animate-spin" />
      ) : playing ? (
        <Pause />
      ) : (
        <Play />
      )}
      {playing ? "Pause" : label}
    </Button>
  );
}
