import { Metadata } from "next";
import { getJobById } from "@/actions/jobs";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { JobApplicationForm } from "@/components/jobs/job-application-form";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const job = await getJobById(params.id);
    return {
      title: `Apply for ${job.title} at ${job.companyName} | Candidate Dashboard | Hirelytics`,
      description: `Submit your application for the ${job.title} position at ${job.companyName}`,
    };
  } catch {
    return {
      title: "Job Not Found | Candidate Dashboard | Hirelytics",
      description:
        "The job listing you're looking for doesn't exist or has been removed.",
    };
  }
}

export default async function JobApplicationPage({ params }: Props) {
  let job;
  try {
    job = await getJobById(params.id);

    // Check if job is expired
    const isExpired = new Date(job.expiryDate) < new Date();
    if (isExpired || !job.isActive) {
      notFound();
    }
  } catch {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <Link
        href={`/dashboard/jobs/${params.id}`}
        className="inline-flex items-center text-sm mb-6 hover:underline"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to job details
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Apply for {job.title}
        </h1>
        <p className="text-muted-foreground">
          Complete the application form below to apply for this position at{" "}
          {job.companyName}
        </p>
      </div>

      <Card className="p-6">
        <JobApplicationForm jobId={params.id} job={job} />
      </Card>
    </div>
  );
}
