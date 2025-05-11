import { Metadata } from "next";
import { JobApplication } from "@/models/job-application";
import { connectToDatabase } from "@/lib/mongodb";
import { getJobById } from "@/actions/jobs";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-3xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <h1 className="text-3xl font-bold">
                {job.title} - Live Interview
              </h1>
              <p className="text-muted-foreground">
                AI Interview session for {job.companyName}
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8">
                <h2 className="text-2xl font-semibold mb-4">
                  Interview in Progress
                </h2>
                <p className="mb-6">
                  The AI interviewer will guide you through a series of
                  questions. Answer naturally as you would in a real interview.
                </p>
                <p className="text-muted-foreground">
                  This is a placeholder for the actual interview interface that
                  would include video streaming, question display, and answer
                  recording functionality.
                </p>
              </div>
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
