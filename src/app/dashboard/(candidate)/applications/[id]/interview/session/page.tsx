import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getJobById } from '@/actions/jobs';
import { AIInterviewBackground } from '@/components/interview/ai-interview-background';
import { InterviewCompletion } from '@/components/interview/interview-completion';
import { InterviewSession } from '@/components/interview/interview-session';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { connectToDatabase } from '@/lib/mongodb';
import { JobApplication } from '@/models/job-application';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const applicationId = params.id;

  try {
    await connectToDatabase();
    const application = await JobApplication.findById(applicationId);

    if (!application) {
      return {
        title: 'Interview Session | Hirelytics',
        description: 'AI-powered interview session',
      };
    }

    const job = await getJobById(application.jobId);

    return {
      title: `Interview Session for ${job.title} | Hirelytics`,
      description: `Live AI-powered interview session for the ${job.title} position at ${job.companyName}`,
    };
  } catch {
    return {
      title: 'Interview Session | Hirelytics',
      description: 'AI-powered interview session',
    };
  }
}

export default async function InterviewSessionPage(props: Props) {
  const params = await props.params;
  const applicationId = params.id;

  try {
    await connectToDatabase();
    const application = await JobApplication.findById(applicationId);

    if (!application) {
      notFound();
    }

    console.log(application.jobId);

    const job = await getJobById(application.jobId);

    if (!job) {
      notFound();
    }

    // Check if interview duration is missing
    if (!job.interviewDuration) {
      return (
        <div className="container px-4 py-8 mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                Interview configuration is incomplete. Please contact the recruiter.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Check if interview is already completed
    const interviewState = application.interviewState;
    if (interviewState?.currentPhase === 'completed') {
      // Redirect to feedback page
      return (
        <div className="container px-4 py-4 mx-auto relative">
          <div className="absolute inset-0 -z-10">
            <AIInterviewBackground className="opacity-30" />
          </div>

          <div className="mx-auto relative z-10">
            <Card className="mb-2 border-border/60 shadow-lg">
              <CardHeader className="py-3">
                <h1 className="text-xl font-bold">{job.title} - Interview Complete</h1>
                <p className="text-sm text-muted-foreground">Your interview is already completed</p>
              </CardHeader>
              <CardContent className="p-4">
                <InterviewCompletion
                  applicationId={applicationId}
                  jobTitle={job.title}
                  companyName={job.companyName}
                  redirectUrl={`/dashboard/applications/${applicationId}/feedback`}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto relative">
        {/* Apply a subtle background for the entire page */}
        <div className="absolute inset-0 -z-10">
          <AIInterviewBackground className="opacity-30" />
        </div>

        <div className="mx-auto relative z-10">
          <Card className="border-border/60 shadow-lg">
            <CardHeader>
              <h1 className="text-xl font-bold">{job.title} - Live Interview</h1>
              <p className="text-sm text-muted-foreground">
                AI Interview session for {job.companyName}
              </p>
            </CardHeader>
            <CardContent className="p-1">
              <InterviewSession
                applicationId={applicationId}
                jobTitle={job.title}
                companyName={job.companyName}
                interviewDuration={job.interviewDuration}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading interview session page:', error);
    notFound();
  }
}
