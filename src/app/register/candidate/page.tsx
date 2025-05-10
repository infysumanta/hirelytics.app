import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function CandidateRegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Candidate Registration</CardTitle>
          <CardDescription>
            Create a candidate account to find job opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm role="candidate" />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link href="/login/candidate" className="text-primary underline underline-offset-4 hover:text-primary/90">
              Login as a candidate
            </Link>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            Are you a recruiter?{" "}
            <Link href="/register/recruiter" className="text-primary underline underline-offset-4 hover:text-primary/90">
              Register as a recruiter
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
