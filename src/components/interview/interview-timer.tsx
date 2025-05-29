"use client";

import { useState, useEffect, useRef } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InterviewTimerProps {
  durationMinutes: number;
  onTimeExpired: () => void;
  className?: string;
  isActive?: boolean;
}

export function InterviewTimer({
  durationMinutes,
  onTimeExpired,
  className,
  isActive = true,
}: InterviewTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60); // Convert to seconds
  const [isExpired, setIsExpired] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    if (!isActive) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        
        if (newTime <= 0 && !hasExpiredRef.current) {
          hasExpiredRef.current = true;
          setIsExpired(true);
          onTimeExpired();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, onTimeExpired]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeStatus = () => {
    const totalSeconds = durationMinutes * 60;
    const percentage = (timeLeft / totalSeconds) * 100;
    
    if (isExpired) return "expired";
    if (percentage <= 10) return "critical"; // Last 10%
    if (percentage <= 25) return "warning"; // Last 25%
    return "normal";
  };

  const status = getTimeStatus();

  const getStatusColor = () => {
    switch (status) {
      case "expired":
        return "bg-red-500 text-white";
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 animate-pulse";
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "expired":
        return "Time Expired";
      case "critical":
        return "Time Almost Up!";
      case "warning":
        return "Time Running Low";
      default:
        return "Interview Timer";
    }
  };

  if (!isActive) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300",
              getStatusColor(),
              status === "critical" && "shadow-lg",
              className,
            )}
          >
            {status === "critical" || status === "expired" ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            <div className="flex flex-col items-center">
              <span className="text-xs font-medium opacity-80">
                {getStatusText()}
              </span>
              <span
                className={cn(
                  "font-mono font-bold",
                  status === "critical" && "text-lg",
                )}
              >
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-medium">Interview Duration</p>
            <p className="text-sm opacity-80">
              {formatTime(timeLeft)} remaining of {durationMinutes} minutes
            </p>
            {status === "critical" && (
              <p className="text-xs text-red-400 mt-1">
                Interview will end automatically when time expires
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Compact version for mobile or smaller spaces
export function CompactInterviewTimer({
  durationMinutes,
  onTimeExpired,
  className,
  isActive = true,
}: InterviewTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isExpired, setIsExpired] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    if (!isActive) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        
        if (newTime <= 0 && !hasExpiredRef.current) {
          hasExpiredRef.current = true;
          setIsExpired(true);
          onTimeExpired();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, onTimeExpired]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getVariant = () => {
    const totalSeconds = durationMinutes * 60;
    const percentage = (timeLeft / totalSeconds) * 100;
    
    if (isExpired) return "destructive";
    if (percentage <= 10) return "destructive";
    if (percentage <= 25) return "secondary";
    return "outline";
  };

  if (!isActive) return null;

  return (
    <Badge
      variant={getVariant()}
      className={cn(
        "font-mono text-xs",
        getVariant() === "destructive" && "animate-pulse",
        className,
      )}
    >
      <Clock className="h-3 w-3 mr-1" />
      {formatTime(timeLeft)}
    </Badge>
  );
}
