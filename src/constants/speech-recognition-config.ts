/**
 * Configuration constants for speech recognition functionality
 */

// Default silence timeout in milliseconds - used for auto-send functionality
export const DEFAULT_SILENCE_TIMEOUT = process.env
  .NEXT_PUBLIC_SPEECH_SILENCE_TIMEOUT
  ? parseInt(process.env.NEXT_PUBLIC_SPEECH_SILENCE_TIMEOUT)
  : 5000; // Default: 5 seconds for auto-send

// Whether to enable automatic speech detection and stopping
export const AUTO_STOP_ENABLED = true;

// Language setting for speech recognition
export const SPEECH_RECOGNITION_LANGUAGE = "en-US";

// Maximum alternatives for speech recognition results
export const SPEECH_RECOGNITION_MAX_ALTERNATIVES = 1;

// Whether speech recognition should be continuous
export const SPEECH_RECOGNITION_CONTINUOUS = true;

// Whether to show interim results during speech recognition
export const SPEECH_RECOGNITION_INTERIM_RESULTS = true;
