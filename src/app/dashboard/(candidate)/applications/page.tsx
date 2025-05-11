import { Metadata } from "next";
import { ApplicationsClient } from "@/components/applications/applications-client";

export const metadata: Metadata = {
  title: "My Applications | Candidate Dashboard | Hirelytics",
  description: "Track and manage all your job applications in one place",
};

export default function CandidateApplicationsPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
        <p className="text-muted-foreground mt-1">
          Track and manage all your job applications
        </p>
      </div>

      <ApplicationsClient />
    </div>
  );
}
