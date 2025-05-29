'use client';

import './ai-interview.css';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { type AIAgentState, useAIAgentState } from '@/hooks/use-ai-agent-state';
import { cn } from '@/lib/utils';

interface AIInterviewerIconProps {
  className?: string;
  size?: number;
  isLoading?: boolean;
  agentState?: AIAgentState;
}

export function AIInterviewerIcon({
  className,
  size = 64,
  isLoading = false,
  agentState,
}: AIInterviewerIconProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Use the AI agent state hook if agentState is not provided
  const aiState = useAIAgentState(isLoading);
  const currentState = agentState || aiState.agentState;

  // Wait for component to mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn('flex items-center justify-center rounded-full bg-primary/20', className)}
        style={{ width: size, height: size }}
      />
    );
  }

  // Animation variants for different states
  const containerVariants = {
    idle: {
      scale: 1,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    thinking: {
      scale: [1, 1.02, 1],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    speaking: {
      scale: [1, 1.05, 0.98, 1.03, 1],
      transition: {
        duration: 1.8,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const backgroundVariants = {
    idle: {
      opacity: 0.3,
      scale: 1,
    },
    thinking: {
      opacity: [0.3, 0.6, 0.8, 0.6, 0.3],
      scale: [1, 1.05, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    speaking: {
      opacity: [0.4, 0.9, 0.6, 0.8, 0.4],
      scale: [1, 1.08, 0.95, 1.06, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <motion.div
      className={cn('relative ai-interviewer-icon', className)}
      style={{ width: size, height: size }}
      variants={containerVariants}
      animate={currentState}
      initial="idle"
    >
      {/* Thinking state gradient background */}
      <AnimatePresence>
        {currentState === 'thinking' && (
          <motion.div
            className={cn(
              'absolute inset-0 rounded-full ai-thinking-gradient',
              'border border-primary/20'
            )}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Speaking state ripple effects */}
      <AnimatePresence>
        {currentState === 'speaking' && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/30"
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border border-primary/20"
              initial={{ scale: 0.9, opacity: 0.6 }}
              animate={{ scale: 1.3, opacity: 0 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 0.3,
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Base background with state-based animation */}
      <motion.div
        className={cn(
          'absolute inset-0 rounded-full',
          currentState === 'thinking'
            ? 'ai-thinking-breathe'
            : currentState === 'speaking'
              ? 'ai-speaking-glow'
              : 'ai-pulse-animation',
          theme === 'dark' ? 'bg-primary/10' : 'bg-primary/5'
        )}
        variants={backgroundVariants}
        animate={currentState}
        initial="idle"
      />

      {/* AI Interviewer Image */}
      <motion.div
        className="relative z-10"
        animate={
          currentState === 'speaking'
            ? {
                filter: [
                  'brightness(1) saturate(1)',
                  'brightness(1.1) saturate(1.2)',
                  'brightness(0.95) saturate(0.9)',
                  'brightness(1.05) saturate(1.1)',
                  'brightness(1) saturate(1)',
                ],
              }
            : {}
        }
        transition={
          currentState === 'speaking'
            ? {
                duration: 1.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : {}
        }
      >
        <Image
          src="/ai-interviewer.svg"
          alt="AI Interviewer"
          width={size}
          height={size}
          className={cn(
            'rounded-full shadow-md relative z-10',
            theme === 'dark' ? 'brightness-110' : 'brightness-90'
          )}
          priority
        />
      </motion.div>

      {/* Thinking state ripple effect */}
      <AnimatePresence>
        {currentState === 'thinking' && (
          <motion.div
            className="absolute inset-0 rounded-full border border-primary/10"
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
