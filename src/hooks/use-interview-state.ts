// Use this hook to track the interview completion state
"use client";

import { useState, useEffect } from "react";

interface InterviewState {
  isCompleted: boolean;
  hasEvaluation: boolean;
  feedback?: {
    technicalSkills?: number;
    communicationSkills?: number;
    problemSolving?: number;
    cultureFit?: number;
    overallImpression?: string;
    strengths?: string[];
    areasOfImprovement?: string[];
  };
  technicalQuestions: number;
  projectQuestions: number;
  behavioralQuestions: number;
}

export function useInterviewState(applicationId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [interviewState, setInterviewState] = useState<InterviewState>({
    isCompleted: false,
    hasEvaluation: false,
    technicalQuestions: 0,
    projectQuestions: 0,
    behavioralQuestions: 0,
  });

  useEffect(() => {
    const checkInterviewState = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/ai/interview/state?applicationId=${applicationId}`,
          {
            method: "GET",
          },
        );

        if (!response.ok) {
          console.error("Failed to get interview state");
          return;
        }

        const data = await response.json();
        setInterviewState({
          isCompleted: data.isCompleted,
          hasEvaluation: data.hasEvaluation,
          feedback: data.feedback,
          technicalQuestions: data.technicalQuestions || 0,
          projectQuestions: data.projectQuestions || 0,
          behavioralQuestions: data.behavioralQuestions || 0,
        });
      } catch (error) {
        console.error("Error checking interview state:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial check
    checkInterviewState();

    // Check the interview state every 10 seconds
    const intervalId = setInterval(checkInterviewState, 10000);

    return () => clearInterval(intervalId);
  }, [applicationId]);

  return { isLoading, interviewState };
}
