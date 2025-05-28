"use client";

import { Clock, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutoSendTimerProps {
  isActive: boolean;
  seconds: number;
  className?: string;
}

export function AutoSendTimer({
  isActive,
  seconds,
  className,
}: AutoSendTimerProps) {
  if (!isActive || seconds <= 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 bg-background/95 backdrop-blur-sm border border-primary/30 rounded-xl px-4 py-3 shadow-lg",
        "animate-in slide-in-from-top-2 duration-300",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {/* Icon with pulsing animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
          <div className="relative bg-primary/10 p-2 rounded-full">
            <Send className="h-4 w-4 text-primary" />
          </div>
        </div>

        {/* Timer content */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              Auto-sending in
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-primary tabular-nums">
              {seconds}
            </span>
            <span className="text-sm text-muted-foreground">
              second{seconds !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="relative w-8 h-8">
          <svg
            className="w-8 h-8 transform -rotate-90"
            viewBox="0 0 32 32"
          >
            {/* Background circle */}
            <circle
              cx="16"
              cy="16"
              r="14"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-muted-foreground/20"
            />
            {/* Progress circle */}
            <circle
              cx="16"
              cy="16"
              r="14"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 14}`}
              strokeDashoffset={`${2 * Math.PI * 14 * (1 - seconds / 10)}`}
              className="text-primary transition-all duration-1000 ease-linear"
              strokeLinecap="round"
            />
          </svg>
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Subtle hint text */}
      <div className="mt-2 pt-2 border-t border-primary/10">
        <p className="text-xs text-muted-foreground text-center">
          Start typing to cancel auto-send
        </p>
      </div>
    </div>
  );
}
