"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signOut } from "next-auth/react";
import { UserRole } from "@/models/user";

export default function DashboardPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      // This will automatically redirect to the login page
      // if the user is not authenticated
    },
  });

  const t = useTranslations("Dashboard");
  const auth = useTranslations("Auth");
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      setRole(session.user.role as UserRole);
    }
  }, [session, status]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>{t("loading")}</p>
      </div>
    );
  }

  if (!role) {
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {role === "admin" && t("admin")}
          {role === "recruiter" && t("recruiter")}
          {role === "candidate" && t("candidate")}
        </h1>
        <Button onClick={() => signOut({ callbackUrl: "/" })}>
          {auth("signOut")}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>
              {t("welcome", { name: session?.user?.name || "" })}
            </CardTitle>
            <CardDescription>
              {role === "admin" && t("admin")}
              {role === "recruiter" && t("recruiter")}
              {role === "candidate" && t("candidate")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>{t("loggedInAs", { role })}</p>
          </CardContent>
        </Card>

        {role === "admin" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>{t("userManagement")}</CardTitle>
                <CardDescription>{t("manageUsers")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{t("userManagementDescription")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("systemSettings")}</CardTitle>
                <CardDescription>{t("configureSettings")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{t("systemSettingsDescription")}</p>
              </CardContent>
            </Card>
          </>
        )}

        {role === "recruiter" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>{t("jobPostings")}</CardTitle>
                <CardDescription>{t("manageJobs")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{t("jobPostingsDescription")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("candidateApplications")}</CardTitle>
                <CardDescription>{t("reviewApplications")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{t("candidateApplicationsDescription")}</p>
              </CardContent>
            </Card>
          </>
        )}

        {role === "candidate" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Job Listings</CardTitle>
                <CardDescription>Browse available jobs</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Browse and apply for job opportunities.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>My Applications</CardTitle>
                <CardDescription>Track your job applications</CardDescription>
              </CardHeader>
              <CardContent>
                <p>View and manage your submitted applications.</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
