"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn, safeStyle } from "@/lib/utils";

interface GradientBackgroundProps {
  baseColor: string;
  className?: string;
}

export function GradientBackground({
  baseColor,
  className,
}: GradientBackgroundProps) {
  return (
    <motion.div
      className={cn("absolute inset-0 rounded-lg", className)}
      style={safeStyle({
        background: `linear-gradient(45deg, ${baseColor}05, ${baseColor}15, ${baseColor}05)`,
        backgroundSize: "200% 200%",
        zIndex: -1,
      })}
      animate={{
        backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    />
  );
}
