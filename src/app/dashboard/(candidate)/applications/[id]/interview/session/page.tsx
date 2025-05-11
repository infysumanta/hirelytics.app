import { Metadata } from "next";
import { JobApplication } from "@/models/job-application";
import { connectToDatabase } from "@/lib/mongodb";
import { getJobById } from "@/actions/jobs";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { InterviewSession } from "@/components/interview/interview-session";
import { AIInterviewBackground } from "@/components/interview/ai-interview-background";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const applicationId = params.id;

  try {
    await connectToDatabase();
    const application = await JobApplication.findById(applicationId);

    if (!application) {
      return {
        title: "Interview Session | Hirelytics",
        description: "AI-powered interview session",
      };
    }

    const job = await getJobById(application.jobId);

    return {
      title: `Interview Session for ${job.title} | Hirelytics`,
      description: `Live AI-powered interview session for the ${job.title} position at ${job.companyName}`,
    };
  } catch {
    return {
      title: "Interview Session | Hirelytics",
      description: "AI-powered interview session",
    };
  }
}

export default async function InterviewSessionPage({ params }: Props) {
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

    return (
      <div className="container px-4 py-4 mx-auto relative">
        {/* Apply a subtle background for the entire page */}
        <div className="absolute inset-0 -z-10">
          <AIInterviewBackground className="opacity-30" />
        </div>

        <div className="mx-auto relative z-10">
          <Card className="mb-2 border-border/60 shadow-lg">
            <CardHeader className="py-3">
              <h1 className="text-xl font-bold">
                {job.title} - Live Interview
              </h1>
              <p className="text-sm text-muted-foreground">
                AI Interview session for {job.companyName}
              </p>
            </CardHeader>
            <CardContent className="p-4">
              <InterviewSession
                applicationId={applicationId}
                jobTitle={job.title}
                companyName={job.companyName}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading interview session page:", error);
    notFound();
  }
}
