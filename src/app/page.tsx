import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <main className="flex w-full max-w-5xl flex-col items-center justify-center gap-8">
        <h1 className="text-center text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Welcome to <span className="text-primary">Hirelytics</span>
        </h1>
        <p className="max-w-3xl text-center text-lg text-muted-foreground">
          A role-based recruitment platform for recruiters, candidates, and
          administrators.
        </p>

        <div className="grid w-full max-w-3xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Admin</CardTitle>
              <CardDescription>System administration</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage the entire platform, users, and system settings.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/login/admin" className="w-full">
                <Button className="w-full">Admin Login</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recruiter</CardTitle>
              <CardDescription>Post jobs and find candidates</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create job listings and find the perfect candidates for your
                positions.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Link href="/login/recruiter" className="w-full">
                <Button variant="outline" className="w-full">
                  Login
                </Button>
              </Link>
              <Link href="/register/recruiter" className="w-full">
                <Button className="w-full">Register</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Candidate</CardTitle>
              <CardDescription>Find job opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Browse job listings and apply for positions that match your
                skills.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Link href="/login/candidate" className="w-full">
                <Button variant="outline" className="w-full">
                  Login
                </Button>
              </Link>
              <Link href="/register/candidate" className="w-full">
                <Button className="w-full">Register</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
