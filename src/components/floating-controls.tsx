'use client';

import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { LanguageSelector } from '@/components/language-selector';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FloatingControlsProps {
  className?: string;
  side?: 'left' | 'right';
}

export function FloatingControls({ className, side = 'right' }: FloatingControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'fixed z-50 flex flex-col items-center gap-4 p-3 rounded-lg bg-background/80 backdrop-blur-sm border shadow-sm',
        side === 'left' ? 'left-4' : 'right-4',
        'top-3/5 -translate-y-1/2',
        className
      )}
    >
      <Link href="/">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-primary/10 text-primary border border-primary/20"
        >
          <Home size={20} />
          <span className="sr-only">Home</span>
        </Button>
      </Link>
      <ThemeToggle />
      <LanguageSelector />
    </motion.div>
  );
}
