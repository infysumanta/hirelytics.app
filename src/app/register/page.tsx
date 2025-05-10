import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Register</CardTitle>
          <CardDescription>
            Choose your role to register in the system
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Link href="/register/recruiter" className="w-full">
            <Button variant="default" className="w-full">
              Register as Recruiter
            </Button>
          </Link>
          <Link href="/register/candidate" className="w-full">
            <Button variant="outline" className="w-full">
              Register as Candidate
            </Button>
          </Link>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Already have an account?
              </span>
            </div>
          </div>
          
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full">
              Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
