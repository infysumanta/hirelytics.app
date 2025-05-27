"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserRole } from "@/models/user";

type ProtectedRouteProps = {
  allowedRoles: UserRole[];
  redirectTo?: string;
};

/**
 * Hook for client-side role-based protection
 *
 * @param allowedRoles - Array of roles that are allowed to access the component
 * @param redirectTo - Optional path to redirect to if access is denied (defaults to /unauthorized)
 * @returns Object with isLoading and isAuthorized flags
 */
export function useRoleProtection({
  allowedRoles,
  redirectTo = "/unauthorized",
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === "loading";

  useEffect(() => {
    // If session loaded and user is not authenticated, redirect to login
    if (!isLoading && status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // If session loaded and user doesn't have required role, redirect to unauthorized page
    if (
      !isLoading &&
      status === "authenticated" &&
      session?.user?.role &&
      !allowedRoles.includes(session.user.role)
    ) {
      router.push(redirectTo);
    }
  }, [isLoading, status, session, router, allowedRoles, redirectTo]);

  // Return true if user is authorized, false otherwise
  const isAuthorized =
    status === "authenticated" &&
    session?.user?.role &&
    allowedRoles.includes(session.user.role);

  return { isLoading, isAuthorized };
}

/**
 * Higher-order component for role-based protection
 *
 * @param Component - The component to protect
 * @param allowedRoles - Array of roles that are allowed to access the component
 * @param LoadingComponent - Optional component to render during loading
 * @returns Protected component
 */

export function withRoleProtection<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[],
  LoadingComponent: React.ComponentType = () => <div>Loading...</div>,
): React.FC<P> {
  return function ProtectedComponent(props: P) {
    const { isLoading, isAuthorized } = useRoleProtection({ allowedRoles });

    if (isLoading) {
      return <LoadingComponent />;
    }

    if (!isAuthorized) {
      return null; // Will be redirected by the useRoleProtection hook
    }

    return <Component {...props} />;
  };
}
