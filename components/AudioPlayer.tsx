"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, Pause, Play } from "lucide-react";

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
  const [error, setError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function ensureAudio() {
    if (audioRef.current) return audioRef.current;
    const a = new Audio(url);
    a.onended = () => setPlaying(false);
    a.oncanplay = () => setLoading(false);
    a.onerror = () => {
      console.error("[AudioPlayer] load failed:", url, a.error);
      setError(true);
      setLoading(false);
      setPlaying(false);
    };
    audioRef.current = a;
    return a;
  }

  async function toggle() {
    setError(false);
    const audio = ensureAudio();

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    setLoading(true);
    try {
      await audio.play();
      setPlaying(true);
    } catch (err) {
      console.error("[AudioPlayer] play() rejected:", url, err);
      setError(true);
      setPlaying(false);
    } finally {
      setLoading(false);
    }
  }

  const darkClass =
    "border-transparent bg-white/12 text-white hover:bg-white/20 hover:border-transparent";
  const lightClass =
    "border-primary/40 text-primary hover:border-primary hover:bg-primary/10";

  const buttonLabel = error
    ? "Unavailable — tap to retry"
    : playing
      ? "Pause"
      : label;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      aria-label={buttonLabel}
      title={error ? "Audio failed to load. Tap to retry." : undefined}
      className={`rounded-full ${tone === "dark" ? darkClass : lightClass}`}
    >
      {loading ? (
        <Loader2 className="animate-spin" />
      ) : error ? (
        <AlertTriangle />
      ) : playing ? (
        <Pause />
      ) : (
        <Play />
      )}
      {error ? "Unavailable" : playing ? "Pause" : label}
    </Button>
  );
}
