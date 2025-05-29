'use client';

import { JobShareButtons } from './job-share-buttons';

interface ClientShareButtonProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
}

export function ClientShareButton({ jobId, jobTitle, companyName }: ClientShareButtonProps) {
  return (
    <JobShareButtons
      jobId={jobId}
      jobTitle={jobTitle}
      companyName={companyName}
      alertDialogMode={true}
      className="w-full"
    />
  );
}
