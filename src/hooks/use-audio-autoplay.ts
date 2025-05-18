import { useEffect, useRef, useState } from "react";
import { Message } from "./use-interview-chat";

/**
 * Hook to automatically play audio for the last AI message
 */
export function useAudioAutoplay(messages: Message[]) {
  const lastPlayedRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Define event handlers outside useEffect for proper cleanup
  const handleEnded = () => setIsPlaying(false);
  const handleError = (e: Event) => {
    console.error("Audio playback error:", e);
    setIsPlaying(false);
  };

  useEffect(() => {
    // Only handle if there are messages and not currently playing another audio
    if (messages.length === 0 || isPlaying) return;

    // Find the most recent AI message with audio
    const lastAiMessage = [...messages]
      .reverse()
      .find((msg) => msg.sender === "ai" && msg.audioUrl);

    // If we found one and haven't played it yet
    if (lastAiMessage?.audioUrl && lastAiMessage.id !== lastPlayedRef.current) {
      try {
        // Clean up previous audio element if it exists
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.removeEventListener("ended", () =>
            setIsPlaying(false),
          );
        }

        // Create new audio element
        const audio = new Audio(lastAiMessage.audioUrl);
        audioRef.current = audio;

        // Set up event listeners using the handlers defined outside useEffect
        audio.addEventListener("ended", handleEnded);
        audio.addEventListener("error", handleError);

        // Attempt to play with a slight delay to ensure the audio is loaded
        setTimeout(() => {
          setIsPlaying(true);
          audio
            .play()
            .then(() => {
              lastPlayedRef.current = lastAiMessage.id;
            })
            .catch((error) => {
              console.error("Failed to autoplay audio:", error);
              setIsPlaying(false);
            });
        }, 300);
      } catch (error) {
        console.error("Error creating audio element:", error);
        setIsPlaying(false);
      }
    }

    // Cleanup function
    return () => {
      if (audioRef.current) {
        const audio = audioRef.current;
        audio.pause();
        // Remove event listeners using the same function references
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("error", handleError);
        // Release the audio element
        audio.src = "";
      }
    };
  }, [messages, isPlaying]);
}
