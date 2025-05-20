"use client";

import { useState, useEffect, useRef } from "react";
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
    if (!audioUrl) return;

    // Create audio element without URL validation
    const checkUrl = async () => {
      try {
        // Server now provides valid URLs, so we just create the audio element

        // Create a new audio element
        const audio = new Audio();

        // Set callbacks for load progress
        audio.onprogress = () => console.log("Audio loading in progress...");
        audio.onloadstart = () => console.log("Audio loading started");
        audio.onloadeddata = () => console.log("Audio loaded basic data");

        // Set load timeout to detect stuck/invalid URLs
        const timeoutId = setTimeout(() => {
          console.warn("Audio loading timeout, may be invalid URL:", audioUrl);
          setErrorOccurred(true);
        }, 8000);

        // Listen for canplaythrough event to clear the timeout
        audio.addEventListener(
          "canplaythrough",
          () => {
            clearTimeout(timeoutId);
            setErrorOccurred(false);
          },
          { once: true },
        );

        // Setup listeners before setting src to catch immediate errors
        audio.addEventListener("ended", () => {
          setIsPlaying(false);
          document.dispatchEvent(new CustomEvent("audio-playback-ended"));
        });

        audio.addEventListener("pause", () => {
          setIsPlaying(false);
          document.dispatchEvent(new CustomEvent("audio-playback-ended"));
        });

        audio.addEventListener("play", () => {
          setIsPlaying(true);
          document.dispatchEvent(new CustomEvent("audio-playback-started"));
        });

        // Error handler with more robust error reporting
        audio.addEventListener("error", () => {
          // Convert MediaError to a plain object with error information
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
        });

        // Set the source
        audio.src = audioUrl;

        // Start preloading
        audio.load();

        // Store the instance
        audioRef.current = audio;
      } catch (error) {
        console.error("Error setting up audio:", error);
        setErrorOccurred(true);
      }
    };

    // Reset error state when URL changes
    setErrorOccurred(false);

    // Initialize audio
    checkUrl();

    return () => {
      // Clean up
      if (audioRef.current) {
        const audio = audioRef.current;
        audio.pause();
        audio.src = ""; // Clear source to stop any downloads in progress

        // Remove all event listeners
        audio.removeEventListener("ended", () => setIsPlaying(false));
        audio.removeEventListener("pause", () => setIsPlaying(false));
        audio.removeEventListener("play", () => setIsPlaying(true));
        audio.removeEventListener("error", () => {});
        audio.removeEventListener("canplaythrough", () => {});

        audioRef.current = null;
      }
    };
  }, [audioUrl, messageId]);

  // Effect to handle autoplay when autoPlayMessageId changes
  useEffect(() => {
    if (autoPlayMessageId === messageId && audioRef.current) {
      // Signal that mic should be disabled during playback
      document.dispatchEvent(new CustomEvent("audio-playback-started"));

      // Pause other audios
      document.querySelectorAll("audio").forEach((a) => a.pause());

      // Play this audio with retry logic
      const attemptPlay = async () => {
        try {
          console.log(`Attempting to play audio for message ${messageId}`);
          // Reset error state before attempting to play
          setErrorOccurred(false);

          // Check if audio element has been created and loaded
          if (!audioRef.current) {
            console.error("Audio element not initialized for autoplay");
            setErrorOccurred(true);
            return;
          }

          // Wait for audio to be ready
          if (audioRef.current.readyState < 2) {
            // HAVE_CURRENT_DATA (2) or higher
            console.log(
              `Audio not ready yet (state: ${audioRef.current.readyState}), waiting...`,
            );

            // Use a promise with both success and timeout paths
            await new Promise<void>((resolve) => {
              // Create a one-time canplay listener
              const canPlayHandler = () => {
                console.log("Audio can play now, continuing with playback");
                resolve();
              };

              // Add the event listener
              audioRef.current?.addEventListener("canplay", canPlayHandler, {
                once: true,
              });

              // Set timeout for loading
              const timeout = setTimeout(() => {
                console.warn("Audio loading timeout during autoplay");
                setErrorOccurred(true);
                // Remove the canplay handler to avoid memory leaks
                audioRef.current?.removeEventListener(
                  "canplay",
                  canPlayHandler,
                );
                resolve();
              }, 5000);

              // Add a handler to clear the timeout when canplay fires
              audioRef.current?.addEventListener(
                "canplay",
                () => clearTimeout(timeout),
                { once: true },
              );
            });
          }

          // Only try to play if we haven't encountered errors
          if (!errorOccurred && audioRef.current) {
            console.log("Starting audio playback");

            try {
              // Use a try-catch inside to specifically handle play() rejection
              await audioRef.current.play();
              console.log("Audio playback started successfully");
            } catch (playError) {
              console.error("Play() method failed:", playError);
              setErrorOccurred(true);
            }
          } else {
            console.warn(
              "Skipping playback due to errors or missing audio element",
            );
          }
        } catch (error) {
          console.error("Autoplay setup failed:", error);
          setErrorOccurred(true);
          // Error will be shown in the UI to let user manually play
        } finally {
          // Signal that mic can be re-enabled after playback ends
          if (audioRef.current) {
            audioRef.current.addEventListener(
              "ended",
              () => {
                console.log("Audio ended, sending playback-ended event");
                document.dispatchEvent(new CustomEvent("audio-playback-ended"));
              },
              { once: true },
            );
          }
        }
      };

      attemptPlay();
    }
  }, [autoPlayMessageId, messageId, errorOccurred]);

  const togglePlayPause = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Reset error state when trying to play again
      setErrorOccurred(false);

      // No need to validate URL anymore - server provides valid URLs

      // Pause all other audio elements first
      document.querySelectorAll("audio").forEach((audio) => audio.pause());

      // Signal that audio playback is starting
      document.dispatchEvent(new CustomEvent("audio-playback-started"));

      audioRef.current.play().catch((error) => {
        console.error("Play failed:", error);
        setErrorOccurred(true);

        // Log error for debugging but don't attempt to refresh the URL
        // URLs are now provided directly by the server and should be valid
        console.error("Audio playback error with URL:", audioUrl);
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
