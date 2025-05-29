'use client';

import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Edit, Eye, Link, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

import { JobFormDialog } from '@/components/jobs/job-form-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { getCountryLabel } from '@/data/countries';

// Define job type
interface Job {
  id: string;
  title: string;
  companyName: string;
  skills: string[];
  location: string;
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

export default function JobsPage() {
  const t = useTranslations('Dashboard');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery] = useState('');

  // Fetch jobs with pagination and search
  const { data, refetch } = useQuery({
    queryKey: ['jobs', page, pageSize, searchQuery],
    queryFn: async () => {
      const searchParam = searchQuery ? `&search=${searchQuery}` : '';
      const response = await fetch(`/api/jobs?page=${page + 1}&limit=${pageSize}${searchParam}`);

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
    },
    {
      accessorKey: 'companyName',
      header: 'Company',
    },
    {
      accessorKey: 'skills',
      header: 'Skills',
      cell: ({ row }) => {
        const skills = row.getValue('skills') as string[];
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="outline" className="mr-1">
                {skill}
              </Badge>
            ))}
            {skills.length > 3 && <Badge variant="outline">+{skills.length - 3}</Badge>}
          </div>
        );
      },
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => {
        const location = row.getValue('location') as string;
        return getCountryLabel(location);
      },
    },
    {
      accessorKey: 'expiryDate',
      header: 'Expiry Date',
      cell: ({ row }) => {
        const date = new Date(row.getValue('expiryDate'));
        const now = new Date();
        const isExpired = date < now;

        return (
          <div className="flex items-center gap-2">
            <span>{format(date, 'PPP')}</span>
            {isExpired && (
              <Badge variant="destructive" className="ml-2">
                Expired
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
        return (
          <Badge variant={isActive ? 'default' : 'outline'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const job = row.original;
        const jobUrl = `/jobs/${job.urlId}`;

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/jobs/${job.urlId}`);
                toast.success('Job URL copied to clipboard');
              }}
              title="Copy job URL"
            >
              <Link className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.open(jobUrl, '_blank')}
              title="View job"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Edit job"
              onClick={() => {
                setSelectedJobId(job.id);
                setDialogMode('edit');
                setIsDialogOpen(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Delete job"
              onClick={() => handleDeleteJob(job.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Handle job deletion
  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) {
      return;
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete job');
      }

      // Refetch jobs to update the table
      refetch();
      toast.success('Job deleted successfully');
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(errorMessage);
    }
  };

  // Handle job creation success
  const handleJobCreated = () => {
    refetch();
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('jobManagement')}</h1>
          <p className="text-muted-foreground">{t('manageJobs')}</p>
        </div>
        <Button
          onClick={() => {
            setDialogMode('create');
            setSelectedJobId(undefined);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Job
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.jobs || []}
        searchKey="title"
        searchPlaceholder="Search jobs..."
        pagination={{
          pageIndex: page,
          pageSize: pageSize,
          pageCount: data?.pagination?.totalPages || 1,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
      />

      <JobFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmitSuccess={handleJobCreated}
        jobId={selectedJobId}
        mode={dialogMode}
      />
    </div>
  );
}
