import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CircleCheck } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

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
        </CardContent>

        <CardFooter className="flex justify-center">
          <Link href={`/dashboard/applications/${applicationId}`}>
            <Button>View Application Status</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
