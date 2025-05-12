"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  FileText,
  CheckCircle,
  Briefcase,
  GraduationCap,
  Code,
} from "lucide-react";
import { IJobApplication } from "@/models/job-application";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import ResumeMatchResult from "./resume-match-result";

interface ResumeAnalysisProps {
  applicationId: string;
}

export function ResumeAnalysis({ applicationId }: ResumeAnalysisProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [application, setApplication] = useState<IJobApplication | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function analyzeResume() {
      try {
        setIsLoading(true);

        // Call the analysis API endpoint with explicit runMatching=true
        const response = await fetch(
          `/api/applications/${applicationId}/analyze`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              runMatching: true, // Always run matching by default
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to analyze resume");
        }

        const result = await response.json();

        setApplication(result.application);
        setIsLoading(false);
      } catch (err) {
        console.error("Error during resume analysis:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
        setIsLoading(false);
        toast.error("Analysis failed", {
          description: "There was a problem analyzing your resume.",
        });
      }
    }

    analyzeResume();
  }, [applicationId]);

  const handleContinue = () => {
    // Update the application status to "reviewed" before proceeding to interview
    fetch(`/api/applications/${applicationId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "reviewed" }),
    })
      .then(() => {
        router.push(`/dashboard/applications/${applicationId}/interview`);
      })
      .catch((err) => {
        console.error("Failed to update application status:", err);
        // Still proceed to interview even if the status update fails
        router.push(`/dashboard/applications/${applicationId}/interview`);
      });
  };

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Resume Analysis Failed</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <CardHeader className="text-center">
        <h1 className="text-2xl font-bold">Resume Analysis</h1>

        {application?.parsedResume?.matchScore ? (
          <div className="mt-4">
            <div
              className="inline-flex items-center px-4 py-2 rounded-full text-white font-semibold text-sm gap-2 shadow-md"
              style={{
                backgroundColor:
                  application.parsedResume.matchScore >= 70
                    ? "rgb(34, 197, 94)"
                    : application.parsedResume.matchScore >= 50
                      ? "rgb(251, 191, 36)"
                      : "rgb(239, 68, 68)",
              }}
            >
              <span className="flex items-center gap-1">
                {application.parsedResume.matchScore >= 70 ? (
                  <>✓ Strong Match:</>
                ) : application.parsedResume.matchScore >= 50 ? (
                  <>◐ Potential Match:</>
                ) : (
                  <>✗ Low Match:</>
                )}
                <span className="font-bold ml-1">
                  {application.parsedResume.matchScore}%
                </span>
              </span>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">
            We&apos;re analyzing your resume to match your skills with the job
            requirements
          </p>
        )}
      </CardHeader>

      <CardContent>
        <div className="flex flex-col items-center">
          {isLoading ? (
            <>
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
                <p className="text-lg font-medium">Processing your resume...</p>
                <p className="text-muted-foreground mt-2">
                  This may take a few moments
                </p>
              </div>
            </>
          ) : (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-xl font-bold mb-4">Analysis Complete!</h2>

              <div className="w-full space-y-4 mb-8">
                {application?.parsedResume && (
                  <>
                    {/* Skills */}
                    <Card className="p-4">
                      <div className="flex items-start gap-3">
                        <Code className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="font-semibold">Skills Identified</h3>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {application.parsedResume.skills.map(
                              (skill, index) => (
                                <Badge key={index} variant="secondary">
                                  {skill}
                                </Badge>
                              ),
                            )}
                            {application.parsedResume.skills.length === 0 && (
                              <p className="text-sm text-muted-foreground">
                                No specific skills identified
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Experience */}
                    <Card className="p-4">
                      <div className="flex items-start gap-3">
                        <Briefcase className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="font-semibold">Experience</h3>
                          <div className="mt-1">
                            {application.parsedResume.experience?.years > 0 && (
                              <p className="text-sm">
                                <span className="font-medium">
                                  {application.parsedResume.experience.years}{" "}
                                  years
                                </span>{" "}
                                of professional experience
                              </p>
                            )}
                            {application.parsedResume.experience?.companies &&
                            application.parsedResume.experience.companies
                              .length > 0 ? (
                              <div className="mt-1">
                                <p className="text-sm font-medium">
                                  Companies:
                                </p>
                                <ul className="list-disc list-inside text-sm text-muted-foreground">
                                  {application.parsedResume.experience.companies.map(
                                    (company, index) => (
                                      <li key={index}>{company}</li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No company information extracted
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Education */}
                    <Card className="p-4">
                      <div className="flex items-start gap-3">
                        <GraduationCap className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="font-semibold">Education</h3>
                          {application.parsedResume.education &&
                          application.parsedResume.education.length > 0 ? (
                            <div className="mt-1">
                              {application.parsedResume.education.map(
                                (edu, index) => (
                                  <div key={index} className="mb-1">
                                    <p className="text-sm">
                                      <span className="font-medium">
                                        {edu.degree}
                                      </span>
                                      {edu.institution && (
                                        <>
                                          {" "}
                                          from{" "}
                                          <span className="font-medium">
                                            {edu.institution}
                                          </span>
                                        </>
                                      )}
                                    </p>
                                  </div>
                                ),
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No education information extracted
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </>
                )}

                {/* Resume Match Score Component */}
                <ResumeMatchResult
                  score={application?.parsedResume?.matchScore}
                  comments={application?.parsedResume?.aiComments}
                  matchedAt={application?.parsedResume?.matchedAt?.toString()}
                  topSkillMatches={application?.parsedResume?.topSkillMatches}
                  missingSkills={application?.parsedResume?.missingSkills}
                  onRefreshRequest={async () => {
                    // Display loading state
                    setIsLoading(true);
                    toast.info("Refreshing match analysis...", {
                      id: "refresh-analysis",
                      duration: 3000,
                    });

                    try {
                      // Call the analysis API endpoint with explicit matching request
                      const response = await fetch(
                        `/api/applications/${applicationId}/analyze`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ runMatching: true }),
                        },
                      );

                      if (!response.ok) {
                        throw new Error("Failed to refresh analysis");
                      }

                      const result = await response.json();
                      setApplication(result.application);

                      toast.success("Match analysis updated", {
                        id: "refresh-analysis",
                      });
                    } catch (err) {
                      console.error("Error refreshing match analysis:", err);
                      toast.error("Failed to refresh analysis", {
                        id: "refresh-analysis",
                      });
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                />

                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Resume Processed</h3>
                      <p className="text-sm text-muted-foreground">
                        Your resume has been successfully analyzed and key
                        information has been extracted.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <Button onClick={handleContinue} className="w-full" size="lg">
                Continue to Interview
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
