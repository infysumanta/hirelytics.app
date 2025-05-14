"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import JobFilter from "@/components/job-applications/job-filter";

// Define JobApplication type
interface JobApplication {
  _id: string;
  jobId: string;
  userId: string;
  fileName: string;
  resumeUrl: string;
  preferredLanguage: string;
  status: "pending" | "reviewed" | "accepted" | "rejected";
  parsedResume?: {
    skills: string[];
    matchScore?: number;
    aiComments?: string;
    matchedAt?: string;
    topSkillMatches?: string[];
    missingSkills?: string[];
  };
  interviewState?: {
    currentPhase: string;
    completedAt?: string;
    feedback?: {
      technicalSkills?: number;
      communicationSkills?: number;
      problemSolving?: number;
      cultureFit?: number;
      strengths: string[];
      areasOfImprovement: string[];
      overallImpression: string;
    };
  };
  job: {
    title: string;
    companyName: string;
  };
  candidateName?: string;
  createdAt: string;
  updatedAt: string;
}

// JobFilterWithData component that fetches job data
function JobFilterWithData({
  selectedJobId,
  onChange,
}: {
  selectedJobId: string;
  onChange: (id: string) => void;
}) {
  // Fetch jobs from the API
  const { data, isLoading } = useQuery({
    queryKey: ["recruiter-jobs"],
    queryFn: async () => {
      const response = await fetch("/api/jobs/recruiter/list");
      if (!response.ok) throw new Error("Failed to fetch jobs");
      return response.json();
    },
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading jobs...</div>;
  }

  return (
    <JobFilter
      jobs={data?.jobs || []}
      selectedJobId={selectedJobId}
      onChange={onChange}
    />
  );
}

export default function RecruiterJobApplicationsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get("job") || "";

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Function to handle job filter changes
  const handleJobFilterChange = (selectedJobId: string) => {
    // Reset the page when changing filter
    setPage(0);

    // Create new URL with updated parameters
    const params = new URLSearchParams(searchParams.toString());

    if (selectedJobId) {
      params.set("job", selectedJobId);
    } else {
      params.delete("job");
    }

    // Navigate to new URL with updated params
    const newPath = `/dashboard/job-applications?${params.toString()}`;
    router.push(newPath);
  };

  // Define table columns
  const columns: ColumnDef<JobApplication>[] = [
    {
      accessorKey: "job",
      header: "Job Position",
      cell: ({ row }) => {
        const job = row.original.job;
        return (
          <div>
            <div className="font-medium">{job.title}</div>
            <div className="text-sm text-muted-foreground">
              {job.companyName}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "candidateName",
      header: "Candidate",
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {row.original.candidateName || "Anonymous"}
          </div>
        );
      },
    },
    {
      accessorKey: "parsedResume.matchScore",
      header: "Match Score",
      cell: ({ row }) => {
        const score = row.original.parsedResume?.matchScore;
        if (score === undefined) return "N/A";

        const color =
          score >= 70
            ? "bg-green-500/20 text-green-500"
            : score >= 50
              ? "bg-yellow-500/20 text-yellow-500"
              : "bg-red-500/20 text-red-500";

        return <Badge className={color}>{score}%</Badge>;
      },
    },
    {
      accessorKey: "interviewState",
      header: "Interview Status",
      cell: ({ row }) => {
        const interviewState = row.original.interviewState;
        if (!interviewState)
          return <Badge variant="outline">Not Started</Badge>;

        if (interviewState.completedAt) {
          return (
            <Badge variant="outline" className="bg-green-500/20 text-green-500">
              Completed
            </Badge>
          );
        }

        return (
          <Badge variant="outline" className="bg-blue-500/20 text-blue-500">
            In Progress
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;

        const statusColors = {
          pending: "bg-yellow-500/20 text-yellow-500",
          reviewed: "bg-blue-500/20 text-blue-500",
          accepted: "bg-green-500/20 text-green-500",
          rejected: "bg-red-500/20 text-red-500",
        };

        return (
          <Badge className={statusColors[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Applied Date",
      cell: ({ row }) => {
        return format(new Date(row.original.createdAt), "MMM d, yyyy");
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(`/dashboard/job-applications/${row.original._id}`)
            }
          >
            <ArrowRight className="h-4 w-4 mr-1" />
            View Details
          </Button>
        );
      },
    },
  ];

  // Fetch job applications
  const { data: applications, isLoading } = useQuery({
    queryKey: ["job-applications", jobId, page, pageSize],
    queryFn: async () => {
      const queryParams = new URLSearchParams();

      if (jobId) {
        queryParams.append("jobId", jobId);
      }

      queryParams.append("page", String(page + 1));
      queryParams.append("limit", String(pageSize));

      const response = await fetch(
        `/api/applications/recruiter?${queryParams.toString()}`,
      );
      if (!response.ok) throw new Error("Failed to fetch applications");

      const data = await response.json();
      return {
        applications: data.applications || [],
        pagination: data.pagination || { totalPages: 1 },
      };
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Job Applications</h1>
          <p className="text-muted-foreground">
            Manage and review submitted applications
          </p>
        </div>
      </div>

      {/* Job Filter */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filter Applications</CardTitle>
          <CardDescription>
            Select a job to see related applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JobFilterWithData
            selectedJobId={jobId}
            onChange={handleJobFilterChange}
          />
        </CardContent>
      </Card>

      {/* Applications Table */}
      <DataTable
        columns={columns}
        data={applications?.applications || []}
        searchKey="candidateName"
        searchPlaceholder="Search applications..."
        isLoading={isLoading}
        pagination={{
          pageIndex: page,
          pageSize: pageSize,
          pageCount: applications?.pagination?.totalPages || 1,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
      />
    </div>
  );
}
