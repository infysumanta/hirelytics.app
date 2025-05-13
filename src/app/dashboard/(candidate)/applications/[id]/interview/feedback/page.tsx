import { Metadata } from "next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { JobApplication } from "@/models/job-application";
import { connectToDatabase } from "@/lib/mongodb";
import { getJobById } from "@/actions/jobs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AIInterviewBackground } from "@/components/interview/ai-interview-background";
import { CircleCheck, Star, StarHalf, ThumbsUp, Lightbulb } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Interview Feedback | Hirelytics`,
  };
}

export default async function InterviewFeedbackPage(props: Props) {
  const params = await props.params;
  const applicationId = params.id;

  try {
    await connectToDatabase();
    const application = await JobApplication.findById(applicationId);

    if (!application) {
      notFound();
    }

    const job = await getJobById(application.jobId);
    if (!job) {
      notFound();
    }

    // Check if interview is completed and has evaluation
    const interviewState = application.interviewState;
    if (!interviewState || interviewState.currentPhase !== "completed") {
      return (
        <div className="container mx-auto max-w-4xl py-12">
          <Card>
            <CardHeader>
              <h1 className="text-2xl font-bold">Interview Not Completed</h1>
              <p className="text-muted-foreground">
                You need to complete the interview before viewing feedback.
              </p>
            </CardHeader>
            <CardContent>
              <Link href={`/dashboard/applications/${applicationId}/interview`}>
                <Button>Go to Interview</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      );
    }

    const feedback = interviewState.feedback || {};
    const hasEvaluation = !!feedback.technicalSkills;

    if (!hasEvaluation) {
      return (
        <div className="container mx-auto max-w-4xl py-12">
          <Card>
            <CardHeader>
              <h1 className="text-2xl font-bold">Feedback Processing</h1>
              <p className="text-muted-foreground">
                Your interview feedback is still being processed. Please check
                back in a few minutes.
              </p>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard">
                <Button>Return to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      );
    }

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
        stars.push(
          <Star key={`empty-${i}`} className="h-5 w-5 text-gray-300" />,
        );
      }

      return stars;
    };

    return (
      <div className="container px-4 py-8 mx-auto relative">
        {/* Apply a subtle background for the entire page */}
        <div className="absolute inset-0 -z-10">
          <AIInterviewBackground className="opacity-25" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CircleCheck className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <Card className="mb-6 border-border/60 shadow-lg">
            <CardHeader>
              <h1 className="text-2xl font-bold text-center">
                {job.title} - Interview Feedback
              </h1>
              <p className="text-center text-muted-foreground">
                AI-generated assessment for your interview with{" "}
                {job.companyName}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Overall Impression */}
                <div className="bg-muted/50 p-6 rounded-lg border border-border/60">
                  <h2 className="text-xl font-semibold mb-3">
                    Overall Impression
                  </h2>
                  <p className="text-muted-foreground">
                    {feedback.overallImpression ||
                      "No overall impression provided"}
                  </p>
                </div>

                {/* Ratings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Technical Skills */}
                  <div className="bg-muted/30 p-4 rounded-lg border border-border/40">
                    <h3 className="text-sm font-medium mb-2">
                      Technical Skills
                    </h3>
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
                    <h3 className="text-sm font-medium mb-2">
                      Problem Solving
                    </h3>
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
                    {feedback.strengths?.map(
                      (strength: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <div className="h-6 w-6 flex-shrink-0 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 mr-2">
                            <span className="text-xs">{index + 1}</span>
                          </div>
                          <span>{strength}</span>
                        </li>
                      ),
                    ) || (
                      <li className="text-muted-foreground">
                        No strengths identified
                      </li>
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
                    {feedback.areasOfImprovement?.map(
                      (area: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <div className="h-6 w-6 flex-shrink-0 flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 mr-2">
                            <span className="text-xs">{index + 1}</span>
                          </div>
                          <span>{area}</span>
                        </li>
                      ),
                    ) || (
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
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading interview feedback page:", error);
    notFound();
  }
}
