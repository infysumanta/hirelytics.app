import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function RecruiterRegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Recruiter Registration</CardTitle>
          <CardDescription>
            Create a recruiter account to post jobs and find candidates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm role="recruiter" />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link href="/login/recruiter" className="text-primary underline underline-offset-4 hover:text-primary/90">
              Login as a recruiter
            </Link>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            Are you a candidate?{" "}
            <Link href="/register/candidate" className="text-primary underline underline-offset-4 hover:text-primary/90">
              Register as a candidate
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
