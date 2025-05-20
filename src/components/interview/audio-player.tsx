"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

// Helper function to convert MediaError codes to readable messages
function getMediaErrorMessage(error: MediaError): string {
  switch (error.code) {
    case MediaError.MEDIA_ERR_ABORTED:
      return "Playback aborted by the user";
    case MediaError.MEDIA_ERR_NETWORK:
      return "Network error while loading audio";
    case MediaError.MEDIA_ERR_DECODE:
      return "Audio decoding error";
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return "Audio format not supported by browser";
    default:
      return error.message || "Unknown error";
  }
}

interface AudioPlayerProps {
  audioUrl: string;
  messageId: string;
  // The message ID that should be autoplayed
  autoPlayMessageId?: string | null;
  // New prop to control if the component should show the continue button
  showContinueButton?: boolean;
  // Callback when continue button is clicked
  onContinue?: () => void;
}

export function AudioPlayer({
  audioUrl,
  messageId,
  autoPlayMessageId,
  showContinueButton = false,
  onContinue,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isWaitingForContinue, setIsWaitingForContinue] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isLastMessage = autoPlayMessageId === messageId;

  // Setup audio with error handling
  const setupAudio = useCallback(async () => {
    if (!audioUrl) return;

    try {
      // Create a new audio element
      const audio = new Audio();

      // Setup event listeners with proper cleanup functions
      const loadProgressHandler = () =>
        console.log("Audio loading in progress...");
      const loadStartHandler = () => console.log("Audio loading started");
      const loadedDataHandler = () => console.log("Audio loaded basic data");

      audio.addEventListener("progress", loadProgressHandler);
      audio.addEventListener("loadstart", loadStartHandler);
      audio.addEventListener("loadeddata", loadedDataHandler);

      // Set load timeout to detect stuck/invalid URLs
      const timeoutId = setTimeout(() => {
        console.warn("Audio loading timeout, may be invalid URL:", audioUrl);
        setErrorOccurred(true);
      }, 3000); // More generous timeout

      // Handle successful audio loading
      const canPlaythroughHandler = () => {
        clearTimeout(timeoutId);
        setIsReady(true);
        setErrorOccurred(false);

        // If this is the last message and should autoplay,
        // show the continue button instead of autoplaying
        if (isLastMessage) {
          setIsWaitingForContinue(true);
        }
      };

      audio.addEventListener("canplaythrough", canPlaythroughHandler, {
        once: true,
      });

      // Setup playback state listeners
      const endedHandler = () => {
        setIsPlaying(false);
        document.dispatchEvent(new CustomEvent("audio-playback-ended"));
      };

      const pauseHandler = () => {
        setIsPlaying(false);
        document.dispatchEvent(new CustomEvent("audio-playback-ended"));
      };

      const playHandler = () => {
        setIsPlaying(true);
        document.dispatchEvent(new CustomEvent("audio-playback-started"));
      };

      audio.addEventListener("ended", endedHandler);
      audio.addEventListener("pause", pauseHandler);
      audio.addEventListener("play", playHandler);

      // Error handler
      const errorHandler = () => {
        const errorDetails = audio.error
          ? {
              code: audio.error.code,
              message: getMediaErrorMessage(audio.error),
              url: audioUrl,
              state: audio.readyState,
            }
          : {
              message: "Unknown error with audio element",
              url: audioUrl,
            };

        console.error("Audio playback error:", errorDetails);
        clearTimeout(timeoutId);
        setIsPlaying(false);
        setErrorOccurred(true);
      };

      audio.addEventListener("error", errorHandler);

      // Set the source
      audio.src = audioUrl;

      // Start preloading
      audio.load();

      // Store the instance with all its event handlers
      audioRef.current = audio;

      // Return cleanup function
      return () => {
        clearTimeout(timeoutId);
        audio.removeEventListener("progress", loadProgressHandler);
        audio.removeEventListener("loadstart", loadStartHandler);
        audio.removeEventListener("loadeddata", loadedDataHandler);
        audio.removeEventListener("canplaythrough", canPlaythroughHandler);
        audio.removeEventListener("ended", endedHandler);
        audio.removeEventListener("pause", pauseHandler);
        audio.removeEventListener("play", playHandler);
        audio.removeEventListener("error", errorHandler);

        audio.pause();
        audio.src = "";
        audioRef.current = null;
      };
    } catch (error) {
      console.error("Error setting up audio:", error);
      setErrorOccurred(true);
      return undefined;
    }
  }, [audioUrl, isLastMessage]);

  // Initialize audio on mount or when URL changes
  useEffect(() => {
    setIsReady(false);
    setErrorOccurred(false);
    setIsWaitingForContinue(false);

    // Setup audio and store the cleanup function
    let cleanupFn: (() => void) | undefined;

    setupAudio().then((cleanup) => {
      cleanupFn = cleanup;
    });

    // Return cleanup function
    return () => {
      if (cleanupFn) {
        cleanupFn();
      }
    };
  }, [audioUrl, messageId, setupAudio]);

  // Handle the continue button click
  const handleContinue = useCallback(() => {
    setIsWaitingForContinue(false);

    // Play the audio
    if (audioRef.current && isReady) {
      // Pause all other audio elements first
      document.querySelectorAll("audio").forEach((audio) => audio.pause());

      // Signal that audio playback is starting
      document.dispatchEvent(new CustomEvent("audio-playback-started"));

      audioRef.current.play().catch((error) => {
        console.error("Play failed:", error);
        setErrorOccurred(true);
      });
    }

    // Call the onContinue callback if provided
    if (onContinue) {
      onContinue();
    }
  }, [isReady, onContinue]);

  // Handle play/pause toggle
  const togglePlayPause = useCallback(async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else if (isReady) {
      // Reset error state
      setErrorOccurred(false);

      // Pause all other audio elements first
      document.querySelectorAll("audio").forEach((audio) => audio.pause());

      // Signal that audio playback is starting
      document.dispatchEvent(new CustomEvent("audio-playback-started"));

      // Try to play with better error handling
      try {
        await audioRef.current.play();
      } catch (error) {
        console.error("Play failed:", error);
        setErrorOccurred(true);
      }
    }
  }, [isPlaying, isReady]);

  // If waiting for continue and it's the last message that should autoplay
  if (isWaitingForContinue && isLastMessage && showContinueButton) {
    return (
      <button
        onClick={handleContinue}
        className="flex items-center gap-2 p-2 rounded bg-primary text-primary-foreground font-medium"
        aria-label="Continue with audio playback"
      >
        <Play className="h-4 w-4" />
        <span>Continue</span>
      </button>
    );
  }

  // Normal play/pause button
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
      disabled={!isReady && !errorOccurred}
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
