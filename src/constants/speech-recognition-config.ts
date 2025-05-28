/**
 * Configuration constants for speech recognition functionality
 */

// Default silence timeout in milliseconds - not currently used in manual mode
export const DEFAULT_SILENCE_TIMEOUT = process.env
  .NEXT_PUBLIC_SPEECH_SILENCE_TIMEOUT
  ? parseInt(process.env.NEXT_PUBLIC_SPEECH_SILENCE_TIMEOUT)
  : 10000; // Default: 10 seconds

// Whether to enable automatic speech detection and stopping
export const AUTO_STOP_ENABLED = false;

// Language setting for speech recognition
export const SPEECH_RECOGNITION_LANGUAGE = "en-US";

// Maximum alternatives for speech recognition results
export const SPEECH_RECOGNITION_MAX_ALTERNATIVES = 1;

// Whether speech recognition should be continuous
export const SPEECH_RECOGNITION_CONTINUOUS = true;

// Whether to show interim results during speech recognition
export const SPEECH_RECOGNITION_INTERIM_RESULTS = true;

// Auto-send configuration
export const AUTO_SEND_SILENT_PERIOD = 5000; // 5 seconds silent period
export const AUTO_SEND_COUNTDOWN_PERIOD = 5000; // 10 seconds countdown period
export const AUTO_SEND_TOTAL_TIMEOUT =
  AUTO_SEND_SILENT_PERIOD + AUTO_SEND_COUNTDOWN_PERIOD; // 15 seconds total
