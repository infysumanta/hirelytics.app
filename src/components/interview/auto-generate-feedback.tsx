'use client';

import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

interface AutoGenerateFeedbackProps {
  applicationId: string;
}

export function AutoGenerateFeedback({ applicationId }: AutoGenerateFeedbackProps) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [status, setStatus] = useState<string | null>('generating');
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        return prev + Math.floor(Math.random() * 10);
      });
    }, 1000);

    const generateFeedback = async () => {
      try {
        const response = await fetch(
          `/api/ai/interview/autoevaluate?applicationId=${applicationId}`,
          { method: 'GET', cache: 'no-store' }
        );

        if (!response.ok) {
          console.error('Failed to auto-generate feedback');
          setStatus('error');
          return;
        }

        const data = await response.json();

        if (data.status === 'generated_feedback') {
          // Set progress to 100 for completion
          setProgress(100);
          setStatus('generated');

          // Wait a moment to show completion before refreshing
          setTimeout(() => {
            // Refresh the page to show the new feedback
            router.refresh();
          }, 1500);
        } else {
          // Feedback already exists or interview not completed
          setStatus(data.status);
          setProgress(100);
        }
      } catch (error) {
        console.error('Error generating feedback:', error);
        setStatus('error');
      } finally {
        setIsGenerating(false);
        clearInterval(progressInterval);
      }
    };

    generateFeedback();

    return () => clearInterval(progressInterval);
  }, [applicationId, router]);

  // Show loading state
  if (status === 'generating' || isGenerating) {
    return (
      <div className="bg-muted/20 p-6 rounded-lg border border-border/40 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span>Analyzing your interview responses...</span>
          </div>
          <span className="text-sm text-muted-foreground">{progress}%</span>
        </div>

        <div className="w-full bg-muted rounded-full h-2 dark:bg-gray-700">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="text-xs text-muted-foreground">
          Our AI is carefully reviewing your interview responses against the job requirements
        </p>
      </div>
    );
  }

  // Show error state
  if (status === 'error') {
    return (
      <div className="bg-destructive/10 p-6 rounded-lg border border-destructive/30 space-y-4">
        <div className="flex items-center gap-2 text-destructive mb-2">
          <AlertCircle className="h-5 w-5" />
          <h3 className="font-medium">Failed to generate feedback</h3>
        </div>

        <p className="text-sm text-muted-foreground">
          We encountered an issue while analyzing your interview. You can try again or contact
          support.
        </p>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setStatus('generating');
            setIsGenerating(true);
            setProgress(0);
            router.refresh();
          }}
        >
          Try again
        </Button>
      </div>
    );
  }

  // Show success state if needed, though this typically gets replaced by refresh
  if (status === 'generated' && !isGenerating) {
    return (
      <div className="bg-green-500/10 p-6 rounded-lg border border-green-500/30 space-y-2">
        <div className="flex items-center gap-2 text-green-600 mb-2">
          <CheckCircle2 className="h-5 w-5" />
          <h3 className="font-medium">Feedback generated successfully</h3>
        </div>
        <p className="text-sm text-muted-foreground">Loading your interview feedback now...</p>
      </div>
    );
  }

  return null;
}
