"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  className?: string;
  patternColor?: string;
  patternOpacity?: number;
  animate?: boolean;
  colorScheme?: "blue" | "purple" | "cyan" | "indigo" | "default";
}

export function AnimatedBackground({
  children,
  className,
  patternColor = "primary",
  patternOpacity = 0.15, // Increased opacity for more vibrant colors
  animate = true,
  colorScheme = "default",
}: AnimatedBackgroundProps) {
  // Define gradient styles based on color scheme
  const getGradientStyle = () => {
    switch (colorScheme) {
      case "blue":
        return "bg-gradient-to-br from-blue-900/30 via-background to-blue-500/20";
      case "purple":
        return "bg-gradient-to-br from-purple-900/30 via-background to-purple-500/20";
      case "cyan":
        return "bg-gradient-to-br from-cyan-900/30 via-background to-cyan-500/20";
      case "indigo":
        return "bg-gradient-to-br from-indigo-900/30 via-background to-indigo-500/20";
      default:
        return "bg-gradient-to-br from-primary/20 via-background to-primary/10";
    }
  };

  // Get colors for the blobs based on color scheme
  const getBlobColors = () => {
    switch (colorScheme) {
      case "blue":
        return ["bg-blue-500", "bg-blue-600", "bg-blue-400", "bg-blue-300"];
      case "purple":
        return [
          "bg-purple-500",
          "bg-purple-600",
          "bg-purple-400",
          "bg-purple-300",
        ];
      case "cyan":
        return ["bg-cyan-500", "bg-cyan-600", "bg-cyan-400", "bg-cyan-300"];
      case "indigo":
        return [
          "bg-indigo-500",
          "bg-indigo-600",
          "bg-indigo-400",
          "bg-indigo-300",
        ];
      default:
        return [
          `bg-${patternColor}`,
          `bg-${patternColor}`,
          `bg-${patternColor}`,
          `bg-${patternColor}`,
        ];
    }
  };

  const blobColors = getBlobColors();

  return (
    <div
      className={cn("relative min-h-screen w-full overflow-hidden", className)}
    >
      {/* Background gradient */}
      <div className={cn("absolute inset-0", getGradientStyle())} />

      {/* Animated pattern elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large blob */}
        <motion.div
          className={cn(`absolute rounded-full ${blobColors[0]}/20`)}
          style={{
            width: "45%",
            height: "45%",
            top: "5%",
            left: "0%",
            opacity: patternOpacity * 2,
            filter: "blur(70px)",
          }}
          animate={
            animate
              ? {
                  x: [0, 20, 0],
                  y: [0, 25, 0],
                  scale: [1, 1.05, 1],
                }
              : undefined
          }
          transition={{
            duration: 12,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />

        {/* Medium blob */}
        <motion.div
          className={cn(`absolute rounded-full ${blobColors[1]}/25`)}
          style={{
            width: "30%",
            height: "30%",
            bottom: "15%",
            right: "5%",
            opacity: patternOpacity * 2.5,
            filter: "blur(60px)",
          }}
          animate={
            animate
              ? {
                  x: [0, -25, 0],
                  y: [0, 15, 0],
                  scale: [1, 1.1, 1],
                }
              : undefined
          }
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />

        {/* Small blob */}
        <motion.div
          className={cn(`absolute rounded-full ${blobColors[2]}/30`)}
          style={{
            width: "20%",
            height: "20%",
            top: "55%",
            left: "25%",
            opacity: patternOpacity * 3,
            filter: "blur(40px)",
          }}
          animate={
            animate
              ? {
                  x: [0, 30, 0],
                  y: [0, -20, 0],
                  scale: [1, 1.15, 1],
                }
              : undefined
          }
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />

        {/* Extra small blob */}
        <motion.div
          className={cn(`absolute rounded-full ${blobColors[3]}/35`)}
          style={{
            width: "15%",
            height: "15%",
            bottom: "5%",
            left: "15%",
            opacity: patternOpacity * 3.5,
            filter: "blur(30px)",
          }}
          animate={
            animate
              ? {
                  x: [0, -15, 0],
                  y: [0, -25, 0],
                  scale: [1, 1.2, 1],
                }
              : undefined
          }
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />

        {/* Additional small blob for more color */}
        <motion.div
          className={cn(`absolute rounded-full ${blobColors[0]}/25`)}
          style={{
            width: "12%",
            height: "12%",
            top: "25%",
            right: "20%",
            opacity: patternOpacity * 3,
            filter: "blur(35px)",
          }}
          animate={
            animate
              ? {
                  x: [0, 18, 0],
                  y: [0, 12, 0],
                  scale: [1, 1.1, 1],
                }
              : undefined
          }
          transition={{
            duration: 9,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen w-full items-center justify-center">
        {children}
      </div>
    </div>
  );
}
