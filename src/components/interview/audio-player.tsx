"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
  messageId: string;
}

export function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    // Set up event listeners
    audio.addEventListener("ended", () => setIsPlaying(false));
    audio.addEventListener("pause", () => setIsPlaying(false));
    audio.addEventListener("play", () => setIsPlaying(true));

    return () => {
      // Clean up
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener("ended", () =>
          setIsPlaying(false),
        );
        audioRef.current.removeEventListener("pause", () =>
          setIsPlaying(false),
        );
        audioRef.current.removeEventListener("play", () => setIsPlaying(true));
      }
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Pause all other audio elements first
      document.querySelectorAll("audio").forEach((audio) => audio.pause());

      audioRef.current.play();
    }
  };

  return (
    <button
      onClick={togglePlayPause}
      className={`flex items-center justify-center p-1.5 rounded-full border transition-colors ${
        isPlaying
          ? "bg-primary text-primary-foreground border-primary animate-pulse"
          : "bg-primary/10 hover:bg-primary/20 border-primary/30 text-primary hover:border-primary"
      }`}
      aria-label={isPlaying ? "Pause audio" : "Play audio"}
      title={isPlaying ? "Pause audio" : "Play audio"}
    >
      {isPlaying ? (
        <div className="flex items-center gap-1">
          <Pause className="h-3 w-3" />
          <Volume2 className="h-3 w-3" />
        </div>
      ) : (
        <Play className="h-3 w-3" />
      )}
    </button>
  );
}
