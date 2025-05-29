'use client';

import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

interface FeedbackData {
  technicalSkills?: number;
  communicationSkills?: number;
  problemSolving?: number;
  cultureFit?: number;
  overallImpression?: number;
  strengths?: string[];
  areasOfImprovement?: string[];
}

interface AutoGenerateFeedbackProps {
  applicationId: string;
  onFeedbackGenerated?: (feedback: FeedbackData) => void;
}

export function AutoGenerateFeedbackEnhanced({
  applicationId,
  onFeedbackGenerated,
}: AutoGenerateFeedbackProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const router = useRouter();

  const generateFeedback = useCallback(
    async (forceRefresh = false) => {
      setIsLoading(true);
      setStatus('Checking feedback status...');
      try {
        // Add cache-busting query parameter if forceRefresh is true
        const url = `/api/ai/interview/autoevaluate?applicationId=${applicationId}${
          forceRefresh ? `&refresh=true&t=${Date.now()}` : ''
        }`;

        const response = await fetch(url, {
          method: 'GET',
          // Add no-cache headers if forcing a refresh
          ...(forceRefresh && {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              Pragma: 'no-cache',
              Expires: '0',
            },
          }),
        });

        const data = await response.json();

        if (response.ok) {
          switch (data.status) {
            case 'existing_feedback':
              setStatus('Using existing feedback');
              break;
            case 'restored_feedback':
              setStatus('Restored feedback from backup');
              break;
            case 'generated_feedback':
              setStatus('Generated new feedback');
              break;
            case 'not_completed':
              setStatus('Interview not completed');
              break;
            default:
              setStatus(data.status || 'Feedback retrieved');
          }

          if (data.feedback && onFeedbackGenerated) {
            onFeedbackGenerated(data.feedback);
          }

          // Only refresh the page if we generated or restored feedback
          if (data.status === 'generated_feedback' || data.status === 'restored_feedback') {
            // Wait a bit to ensure DB updates are complete
            setTimeout(() => {
              router.refresh();
            }, 500);
          }

          return data;
        } else {
          setStatus(`Error: ${data.error || 'Failed to generate feedback'}`);
          return null;
        }
      } catch (error) {
        console.error('Error generating feedback:', error);
        setStatus('Error occurred while generating feedback');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [applicationId, onFeedbackGenerated, router]
  );

  // Auto-generate on component mount
  useEffect(() => {
    generateFeedback();
  }, [generateFeedback]);

  return (
    <div className="mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => generateFeedback(true)}
        disabled={isLoading}
        className="text-xs"
      >
        <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Processing...' : 'Refresh Feedback'}
      </Button>
      {status && <p className="text-xs text-muted-foreground mt-1">{status}</p>}
    </div>
  );
}
