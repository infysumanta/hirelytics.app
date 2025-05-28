"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Video,
  VideoOff,
  Send,
  Settings,
  User,
  AlertTriangle,
  Loader2,
  MoreVertical,
  RefreshCcw,
  Mic,
} from "lucide-react";
import { SpeechRecognitionInput } from "./speech-recognition-input";
import { TypingIndicator } from "./typing-indicator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import Webcam from "react-webcam";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AIInterviewBackground } from "./ai-interview-background";
import { AIInterviewerIcon } from "./ai-interviewer-icon";
import { useAIAgentState } from "@/hooks/use-ai-agent-state";
import { MediaDeviceSelector } from "./media-device-selector";
import { AudioPlayer } from "./audio-player";
import { useAudioAutoplay } from "@/hooks/use-audio-autoplay";
import { useAudioPlaybackState } from "@/hooks/use-audio-playback-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { INTERVIEW_ALERTS } from "@/constants/interview-alerts";
import { useInterviewChat } from "@/hooks/use-interview-chat";
import { useInterviewState } from "@/hooks/use-interview-state";
import { InterviewCompletion } from "./interview-completion";

// Message interface is now imported from the useInterviewChat hook

interface InterviewSessionProps {
  applicationId: string;
  jobTitle?: string;
  companyName?: string;
  cameraMonitoring?: boolean;
  monitoringInterval?: number;
}

