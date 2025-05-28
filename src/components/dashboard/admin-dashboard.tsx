/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Activity, Users, BriefcaseIcon } from "lucide-react";
import { format } from "date-fns";
import { ClickableStatCard } from "@/components/dashboard/clickable-stat-card";
import { PieChartCard } from "@/components/dashboard/pie-chart-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";

export function AdminDashboard() {
  const { stats, loading, error } = useDashboardStats();

  // Format application status data for pie chart
  const [applicationStatusData, setApplicationStatusData] = useState<any[]>([]);
  const [jobsPerRecruiterData, setJobsPerRecruiterData] = useState<any[]>([]);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);

  // Define colors for pie chart
  const statusColors = {
    pending: "#fbbf24",
    reviewed: "#3b82f6",
    accepted: "#10b981",
    rejected: "#ef4444",
  };

  const recruiterColors = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f59e0b",
    "#84cc16",
    "#06b6d4",
    "#f43f5e",
  ];

  useEffect(() => {
    if (stats) {
      // Format application status data
      if (stats.applicationStatusData) {
        setApplicationStatusData(
          stats.applicationStatusData.map((item: any) => ({
            name: item._id,
            value: item.count,
            color:
              statusColors[item._id as keyof typeof statusColors] || "#94a3b8",
          })),
        );
      }

      // Format jobs per recruiter data
      if (stats.jobsPerRecruiter) {
        setJobsPerRecruiterData(
          stats.jobsPerRecruiter.map((item: any, index: number) => ({
            name: item._id,
            value: item.count,
            color: recruiterColors[index % recruiterColors.length],
          })),
        );
      }

      // Format recent jobs for activity feed
      if (stats.recentJobs) {
        setRecentJobs(
          stats.recentJobs.map((job: any) => ({
            title: job.title || "Untitled Job",
            description: `Added by ${job.recruiter?.name || "Unknown"}`,
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
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ClickableStatCard
          title="Total Jobs"
          value={stats?.totalJobs || 0}
          description="Active job listings"
          icon={<BriefcaseIcon className="h-4 w-4" />}
          href="/dashboard/jobs"
        />
        <ClickableStatCard
          title="Total Candidates"
          value={stats?.totalCandidates || 0}
          description="Registered candidates"
          icon={<Users className="h-4 w-4" />}
          href="/dashboard/candidates"
        />
        <ClickableStatCard
          title="Total Recruiters"
          value={stats?.totalRecruiters || 0}
          description="Active recruiters"
          icon={<Activity className="h-4 w-4" />}
          href="/dashboard/recruiters"
        />
        <ClickableStatCard
          title="Wishlist Entries"
          value="View All"
          description="People interested in platform"
          icon={<Users className="h-4 w-4" />}
          href="/dashboard/wishlist"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <PieChartCard
          title="Applications by Status"
          description="Distribution of job applications by current status"
          data={applicationStatusData}
        />
        <PieChartCard
          title="Jobs per Recruiter"
          description="Number of jobs posted by top recruiters"
          data={jobsPerRecruiterData}
        />
      </div>

      {/* Recent Activity */}
      <ActivityFeed
        title="Recently Posted Jobs"
        items={recentJobs}
        emptyMessage="No jobs have been posted recently"
      />
    </div>
  );
}
