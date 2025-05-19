"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
  messageId: string;
  // The message ID that should be autoplayed
  autoPlayMessageId?: string | null;
}

export function AudioPlayer({
  audioUrl,
  messageId,
  autoPlayMessageId,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    // Reset error state when URL changes
    setErrorOccurred(false);

    // Set up event listeners
    audio.addEventListener("ended", () => setIsPlaying(false));
    audio.addEventListener("pause", () => setIsPlaying(false));
    audio.addEventListener("play", () => setIsPlaying(true));

    // Handle any errors that might occur
    audio.addEventListener("error", (e) => {
      console.error("Audio playback error:", e);
      setIsPlaying(false);
      setErrorOccurred(true);

      // Emit event to notify that audio URL refresh is needed
      document.dispatchEvent(
        new CustomEvent("audio-url-expired", {
          detail: { messageId },
        }),
      );
    });

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
        audioRef.current.removeEventListener("error", (e) => {
          console.error("Audio playback error:", e);
          setIsPlaying(false);
          setErrorOccurred(true);

          // Emit event to notify that audio URL refresh is needed
          document.dispatchEvent(
            new CustomEvent("audio-url-expired", {
              detail: { messageId },
            }),
          );
        });
      }
    };
  }, [audioUrl, messageId]);

  // Effect to handle autoplay when autoPlayMessageId changes
  useEffect(() => {
    if (autoPlayMessageId === messageId && audioRef.current) {
      // Pause other audios
      document.querySelectorAll("audio").forEach((a) => a.pause());
      // Play this audio
      audioRef.current.play().catch((error) => {
        console.error("Autoplay failed:", error);
        setErrorOccurred(true);
        // Error will be shown in the UI to let user manually play
      });
    }
  }, [autoPlayMessageId, messageId]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Reset error state when trying to play again
      setErrorOccurred(false);

      // Pause all other audio elements first
      document.querySelectorAll("audio").forEach((audio) => audio.pause());

      audioRef.current.play().catch((error) => {
        console.error("Play failed:", error);
        setErrorOccurred(true);
      });
    }
  };

  return (
    <button
      onClick={togglePlayPause}
      className={`flex items-center justify-center p-1.5 rounded-full border transition-colors ${
        errorOccurred
          ? "bg-red-100/30 text-red-500 border-red-300 hover:bg-red-100/50"
          : isPlaying
          ? "bg-primary text-primary-foreground border-primary animate-pulse"
          : "bg-primary/10 hover:bg-primary/20 border-primary/30 text-primary hover:border-primary"
      }`}
      aria-label={
        errorOccurred
          ? "Audio error - try again"
          : isPlaying
          ? "Pause audio"
          : "Play audio"
      }
      title={
        errorOccurred
          ? "Audio error - try again"
          : isPlaying
          ? "Pause audio"
          : "Play audio"
      }
    >
      {errorOccurred ? (
        <div className="flex items-center gap-1">
          <Play className="h-3 w-3" />
          <span className="text-xs">Retry</span>
        </div>
      ) : isPlaying ? (
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
