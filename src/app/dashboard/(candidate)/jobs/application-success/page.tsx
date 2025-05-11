import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function ApplicationSuccessPage() {
  return (
    <div className="container mx-auto py-12 max-w-xl">
      <Card className="p-8 flex flex-col items-center text-center">
        <CheckCircle2 className="h-24 w-24 text-primary" />

        <h1 className="text-3xl font-bold mt-6">Application Submitted!</h1>

        <p className="text-lg text-muted-foreground mt-4 max-w-md">
          Your job application has been successfully submitted. The employer
          will review your application and contact you if they&apos;d like to
          proceed with your candidacy.
        </p>

        <div className="mt-8 space-y-4 w-full">
          <Link href="/dashboard/jobs" className="w-full block">
            <Button className="w-full">Browse More Jobs</Button>
          </Link>

          <Link href="/dashboard" className="w-full block">
            <Button variant="outline" className="w-full">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
