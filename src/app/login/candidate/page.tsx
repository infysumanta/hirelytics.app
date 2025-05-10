import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function CandidateLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Candidate Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your candidate dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm role="candidate" />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            Don't have an account?{" "}
            <Link href="/register/candidate" className="text-primary underline underline-offset-4 hover:text-primary/90">
              Register as a candidate
            </Link>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            Not a candidate? Login as a{" "}
            <Link href="/login/admin" className="text-primary underline underline-offset-4 hover:text-primary/90">
              admin
            </Link>{" "}
            or{" "}
            <Link href="/login/recruiter" className="text-primary underline underline-offset-4 hover:text-primary/90">
              recruiter
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
