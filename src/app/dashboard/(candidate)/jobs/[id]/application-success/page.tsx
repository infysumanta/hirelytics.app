import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, ArrowRightCircle } from "lucide-react";

type Props = {
  params: { id: string };
};

export default function ApplicationSuccessPage({ params }: Props) {
  const jobId = params.id;

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
          <Link
            href={`/dashboard/jobs/${jobId}/interview`}
            className="w-full block"
          >
            <Button className="w-full gap-2">
              Go for Interview <ArrowRightCircle className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/dashboard/jobs" className="w-full block">
            <Button variant="outline" className="w-full">
              Browse More Jobs
            </Button>
          </Link>

          <Link href="/dashboard" className="w-full block">
            <Button variant="ghost" className="w-full">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
