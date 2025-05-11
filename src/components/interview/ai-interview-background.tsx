"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import "./ai-interview.css";

interface AIInterviewBackgroundProps {
  className?: string;
}

export function AIInterviewBackground({
  className,
}: AIInterviewBackgroundProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait for component to mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className={cn("absolute inset-0 overflow-hidden -z-10", className)}>
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br",
          theme === "dark"
            ? "from-blue-950/20 to-black/50"
            : "from-blue-50/90 to-white/70",
        )}
      />
      <Image
        src="/ai-interview-background.svg"
        alt=""
        fill
        sizes="100vw"
        className={cn(
          "object-cover ai-circuit-pattern",
          theme === "dark" ? "invert-0" : "invert opacity-30",
        )}
        priority
      />
    </div>
  );
}
