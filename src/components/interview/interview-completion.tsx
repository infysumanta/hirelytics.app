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
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface InterviewCompletionProps {
  applicationId: string;
  jobTitle: string;
  companyName: string;
  redirectUrl?: string;
  isInterrupted?: boolean;
  interruptionReason?: "timer_expired" | "technical_issue" | "user_action";
}

export function InterviewCompletion({
  applicationId,
  jobTitle,
  companyName,
  isInterrupted = false,
  interruptionReason,
}: InterviewCompletionProps) {
  const [closingTimer, setClosingTimer] = useState(12); // Increased from 8 to 12 seconds
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
    }, 15000); // Increased from 10 to 15 seconds max wait to give users more time to read

    return () => clearTimeout(maxWaitTimer);
  }, []);

  // Handle redirect to feedback page
  const handleViewFeedback = () => {
    router.push(`/dashboard/applications/${applicationId}/interview/feedback`);
  };

  // Get completion message based on interruption status
  const getCompletionMessage = () => {
    if (isInterrupted) {
      switch (interruptionReason) {
        case "timer_expired":
          return {
            title: "Interview Time Expired",
            message: "Your interview session has ended due to time limit.",
            icon: "clock",
          };
        case "technical_issue":
          return {
            title: "Interview Interrupted",
            message: "Your interview was interrupted due to a technical issue.",
            icon: "warning",
          };
        case "user_action":
          return {
            title: "Interview Ended",
            message: "Your interview session has been ended.",
            icon: "stop",
          };
        default:
          return {
            title: "Interview Interrupted",
            message: "Your interview session was interrupted.",
            icon: "warning",
          };
      }
    }
    return {
      title: "Interview Completed",
      message: "Thank you for completing your interview.",
      icon: "check",
    };
  };

  const completionInfo = getCompletionMessage();

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <CircleCheck className="h-12 w-12 text-green-600 dark:text-green-400" />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">{completionInfo.title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p>
            {completionInfo.message} {!isInterrupted && "for the"}{" "}
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

        <CardFooter className="flex justify-center">
          {isChatClosed ? (
            <Button onClick={handleViewFeedback} className="w-full sm:w-auto">
              Continue to Feedback
            </Button>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Analyzing your interview responses...</span>
              </div>
              <p className="text-xs text-muted-foreground">
                This may take a moment to process
              </p>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
