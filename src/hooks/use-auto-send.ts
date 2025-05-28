import { useState, useEffect, useRef, useCallback } from "react";
import {
  AUTO_SEND_SILENT_PERIOD,
  AUTO_SEND_COUNTDOWN_PERIOD,
} from "@/constants/speech-recognition-config";

interface UseAutoSendOptions {
  value: string;
  onSend: () => void;
  disabled?: boolean;
  paused?: boolean; // New prop to pause auto-send (e.g., when audio is playing)
}

interface UseAutoSendReturn {
  isCountdownActive: boolean;
  countdownSeconds: number;
  resetTimer: () => void;
}

export function useAutoSend({
  value,
  onSend,
  disabled = false,
  paused = false,
}: UseAutoSendOptions): UseAutoSendReturn {
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(0);

  const silentTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastValueRef = useRef(value);

  // Reset all timers
  const resetTimer = useCallback(() => {
    // Clear silent period timer
    if (silentTimerRef.current) {
      clearTimeout(silentTimerRef.current);
      silentTimerRef.current = null;
    }

    // Clear countdown timer
    if (countdownTimerRef.current) {
      clearTimeout(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    // Clear countdown interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    // Reset countdown state
    setIsCountdownActive(false);
    setCountdownSeconds(0);
  }, []);

  // Start countdown display and timer
  const startCountdown = useCallback(() => {
    if (disabled || paused) return;

    console.log("[Auto-Send] Starting 10-second countdown");
    setIsCountdownActive(true);
    setCountdownSeconds(10);

    // Update countdown display every second
    countdownIntervalRef.current = setInterval(() => {
      setCountdownSeconds((prev) => {
        const newValue = prev - 1;
        if (newValue <= 0) {
          // Clear the interval when countdown reaches 0
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
        }
        return newValue;
      });
    }, 1000);

    // Set timer to auto-send after countdown period
    countdownTimerRef.current = setTimeout(() => {
      console.log("[Auto-Send] Countdown completed, auto-sending message");
      setIsCountdownActive(false);
      setCountdownSeconds(0);

      // Only send if there's content and not disabled
      if (value.trim() && !disabled) {
        onSend();
      }
    }, AUTO_SEND_COUNTDOWN_PERIOD);
  }, [disabled, value, onSend]);

  // Start silent period timer
  const startSilentPeriod = useCallback(() => {
    if (disabled || !value.trim()) {
      console.log("[Auto-Send] Not starting silent period", {
        disabled,
        valueEmpty: !value.trim(),
      });
      return;
    }

    console.log("[Auto-Send] Starting 5-second silent period", {
      value: value.trim(),
    });

    silentTimerRef.current = setTimeout(() => {
      // After silent period, start countdown if value still exists and not disabled
      console.log("[Auto-Send] Silent period ended, checking conditions", {
        valueExists: !!value.trim(),
        disabled,
        paused,
      });
      if (value.trim() && !disabled && !paused) {
        startCountdown();
      }
    }, AUTO_SEND_SILENT_PERIOD);
  }, [disabled, paused, value, startCountdown]);

  // Effect to handle value changes
  useEffect(() => {
    // Skip if disabled
    if (disabled) {
      resetTimer();
      return;
    }

    // If value is empty, reset timers
    if (!value.trim()) {
      resetTimer();
      lastValueRef.current = value;
      return;
    }

    // If value changed (user is typing), reset and restart timer
    if (value !== lastValueRef.current) {
      console.log("[Auto-Send] Text changed, resetting timer", {
        oldValue: lastValueRef.current,
        newValue: value,
        disabled,
        paused,
      });
      resetTimer();

      // Start new silent period timer
      startSilentPeriod();

      lastValueRef.current = value;
    }
  }, [value, disabled, resetTimer, startSilentPeriod]);

  // Effect to handle disabled state changes
  useEffect(() => {
    if (disabled) {
      resetTimer();
    }
  }, [disabled, resetTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetTimer();
    };
  }, [resetTimer]);

  return {
    isCountdownActive,
    countdownSeconds,
    resetTimer,
  };
}
