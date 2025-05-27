"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AIInterviewerIcon } from "./ai-interviewer-icon";
import { Badge } from "@/components/ui/badge";
import type { AIAgentState } from "@/hooks/use-ai-agent-state";

/**
 * Demo component to showcase the enhanced AI agent visual states
 * This component demonstrates the thinking and speaking animations
 */
export function AIAgentDemo() {
  const [currentState, setCurrentState] = useState<AIAgentState>("idle");
  const [isLoading, setIsLoading] = useState(false);

  const handleStateChange = (newState: AIAgentState) => {
    setCurrentState(newState);
    setIsLoading(newState === "thinking");
    
    // Auto-reset after demonstration
    if (newState !== "idle") {
      setTimeout(() => {
        setCurrentState("idle");
        setIsLoading(false);
      }, 5000);
    }
  };

  const getStateDescription = (state: AIAgentState) => {
    switch (state) {
      case "thinking":
        return "AI is processing your input with gradient breathing animation and ripple effects";
      case "speaking":
        return "AI is speaking with dynamic pulse animation synchronized with audio playback";
      case "idle":
        return "AI is in idle state with subtle pulse animation";
      default:
        return "";
    }
  };

  const getStateColor = (state: AIAgentState) => {
    switch (state) {
      case "thinking":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "speaking":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "idle":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "";
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>AI Agent Visual Enhancements Demo</CardTitle>
        <CardDescription>
          Experience the enhanced visual feedback for AI agent states during interview interactions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Agent Display */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <AIInterviewerIcon
              size={120}
              isLoading={isLoading}
              agentState={currentState}
              className="shadow-lg shadow-primary/20"
            />
          </div>
          
          <div className="text-center space-y-2">
            <Badge className={getStateColor(currentState)}>
              {currentState.charAt(0).toUpperCase() + currentState.slice(1)} State
            </Badge>
            <p className="text-sm text-muted-foreground max-w-md">
              {getStateDescription(currentState)}
            </p>
          </div>
        </div>

        {/* State Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            variant={currentState === "idle" ? "default" : "outline"}
            onClick={() => handleStateChange("idle")}
            className="w-full"
          >
            Idle State
          </Button>
          <Button
            variant={currentState === "thinking" ? "default" : "outline"}
            onClick={() => handleStateChange("thinking")}
            className="w-full"
          >
            Thinking State
          </Button>
          <Button
            variant={currentState === "speaking" ? "default" : "outline"}
            onClick={() => handleStateChange("speaking")}
            className="w-full"
          >
            Speaking State
          </Button>
        </div>

        {/* Feature List */}
        <div className="space-y-3 text-sm">
          <h4 className="font-medium">Enhanced Features:</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span><strong>Thinking State:</strong> Gradient breathing animation with ripple effects when AI is processing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">•</span>
              <span><strong>Speaking State:</strong> Dynamic beat/pulse animation synchronized with audio playback</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-500">•</span>
              <span><strong>Accessibility:</strong> Respects user's reduced motion preferences</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              <span><strong>Theme Support:</strong> Adapts to light and dark modes seamlessly</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
