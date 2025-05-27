"use client";

import { useState, useEffect } from "react";
import { useAudioPlaybackState } from "./use-audio-playback-state";

export type AIAgentState = "idle" | "thinking" | "speaking";

interface AIAgentStateHook {
  agentState: AIAgentState;
  isThinking: boolean;
  isSpeaking: boolean;
}

/**
 * Hook to manage AI agent visual states for enhanced UI feedback
 */
export function useAIAgentState(isLoading: boolean): AIAgentStateHook {
  const { isAudioPlaying } = useAudioPlaybackState();
  const [agentState, setAgentState] = useState<AIAgentState>("idle");

  useEffect(() => {
    if (isAudioPlaying) {
      setAgentState("speaking");
    } else if (isLoading) {
      setAgentState("thinking");
    } else {
      setAgentState("idle");
    }
  }, [isLoading, isAudioPlaying]);

  return {
    agentState,
    isThinking: agentState === "thinking",
    isSpeaking: agentState === "speaking",
  };
}
