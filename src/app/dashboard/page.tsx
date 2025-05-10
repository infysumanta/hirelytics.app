"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
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

  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      setRole(session.user.role as UserRole);
    }
  }, [session, status]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
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
          {role === "admin" && "Admin Dashboard"}
          {role === "recruiter" && "Recruiter Dashboard"}
          {role === "candidate" && "Candidate Dashboard"}
        </h1>
        <Button onClick={() => signOut({ callbackUrl: "/" })}>Sign Out</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {session?.user?.name}</CardTitle>
            <CardDescription>
              {role === "admin" && "Admin Dashboard"}
              {role === "recruiter" && "Recruiter Dashboard"}
              {role === "candidate" && "Candidate Dashboard"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>You are logged in as a {role}.</p>
          </CardContent>
        </Card>

        {role === "admin" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage system users</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Here you can manage recruiters and candidates.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure system settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Configure application settings and preferences.</p>
              </CardContent>
            </Card>
          </>
        )}

        {role === "recruiter" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Job Postings</CardTitle>
                <CardDescription>Manage your job listings</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Create and manage job postings to find candidates.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Candidate Applications</CardTitle>
                <CardDescription>Review candidate applications</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Review and manage applications from candidates.</p>
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
