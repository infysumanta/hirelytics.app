import { Metadata } from "next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { JobApplication } from "@/models/job-application";
import { connectToDatabase } from "@/lib/mongodb";
import { getJobById } from "@/actions/jobs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AIInterviewBackground } from "@/components/interview/ai-interview-background";
import { CircleCheck } from "lucide-react";
import { AutoGenerateFeedback } from "@/components/interview/auto-generate-feedback";
import { FeedbackContent } from "@/components/interview/feedback-content";

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
                Your interview responses are being analyzed. This may take a
                moment.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AutoGenerateFeedback applicationId={applicationId} />
                <div className="flex justify-center">
                  <Link href="/dashboard">
                    <Button>Return to Dashboard</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Serialize the feedback data to plain JavaScript objects
    // to avoid passing Mongoose document objects to client components
    const serializedFeedback = {
      technicalSkills: feedback.technicalSkills || 0,
      communicationSkills: feedback.communicationSkills || 0,
      problemSolving: feedback.problemSolving || 0,
      cultureFit: feedback.cultureFit || 0,
      overallImpression: feedback.overallImpression || "",
      strengths: Array.isArray(feedback.strengths)
        ? [...feedback.strengths]
        : [],
      areasOfImprovement: Array.isArray(feedback.areasOfImprovement)
        ? [...feedback.areasOfImprovement]
        : [],
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
              <FeedbackContent
                initialFeedback={serializedFeedback}
                applicationId={applicationId.toString()}
                jobId={job._id ? job._id.toString() : job.id.toString()}
              />
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
