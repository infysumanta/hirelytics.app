"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAudioPlaybackState } from "./use-audio-playback-state";

interface AutoSpeechFlowConfig {
  /** Enable automatic microphone activation after audio ends */
  autoMicEnabled: boolean;
  /** Enable automatic message sending after speech pause */
  autoSendEnabled: boolean;
  /** Pause duration in milliseconds before auto-sending (default: 5000ms) */
  autoSendDelay: number;
  /** Minimum speech duration before considering auto-send (default: 1000ms) */
  minSpeechDuration: number;
}

interface AutoSpeechFlowState {
  isAutoMicActive: boolean;
  isAutoSendPending: boolean;
  autoSendCountdown: number;
  lastSpeechEndTime: number | null;
}

interface AutoSpeechFlowHook extends AutoSpeechFlowState {
  config: AutoSpeechFlowConfig;
  updateConfig: (newConfig: Partial<AutoSpeechFlowConfig>) => void;
  cancelAutoSend: () => void;
  resetFlow: () => void;
}

const DEFAULT_CONFIG: AutoSpeechFlowConfig = {
  autoMicEnabled: true,
  autoSendEnabled: true,
  autoSendDelay: 5000, // 5 seconds
  minSpeechDuration: 1000, // 1 second
};

/**
 * Hook to manage automatic speech flow:
 * 1. Auto-enable microphone when audio playback ends
 * 2. Auto-send message after speech pause
 */
export function useAutoSpeechFlow(
  isUserTurn: boolean,
  onSendMessage: () => void,
  initialConfig?: Partial<AutoSpeechFlowConfig>
): AutoSpeechFlowHook {
  const { isAudioPlaying } = useAudioPlaybackState();
  
  // Configuration state
  const [config, setConfig] = useState<AutoSpeechFlowConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig,
  });

  // Flow state
  const [flowState, setFlowState] = useState<AutoSpeechFlowState>({
    isAutoMicActive: false,
    isAutoSendPending: false,
    autoSendCountdown: 0,
    lastSpeechEndTime: null,
  });

  // Refs for timers and tracking
  const autoSendTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speechStartTimeRef = useRef<number | null>(null);
  const wasAudioPlayingRef = useRef(false);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<AutoSpeechFlowConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  // Cancel auto-send
  const cancelAutoSend = useCallback(() => {
    if (autoSendTimerRef.current) {
      clearTimeout(autoSendTimerRef.current);
      autoSendTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setFlowState(prev => ({
      ...prev,
      isAutoSendPending: false,
      autoSendCountdown: 0,
    }));
  }, []);

  // Reset flow state
  const resetFlow = useCallback(() => {
    cancelAutoSend();
    setFlowState({
      isAutoMicActive: false,
      isAutoSendPending: false,
      autoSendCountdown: 0,
      lastSpeechEndTime: null,
    });
    speechStartTimeRef.current = null;
  }, [cancelAutoSend]);

  // Handle auto-microphone activation when audio ends
  useEffect(() => {
    if (!config.autoMicEnabled || !isUserTurn) return;

    // Track when audio was playing
    if (isAudioPlaying) {
      wasAudioPlayingRef.current = true;
      setFlowState(prev => ({ ...prev, isAutoMicActive: false }));
      return;
    }

    // If audio just stopped and it's user's turn, auto-activate microphone
    if (wasAudioPlayingRef.current && !isAudioPlaying && isUserTurn) {
      console.log("[Auto Speech Flow] Audio ended, auto-activating microphone");
      
      // Small delay to ensure audio has fully stopped
      setTimeout(() => {
        setFlowState(prev => ({ ...prev, isAutoMicActive: true }));
        
        // Trigger microphone activation
        document.dispatchEvent(new CustomEvent("auto-activate-microphone"));
      }, 500);

      wasAudioPlayingRef.current = false;
    }
  }, [isAudioPlaying, isUserTurn, config.autoMicEnabled]);

  // Handle speech recognition events for auto-send
  useEffect(() => {
    if (!config.autoSendEnabled) return;

    const handleSpeechStart = () => {
      console.log("[Auto Speech Flow] Speech started");
      speechStartTimeRef.current = Date.now();
      cancelAutoSend(); // Cancel any pending auto-send
    };

    const handleSpeechEnd = () => {
      console.log("[Auto Speech Flow] Speech ended");
      const speechEndTime = Date.now();
      const speechDuration = speechStartTimeRef.current 
        ? speechEndTime - speechStartTimeRef.current 
        : 0;

      setFlowState(prev => ({ ...prev, lastSpeechEndTime: speechEndTime }));

      // Only trigger auto-send if speech was long enough
      if (speechDuration >= config.minSpeechDuration) {
        console.log(`[Auto Speech Flow] Starting auto-send countdown (${config.autoSendDelay}ms)`);
        
        setFlowState(prev => ({
          ...prev,
          isAutoSendPending: true,
          autoSendCountdown: Math.ceil(config.autoSendDelay / 1000),
        }));

        // Start countdown timer
        countdownTimerRef.current = setInterval(() => {
          setFlowState(prev => {
            const newCountdown = prev.autoSendCountdown - 1;
            if (newCountdown <= 0) {
              if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current);
                countdownTimerRef.current = null;
              }
              return {
                ...prev,
                isAutoSendPending: false,
                autoSendCountdown: 0,
              };
            }
            return { ...prev, autoSendCountdown: newCountdown };
          });
        }, 1000);

        // Set auto-send timer
        autoSendTimerRef.current = setTimeout(() => {
          console.log("[Auto Speech Flow] Auto-sending message");
          onSendMessage();
          resetFlow();
        }, config.autoSendDelay);
      } else {
        console.log(`[Auto Speech Flow] Speech too short (${speechDuration}ms), not auto-sending`);
      }
    };

    const handleSpeechRecognitionStatus = (event: CustomEvent) => {
      const { isListening } = event.detail;
      if (isListening) {
        handleSpeechStart();
      } else {
        handleSpeechEnd();
      }
    };

    // Listen for speech recognition events
    document.addEventListener("speech-recognition-status", handleSpeechRecognitionStatus as EventListener);

    return () => {
      document.removeEventListener("speech-recognition-status", handleSpeechRecognitionStatus as EventListener);
    };
  }, [config.autoSendEnabled, config.autoSendDelay, config.minSpeechDuration, onSendMessage, cancelAutoSend, resetFlow]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (autoSendTimerRef.current) {
        clearTimeout(autoSendTimerRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  // Reset flow when user turn changes
  useEffect(() => {
    if (!isUserTurn) {
      resetFlow();
    }
  }, [isUserTurn, resetFlow]);

  return {
    ...flowState,
    config,
    updateConfig,
    cancelAutoSend,
    resetFlow,
  };
}
