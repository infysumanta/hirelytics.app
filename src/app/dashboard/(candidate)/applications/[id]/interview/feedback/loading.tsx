import { AIInterviewBackground } from '@/components/interview/ai-interview-background';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function InterviewFeedbackLoading() {
  return (
    <div className="container px-4 py-8 mx-auto relative">
      <div className="absolute inset-0 -z-10">
        <AIInterviewBackground className="opacity-25" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-6 flex justify-center">
          <Skeleton className="h-20 w-20 rounded-full" />
        </div>

        <Card className="mb-6 border-border/60 shadow-lg">
          <CardHeader>
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-4 w-72 mx-auto mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <Skeleton className="h-32 w-full rounded-lg" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>

              <div>
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
                </div>
              </div>

              <div>
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Skeleton className="h-10 w-full sm:w-1/2" />
                <Skeleton className="h-10 w-full sm:w-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
