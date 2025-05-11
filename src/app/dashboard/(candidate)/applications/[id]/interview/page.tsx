import { Metadata } from "next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { JobApplication } from "@/models/job-application";
import { connectToDatabase } from "@/lib/mongodb";
import { getJobById } from "@/actions/jobs";
import { InterviewClient } from "@/components/interview/interview-client";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const applicationId = params.id;

  try {
    await connectToDatabase();
    const application = await JobApplication.findById(applicationId);

    if (!application) {
      return {
        title: "Interview | Hirelytics",
        description: "Virtual interview for your job application",
      };
    }

    const job = await getJobById(application.jobId);

    return {
      title: `Interview for ${job.title} | Hirelytics`,
      description: `Virtual interview for the ${job.title} position at ${job.companyName}`,
    };
  } catch {
    return {
      title: "Interview | Hirelytics",
      description: "Virtual interview for your job application",
    };
  }
}

export default async function InterviewPage(props: Props) {
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

    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-3xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <h1 className="text-3xl font-bold">{job.title} - AI Interview</h1>
              <p className="text-muted-foreground">
                Virtual interview for {job.companyName}
              </p>
            </CardHeader>
            <CardContent>
              <InterviewClient
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
    console.error("Error loading interview page:", error);
    notFound();
  }
}
