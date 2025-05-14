/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { BriefcaseIcon, Users, FileText } from "lucide-react";
import { format } from "date-fns";
import { StatCard } from "@/components/dashboard/stat-card";
import { PieChartCard } from "@/components/dashboard/pie-chart-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";

interface ApplicationStatusData {
  name: string;
  value: number;
  color: string;
}

interface ApplicationActivity {
  title: string;
  description: string;
  timestamp: string;
  status: string;
}

export function RecruiterDashboard() {
  const { stats, loading, error } = useDashboardStats();
  const [applicationsByStatusData, setApplicationsByStatusData] = useState<
    ApplicationStatusData[]
  >([]);
  const [recentApplicationsList, setRecentApplicationsList] = useState<
    ApplicationActivity[]
  >([]);

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
      if (stats.applicationsByStatus) {
        setApplicationsByStatusData(
          stats.applicationsByStatus.map((item: any) => ({
            name: item._id,
            value: item.count,
            color:
              statusColors[item._id as keyof typeof statusColors] || "#94a3b8",
          })),
        );
      }

      // Format recent applications for activity feed
      if (stats.recentApplications) {
        setRecentApplicationsList(
          stats.recentApplications.map((app: any) => ({
            title: app.jobInfo?.title || "Unknown Job",
            description: `Applied by ${app.candidateName || "Unknown"}`,
            timestamp: format(new Date(app.createdAt), "MMM dd, yyyy"),
            status: app.status,
          })),
        );
        console.log(
          "Recruiter - Recent applications:",
          stats.recentApplications,
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
      <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="My Jobs"
          value={stats?.myJobs || 0}
          description="Active job listings you've posted"
          icon={<BriefcaseIcon className="h-4 w-4" />}
        />
        <StatCard
          title="Total Applications"
          value={stats?.totalApplications || 0}
          description="Applications to your job listings"
          icon={<FileText className="h-4 w-4" />}
        />
        <StatCard
          title="Acceptance Rate"
          value={`${calculateAcceptanceRate(stats?.applicationsByStatus || [])}%`}
          description="Percentage of applications accepted"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <PieChartCard
          title="Applications by Status"
          description="Distribution of applications to your job listings"
          data={applicationsByStatusData}
        />
      </div>

      {/* Recent Activity */}
      <ActivityFeed
        title="Recent Applications"
        description="Latest applications to your job listings"
        items={recentApplicationsList}
        emptyMessage="No recent applications"
      />
    </div>
  );
}

function calculateAcceptanceRate(applicationsByStatus: any[]): string {
  const accepted =
    applicationsByStatus.find((item) => item._id === "accepted")?.count || 0;
  const total = applicationsByStatus.reduce((sum, item) => sum + item.count, 0);

  if (total === 0) return "0";

  const rate = (accepted / total) * 100;
  return rate.toFixed(1);
}
