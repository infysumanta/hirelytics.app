'use client';

import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IJob } from '@/models/job';

import { JobApplicationModal } from './job-application-modal';

interface JobApplyButtonProps {
  jobId: string;
  disabled?: boolean;
  isExpired?: boolean;
  job?: IJob;
  variant?: 'default' | 'small';
}

export function JobApplyButton({
  disabled = false,
  isExpired = false,
  job,
  variant = 'default',
}: JobApplyButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session } = useSession();

  // Check if user is admin or recruiter
  const isAdminOrRecruiter = session?.user?.role === 'admin' || session?.user?.role === 'recruiter';

  const handleApply = () => {
    setIsLoading(true);
    if (job) {
      setIsLoading(false);
      setIsModalOpen(true);
    } else {
      setIsLoading(false);
      setIsModalOpen(true);
    }
  };

  // If job is expired, show only the expired badge for all users
  if (isExpired) {
    return (
      <div className={variant === 'default' ? 'w-full text-center' : ''}>
        <Badge variant="destructive" className={variant === 'small' ? 'text-xs px-2' : 'px-3 py-1'}>
          Job Expired
        </Badge>
      </div>
    );
  }

  return (
    <>
      <Button
        className={variant === 'default' ? 'w-full' : ''}
        size={variant === 'small' ? 'sm' : 'default'}
        onClick={handleApply}
        disabled={disabled || isLoading || isAdminOrRecruiter}
      >
        {isLoading ? (
          <>
            <Loader2
              className={`${variant === 'small' ? 'h-3.5 w-3.5' : 'h-4 w-4'} mr-1 animate-spin`}
            />
            {variant === 'small' ? 'Loading...' : 'Processing...'}
          </>
        ) : isAdminOrRecruiter ? (
          variant === 'small' ? (
            'Admin View'
          ) : (
            'Admin/Recruiter View'
          )
        ) : variant === 'small' ? (
          'Apply'
        ) : (
          'Apply Now'
        )}
      </Button>

      {job && isModalOpen && (
        <JobApplicationModal job={job} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}
