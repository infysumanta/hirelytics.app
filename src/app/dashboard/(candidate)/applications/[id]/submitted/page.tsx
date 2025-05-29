import { ArrowRightCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { connectToDatabase } from '@/lib/mongodb';
import { JobApplication } from '@/models/job-application';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ApplicationSubmittedPage(props: Props) {
  const params = await props.params;
  const applicationId = params.id;

  try {
    await connectToDatabase();
    const application = await JobApplication.findById(applicationId);

    if (!application) {
      notFound();
    }

    return (
      <div className="container mx-auto py-12 max-w-xl">
        <Card className="p-8 flex flex-col items-center text-center">
          <CheckCircle2 className="h-24 w-24 text-primary" />

          <h1 className="text-3xl font-bold mt-6">Application Submitted!</h1>

          <p className="text-lg text-muted-foreground mt-4 max-w-md">
            Your job application has been successfully submitted. The employer will review your
            application and contact you if they&apos;d like to proceed with your candidacy.
          </p>

          <div className="mt-8 space-y-4 w-full">
            <Link
              href={`/dashboard/applications/${applicationId}/interview`}
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
  } catch (error) {
    console.error('Error loading application:', error);
    notFound();
  }
}
