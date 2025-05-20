import { useEffect, useRef, useState } from "react";
import { Message } from "./use-interview-chat";

/**
 * Hook to automatically play audio for the last AI message
 */
export function useAudioAutoplay(messages: Message[]): string | null {
  const lastPlayedRef = useRef<string | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const initialLoadRef = useRef(true);
  const userInteractedRef = useRef(false);

  // Track user interactions to enable autoplay after first interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      userInteractedRef.current = true;
      // Remove event listeners once we've detected interaction
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };

    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("keydown", handleUserInteraction);
    document.addEventListener("touchstart", handleUserInteraction);

    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;

    // Find the most recent AI message with audio
    const lastAiMessage = [...messages]
      .reverse()
      .find((msg) => msg.sender === "ai" && msg.audioUrl);

    // If we found one and haven't signaled it yet
    if (lastAiMessage?.audioUrl && lastAiMessage.id !== lastPlayedRef.current) {
      if (initialLoadRef.current) {
        // Always try to play audio on initial page load/refresh
        console.log("Attempting to play audio on page load/refresh");
        lastPlayedRef.current = lastAiMessage.id;
        setPlayingMessageId(lastAiMessage.id);
        initialLoadRef.current = false;
      } else {
        // For new messages after initial load
        console.log("Playing new message audio after initial load");
        lastPlayedRef.current = lastAiMessage.id;
        setPlayingMessageId(lastAiMessage.id);
      }
    }
  }, [messages]);

  return playingMessageId;
}
