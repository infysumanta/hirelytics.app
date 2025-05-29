'use client';

import { motion } from 'framer-motion';
import * as React from 'react';

import { LanguageSelector } from '@/components/language-selector';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

interface FloatingControlsProps {
  className?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function FloatingControls({ className, position = 'top-right' }: FloatingControlsProps) {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'fixed z-50 flex items-center gap-2 p-2 rounded-full bg-background/80 backdrop-blur-sm border shadow-sm',
        positionClasses[position],
        className
      )}
    >
      <ThemeToggle />
      <LanguageSelector />
    </motion.div>
  );
}
