"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { IJob } from "@/models/job";
import { JobApplicationModal } from "./job-application-modal";

interface JobApplyButtonProps {
  jobId: string;
  disabled?: boolean;
  isExpired?: boolean;
  job?: IJob;
  variant?: "default" | "small";
}

export function JobApplyButton({
  disabled = false,
  isExpired = false,
  job,
  variant = "default",
}: JobApplyButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleApply = () => {
    setIsLoading(true);
    // Fetch the job if we don't have it yet
    if (job) {
      setIsLoading(false);
      setIsModalOpen(true);
    } else {
      // In a real implementation, we would fetch the job here
      setIsLoading(false);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <Button
        className={variant === "default" ? "w-full" : ""}
        size={variant === "small" ? "sm" : "default"}
        onClick={handleApply}
        disabled={disabled || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2
              className={`${variant === "small" ? "h-3.5 w-3.5" : "h-4 w-4"} mr-1 animate-spin`}
            />
            {variant === "small" ? "Loading..." : "Processing..."}
          </>
        ) : isExpired ? (
          variant === "small" ? (
            "Expired"
          ) : (
            "Job Expired"
          )
        ) : variant === "small" ? (
          "Apply"
        ) : (
          "Apply Now"
        )}
      </Button>

      {job && isModalOpen && (
        <JobApplicationModal
          job={job}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