export function InterviewSession({
  applicationId,
  jobTitle = "Position",
  companyName = "Company",
  cameraMonitoring = true,
  monitoringInterval = 30000, // Default 30 seconds
}: InterviewSessionProps) {
  const [videoEnabled, setVideoEnabled] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [micEnabled, setMicEnabled] = useState(true);
  const [forceMicOff, setForceMicOff] = useState(false);
  const [showCompletionUI, setShowCompletionUI] = useState(false);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string | null>(
    null,
  );
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string | null>(
    null,
  );
  const [showSettings, setShowSettings] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(cameraMonitoring);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isTabFocused, setIsTabFocused] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const [alerts, setAlerts] = useState<string[]>([]);
  // Track interview state
  const { interviewState } = useInterviewState(applicationId);
  const monitoringIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const intervalValueRef = useRef(monitoringInterval);

  // Use our interview chat hook
  const {
    messages,
    messageInput,
    setMessageInput,
    sendMessage: sendChatMessage,
    isLoading,
    isUserTurn,
    isInitializing,
    restartInterview,
    isCompleted,
  } = useInterviewChat({
    applicationId,
  });

  const videoRef = useRef<Webcam>(null);
  const aiVideoRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Load device preferences from localStorage on component mount
  useEffect(() => {
    const savedVideoDevice = localStorage.getItem("preferredVideoDevice");
    const savedAudioDevice = localStorage.getItem("preferredAudioDevice");

    if (savedVideoDevice) setSelectedVideoDevice(savedVideoDevice);
    if (savedAudioDevice) setSelectedAudioDevice(savedAudioDevice);
  }, []);

  // Save device preferences to localStorage when they change
  useEffect(() => {
    if (selectedVideoDevice) {
      localStorage.setItem("preferredVideoDevice", selectedVideoDevice);
    }
    if (selectedAudioDevice) {
      localStorage.setItem("preferredAudioDevice", selectedAudioDevice);
    }
  }, [selectedVideoDevice, selectedAudioDevice]);

  // Scroll to bottom of messages when new ones arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest",
        });
      }, 150);
    }
  }, [messages]);

  // Function to capture and upload image
  const captureAndUploadImage = useCallback(async () => {
    if (!videoRef.current || !isMonitoring) return;

    const imageSrc = videoRef.current.getScreenshot();
    if (!imageSrc) return;

    try {
      console.log("Capturing and uploading image...");
      const response = await fetch(
        `/api/applications/${applicationId}/monitoring`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: imageSrc,
            timestamp: new Date().toISOString(),
          }),
        },
      );

      if (!response.ok) {
        console.error("Failed to upload monitoring image");
      } else {
        console.log("Successfully uploaded monitoring image");
      }
    } catch (error) {
      console.error("Error uploading monitoring image:", error);
    }
  }, [applicationId, isMonitoring]);

  // Handle camera monitoring setup and prop changes
  useEffect(() => {
    console.log("Camera monitoring props changed:", {
      cameraMonitoring,
      monitoringInterval,
    });
    setIsMonitoring(cameraMonitoring);
    intervalValueRef.current = monitoringInterval;
  }, [cameraMonitoring, monitoringInterval]);

  // Take initial picture when video is ready
  useEffect(() => {
    console.log(videoEnabled, isMonitoring);
    let initialCapture: NodeJS.Timeout;
    if (videoEnabled && isMonitoring) {
      // Wait a short moment for video to initialize
      initialCapture = setTimeout(() => {
        console.log("Taking initial capture");
        captureAndUploadImage();
      }, 1000);
    }
    return () => {
      if (initialCapture) clearTimeout(initialCapture);
    };
  }, [videoEnabled, isMonitoring, captureAndUploadImage]);

  // Set up monitoring interval
  useEffect(() => {
    const setupMonitoring = () => {
      if (isMonitoring && videoEnabled) {
        console.log(
          "Starting monitoring interval with delay:",
          intervalValueRef.current,
        );
        // Set up interval (initial capture is handled by the effect above)
        monitoringIntervalRef.current = setInterval(
          captureAndUploadImage,
          intervalValueRef.current,
        );
      }
    };

    // Clear existing interval if any
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = undefined;
    }

    // Set up new interval
    setupMonitoring();

    return () => {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
        monitoringIntervalRef.current = undefined;
      }
    };
  }, [isMonitoring, videoEnabled, captureAndUploadImage]);

  // Clear monitoring when video is disabled
  useEffect(() => {
    if (!videoEnabled && monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
    }
  }, [videoEnabled]);

  // Handle tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isHidden = document.hidden;
      setIsTabFocused(!isHidden);
      if (isHidden) {
        setAlerts((prev) =>
          prev.includes(INTERVIEW_ALERTS.TAB_SWITCH)
            ? prev
            : [...prev, INTERVIEW_ALERTS.TAB_SWITCH],
        );
      } else {
        setAlerts((prev) =>
          prev.filter((alert) => alert !== INTERVIEW_ALERTS.TAB_SWITCH),
        );
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Handle window focus
  useEffect(() => {
    const handleFocus = () => {
      setIsWindowFocused(true);
      setAlerts((prev) =>
        prev.filter((alert) => alert !== INTERVIEW_ALERTS.WINDOW_SWITCH),
      );
    };

    const handleBlur = () => {
      setIsWindowFocused(false);
      setAlerts((prev) =>
        prev.includes(INTERVIEW_ALERTS.WINDOW_SWITCH)
          ? prev
          : [...prev, INTERVIEW_ALERTS.WINDOW_SWITCH],
      );
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Show completion UI when interview is completed
  useEffect(() => {
    console.log("[Completion Debug] isCompleted:", isCompleted);
    console.log("[Completion Debug] interviewState:", interviewState);

    // Check for completed messages in the current messages array
    const hasCompletionMessage = messages.some(
      (msg) => msg.isCompletionMessage,
    );
    console.log(
      "[Completion Debug] Has completion message:",
      hasCompletionMessage,
    );

    // Check if the interview is completed from the interviewState
    console.log(
      "[Completion Debug] Interview state completed:",
      interviewState.isCompleted,
    );

    // Determine if we should show the completion UI
    if (isCompleted || hasCompletionMessage || interviewState.isCompleted) {
      console.log(
        "[Completion Debug] Interview completed, showing UI in 5 seconds",
      );

      // Allow for a longer period to let the user read the final message and respond if needed
      const timer = setTimeout(() => {
        // Check if there have been user messages after the completion message
        const lastCompletionIndex = messages.findIndex(
          (msg) => msg.isCompletionMessage,
        );

        // Only proceed with completion if there haven't been user messages after completion message
        // or if it's been forced through other means
        const hasUserMessageAfterCompletion =
          lastCompletionIndex !== -1 &&
          messages
            .slice(lastCompletionIndex + 1)
            .some((msg) => msg.sender === "user");

        if (!hasUserMessageAfterCompletion || interviewState.isCompleted) {
          console.log("[Completion Debug] Setting showCompletionUI to true");
          setShowCompletionUI(true);
        } else {
          console.log(
            "[Completion Debug] User sent message after completion, not showing completion UI yet",
          );
          // Check again in 5 seconds if the user is still interacting
          const extendedTimer = setTimeout(() => {
            console.log(
              "[Completion Debug] Final check - showing completion UI",
            );
            setShowCompletionUI(true);
          }, 5000);
          return () => clearTimeout(extendedTimer);
        }
      }, 5000); // Extended from 2000 to 5000 ms to give more time for reading

      return () => clearTimeout(timer);
    }
  }, [isCompleted, interviewState, messages]);

  // Watch for camera and microphone state changes
  useEffect(() => {
    if (!videoEnabled) {
      setAlerts((prev) =>
        prev.includes(INTERVIEW_ALERTS.CAMERA_OFF)
          ? prev
          : [...prev, INTERVIEW_ALERTS.CAMERA_OFF],
      );
    } else {
      setAlerts((prev) =>
        prev.filter((alert) => alert !== INTERVIEW_ALERTS.CAMERA_OFF),
      );
    }
  }, [videoEnabled]);

  useEffect(() => {
    if (!micEnabled) {
      setAlerts((prev) =>
        prev.includes(INTERVIEW_ALERTS.MICROPHONE_OFF)
          ? prev
          : [...prev, INTERVIEW_ALERTS.MICROPHONE_OFF],
      );
    } else {
      setAlerts((prev) =>
        prev.filter((alert) => alert !== INTERVIEW_ALERTS.MICROPHONE_OFF),
      );
    }
  }, [micEnabled]);

  const toggleVideo = () => {
    if (videoRef.current && videoRef.current.video) {
      const video = videoRef.current.video as HTMLVideoElement;
      const stream = video.srcObject as MediaStream;

      if (stream) {
        const videoTracks = stream.getVideoTracks();
        videoTracks.forEach((track) => {
          track.enabled = !videoEnabled;
        });
      }
    }

    setVideoEnabled(!videoEnabled);
  };

  // const toggleMicrophone = () => {
  //   if (videoRef.current && videoRef.current.video) {
  //     const video = videoRef.current.video as HTMLVideoElement;
  //     const stream = video.srcObject as MediaStream;

  //     if (stream) {
  //       const audioTracks = stream.getAudioTracks();
  //       audioTracks.forEach((track) => {
  //         track.enabled = !micEnabled;
  //       });
  //     }
  //   }

  //   setMicEnabled(!micEnabled);
  // };

  const handleDeviceChange = (
    videoDeviceId: string | null,
    audioDeviceId: string | null,
  ) => {
    setSelectedVideoDevice(videoDeviceId);
    setSelectedAudioDevice(audioDeviceId);
    setShowSettings(false);
  };

  // State to track speech recognition status
  const [isSpeechListening, setIsSpeechListening] = useState<boolean>(false);

  // Use audio autoplay hook to play the latest AI message automatically
  // Autoplay audio for AI messages and get the ID of the playing message
  const autoPlayMessageId = useAudioAutoplay(messages);

  // Track global audio playback state
  const { isAudioPlaying } = useAudioPlaybackState();

  // Track AI agent state for enhanced visual feedback
  const { agentState } = useAIAgentState(isLoading);

  // Listen for speech recognition status events
  useEffect(() => {
    const handleSpeechStatus = (event: CustomEvent) => {
      setIsSpeechListening(event.detail?.isListening || false);
    };

    document.addEventListener(
      "speech-recognition-status",
      handleSpeechStatus as EventListener,
    );

    return () => {
      document.removeEventListener(
        "speech-recognition-status",
        handleSpeechStatus as EventListener,
      );
    };
  }, []);

  // Wrapper for sendChatMessage that also turns off the mic
  const handleSendMessage = () => {
    // Temporarily set forceMicOff to true, then back to false after a short delay
    setForceMicOff(true);

    // Log current message input before clearing
    console.log("Message about to be sent:", {
      content: messageInput,
      length: messageInput.length,
      timestamp: new Date().toISOString(),
    });

    // Force clear the input box before sending (extra safety measure)
    setMessageInput("");

    // Ensure the message is sent after input is cleared
    sendChatMessage();

    // Reset mic state after a short delay to avoid React state batching issues
    setTimeout(() => {
      setForceMicOff(false);
    }, 100);
  };

  // We no longer force the mic off during audio playback
  // This allows users to start speaking even while audio is playing
  useEffect(() => {
    // Only track audio state for debugging purposes
    if (isAudioPlaying) {
      console.log("[Interview Session] Audio is playing - mic remains enabled");
    } else if (!forceMicOff && !isAudioPlaying) {
      console.log(
        "[Interview Session] Audio stopped - mic remains enabled if user's turn",
      );
    }

    // No longer setting forceMicOff based on audio playback
    // This allows the user to interrupt the audio by starting to speak
  }, [isAudioPlaying, forceMicOff]);

  // Stop all audio playback when speech recognition starts
  useEffect(() => {
    const handleSpeechStarted = () => {
      // If speech recognition starts, stop all audio playback
      if (isSpeechListening && isAudioPlaying) {
        console.log(
          "[Interview Session] User started speaking - stopping audio playback",
        );
        // Stop all audio elements
        document.querySelectorAll("audio").forEach((audio) => audio.pause());
        // Dispatch an event to notify that audio playback has ended
        document.dispatchEvent(new CustomEvent("audio-playback-ended"));
      }
    };

    // Listen for changes in speech recognition status
    if (isSpeechListening) {
      handleSpeechStarted();
    }
  }, [isSpeechListening, isAudioPlaying]);

  // We no longer need this as the SpeechRecognitionInput component handles key presses

  // Remove the handleRestartInterview function since we're now directly using restartInterview
  // with a window.confirm in the dropdown menu onClick handler

  // Debug: Check for completion messages in state
  const hasCompletionMessage = messages.some((msg) => msg.isCompletionMessage);

  // Check if the interview should be considered completed from any source
  const isInterviewCompleted =
    interviewState.isCompleted || isCompleted || hasCompletionMessage;
  console.log("[Render Debug] Final completion state:", {
    isInterviewCompleted,
    showCompletionUI,
    stateCompleted: interviewState.isCompleted,
    hookCompleted: isCompleted,
    hasCompletionMsg: hasCompletionMessage,
  });

  // Conditionally render the interview or completion screen
  // Show completion UI if either:
  // 1. The interview state from backend shows it's completed
  // 2. The chat hook detected a completion message from the API
  // 3. We've explicitly set the showCompletionUI flag
  return isInterviewCompleted && showCompletionUI ? (
    <InterviewCompletion
      applicationId={applicationId}
      jobTitle={jobTitle}
      companyName={companyName}
      redirectUrl="/dashboard"
    />
  ) : (
    <div className="w-full min-h-[calc(100vh-20rem)] flex flex-col md:flex-row interview-layout gap-4">
      {/* Video Section - 70% on desktop, 100% on mobile */}
      <div className="video-section bg-muted rounded-lg overflow-hidden flex flex-col w-full md:w-[70%]">
        <div
          className={`flex-1 relative flex ${
            isMobile ? "flex-col" : "flex-row"
          }`}
        >
          {/* AI Video */}
          <div
            ref={aiVideoRef}
            className={`relative ${
              isMobile ? "h-1/2" : "flex-1"
            } flex flex-col items-center justify-center overflow-hidden`}
          >
            {/* AI Interview background with circuits pattern */}
            <AIInterviewBackground />

            <div className="absolute top-3 left-3 bg-background/50 backdrop-blur-sm px-3 py-1 rounded-md text-sm font-medium shadow-md border border-border/50 z-10">
              AI Interviewer
            </div>

            {/* Branded AI placeholder with logo & brand name */}
            <div className="flex flex-col items-center gap-3 z-10">
              <AIInterviewerIcon
                size={96}
                isLoading={isLoading || isInitializing}
                agentState={agentState}
                className="shadow-lg shadow-primary/10"
              />
              <div className="text-center">
                <h3 className="font-semibold">Hirelytics AI</h3>
                <p className="text-xs text-muted-foreground">
                  Interview Assistant
                </p>
              </div>

              {isInitializing && (
                <TypingIndicator
                  text="Initializing interview"
                  className="mt-2"
                />
              )}

              {isLoading && !isInitializing && (
                <TypingIndicator text="Thinking" className="mt-2" />
              )}
            </div>
          </div>

          {/* User Video */}
          <div
            className={`relative ${
              isMobile ? "h-1/2" : "flex-1"
            } bg-black flex items-center justify-center`}
          >
            <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-md text-sm font-medium text-white/90 shadow-md border border-white/10">
              You
            </div>
            <Webcam
              ref={videoRef}
              audio={true}
              muted={true}
              videoConstraints={{
                deviceId: selectedVideoDevice
                  ? { exact: selectedVideoDevice }
                  : undefined,
                facingMode: "user",
              }}
              audioConstraints={{
                deviceId: selectedAudioDevice
                  ? { exact: selectedAudioDevice }
                  : undefined,
              }}
              className="h-full w-full object-cover"
            />
            {!videoEnabled && (
              <div className="absolute inset-0 bg-black flex items-center justify-center">
                <VideoOff className="h-16 w-16 text-muted-foreground/50" />
              </div>
            )}
          </div>
        </div>

        {/* Video Controls */}
        <div className="h-16 flex items-center justify-center gap-4 bg-background/95 backdrop-blur-sm px-4 border-t">
          {/* <Button
            variant={micEnabled ? "ghost" : "destructive"}
            size="icon"
            onClick={toggleMicrophone}
            className="rounded-full h-10 w-10 transition-all hover:bg-primary/10"
          >
            {micEnabled ? (
              <Mic className="h-5 w-5" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </Button> */}

          <Button
            variant={videoEnabled ? "ghost" : "destructive"}
            size="icon"
            onClick={toggleVideo}
            className="rounded-full h-10 w-10 transition-all hover:bg-primary/10"
          >
            {videoEnabled ? (
              <Video className="h-5 w-5" />
            ) : (
              <VideoOff className="h-5 w-5" />
            )}
          </Button>

          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10 border-dashed transition-all hover:bg-primary/10 hover:border-primary"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" /> Media Device Settings
              </DialogTitle>
              <MediaDeviceSelector
                initialVideoDeviceId={selectedVideoDevice || undefined}
                initialAudioDeviceId={selectedAudioDevice || undefined}
                onDevicesSelected={handleDeviceChange}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Chat Section - 30% on desktop, 100% on mobile */}
      <div className="chat-section flex flex-col bg-muted rounded-lg overflow-hidden w-full md:w-[30%] min-w-[280px] h-[500px] md:h-full mt-4 md:mt-0">
        {/* Chat Header - Fixed at top */}
        <div className="p-3 border-b bg-gradient-to-r from-muted/80 to-muted/50 flex items-center justify-between">
          <div className="flex items-center">
            <h3 className="font-semibold text-foreground/90">Interview Chat</h3>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={async () => {
                    if (
                      window.confirm(
                        "Are you sure you want to restart this interview? This will clear all current conversation history.",
                      )
                    ) {
                      await restartInterview();
                    }
                  }}
                  disabled={isInitializing}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {isInitializing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Restarting...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="h-4 w-4" />
                      <span>Restart Interview</span>
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex gap-1">
            {isInitializing && (
              <div className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                Initializing...
              </div>
            )}

            {isAudioPlaying && !isInitializing && (
              <div className="text-xs px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 rounded-full">
                AI is talking...
              </div>
            )}

            {!isUserTurn && !isInitializing && !isAudioPlaying && (
              <div className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                AI is responding...
              </div>
            )}

            {isUserTurn &&
              messages.length > 0 &&
              !isInitializing &&
              !isAudioPlaying && (
                <div className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full whitespace-nowrap animate-subtle-bounce">
                  Your turn
                </div>
              )}
          </div>
        </div>

        {/* Message Container with ScrollArea - Takes available space between header and input */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full w-full">
            <div className="flex flex-col gap-4 px-3 py-4 min-h-full">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "system"
                      ? "justify-center"
                      : message.sender === "ai"
                        ? "justify-start"
                        : "justify-end"
                  }`}
                >
                  {message.sender === "system" ? (
                    // System message (centered, special styling)
                    <div className="w-full max-w-[90%] px-4 py-3 my-2 rounded-lg bg-muted/80 border border-border/80 shadow-sm">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                        System Information
                      </div>
                      <div className="text-sm prose-sm prose-headings:text-primary prose-headings:my-1 prose-p:my-1 prose-hr:my-2 markdown-content">
                        {message.text.split("\n").map((line, i) =>
                          line.startsWith("##") ? (
                            <h3
                              key={i}
                              className="text-sm font-medium mt-2 mb-1"
                            >
                              {line.replace("##", "")}
                            </h3>
                          ) : line.startsWith("#") ? (
                            <h2
                              key={i}
                              className="text-base font-semibold mt-2 mb-1"
                            >
                              {line.replace("#", "")}
                            </h2>
                          ) : (
                            <p key={i} className="text-sm my-0.5">
                              {line}
                            </p>
                          ),
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      {message.sender === "ai" && (
                        <div className="flex-shrink-0 mr-2 self-end mb-1">
                          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 overflow-hidden flex items-center justify-center">
                            <AIInterviewerIcon
                              size={28}
                              isLoading={false}
                              agentState="idle"
                            />
                          </div>
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] p-3 rounded-lg shadow-sm ${
                          message.sender === "ai"
                            ? "bg-muted-foreground/10 text-foreground border border-border/50"
                            : "bg-primary/90 text-primary-foreground"
                        } ${
                          message.sender === "ai"
                            ? "rounded-tl-none"
                            : "rounded-tr-none"
                        } transition-all hover:shadow-md`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.text}
                        </p>
                        <div className="flex justify-between items-center mt-1">
                          {message.sender === "ai" && message.audioUrl && (
                            <AudioPlayer
                              audioUrl={message.audioUrl}
                              messageId={message.id}
                              autoPlayMessageId={autoPlayMessageId}
                            />
                          )}
                          <p className="text-xs opacity-70 text-right flex-grow">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      {message.sender === "user" && (
                        <div className="flex-shrink-0 ml-2 self-end mb-1">
                          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 overflow-hidden flex items-center justify-center text-primary">
                            <User className="h-5 w-5" />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-32 text-muted-foreground text-sm italic">
                  Messages will appear here
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="p-3 border-t bg-background/80 backdrop-blur-sm">
          {/* Speech Recognition Input Component */}
          <div className="flex items-end relative">
            <div className="flex-1 pr-28 relative">
              {" "}
              {/* Increased padding-right to make space for the buttons */}
              <SpeechRecognitionInput
                placeholder={
                  isInitializing
                    ? "Initializing interview..."
                    : isAudioPlaying
                      ? "AI is talking... Please wait..."
                      : isUserTurn
                        ? "Type your message or speak..."
                        : "Please wait for the AI to respond..."
                }
                value={messageInput}
                onChange={setMessageInput}
                onSend={handleSendMessage}
                forceMicOff={forceMicOff || isAudioPlaying}
                disabled={
                  !isUserTurn || isLoading || isInitializing || isAudioPlaying
                }
                className={`min-h-12 resize-none bg-background border-muted focus:border-primary/30 rounded-lg transition-all ${
                  !isUserTurn || isInitializing || isAudioPlaying
                    ? "opacity-50"
                    : ""
                }`}
                rows={1}
                hideButtons={
                  true
                } /* Hide the internal mic button so we can use our external ones */
              />
              {/* Positioned buttons in a button group with consistent styling */}
              <div className="absolute right-3 bottom-3 flex gap-2 items-center bg-background/70 backdrop-blur-sm px-1.5 py-1.5 rounded-full shadow-sm border border-muted/30">
                {/* Mic Button with active state */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant={isSpeechListening ? "default" : "outline"}
                        className={`h-9 w-9 rounded-full transition-all relative overflow-hidden shadow-sm
                          ${
                            isSpeechListening
                              ? "border-primary bg-primary text-white"
                              : "border border-muted hover:bg-primary/10 hover:text-primary"
                          }`}
                        onClick={() => {
                          document.dispatchEvent(
                            new CustomEvent("toggle-speech-recognition"),
                          );
                        }}
                        disabled={
                          !isUserTurn ||
                          isLoading ||
                          isInitializing ||
                          isAudioPlaying
                        }
                      >
                        {isSpeechListening && (
                          <div className="absolute inset-0 bg-primary/20 animate-pulse"></div>
                        )}
                        <Mic
                          className={`h-4 w-4 relative z-10 ${
                            isSpeechListening ? "text-primary-foreground" : ""
                          }`}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {isSpeechListening
                        ? "Stop listening"
                        : isAudioPlaying
                          ? "Microphone disabled while AI is talking"
                          : !isUserTurn
                            ? "Wait for your turn to speak"
                            : "Start voice recognition"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Send Button */}
                <Button
                  size="icon"
                  onClick={() => {
                    // Force clear the input field in DOM before calling handleSendMessage
                    const textareaElement = document.querySelector("textarea");
                    if (textareaElement) {
                      textareaElement.value = "";
                      console.log("DOM textarea cleared by send button");
                    }
                    handleSendMessage();
                  }}
                  disabled={
                    !messageInput.trim() ||
                    !isUserTurn ||
                    isLoading ||
                    isInitializing
                  }
                  className="flex-shrink-0 h-9 w-9 rounded-full bg-primary hover:bg-primary/90 transition-all shadow-sm"
                  variant="default"
                >
                  <div className="relative flex items-center justify-center">
                    {isLoading || isInitializing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="absolute top-4 left-4 z-50 flex flex-col gap-2">
          {alerts.map((alert, index) => (
            <Alert key={index} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{alert}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
}
