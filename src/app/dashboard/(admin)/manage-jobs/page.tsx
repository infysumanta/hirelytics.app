'use client';

import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Building, Calendar, Eye, MapPin, User } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { getCountryLabel } from '@/data/countries';
import { getSkillLabel } from '@/data/technical-skills';

// Define job type
interface Job {
  id: string;
  title: string;
  description: string;
  companyName: string;
  location: string;
  skills: string[];
  expiryDate: string;
  urlId: string;
  isActive: boolean;
  createdAt: string;
  recruiter: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminJobsPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Fetch jobs data
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-jobs', page, pageSize],
    queryFn: async () => {
      const response = await fetch(`/api/admin/jobs?page=${page + 1}&limit=${pageSize}`);
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      return response.json();
    },
  });

  // Define columns for the data table
  const columns: ColumnDef<Job>[] = [
    {
      accessorKey: 'title',
      header: 'Job Title',
      cell: ({ row }) => {
        const title = row.getValue('title') as string;
        return (
          <div className="font-medium max-w-xs">
            <p className="truncate" title={title}>
              {title}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: 'companyName',
      header: 'Company',
      cell: ({ row }) => {
        const companyName = row.getValue('companyName') as string;
        return (
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{companyName}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'recruiter',
      header: 'Recruiter',
      cell: ({ row }) => {
        const recruiter = row.getValue('recruiter') as Job['recruiter'];
        return (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{recruiter.name}</span>
              <span className="text-xs text-muted-foreground">{recruiter.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => {
        const location = row.getValue('location') as string;
        return (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{getCountryLabel(location)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'skills',
      header: 'Skills',
      cell: ({ row }) => {
        const skills = row.getValue('skills') as string[];
        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {skills.slice(0, 2).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {getSkillLabel(skill)}
              </Badge>
            ))}
            {skills.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{skills.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean;
        const expiryDate = new Date(row.original.expiryDate);
        const isExpired = expiryDate < new Date();

        return (
          <Badge variant={isActive && !isExpired ? 'default' : 'destructive'}>
            {isActive && !isExpired ? 'Active' : isExpired ? 'Expired' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'expiryDate',
      header: 'Expires',
      cell: ({ row }) => {
        const date = row.getValue('expiryDate') as string;
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{format(new Date(date), 'MMM dd, yyyy')}</span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const job = row.original;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`/jobs/${job.urlId}`, '_blank')}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        );
      },
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Job Management</h1>
          <p className="text-muted-foreground">Manage and view all job listings</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <p className="text-red-500">Failed to load jobs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Job Management</h1>
        <p className="text-muted-foreground">
          Manage and view all job listings across all recruiters
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Jobs</h3>
            <Building className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{data?.pagination?.total || 0}</div>
          <p className="text-xs text-muted-foreground">All job listings in the system</p>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">This Page</h3>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{data?.jobs?.length || 0}</div>
          <p className="text-xs text-muted-foreground">Jobs on current page</p>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Pages</h3>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{data?.pagination?.totalPages || 0}</div>
          <p className="text-xs text-muted-foreground">Total pages available</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.jobs || []}
        searchKey="title"
        searchPlaceholder="Search by job title, company, or description..."
        pagination={{
          pageIndex: page,
          pageSize: pageSize,
          pageCount: data?.pagination?.totalPages || 1,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
        isLoading={isLoading}
      />
    </div>
  );
}
