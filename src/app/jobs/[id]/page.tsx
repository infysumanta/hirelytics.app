import { Metadata } from "next";
import { getJobById } from "@/actions/jobs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  CalendarIcon,
  MapPinIcon,
  BriefcaseIcon,
  ArrowLeftIcon,
} from "lucide-react";
import { ClientShareButton } from "@/components/jobs/client-share-button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSkillLabel } from "@/data/technical-skills";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { AnimatedBackground } from "@/components/ui/animated-background";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const job = await getJobById(params.id);
    return {
      title: `${job.title} at ${job.companyName} | Hirelytics`,
      description: job.description?.slice(0, 160),
    };
  } catch {
    return {
      title: "Job Not Found | Hirelytics",
      description:
        "The job listing you're looking for doesn't exist or has been removed.",
    };
  }
}

export default async function JobDetailsPage({ params }: Props) {
  let job;
  try {
    job = await getJobById(params.id);
  } catch {
    notFound();
  }

  // Format dates
  const expiryDate = new Date(job.expiryDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const postedDate = new Date(job.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Check if job is expired
  const isExpired = new Date(job.expiryDate) < new Date();

  return (
    <AnimatedBackground
      patternColor="primary"
      colorScheme="blue"
      className="min-h-screen"
    >
      <div className="container px-4 py-8 mx-auto">
        <Link
          href="/jobs"
          className="inline-flex items-center text-sm mb-6 hover:underline"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to jobs
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                {job.title}
              </h1>
              <div className="flex items-center text-lg text-muted-foreground">
                <BriefcaseIcon className="h-5 w-5 mr-1" />
                <span className="font-medium">{job.companyName}</span>
              </div>
              {isExpired && (
                <Badge variant="destructive" className="mt-2">
                  Expired
                </Badge>
              )}
            </div>

            <Card className="mb-6 bg-background/70 backdrop-blur-sm">
              <CardHeader>
                <h2 className="text-xl font-semibold">Job Description</h2>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-a:text-primary">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      a: (props) => (
                        <a
                          {...props}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        />
                      ),
                      code: (props) => (
                        <code
                          {...props}
                          className="bg-muted px-1 py-0.5 rounded text-sm font-mono"
                        />
                      ),
                    }}
                  >
                    {job.description}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            {job.requirements && (
              <Card className="mb-6 bg-background/70 backdrop-blur-sm">
                <CardHeader>
                  <h2 className="text-xl font-semibold">Requirements</h2>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-a:text-primary">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {job.requirements}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            )}

            {job.benefits && (
              <Card className="mb-6 bg-background/70 backdrop-blur-sm">
                <CardHeader>
                  <h2 className="text-xl font-semibold">Benefits</h2>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-a:text-primary">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {job.benefits}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <Card className="mb-6 sticky top-6 bg-background/70 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <MapPinIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{job.location}</span>
                </div>

                {job.salary && (
                  <div className="flex items-center mb-4">
                    <span className="font-medium mr-2">Salary:</span>
                    <span>{job.salary}</span>
                  </div>
                )}

                <div className="flex items-center mb-4">
                  <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <div>
                      <span className="font-medium">Posted:</span> {postedDate}
                    </div>
                    <div>
                      <span className="font-medium">Expires:</span> {expiryDate}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {getSkillLabel(skill)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full"
                    disabled={isExpired || !job.isActive}
                  >
                    {isExpired ? "Job Expired" : "Apply Now"}
                  </Button>
                  {/* Using a client component wrapper */}
                  <ClientShareButton
                    jobId={params.id}
                    jobTitle={job.title}
                    companyName={job.companyName}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
}
