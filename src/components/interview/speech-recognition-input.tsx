"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { VoiceIndicator } from "./voice-indicator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  /** Hide internal buttons to use external controls */
  hideButtons?: boolean;
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
  rows = 5,
  forceMicOff = false,
  hideButtons = false,
}: SpeechRecognitionInputProps) {
  const [isSpeechEnabled, setIsSpeechEnabled] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null);
  const [audioIsPlaying, setAudioIsPlaying] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check if speech recognition is available
  useEffect(() => {
    const speechRecognitionAvailable =
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window;

    setIsSpeechEnabled(speechRecognitionAvailable);
  }, []);

  // Track audio playback state
  useEffect(() => {
    const handleAudioStart = () => {
      console.log("[Speech Recognition] Audio playback started");
      setAudioIsPlaying(true);
    };

    const handleAudioEnd = () => {
      console.log("[Speech Recognition] Audio playback ended");
      setAudioIsPlaying(false);
    };

    // Listen for audio playback events
    document.addEventListener("audio-playback-started", handleAudioStart);
    document.addEventListener("audio-playback-ended", handleAudioEnd);

    return () => {
      document.removeEventListener("audio-playback-started", handleAudioStart);
      document.removeEventListener("audio-playback-ended", handleAudioEnd);
    };
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

        // Broadcast speech recognition status
        document.dispatchEvent(
          new CustomEvent("speech-recognition-status", {
            detail: { isListening: true },
          }),
        );

        // Stop all audio playback when speech recognition starts
        if (audioIsPlaying) {
          console.log(
            "Stopping audio playback because speech recognition started",
          );
          document.querySelectorAll("audio").forEach((audio) => audio.pause());
          document.dispatchEvent(new CustomEvent("audio-playback-ended"));
        }
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
        setIsListening(false);

        // Broadcast speech recognition status
        document.dispatchEvent(
          new CustomEvent("speech-recognition-status", {
            detail: { isListening: false },
          }),
        );
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
          // Always set a timer to stop listening after silence for auto-send functionality
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
              console.log(
                "Stopping listening after silence period - auto-send will trigger",
              );
              stopListening();
            }
          }, DEFAULT_SILENCE_TIMEOUT);

          setSilenceTimer(timer);
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const toggleListening = useCallback(() => {
    console.log("Toggling speech recognition, current state:", isListening);
    console.log("Component disabled state:", disabled);
    console.log("Audio playing state:", audioIsPlaying);

    // We now allow starting speech recognition even during audio playback
    // If audio is playing and user wants to start talking, we'll stop the audio playback
    if (audioIsPlaying && !isListening) {
      console.log(
        "Audio is playing but allowing speech recognition to start - stopping audio",
      );
      // Stop audio playback
      document.querySelectorAll("audio").forEach((audio) => audio.pause());
      document.dispatchEvent(new CustomEvent("audio-playback-ended"));
    }

    // Check if it's disabled - important for user turn state
    if (disabled) {
      console.log("Cannot toggle listening while disabled (not user's turn)");
      return;
    }

    // Use a small delay to ensure previous operations have completed
    setTimeout(() => {
      if (isListening) {
        stopListening();
      } else {
        startListening();
      }
    }, 100);
  }, [isListening, stopListening, startListening, audioIsPlaying, disabled]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !disabled) {
      e.preventDefault();
      if (isListening) {
        stopListening();
      }

      // Log that Enter key was pressed to send message
      console.log("Enter key pressed to send message, current input:", value);

      // Send the message which should trigger input clearing
      onSend();
    }
  };

  // Force textarea to sync with value prop - useful when parent components clear the input
  useEffect(() => {
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
    if (textarea && textarea.value !== value) {
      console.log("Forcing textarea sync with value prop:", {
        textareaValue: textarea.value,
        propValue: value,
      });
      textarea.value = value;
    }
  }, [value]);

  // Effect to turn off mic only when forceMicOff prop changes to true
  // We no longer automatically stop listening when audio starts playing
  useEffect(() => {
    if (forceMicOff && isListening) {
      stopListening();
    }
  }, [forceMicOff, isListening, stopListening, audioIsPlaying]);

  // Listen for audio playback events
  useEffect(() => {
    const handleAudioStart = () => {
      console.log("Audio playback started - disabling mic");
      setAudioIsPlaying(true);
    };

    const handleAudioEnd = () => {
      console.log("Audio playback ended - mic can be enabled again");
      setAudioIsPlaying(false);
    };

    document.addEventListener("audio-playback-started", handleAudioStart);
    document.addEventListener("audio-playback-ended", handleAudioEnd);

    return () => {
      document.removeEventListener("audio-playback-started", handleAudioStart);
      document.removeEventListener("audio-playback-ended", handleAudioEnd);
    };
  }, []);

  // Add event listener for external microphone toggle when hideButtons=true
  useEffect(() => {
    const handleToggleSpeechRecognition = () => {
      toggleListening();
    };

    const handleAutoActivateMicrophone = () => {
      console.log("[Speech Recognition] Auto-activating microphone");
      if (!isListening && !disabled) {
        startListening();
      }
    };

    document.addEventListener(
      "toggle-speech-recognition",
      handleToggleSpeechRecognition,
    );

    document.addEventListener(
      "auto-activate-microphone",
      handleAutoActivateMicrophone,
    );

    return () => {
      document.removeEventListener(
        "toggle-speech-recognition",
        handleToggleSpeechRecognition,
      );
      document.removeEventListener(
        "auto-activate-microphone",
        handleAutoActivateMicrophone,
      );
    };
  }, [toggleListening, startListening, isListening, disabled]);

  // Emit speech recognition status for external components when the listening state changes
  useEffect(() => {
    if (hideButtons) {
      document.dispatchEvent(
        new CustomEvent("speech-recognition-status", {
          detail: { isListening },
        }),
      );
    }
  }, [isListening, hideButtons]);

  // Enhanced logging for value prop changes to debug input clearing
  useEffect(() => {
    console.log("SpeechRecognitionInput value changed:", {
      value,
      length: value?.length || 0,
      timestamp: new Date().toISOString(),
      isEmpty: !value || value.length === 0,
    });

    // If value becomes empty, log that the input has been cleared
    if (!value || value.length === 0) {
      console.log("Input has been cleared at:", new Date().toISOString());
    }
  }, [value]);

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
        <div className="flex-1 relative">
          <Textarea
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={disabled}
            className={cn(
              "min-h-[5lh] resize-none rounded-lg transition-all w-full max-h-[5lh]", // Added max-h-[3lh] to limit height
              isListening &&
                "border-primary border-2 shadow-[0_0_15px_rgba(136,58,234,0.3)]",
              disabled && "opacity-70 cursor-not-allowed",
              className,
            )}
            rows={rows}
          />
          {isListening && (
            <div className="absolute top-2 right-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-ping"></div>
            </div>
          )}

          {/* Voice visualizer above the textarea when listening */}
          {isListening && (
            <div className="absolute -top-16 left-0 right-0 flex justify-center">
              <div className="bg-background/90 backdrop-blur-sm rounded-xl px-5 py-3 flex items-center gap-3 shadow-lg border border-primary/30">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Volume2 className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-primary">
                    Listening to your voice
                  </span>
                  <VoiceIndicator
                    isActive={true}
                    variant="wave"
                    className="h-4 mt-1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Only show internal mic button if hideButtons is false */}
        {isSpeechEnabled && !hideButtons && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className={cn(
                    "flex-shrink-0 h-10 w-10 rounded-full transition-all relative overflow-hidden",
                    isListening && "border-primary",
                  )}
                  onClick={toggleListening}
                  disabled={disabled}
                >
                  <div
                    className={cn(
                      "absolute inset-0 transition-all duration-300",
                      isListening ? "opacity-100" : "opacity-0",
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary animate-gradient"></div>
                    <div className="absolute inset-0 bg-primary/20 animate-ping"></div>
                  </div>

                  <div
                    className={cn(
                      "relative z-10 transition-transform duration-300",
                      isListening && "scale-110",
                    )}
                  >
                    {isListening ? (
                      <Mic
                        className={cn(
                          "h-4 w-4 text-primary-foreground transition-all",
                          isListening && "text-white",
                        )}
                      />
                    ) : (
                      <MicOff className="h-4 w-4" />
                    )}
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {isListening ? "Stop listening" : "Start voice recognition"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Voice status guidance text
      {isListening && (
        <div className="mt-3 relative">
          <div className="absolute -left-1 -right-1 top-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          <div className="text-xs p-3 text-center bg-gradient-to-r from-primary/5 via-secondary/10 to-primary/5 rounded-lg backdrop-blur-sm border border-primary/10 shadow-inner">
            <div className="font-medium text-primary mb-1.5 flex items-center justify-center gap-2">
              <VoiceIndicator isActive={true} variant="pulse" className="h-4" />
              <span>Voice Recognition System</span>
              <VoiceIndicator isActive={true} variant="pulse" className="h-4" />
            </div>
            <div className="text-muted-foreground max-w-sm mx-auto">
              {AUTO_STOP_ENABLED
                ? `I'll automatically stop listening after ${Math.round(
                    DEFAULT_SILENCE_TIMEOUT / 1000,
                  )} seconds of silence`
                : "I'm capturing your voice now. Please speak clearly and tap the microphone icon when you've finished speaking"}
            </div>

            <div className="mt-3 pt-2 border-t border-primary/10">
              <VoiceIndicator
                isActive={true}
                variant="bubble"
                className="h-8 w-24 mx-auto"
              />
            </div>
          </div>
        </div>
      )} */}

      {!isSpeechEnabled && (
        <div className="text-xs mt-1 text-muted-foreground">
          Speech recognition not available in your browser
        </div>
      )}
    </div>
  );
}
