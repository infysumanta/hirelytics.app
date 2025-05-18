"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  SPEECH_RECOGNITION_LANGUAGE,
  SPEECH_RECOGNITION_MAX_ALTERNATIVES,
  SPEECH_RECOGNITION_CONTINUOUS,
  SPEECH_RECOGNITION_INTERIM_RESULTS,
  AUTO_STOP_ENABLED,
  DEFAULT_SILENCE_TIMEOUT,
} from "@/constants/speech-recognition-config";

interface SpeechRecognitionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  rows?: number;
  /** For external control of the listening state */
  forceMicOff?: boolean;
}

// TypeScript interface for SpeechRecognition
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionError) => void;
  onend: () => void;
  onstart: () => void;
  onspeechend: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionError extends Event {
  error: string;
  message: string;
}

// Global declarations for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
      prototype: SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
      prototype: SpeechRecognition;
    };
  }
}

export function SpeechRecognitionInput({
  value,
  onChange,
  onSend,
  placeholder = "Type your message...",
  className,
  disabled = false,
  rows = 1,
  forceMicOff = false,
}: SpeechRecognitionInputProps) {
  const [isSpeechEnabled, setIsSpeechEnabled] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check if speech recognition is available
  useEffect(() => {
    const speechRecognitionAvailable =
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window;

    setIsSpeechEnabled(speechRecognitionAvailable);
  }, []);

  // Initialize speech recognition
  const initializeSpeechRecognition = () => {
    if (!isSpeechEnabled) return;

    try {
      const SpeechRecognitionConstructor =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      const recognition = new SpeechRecognitionConstructor();

      // Configure recognition using our constants
      recognition.continuous = SPEECH_RECOGNITION_CONTINUOUS;
      recognition.interimResults = SPEECH_RECOGNITION_INTERIM_RESULTS;
      recognition.lang = SPEECH_RECOGNITION_LANGUAGE;
      recognition.maxAlternatives = SPEECH_RECOGNITION_MAX_ALTERNATIVES;

      recognition.onstart = () => {
        console.log("Speech recognition started");
        setIsListening(true);
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
        setIsListening(false);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        // Reset any existing silence timer
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          setSilenceTimer(null);
        }

        // Process the transcription result
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");

        console.log("Speech recognition result:", transcript);
        onChange(transcript);

        // Check if the result is final
        const isFinalResult = event.results[event.results.length - 1].isFinal;
        if (isFinalResult) {
          // If AUTO_STOP_ENABLED is true, set a timer to stop listening after silence
          if (AUTO_STOP_ENABLED) {
            console.log(
              `Final result detected, setting silence timer (${DEFAULT_SILENCE_TIMEOUT}ms)`,
            );

            // Clear any existing timer
            if (silenceTimer) {
              clearTimeout(silenceTimer);
              setSilenceTimer(null);
            }

            // Set a new timer to stop listening after configured silence timeout
            const timer = setTimeout(() => {
              if (transcript.trim() !== "") {
                console.log("Stopping listening after silence period");
                stopListening();
              }
            }, DEFAULT_SILENCE_TIMEOUT);

            setSilenceTimer(timer);
          } else {
            console.log(`Final result detected (will continue listening)`);

            // Clear any existing timer to avoid unexpected behavior
            if (silenceTimer) {
              clearTimeout(silenceTimer);
              setSilenceTimer(null);
            }
          }
        }
      };

      recognition.onerror = (event: SpeechRecognitionError) => {
        // Handle different error types appropriately
        if (event.error === "aborted") {
          console.log("Speech recognition was aborted");
        } else if (event.error === "no-speech") {
          console.log("No speech detected");
        } else if (event.error === "network") {
          console.warn("Network error in speech recognition");
        } else {
          console.error("Speech recognition error:", event.error);
        }

        setIsListening(false);
      };

      recognition.onspeechend = () => {
        console.log("Speech ended");
      };

      return recognition;
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
      return null;
    }
  };

  const startListening = () => {
    if (disabled) return;

    try {
      // Always create a new instance to avoid potential issues with reusing
      // an instance that might be in an inconsistent state
      const recognition = initializeSpeechRecognition();

      // Clean up any previous instance
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.log("Error while aborting previous recognition instance:", e);
        }
        recognitionRef.current = null;
      }

      // Set the new instance
      if (recognition) {
        recognitionRef.current = recognition;

        // Request microphone permission if needed
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then(() => {
            console.log("Microphone permission granted");

            // Start recognition after ensuring we have permission
            try {
              recognitionRef.current?.start();
              console.log("Started speech recognition");
            } catch (error) {
              if (
                error instanceof DOMException &&
                error.name === "NotAllowedError"
              ) {
                console.error("Microphone permission denied", error);
              } else {
                console.error("Failed to start speech recognition:", error);
              }
              setIsListening(false);
            }
          })
          .catch((err) => {
            console.error("Microphone permission denied:", err);
            setIsListening(false);
          });
      } else {
        console.warn("Could not initialize speech recognition");
      }
    } catch (error) {
      console.error("Error in startListening:", error);
      setIsListening(false);
    }
  };

  const stopListening = useCallback(() => {
    try {
      if (recognitionRef.current) {
        console.log("Stopping speech recognition");

        // First clear the silence timer
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          setSilenceTimer(null);
        }

        try {
          // Stop the recognition instance
          recognitionRef.current.stop();
        } catch (error) {
          console.log(
            "Error stopping recognition, trying to abort instead:",
            error,
          );
          try {
            // Fall back to abort if stop fails
            recognitionRef.current.abort();
          } catch (abortError) {
            console.error("Failed to abort recognition:", abortError);
          }
        }
      }
    } catch (error) {
      console.error("Error in stopListening:", error);
    } finally {
      // Ensure the listening state is updated regardless of errors
      setIsListening(false);
    }
  }, [silenceTimer]);

  const toggleListening = () => {
    console.log("Toggling speech recognition, current state:", isListening);

    // Use a small delay to ensure previous operations have completed
    setTimeout(() => {
      if (isListening) {
        stopListening();
      } else {
        startListening();
      }
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !disabled) {
      e.preventDefault();
      if (isListening) {
        stopListening();
      }
      onSend();
    }
  };

  // Effect to turn off mic when forceMicOff prop changes to true
  useEffect(() => {
    if (forceMicOff && isListening) {
      stopListening();
    }
  }, [forceMicOff, isListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("Component unmounting, cleaning up resources");
      try {
        // Clean up recognition instance
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch (e) {
            console.log("Error during cleanup:", e);
          }
          recognitionRef.current = null;
        }

        // Clean up timer
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          setSilenceTimer(null);
        }
      } catch (error) {
        console.error("Error in cleanup:", error);
      }
    };
  }, [silenceTimer]);

  return (
    <div className="flex flex-col w-full">
      <div className="flex gap-2 items-end">
        <Textarea
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={disabled}
          className={cn(
            "min-h-12 resize-none rounded-lg transition-all w-full",
            isListening && "border-primary border-2",
            className,
          )}
          rows={rows}
        />

        {isSpeechEnabled && (
          <Button
            type="button"
            size="icon"
            variant={isListening ? "default" : "outline"}
            className={cn(
              "flex-shrink-0 h-10 w-10 rounded-full transition-all",
              isListening && "bg-primary text-primary-foreground animate-pulse",
            )}
            onClick={toggleListening}
            disabled={disabled}
            title={isListening ? "Stop listening" : "Start listening"}
          >
            {isListening ? (
              <Mic className="h-4 w-4" />
            ) : (
              <MicOff className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Voice status indicator */}
      {isListening && (
        <div className="text-xs mt-1 text-muted-foreground flex items-center">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse mr-1"></div>
          Listening... •{" "}
          {AUTO_STOP_ENABLED
            ? `Speech will auto-stop after ${Math.round(DEFAULT_SILENCE_TIMEOUT / 1000)}s of silence`
            : "Speak clearly and click the mic button when done"}
        </div>
      )}

      {!isSpeechEnabled && (
        <div className="text-xs mt-1 text-muted-foreground">
          Speech recognition not available in your browser
        </div>
      )}
    </div>
  );
}
