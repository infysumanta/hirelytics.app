"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CircleCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface InterviewCompletionProps {
  applicationId: string;
  jobTitle: string;
  companyName: string;
  redirectUrl?: string;
}

export function InterviewCompletion({
  applicationId,
  jobTitle,
  companyName,
}: InterviewCompletionProps) {
  const [closingTimer, setClosingTimer] = useState(8);
  const [isChatClosed, setIsChatClosed] = useState(false);
  const router = useRouter();

  // Auto-close chat effect
  useEffect(() => {
    console.log(
      "[Completion UI] Initializing completion UI with timer:",
      closingTimer,
    );

    // Immediately make sure the component is mounted to prevent any race conditions
    let isMounted = true;

    if (closingTimer > 0) {
      const timer = setTimeout(() => {
        if (isMounted) {
          console.log("[Completion UI] Timer tick:", closingTimer - 1);
          setClosingTimer(closingTimer - 1);
        }
      }, 1000);

      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    } else {
      console.log("[Completion UI] Chat closed, showing feedback button");
      setIsChatClosed(true);
    }
  }, [closingTimer]);

  // Force show feedback button after a maximum wait time (safety measure)
  useEffect(() => {
    const maxWaitTimer = setTimeout(() => {
      console.log(
        "[Completion UI] Maximum wait time reached, forcing feedback button",
      );
      setIsChatClosed(true);
    }, 10000); // 10 seconds max wait

    return () => clearTimeout(maxWaitTimer);
  }, []);

  // Handle redirect to feedback page
  const handleViewFeedback = () => {
    router.push(`/dashboard/applications/${applicationId}/feedback`);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <CircleCheck className="h-12 w-12 text-green-600 dark:text-green-400" />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Interview Completed</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p>
            Thank you for completing your interview for the{" "}
            <Badge variant="outline" className="font-semibold">
              {jobTitle}
            </Badge>{" "}
            position at{" "}
            <Badge variant="outline" className="font-semibold">
              {companyName}
            </Badge>
          </p>

          <div className="rounded-lg bg-muted p-4 text-left">
            <h3 className="text-sm font-medium">What happens next?</h3>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Your responses are being analyzed</li>
              <li>A detailed assessment will be generated</li>
              <li>The hiring team will review your interview</li>
              <li>You&apos;ll receive feedback through the platform</li>
            </ul>
          </div>

          {!isChatClosed && (
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Chat will close in {closingTimer} seconds...</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center">
          {isChatClosed ? (
            <>
              <Button onClick={handleViewFeedback} className="w-full sm:w-auto">
                Continue to Feedback
              </Button>
              <Link
                href={`/dashboard/applications/${applicationId}`}
                className="w-full sm:w-auto"
              >
                <Button variant="outline" className="w-full">
                  View Application Status
                </Button>
              </Link>
            </>
          ) : (
            <Link href={`/dashboard/applications/${applicationId}`}>
              <Button variant="outline">View Application Status</Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
