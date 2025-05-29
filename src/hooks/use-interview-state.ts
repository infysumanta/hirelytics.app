// Use this hook to track the interview completion state
'use client';

import { useEffect, useRef, useState } from 'react';

import { useAudioPlaybackState } from './use-audio-playback-state';

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
  isInterrupted?: boolean;
  interruptionReason?: 'timer_expired' | 'technical_issue' | 'user_action';
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
  const { isAudioPlaying } = useAudioPlaybackState();
  const isInitializingRef = useRef(true);
  const isChatActiveRef = useRef(false);
  const lastCheckedRef = useRef(Date.now());

  // Listen for custom events from chat activities and UI interactions
  useEffect(() => {
    const handleChatActive = () => {
      console.log('[InterviewState] Chat activity detected, pausing state checks');
      isChatActiveRef.current = true;
      // Reset chat activity after 5 seconds
      setTimeout(() => {
        isChatActiveRef.current = false;
      }, 5000);
    };

    const handleUIInteraction = () => {
      // When user interacts with UI, pause state checks briefly
      console.log('[InterviewState] UI interaction detected, pausing state checks');
      isChatActiveRef.current = true;
      // Reset after 2 seconds for UI interactions (shorter than chat activity)
      setTimeout(() => {
        isChatActiveRef.current = false;
      }, 2000);
    };

    // Chat-specific events
    document.addEventListener('chat-message-sent', handleChatActive);
    document.addEventListener('chat-initializing', handleChatActive);

    // General UI interaction events
    const uiEvents = ['click', 'touchstart', 'keydown', 'scroll'];
    uiEvents.forEach((event) => {
      document.addEventListener(event, handleUIInteraction);
    });

    return () => {
      document.removeEventListener('chat-message-sent', handleChatActive);
      document.removeEventListener('chat-initializing', handleChatActive);

      uiEvents.forEach((event) => {
        document.removeEventListener(event, handleUIInteraction);
      });
    };
  }, []);

  useEffect(() => {
    const checkInterviewState = async () => {
      // Skip API call if:
      // 1. Audio is currently playing
      // 2. Chat is active (message just sent or initializing)
      // 3. We're in the initialization phase
      if (isAudioPlaying || isChatActiveRef.current || isInitializingRef.current) {
        console.log('[InterviewState] Skipping state check due to:', {
          isAudioPlaying,
          isChatActive: isChatActiveRef.current,
          isInitializing: isInitializingRef.current,
        });
        return;
      }

      // Don't check too frequently (at least 5 seconds between checks)
      const now = Date.now();
      if (now - lastCheckedRef.current < 5000) {
        console.log('[InterviewState] Too soon since last check, skipping');
        return;
      }

      lastCheckedRef.current = now;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/ai/interview/state?applicationId=${applicationId}`, {
          method: 'GET',
        });

        if (!response.ok) {
          console.error('Failed to get interview state');
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
          isInterrupted: data.isInterrupted || false,
          interruptionReason: data.interruptionReason,
        });
      } catch (error) {
        console.error('Error checking interview state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Set a timeout to mark initialization as complete after 5 seconds
    const initTimeout = setTimeout(() => {
      isInitializingRef.current = false;
    }, 5000);

    // Initial check (delayed to avoid initialization conflicts)
    const initialCheckTimeout = setTimeout(() => {
      checkInterviewState();
    }, 6000);

    // Check the interview state every 10 seconds, but only if conditions are met
    const intervalId = setInterval(() => {
      checkInterviewState();
    }, 10000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(initTimeout);
      clearTimeout(initialCheckTimeout);
    };
  }, [applicationId, isAudioPlaying]);

  return { isLoading, interviewState };
}
