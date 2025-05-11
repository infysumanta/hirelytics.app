import { Metadata } from "next";
import { getJobById } from "@/actions/jobs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Mic } from "lucide-react";
import { notFound } from "next/navigation";
import { AIInterviewBackground } from "@/components/interview/ai-interview-background";
import { AIInterviewerIcon } from "@/components/interview/ai-interviewer-icon";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;

  try {
    const job = await getJobById(id);
    return {
      title: `Interview for ${job.title} | Hirelytics`,
      description: `Virtual interview for the ${job.title} position at ${job.companyName}`,
    };
  } catch {
    return {
      title: "Interview | Hirelytics",
      description: "Virtual interview for your job application",
    };
  }
}

export default async function InterviewPage({ params }: Props) {
  const id = params.id;

  let job;
  try {
    job = await getJobById(id);
  } catch {
    notFound();
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="max-w-3xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <h1 className="text-3xl font-bold">{job.title} - AI Interview</h1>
            <p className="text-muted-foreground">
              Virtual interview for {job.companyName}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="relative bg-muted/50 p-6 rounded-lg text-center overflow-hidden">
                {/* Interview background */}
                <div className="absolute inset-0">
                  <AIInterviewBackground />
                </div>

                <div className="relative z-10">
                  <div className="flex flex-col items-center mb-4">
                    <AIInterviewerIcon size={84} />
                    <h2 className="text-2xl font-bold mt-4">
                      Ready to begin your interview?
                    </h2>
                  </div>

                  <p className="text-muted-foreground mb-6">
                    Our AI-powered system will guide you through a series of
                    questions to assess your skills and experience for this
                    position. Please ensure your camera and microphone are
                    working properly.
                  </p>

                  <div className="flex flex-wrap gap-4 justify-center">
                    <Button size="lg" className="gap-2">
                      <Video className="h-5 w-5" /> Check Camera
                    </Button>
                    <Button size="lg" className="gap-2">
                      <Mic className="h-5 w-5" /> Check Microphone
                    </Button>
                    <Button size="lg" variant="default" className="w-full mt-4">
                      Start Interview
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 p-6 rounded-lg">
                <h3 className="font-medium mb-2">Interview Tips</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>
                    Find a quiet place with good lighting and minimal background
                    noise
                  </li>
                  <li>
                    Dress professionally as you would for an in-person interview
                  </li>
                  <li>
                    Speak clearly and take your time to answer thoughtfully
                  </li>
                  <li>
                    Have your resume and relevant documents nearby for reference
                  </li>
                  <li>
                    The interview will take approximately 15-20 minutes to
                    complete
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
