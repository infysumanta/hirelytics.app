import { useEffect, useRef, useState } from "react";
import { Message } from "./use-interview-chat";

/**
 * Hook to automatically play audio for the last AI message
 */
export function useAudioAutoplay(messages: Message[]): string | null {
  const lastPlayedRef = useRef<string | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

  useEffect(() => {
    if (messages.length === 0) return;

    // Find the most recent AI message with audio
    const lastAiMessage = [...messages]
      .reverse()
      .find((msg) => msg.sender === "ai" && msg.audioUrl);

    // If we found one and haven't signaled it yet
    if (lastAiMessage?.audioUrl && lastAiMessage.id !== lastPlayedRef.current) {
      lastPlayedRef.current = lastAiMessage.id;
      setPlayingMessageId(lastAiMessage.id);
    }
  }, [messages]);

  return playingMessageId;
}
