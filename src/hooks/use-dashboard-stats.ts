'use client';

import { useEffect, useState } from 'react';

// Define types for dashboard stats
interface DashboardStats {
  // Common fields
  totalJobs?: number;
  totalCandidates?: number;
  totalRecruiters?: number;

  // Admin specific
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentJobs?: any[];
  applicationStatusData?: Array<{ _id: string; count: number }>;
  jobsPerRecruiter?: Array<{ _id: string; count: number }>;

  // Recruiter specific
  myJobs?: number;
  totalApplications?: number;
  applicationsByStatus?: Array<{ _id: string; count: number }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentApplications?: any[];

  // Candidate specific
  myApplicationsCount?: number;
  myApplicationsByStatus?: Array<{ _id: string; count: number }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  myRecentApplications?: any[];
}

export function useDashboardStats(): {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
} {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/stats');

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}
