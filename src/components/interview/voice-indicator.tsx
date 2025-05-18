"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface VoiceIndicatorProps {
  isActive: boolean;
  variant?: "bubble" | "wave" | "pulse";
  className?: string;
}

export function VoiceIndicator({
  isActive,
  variant = "wave",
  className,
}: VoiceIndicatorProps) {
  // For bubble variant
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (variant !== "bubble" || !isActive || !bubbleRef.current) return;

    // Create animated bubbles
    const createBubble = () => {
      if (!bubbleRef.current || !isActive) return;

      const bubble = document.createElement("span");
      const size = Math.random() * 10 + 5; // Random size between 5-15px

      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${Math.random() * 100}%`;
      bubble.style.animationDuration = `${Math.random() * 2 + 1}s`;
      bubble.className =
        "absolute bottom-0 bg-primary/40 rounded-full transform-gpu";
      bubble.style.animation = "voiceBubbleRise 2s ease forwards";

      bubbleRef.current.appendChild(bubble);

      // Remove bubble after animation completes
      setTimeout(() => {
        if (bubble && bubble.parentNode === bubbleRef.current) {
          bubbleRef.current?.removeChild(bubble);
        }
      }, 2000);
    };

    const bubbleInterval = setInterval(createBubble, 300);
    return () => clearInterval(bubbleInterval);
  }, [isActive, variant]);

  if (!isActive) {
    return null;
  }

  // Render different variants
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {variant === "wave" && (
        <div className="flex items-end justify-center h-6 gap-[2px]">
          <div className="voice-wave"></div>
          <div className="voice-wave"></div>
          <div className="voice-wave"></div>
          <div className="voice-wave"></div>
          <div className="voice-wave"></div>
        </div>
      )}

      {variant === "pulse" && (
        <div className="flex justify-center items-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
            <div className="relative z-10 h-2 w-2 bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>
      )}

      {variant === "bubble" && (
        <div ref={bubbleRef} className="relative h-12 w-full overflow-hidden" />
      )}
    </div>
  );
}
