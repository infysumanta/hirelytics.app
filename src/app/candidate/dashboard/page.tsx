"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signOut } from "next-auth/react";

export default function CandidateDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login/candidate");
    } else if (session?.user?.role !== "candidate") {
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
        <h1 className="text-3xl font-bold">Candidate Dashboard</h1>
        <Button onClick={() => signOut({ callbackUrl: "/" })}>Sign Out</Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {session?.user?.name}</CardTitle>
            <CardDescription>Candidate Dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <p>You are logged in as a candidate.</p>
          </CardContent>
        </Card>
        
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
      </div>
    </div>
  );
}
