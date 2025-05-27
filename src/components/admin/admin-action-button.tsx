"use client";

import { useState } from "react";
import RoleGuard from "@/components/auth/role-guard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface AdminActionButtonProps {
  action: string;
  onAction: () => Promise<void>;
  dialogTitle?: string;
  dialogDescription?: string;
  confirmLabel?: string;
  children?: React.ReactNode;
}

// This component is an example of using role-based protection in a client component
export function AdminActionButton({
  action,
  onAction,
  dialogTitle = "Confirm Action",
  dialogDescription = "Are you sure you want to perform this action?",
  confirmLabel = "Confirm",
  children,
}: AdminActionButtonProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleConfirm() {
    try {
      setIsLoading(true);
      await onAction();

      toast.success("Success", {
        description: `${action} completed successfully`,
      });
      setOpen(false);
    } catch (error) {
      console.error(`Error during ${action}:`, error);
      toast.error("Error", {
        description: `Failed to ${action}. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <Button onClick={() => setOpen(true)} variant="default">
        {action}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>

          {children}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleConfirm} disabled={isLoading}>
              {isLoading ? "Processing..." : confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </RoleGuard>
  );
}
