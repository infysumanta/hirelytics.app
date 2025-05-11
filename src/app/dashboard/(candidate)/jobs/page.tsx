import { JobsList } from "@/components/jobs/jobs-list";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Listings | Candidate Dashboard | Hirelytics",
  description:
    "Browse through available job positions and find your next opportunity",
};

export default function CandidateJobsPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold tracking-tight">Job Listings</h1>
        <p className="text-muted-foreground mt-1">
          Browse available positions and apply to opportunities that match your
          skills
        </p>
      </div>

      <JobsList />
    </div>
  );
}
