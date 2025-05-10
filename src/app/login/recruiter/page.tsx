import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function RecruiterLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Recruiter Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the recruiter dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm role="recruiter" />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            Don't have an account?{" "}
            <Link href="/register/recruiter" className="text-primary underline underline-offset-4 hover:text-primary/90">
              Register as a recruiter
            </Link>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            Not a recruiter? Login as a{" "}
            <Link href="/login/admin" className="text-primary underline underline-offset-4 hover:text-primary/90">
              admin
            </Link>{" "}
            or{" "}
            <Link href="/login/candidate" className="text-primary underline underline-offset-4 hover:text-primary/90">
              candidate
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
