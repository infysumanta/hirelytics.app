"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signOut } from "next-auth/react";

export default function RecruiterDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login/recruiter");
    } else if (session?.user?.role !== "recruiter") {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
        <Button onClick={() => signOut({ callbackUrl: "/" })}>Sign Out</Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {session?.user?.name}</CardTitle>
            <CardDescription>Recruiter Dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <p>You are logged in as a recruiter.</p>
          </CardContent>
        </Card>
        
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
      </div>
    </div>
  );
}
