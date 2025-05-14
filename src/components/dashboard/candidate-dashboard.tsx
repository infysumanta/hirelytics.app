/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { BriefcaseIcon, FileCheck, Clock } from "lucide-react";
import { format } from "date-fns";
import { StatCard } from "@/components/dashboard/stat-card";
import { PieChartCard } from "@/components/dashboard/pie-chart-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";

export function CandidateDashboard() {
  const { stats, loading, error } = useDashboardStats();
  const [applicationsByStatusData, setApplicationsByStatusData] = useState<
    any[]
  >([]);
  const [recentApplicationsList, setRecentApplicationsList] = useState<any[]>(
    [],
  );
  const [recentJobs, setRecentJobs] = useState<any[]>([]);

  // Define colors for pie chart
  const statusColors = {
    pending: "#fbbf24",
    reviewed: "#3b82f6",
    accepted: "#10b981",
    rejected: "#ef4444",
  };

  useEffect(() => {
    if (stats) {
      // Format application status data for pie chart
      if (stats.myApplicationsByStatus) {
        setApplicationsByStatusData(
          stats.myApplicationsByStatus.map((item: any) => ({
            name: item._id,
            value: item.count,
            color:
              statusColors[item._id as keyof typeof statusColors] || "#94a3b8",
          })),
        );
      }

      // Format recent applications for activity feed
      if (stats.myRecentApplications) {
        setRecentApplicationsList(
          stats.myRecentApplications.map((app: any) => ({
            title: app.jobInfo?.title || "Unknown Job",
            description: `at ${app.jobInfo?.companyName || "Unknown Company"}`,
            timestamp: format(new Date(app.createdAt), "MMM dd, yyyy"),
            status: app.status,
          })),
        );
      }

      // Format recent jobs for jobs feed
      if (stats.recentJobs) {
        setRecentJobs(
          stats.recentJobs.map((job: any) => ({
            title: job.title,
            description: `${job.companyName} - ${job.location}`,
            timestamp: format(new Date(job.createdAt), "MMM dd, yyyy"),
          })),
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 p-4 rounded-md text-destructive">
        Error loading dashboard data: {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Candidate Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="My Applications"
          value={stats?.myApplicationsCount || 0}
          description="Total jobs you've applied to"
          icon={<FileCheck className="h-4 w-4" />}
        />
        <StatCard
          title="Application Success Rate"
          value={`${calculateSuccessRate(stats?.myApplicationsByStatus || [])}%`}
          description="Percentage of successful applications"
          icon={<BriefcaseIcon className="h-4 w-4" />}
        />
        <StatCard
          title="Interview Opportunities"
          value={countInterviewOpportunities(
            stats?.myApplicationsByStatus || [],
          )}
          description="Applications in review or accepted status"
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <PieChartCard
          title="Applications by Status"
          description="Status distribution of your job applications"
          data={applicationsByStatusData}
        />

        <ActivityFeed
          title="Recent Job Applications"
          description="Your most recent job applications"
          items={recentApplicationsList}
          emptyMessage="You haven't applied to any jobs yet"
        />
      </div>

      <ActivityFeed
        title="Recent Job Postings"
        description="Latest job opportunities that match your profile"
        items={recentJobs}
        emptyMessage="No recent job postings"
      />
    </div>
  );
}

function calculateSuccessRate(applicationsByStatus: any[]): string {
  const accepted =
    applicationsByStatus.find((item) => item._id === "accepted")?.count || 0;
  const total = applicationsByStatus.reduce((sum, item) => sum + item.count, 0);

  if (total === 0) return "0";

  const rate = (accepted / total) * 100;
  return rate.toFixed(1);
}

function countInterviewOpportunities(applicationsByStatus: any[]): number {
  const reviewed =
    applicationsByStatus.find((item) => item._id === "reviewed")?.count || 0;
  const accepted =
    applicationsByStatus.find((item) => item._id === "accepted")?.count || 0;

  return reviewed + accepted;
}
