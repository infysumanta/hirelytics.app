'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to track global audio playback state across components
 */
export function useAudioPlaybackState() {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  useEffect(() => {
    const handleAudioStart = () => {
      console.log('[Audio State] Audio playback started');
      setIsAudioPlaying(true);
    };

    const handleAudioEnd = () => {
      console.log('[Audio State] Audio playback ended');
      setIsAudioPlaying(false);
    };

    // Listen for audio playback events
    document.addEventListener('audio-playback-started', handleAudioStart);
    document.addEventListener('audio-playback-ended', handleAudioEnd);

    return () => {
      document.removeEventListener('audio-playback-started', handleAudioStart);
      document.removeEventListener('audio-playback-ended', handleAudioEnd);
    };
  }, []);

  return { isAudioPlaying };
}
