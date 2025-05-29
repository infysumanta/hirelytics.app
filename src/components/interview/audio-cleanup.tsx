'use client';

import { useEffect } from 'react';

import { AudioUrlManager } from '@/lib/deepgram-tts';

/**
 * Component that handles cleanup of audio resources when navigating away
 * from pages with TTS functionality
 */
export function AudioCleanup() {
  useEffect(() => {
    // Clean up function that will be called when the component unmounts
    // (i.e., when navigating away from the page)
    return () => {
      console.log('Cleaning up all audio blob URLs');
      AudioUrlManager.revokeAll();
    };
  }, []);

  // This is a utility component, it doesn't render anything
  return null;
}
