import { useEffect, useRef } from 'react';
import { Message } from './use-interview-chat';

/**
 * Hook to automatically play audio for the last AI message
 */
export function useAudioAutoplay(messages: Message[]) {
  const lastPlayedRef = useRef<string | null>(null);

  useEffect(() => {
    // Only handle if there are messages
    if (messages.length === 0) return;
    
    // Find the most recent AI message with audio
    const lastAiMessage = [...messages]
      .reverse()
      .find(msg => msg.sender === 'ai' && msg.audioUrl);
    
    // If we found one and haven't played it yet
    if (lastAiMessage?.audioUrl && lastAiMessage.id !== lastPlayedRef.current) {
      try {
        const audio = new Audio(lastAiMessage.audioUrl);
        audio.play().catch(error => {
          console.error("Failed to autoplay audio:", error);
        });
        lastPlayedRef.current = lastAiMessage.id;
      } catch (error) {
        console.error("Error creating audio element:", error);
      }
    }
  }, [messages]);
}
