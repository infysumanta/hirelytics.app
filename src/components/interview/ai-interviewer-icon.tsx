"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import "./ai-interview.css";

interface AIInterviewerIconProps {
  className?: string;
  size?: number;
}

export function AIInterviewerIcon({
  className,
  size = 64,
}: AIInterviewerIconProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait for component to mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-primary/20",
          className,
        )}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={cn("relative ai-interviewer-icon", className)}
      style={{ width: size, height: size }}
    >
      <div
        className={cn(
          "absolute inset-0 rounded-full ai-pulse-animation",
          theme === "dark" ? "bg-primary/10" : "bg-primary/5",
        )}
      />
      <Image
        src="/ai-interviewer.svg"
        alt="AI Interviewer"
        width={size}
        height={size}
        className={cn(
          "rounded-full shadow-md",
          theme === "dark" ? "brightness-110" : "brightness-90",
        )}
        priority
      />
    </div>
  );
}
