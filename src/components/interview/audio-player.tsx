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

// Track if user has interacted with the page
let hasUserInteractedWithPage = false;

// Track DOM content loaded status
let isDOMContentLoaded = false;

// Create global registry for last audio player
const lastAudioPlayerRegistry: {
  messageId: string | null;
  triggerAutoplay: (() => void) | null;
} = {
  messageId: null,
  triggerAutoplay: null,
};

// Listen for any user interaction with the page
if (typeof window !== "undefined") {
  const interactionEvents = [
    "click",
    "touchstart",
    "keydown",
    "scroll",
    "mousedown",
  ];

  const markUserInteraction = () => {
    hasUserInteractedWithPage = true;

    // When user interacts with the page, trigger the last audio player's autoplay if available
    if (lastAudioPlayerRegistry.triggerAutoplay) {
      const autoplayFn = lastAudioPlayerRegistry.triggerAutoplay;
      lastAudioPlayerRegistry.triggerAutoplay = null; // Clear it to prevent multiple calls
      autoplayFn();
    }
  };

  // Add listeners for user interaction
  interactionEvents.forEach((event) => {
    document.addEventListener(event, markUserInteraction);
  });

  // Add listener for DOM content loaded
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    // DOM already loaded
    isDOMContentLoaded = true;
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      isDOMContentLoaded = true;

      // If there's a registered autoplay function, call it
      if (lastAudioPlayerRegistry.triggerAutoplay) {
        const autoplayFn = lastAudioPlayerRegistry.triggerAutoplay;
        lastAudioPlayerRegistry.triggerAutoplay = null; // Clear it to prevent multiple calls
        setTimeout(autoplayFn, 300); // Small delay for browser to stabilize
      }
    });
  }
}

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
  const [isReady, setIsReady] = useState(false);
  const [isWaitingForContinue, setIsWaitingForContinue] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isLastMessage = autoPlayMessageId === messageId;

  // Flag to track if this instance has attempted autoplay
  const hasAttemptedAutoplayRef = useRef(false);

  // Define the autoplay function to be called at the right time
  const attemptAutoplay = useCallback(
    async (audio: HTMLAudioElement) => {
      if (!audio || !isLastMessage || hasAttemptedAutoplayRef.current) return;

      hasAttemptedAutoplayRef.current = true;
      console.log("Attempting autoplay for last audio message:", messageId);

      // Pause all other audio elements first
      document.querySelectorAll("audio").forEach((a) => a.pause());

      // Signal that audio playback is starting
      document.dispatchEvent(new CustomEvent("audio-playback-started"));

      // Try to play audio with browser-friendly approach:
      // 1. First play muted (most browsers allow this)
      audio.muted = true;
      try {
        await audio.play();
        console.log("Muted autoplay successful");

        // Check if user has interacted with the page
        if (hasUserInteractedWithPage) {
          // If user has interacted, we can unmute
          audio.muted = false;
          setIsPlaying(true);
          console.log("Audio unmuted after user interaction");
        } else {
          // Keep playing muted and wait for interaction
          setIsPlaying(true);

          // Set up a one-time listener for user interaction to unmute
          const unmuteFn = () => {
            if (audio && !audio.paused) {
              audio.muted = false;
              console.log("Audio unmuted after deferred user interaction");
            }
          };

          const interactionEvents = ["click", "touchstart", "keydown"];
          interactionEvents.forEach((event) => {
            document.addEventListener(event, unmuteFn, { once: true });
          });

          // Clean up these listeners after audio ends
          audio.addEventListener(
            "ended",
            () => {
              interactionEvents.forEach((event) => {
                document.removeEventListener(event, unmuteFn);
              });
            },
            { once: true },
          );
        }
      } catch (error) {
        console.log("Autoplay failed, need user interaction:", error);
        // Show a smaller continue button
        setIsWaitingForContinue(true);
        setIsPlaying(false);
      }
    },
    [isLastMessage, messageId],
  );

  // Setup audio with error handling
  const setupAudio = useCallback(async () => {
    if (!audioUrl) return;

    try {
      // Create a new audio element
      const audio = new Audio();

      // Important: Set muted attribute for autoplay compliance
      audio.muted = true;

      // Try to set autoplay attribute as well
      audio.autoplay = true;

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
      }, 3000);

      // Handle successful audio loading
      const canPlaythroughHandler = () => {
        clearTimeout(timeoutId);
        setIsReady(true);
        setErrorOccurred(false);

        // If this is the last message that should autoplay, register it
        if (isLastMessage) {
          // Update the registry with this audio player's message ID and autoplay function
          lastAudioPlayerRegistry.messageId = messageId;
          lastAudioPlayerRegistry.triggerAutoplay = () =>
            attemptAutoplay(audio);

          // Check if we can autoplay immediately
          if (isDOMContentLoaded || hasUserInteractedWithPage) {
            attemptAutoplay(audio);
          } else {
            console.log(
              "Audio ready but waiting for DOM loaded or user interaction",
            );
          }
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

        // Clear the autoplay registry if this was the last message
        if (isLastMessage && lastAudioPlayerRegistry.messageId === messageId) {
          lastAudioPlayerRegistry.messageId = null;
          lastAudioPlayerRegistry.triggerAutoplay = null;
        }
      };
    } catch (error) {
      console.error("Error setting up audio:", error);
      setErrorOccurred(true);
      return undefined;
    }
  }, [audioUrl, isLastMessage, messageId, attemptAutoplay]);

  // Initialize audio on mount or when URL changes
  useEffect(() => {
    setIsReady(false);
    setErrorOccurred(false);
    setIsWaitingForContinue(false);
    hasAttemptedAutoplayRef.current = false;

    // Register this component as the last audio player if it is the last message
    if (isLastMessage) {
      console.log("Registering last audio player:", messageId);
      // We'll set the triggerAutoplay function after setup
    }

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
  }, [audioUrl, messageId, setupAudio, isLastMessage]);

  // Continue button handler for manual playback
  const handleContinue = useCallback(() => {
    setIsWaitingForContinue(false);
    hasUserInteractedWithPage = true;

    // Play the audio with unmuted sound
    if (audioRef.current && isReady) {
      // Ensure audio is not muted
      audioRef.current.muted = false;

      // Pause all other audio elements first
      document.querySelectorAll("audio").forEach((audio) => audio.pause());

      // Signal that audio playback is starting
      document.dispatchEvent(new CustomEvent("audio-playback-started"));

      // This should work now as it's from a user interaction
      audioRef.current
        .play()
        .then(() => {
          console.log("Audio playback started via user interaction");
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error("Play failed even with user interaction:", error);
          setErrorOccurred(true);
        });
    }
  }, [isReady]);

  // Handle play/pause toggle
  const togglePlayPause = useCallback(async () => {
    if (!audioRef.current) return;

    // Mark that user has interacted
    hasUserInteractedWithPage = true;

    if (isPlaying) {
      audioRef.current.pause();
    } else if (isReady) {
      // Reset error state
      setErrorOccurred(false);

      // Ensure audio is not muted since this is user-initiated
      audioRef.current.muted = false;

      // Pause all other audio elements first
      document.querySelectorAll("audio").forEach((audio) => audio.pause());

      // Signal that audio playback is starting
      document.dispatchEvent(new CustomEvent("audio-playback-started"));

      // Try to play with better error handling
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Play failed:", error);
        setErrorOccurred(true);
      }
    }
  }, [isPlaying, isReady]);

  return (
    <>
      {/* Inline continue button when autoplay fails */}
      {isWaitingForContinue && isLastMessage && (
        <button
          onClick={handleContinue}
          className="flex items-center gap-2 p-2 rounded bg-primary text-primary-foreground font-medium"
          aria-label="Continue with audio playback"
        >
          <Play className="h-4 w-4" />
          <span>Continue</span>
        </button>
      )}

      {/* Normal play/pause button */}
      {!isWaitingForContinue && (
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
      )}
    </>
  );
}
