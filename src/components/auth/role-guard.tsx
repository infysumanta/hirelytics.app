"use client";

import { useRoleProtection } from "@/lib/auth-utils";
import { UserRole } from "@/models/user";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RoleGuard({
  allowedRoles,
  children,
  fallback = <AuthLoading />,
}: RoleGuardProps) {
  const { isLoading, isAuthorized } = useRoleProtection({ allowedRoles });

  if (isLoading) {
    return fallback;
  }

  if (!isAuthorized) {
    return null; // Will be redirected by the useRoleProtection hook
  }

  return <>{children}</>;
}

function AuthLoading() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <h3 className="text-lg font-medium">Loading...</h3>
        <p className="text-sm text-muted-foreground">
          Verifying your access permissions
        </p>
      </div>
    </div>
  );
}
