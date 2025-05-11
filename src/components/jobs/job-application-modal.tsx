"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IJob } from "@/models/job";
import { JobApplicationForm } from "./job-application-form";
import { useRouter } from "next/navigation";

interface JobApplicationModalProps {
  job: IJob;
  isOpen: boolean;
  onClose: () => void;
}

export function JobApplicationModal({
  job,
  isOpen,
  onClose,
}: JobApplicationModalProps) {
  const router = useRouter();

  // This function will now receive the application ID from the form
  const handleApplicationSuccess = (applicationId: string) => {
    onClose();
    // Navigate to dashboard application-specific success page
    router.push(`/dashboard/applications/${applicationId}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for {job.title}</DialogTitle>
          <DialogDescription>
            Complete the application form below to apply for this position at{" "}
            {job.companyName}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <JobApplicationForm
            jobId={job.urlId}
            job={job}
            onSubmitSuccess={handleApplicationSuccess}
            inModal={true}
            onClose={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
