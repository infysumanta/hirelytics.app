"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Send,
  Settings,
  User,
} from "lucide-react";
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
import { MediaDeviceSelector } from "./media-device-selector";
interface Message {
  id: string;
  text: string;
  sender: "ai" | "user";
  timestamp: Date;
}

interface InterviewSessionProps {
  applicationId: string;
  jobTitle: string;
  companyName: string;
  cameraMonitoring?: boolean;
  monitoringInterval?: number;
}

export function InterviewSession({
  applicationId,
  jobTitle,
  companyName,
  cameraMonitoring = true,
  monitoringInterval = 30000, // Default 30 seconds
}: InterviewSessionProps) {
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: `Hello! I'm your AI interviewer for the ${jobTitle} position at ${companyName}. Let's start with you introducing yourself briefly.`,
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [messageInput, setMessageInput] = useState("");
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string | null>(
    null,
  );
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string | null>(
    null,
  );
  const [showSettings, setShowSettings] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(cameraMonitoring);
  const monitoringIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const intervalValueRef = useRef(monitoringInterval);

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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  const toggleMicrophone = () => {
    if (videoRef.current && videoRef.current.video) {
      const video = videoRef.current.video as HTMLVideoElement;
      const stream = video.srcObject as MediaStream;

      if (stream) {
        const audioTracks = stream.getAudioTracks();
        audioTracks.forEach((track) => {
          track.enabled = !micEnabled;
        });
      }
    }

    setMicEnabled(!micEnabled);
  };

  const sendMessage = () => {
    if (messageInput.trim() === "") return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageInput,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setMessageInput("");

    // In a real implementation, this would send the message to the backend API
    // using the applicationId to track the interview session
    console.log(
      `Sending message to interview API for application ${applicationId}`,
    );

    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Thank you for sharing. Let me ask you another question about your experience with ${jobTitle}.`,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    }, 2000);
  };

  const handleDeviceChange = (
    videoDeviceId: string | null,
    audioDeviceId: string | null,
  ) => {
    setSelectedVideoDevice(videoDeviceId);
    setSelectedAudioDevice(audioDeviceId);
    setShowSettings(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="w-full h-[calc(100vh-20rem)] flex flex-col md:flex-row interview-layout gap-4">
      {/* Video Section - 70% on desktop, 100% on mobile */}
      <div className="video-section bg-muted rounded-lg overflow-hidden flex flex-col w-full md:w-[70%]">
        <div
          className={`flex-1 relative flex ${isMobile ? "flex-col" : "flex-row"}`}
        >
          {/* AI Video */}
          <div
            ref={aiVideoRef}
            className={`relative ${isMobile ? "h-1/2" : "flex-1"} flex flex-col items-center justify-center overflow-hidden`}
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
                className="shadow-lg shadow-primary/10"
              />
              <div className="text-center">
                <h3 className="font-semibold">Hirelytics AI</h3>
                <p className="text-xs text-muted-foreground">
                  Interview Assistant
                </p>
              </div>
            </div>
          </div>

          {/* User Video */}
          <div
            className={`relative ${isMobile ? "h-1/2" : "flex-1"} bg-black flex items-center justify-center`}
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
          <Button
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
          </Button>

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
      <div className="chat-section flex flex-col bg-muted rounded-lg overflow-hidden w-full md:w-[30%] min-w-[280px] h-[350px] md:h-auto mt-4 md:mt-0">
        <div className="p-3 border-b bg-gradient-to-r from-muted/80 to-muted/50">
          <h3 className="font-semibold text-foreground/90">Interview Chat</h3>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <div className="flex flex-col gap-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "ai" ? "justify-start" : "justify-end"}`}
              >
                {message.sender === "ai" && (
                  <div className="flex-shrink-0 mr-2 self-end mb-1">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 overflow-hidden flex items-center justify-center">
                      <AIInterviewerIcon size={28} />
                    </div>
                  </div>
                )}
                <div
                  className={`max-w-[75%] p-3 rounded-lg shadow-sm ${
                    message.sender === "ai"
                      ? "bg-muted-foreground/10 text-foreground border border-border/50"
                      : "bg-primary/90 text-primary-foreground"
                  } ${message.sender === "ai" ? "rounded-tl-none" : "rounded-tr-none"} transition-all hover:shadow-md`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1 text-right">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {message.sender === "user" && (
                  <div className="flex-shrink-0 ml-2 self-end mb-1">
                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 overflow-hidden flex items-center justify-center text-primary">
                      <User className="h-5 w-5" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-3 border-t bg-background/80 backdrop-blur-sm">
          <div className="flex gap-2 items-end">
            <Textarea
              placeholder="Type your message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="min-h-12 resize-none bg-background border-muted focus:border-primary/30 rounded-lg transition-all"
              rows={2}
            />
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={!messageInput.trim()}
              className="mb-1 h-10 w-10 rounded-full bg-primary hover:bg-primary/90 transition-all"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
