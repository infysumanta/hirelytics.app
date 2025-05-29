'use client';

import { Clock, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AutoSendTimerProps {
  isActive: boolean;
  seconds: number;
  onCancel?: () => void;
  className?: string;
}

export function AutoSendTimer({ isActive, seconds, onCancel, className }: AutoSendTimerProps) {
  if (!isActive || seconds <= 0) {
    return null;
  }

  return (
    <div className={cn('animate-in slide-in-from-top-2 duration-300', className)}>
      {/* Cancel button in top-right corner */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onCancel}
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border border-border shadow-sm hover:bg-destructive hover:text-destructive-foreground"
      >
        <X className="h-3 w-3" />
      </Button>

      <div className="flex items-center justify-between gap-3">
        {/* Timer content */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 justify-between">
            <Clock className="h-2 w-2 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Auto-sending in</span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-primary tabular-nums">{seconds}</span>
              <span className="text-sm text-muted-foreground">
                second{seconds !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle hint text */}
      <div className="m-1 p-1 border-t border-primary/10">
        <p className="text-[0.625rem] text-muted-foreground">
          Start typing or click × to cancel auto-send
        </p>
      </div>
    </div>
  );
}
