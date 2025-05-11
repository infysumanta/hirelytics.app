"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleApplicationSuccess = () => {
    setIsSubmitting(false);
    onClose();
    // Navigate to success page
    router.push("/dashboard/jobs/application-success");
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
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
