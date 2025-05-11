"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { Loader2, Building, MapPin, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { getSkillLabel } from "@/data/technical-skills";

interface JobDetails {
  id: string;
  title: string;
  description: string;
  companyName: string;
  expiryDate: string;
  location: string;
  salary?: string;
  skills: string[];
  requirements?: string;
  benefits?: string;
  urlId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  recruiter: {
    id: string;
    name: string;
    email: string;
  };
}

export default function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`/api/jobs/${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch job details");
        }

        const data = await response.json();
        setJob(data.job);
      } catch (err) {
        setError("Failed to load job details. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  // Check if job is expired
  const isExpired = job ? new Date(job.expiryDate) < new Date() : false;

  // Format description with Markdown
  const formatDescription = (description: string) => {
    // Simple markdown parsing for headings, lists, and paragraphs
    return description
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold my-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold my-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium my-2">$1</h3>')
      .replace(/^\* (.*$)/gm, '<li class="ml-6 list-disc">$1</li>')
      .replace(/^- (.*$)/gm, '<li class="ml-6 list-disc">$1</li>')
      .replace(/\n\n/g, '</p><p class="my-2">');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-muted-foreground">{error || "Job not found"}</p>
        <Button className="mt-4" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <AnimatedBackground patternColor="primary" colorScheme="blue">
      <div className="container max-w-4xl py-8 px-4">
        <Card className="overflow-hidden">
          <div className="bg-primary/10 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    {job.companyName}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </Badge>
                  {job.salary && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <DollarSign className="h-3 w-3" />
                      {job.salary}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Expires: {format(new Date(job.expiryDate), "PPP")}
                  </span>
                </div>
                {isExpired ? (
                  <Badge variant="destructive" className="mt-2">
                    Expired
                  </Badge>
                ) : (
                  <Button className="mt-2" disabled={!job.isActive}>
                    Apply Now
                  </Button>
                )}
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: `<p class="my-2">${formatDescription(job.description)}</p>`,
              }}
            />

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {getSkillLabel(skill)}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-2">
                About the Recruiter
              </h3>
              <p className="text-muted-foreground">
                Posted by {job.recruiter.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Contact: {job.recruiter.email}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AnimatedBackground>
  );
}
