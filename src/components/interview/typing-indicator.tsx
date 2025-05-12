"use client";

import React from "react";
import styles from "./typing-indicator.module.css";

interface TypingIndicatorProps {
  text?: string;
  className?: string;
}

export function TypingIndicator({
  text = "Typing",
  className,
}: TypingIndicatorProps) {
  return (
    <div className={`${styles.typingContainer} ${className || ""}`}>
      <span className="text-sm text-muted-foreground">{text}</span>
      <span className={styles.typingDot}></span>
      <span className={styles.typingDot}></span>
      <span className={styles.typingDot}></span>
    </div>
  );
}
