"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Star, StarHalf, ThumbsUp, Lightbulb } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface FeedbackData {
  technicalSkills?: number;
  communicationSkills?: number;
  problemSolving?: number;
  cultureFit?: number;
  overallImpression?: string;
  strengths?: string[];
  areasOfImprovement?: string[];
}

interface FeedbackContentProps {
  initialFeedback: FeedbackData;
  applicationId: string;
  jobId: string;
}

export function FeedbackContent({
  initialFeedback,
  applicationId,
}: FeedbackContentProps) {
  const [feedback, setFeedback] = useState<FeedbackData>(initialFeedback);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  // Function to refresh feedback
  const refreshFeedback = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(
        `/api/ai/interview/autoevaluate?applicationId=${applicationId}`,
        { method: "GET" },
      );

      if (!response.ok) {
        console.error("Failed to refresh feedback");
        return;
      }

      const data = await response.json();

      if (data.feedback) {
        setFeedback(data.feedback);
        // Also refresh the page to ensure server-side data is updated
        router.refresh();
      }
    } catch (error) {
      console.error("Error refreshing feedback:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Render stars based on rating
  const renderStars = (rating: number = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="h-5 w-5 fill-yellow-500 text-yellow-500"
        />,
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half"
          className="h-5 w-5 fill-yellow-500 text-yellow-500"
        />,
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-5 w-5 text-gray-300" />);
    }

    return stars;
  };

  return (
    <div className="space-y-8">
      {/* Overall Impression */}
      <div className="bg-muted/50 p-6 rounded-lg border border-border/60">
        <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
          <h2 className="text-xl font-semibold">Overall Impression</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={refreshFeedback}
            disabled={isRefreshing}
            className="text-xs h-8"
          >
            {isRefreshing ? "Refreshing..." : "Refresh Analysis"}
          </Button>
        </div>
        <p className="text-muted-foreground">
          {feedback.overallImpression || "No overall impression provided"}
        </p>
      </div>

      {/* Ratings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Technical Skills */}
        <div className="bg-muted/30 p-4 rounded-lg border border-border/40">
          <h3 className="text-sm font-medium mb-2">Technical Skills</h3>
          <div className="flex items-center mb-2">
            {renderStars(feedback.technicalSkills)}
            <span className="ml-2 text-sm text-muted-foreground">
              ({feedback.technicalSkills}/5)
            </span>
          </div>
        </div>

        {/* Communication Skills */}
        <div className="bg-muted/30 p-4 rounded-lg border border-border/40">
          <h3 className="text-sm font-medium mb-2">Communication</h3>
          <div className="flex items-center mb-2">
            {renderStars(feedback.communicationSkills)}
            <span className="ml-2 text-sm text-muted-foreground">
              ({feedback.communicationSkills}/5)
            </span>
          </div>
        </div>

        {/* Problem Solving */}
        <div className="bg-muted/30 p-4 rounded-lg border border-border/40">
          <h3 className="text-sm font-medium mb-2">Problem Solving</h3>
          <div className="flex items-center mb-2">
            {renderStars(feedback.problemSolving)}
            <span className="ml-2 text-sm text-muted-foreground">
              ({feedback.problemSolving}/5)
            </span>
          </div>
        </div>

        {/* Culture Fit */}
        <div className="bg-muted/30 p-4 rounded-lg border border-border/40">
          <h3 className="text-sm font-medium mb-2">Culture Fit</h3>
          <div className="flex items-center mb-2">
            {renderStars(feedback.cultureFit)}
            <span className="ml-2 text-sm text-muted-foreground">
              ({feedback.cultureFit}/5)
            </span>
          </div>
        </div>
      </div>

      {/* Strengths */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          <ThumbsUp className="mr-2 h-5 w-5 text-green-500" />
          Strengths
        </h2>
        <ul className="space-y-2">
          {feedback.strengths?.map((strength: string, index: number) => (
            <li key={index} className="flex items-start">
              <div className="h-6 w-6 flex-shrink-0 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 mr-2">
                <span className="text-xs">{index + 1}</span>
              </div>
              <span>{strength}</span>
            </li>
          )) || (
            <li className="text-muted-foreground">No strengths identified</li>
          )}
        </ul>
      </div>

      {/* Areas of Improvement */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          <Lightbulb className="mr-2 h-5 w-5 text-amber-500" />
          Areas for Improvement
        </h2>
        <ul className="space-y-2">
          {feedback.areasOfImprovement?.map((area: string, index: number) => (
            <li key={index} className="flex items-start">
              <div className="h-6 w-6 flex-shrink-0 flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 mr-2">
                <span className="text-xs">{index + 1}</span>
              </div>
              <span>{area}</span>
            </li>
          )) || (
            <li className="text-muted-foreground">
              No improvement areas identified
            </li>
          )}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Link
          href={`/dashboard/applications/${applicationId}`}
          className="flex-1"
        >
          <Button variant="default" className="w-full">
            View Application Status
          </Button>
        </Link>
        <Link href="/dashboard" className="flex-1">
          <Button variant="outline" className="w-full">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
