'use client';
import { JobFormDialog } from './job-form-dialog';

interface CreateJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobCreated: () => void;
}

// This component is a backward compatibility wrapper for the JobFormDialog
export function CreateJobDialog({ open, onOpenChange, onJobCreated }: CreateJobDialogProps) {
  return (
    <JobFormDialog
      open={open}
      onOpenChange={onOpenChange}
      onSubmitSuccess={onJobCreated}
      mode="create"
    />
  );
}
