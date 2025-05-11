"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface JobApplyRedirectButtonProps {
  jobId: string;
  isExpired: boolean;
  isActive: boolean;
  variant?: "default" | "small";
}

export function JobApplyRedirectButton({
  jobId,
  isExpired,
  isActive,
  variant = "default",
}: JobApplyRedirectButtonProps) {
  const router = useRouter();
  const { status } = useSession();

  const handleApplyClick = () => {
    if (status === "authenticated") {
      // User is logged in, redirect to dashboard job page
      router.push(`/dashboard/jobs/${jobId}`);
    } else {
      // User is not logged in, redirect to candidate login
      router.push(`/login/candidate?redirect=/dashboard/jobs/${jobId}`);
    }
  };

  return (
    <Button
      className={variant === "default" ? "w-full" : ""}
      size={variant === "small" ? "sm" : "default"}
      onClick={handleApplyClick}
      disabled={isExpired || !isActive}
    >
      {isExpired
        ? variant === "small"
          ? "Expired"
          : "Job Expired"
        : variant === "small"
          ? "Apply"
          : "Apply Now"}
    </Button>
  );
}
