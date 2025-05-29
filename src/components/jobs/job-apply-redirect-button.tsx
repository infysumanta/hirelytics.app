'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface JobApplyRedirectButtonProps {
  jobId: string;
  isExpired: boolean;
  isActive: boolean;
  variant?: 'default' | 'small';
}

export function JobApplyRedirectButton({
  jobId,
  isExpired,
  isActive,
  variant = 'default',
}: JobApplyRedirectButtonProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Check if user is admin or recruiter
  const isAdminOrRecruiter = session?.user?.role === 'admin' || session?.user?.role === 'recruiter';

  const handleApplyClick = () => {
    if (status === 'authenticated') {
      // User is logged in, redirect to dashboard job page
      router.push(`/dashboard/jobs/${jobId}`);
    } else {
      // User is not logged in, redirect to candidate login
      router.push(`/login/candidate?redirect=/dashboard/jobs/${jobId}`);
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
    <Button
      className={variant === 'default' ? 'w-full' : ''}
      size={variant === 'small' ? 'sm' : 'default'}
      onClick={handleApplyClick}
      disabled={isExpired || !isActive || isAdminOrRecruiter}
    >
      {isAdminOrRecruiter
        ? variant === 'small'
          ? 'Admin View'
          : 'Admin/Recruiter View'
        : variant === 'small'
          ? 'Apply'
          : 'Apply Now'}
    </Button>
  );
}
