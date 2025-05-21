import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRightCircle,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { JobApplication } from "@/models/job-application";
import { connectToDatabase } from "@/lib/mongodb";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ApplicationDetailsPage(props: Props) {
  const params = await props.params;
  const applicationId = params.id;

  try {
    await connectToDatabase();
    const application = await JobApplication.findById(applicationId);

    if (!application) {
      notFound();
    }

    // Status badge color mapping
    type ApplicationStatus = "pending" | "reviewed" | "accepted" | "rejected";

    const statusColors = {
      pending: "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20",
      reviewed: "bg-blue-500/20 text-blue-500 hover:bg-blue-500/20",
      accepted: "bg-green-500/20 text-green-500 hover:bg-green-500/20",
      rejected: "bg-red-500/20 text-red-500 hover:bg-red-500/20",
    };

    const statusColor =
      statusColors[application.status as ApplicationStatus] ||
      statusColors.pending;

    // Format date
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    // Check if interview has been started
    const hasInterviewState = !!application.interviewState;

    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="flex flex-col gap-6">
          {/* Application Header with Action Buttons */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold">Application Details</h1>
                <p className="text-muted-foreground">
                  Submitted on {formatDate(application.createdAt)}
                </p>
              </div>
              <Badge className={`${statusColor}`}>
                {application.status.charAt(0).toUpperCase() +
                  application.status.slice(1)}
              </Badge>
            </div>

            {/* Action Buttons - Moved to top */}
            <div className="flex flex-wrap gap-3">
              {!application.interviewState?.completed && (
                <Link
                  href={`/dashboard/applications/${applicationId}/interview`}
                >
                  <Button size="sm" className="gap-2">
                    {hasInterviewState
                      ? "Continue Interview"
                      : "Start Interview"}
                    <ArrowRightCircle className="h-4 w-4" />
                  </Button>
                </Link>
              )}

              <Link href="/dashboard/applications">
                <Button variant="outline" size="sm">
                  Back to Applications
                </Button>
              </Link>
            </div>
          </div>

          {/* Application Overview */}
          <Card>
            <CardHeader className="border-b border-border/40">
              <CardTitle className="text-lg font-medium">
                Application Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Resume:
                    </span>
                    <span className="text-sm">{application.fileName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Application Status:
                    </span>
                    <Badge variant="outline" className={statusColor}>
                      {application.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  {application.parsedResume &&
                    application.parsedResume.analyzedAt && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">
                          Resume Analyzed:
                        </span>
                        <span className="text-sm">
                          {formatDate(application.parsedResume.analyzedAt)}
                        </span>
                      </div>
                    )}

                  <div className="flex items-center gap-2">
                    {hasInterviewState ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">
                          Interview Status:
                        </span>
                        <span className="text-sm">
                          {application.interviewState?.completed
                            ? "Completed"
                            : "Started"}
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Interview Status:
                        </span>
                        <span className="text-sm">Not Started</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Analysis and Feedback Section */}
          <Card className="mb-4 border-none bg-[#1c1c1c] shadow-none">
            <CardHeader className="py-3 px-4 border-b border-border/40">
              <CardTitle className="text-base font-medium flex justify-between items-center">
                <span>Application Analysis</span>
                {(application.parsedResume?.analyzedAt ||
                  application.interviewState?.completedAt) && (
                  <div className="flex items-center gap-2">
                    {application.parsedResume?.analyzedAt && (
                      <Badge
                        variant="outline"
                        className="bg-blue-500/20 text-blue-500"
                      >
                        Resume Analyzed
                      </Badge>
                    )}
                    {application.interviewState?.completedAt && (
                      <Badge
                        variant="outline"
                        className="bg-green-500/20 text-green-500"
                      >
                        Interview Completed
                      </Badge>
                    )}
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 pb-1 px-4">
              {/* Tabs for Resume and Interview */}
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex-1 min-w-[280px]">
                  {/* Resume Analysis Section */}
                  {application.parsedResume ? (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium text-sm">Resume Analysis</h3>
                        {application.parsedResume.matchScore !== undefined && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Match Score:
                            </span>
                            <Badge
                              className={`${
                                application.parsedResume.matchScore > 70
                                  ? "bg-green-500/20 text-green-500"
                                  : application.parsedResume.matchScore > 50
                                    ? "bg-yellow-500/20 text-yellow-500"
                                    : "bg-red-500/20 text-red-500"
                              }`}
                            >
                              {application.parsedResume.matchScore}%
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Top Skills Matches */}
                      {application.parsedResume.topSkillMatches &&
                        application.parsedResume.topSkillMatches.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium text-xs mb-2 text-muted-foreground">
                              Top Matching Skills
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {application.parsedResume.topSkillMatches
                                .slice(0, 5)
                                .map((skill: string, index: number) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="bg-background/40"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        )}

                      {/* AI Comments */}
                      {application.parsedResume.aiComments && (
                        <div className="mb-3">
                          <h4 className="font-medium text-xs mb-1 text-muted-foreground">
                            AI Analysis
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {application.parsedResume.aiComments}
                          </p>
                        </div>
                      )}

                      {/* Missing Skills */}
                      {application.parsedResume.missingSkills &&
                        application.parsedResume.missingSkills.length > 0 && (
                          <div className="mb-3">
                            <h4 className="font-medium text-xs mb-1 text-muted-foreground">
                              Skills to Develop
                            </h4>
                            <div className="flex flex-wrap gap-1 mb-1">
                              {application.parsedResume.missingSkills.map(
                                (skill: string, index: number) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="bg-red-500/10 text-red-400 border-red-400/30"
                                  >
                                    {skill}
                                  </Badge>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6">
                      <p className="text-sm text-muted-foreground">
                        No resume analysis available yet
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-[280px]">
                  {/* Interview Feedback Section */}
                  {application.interviewState?.feedback &&
                  application.interviewState.completedAt ? (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium text-sm">
                          Interview Feedback
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(application.interviewState.completedAt)}
                        </span>
                      </div>

                      {/* Rating Summary */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {application.interviewState.feedback
                          .technicalSkills && (
                          <div className="bg-background/30 p-2 rounded-lg">
                            <h4 className="font-medium text-xs mb-1 text-muted-foreground">
                              Technical
                            </h4>
                            <div className="flex items-center">
                              <span className="text-base font-semibold">
                                {
                                  application.interviewState.feedback
                                    .technicalSkills
                                }
                                /5
                              </span>
                            </div>
                          </div>
                        )}

                        {application.interviewState.feedback
                          .communicationSkills && (
                          <div className="bg-background/30 p-2 rounded-lg">
                            <h4 className="font-medium text-xs mb-1 text-muted-foreground">
                              Communication
                            </h4>
                            <div className="flex items-center">
                              <span className="text-base font-semibold">
                                {
                                  application.interviewState.feedback
                                    .communicationSkills
                                }
                                /5
                              </span>
                            </div>
                          </div>
                        )}

                        {application.interviewState.feedback.problemSolving && (
                          <div className="bg-background/30 p-2 rounded-lg">
                            <h4 className="font-medium text-xs mb-1 text-muted-foreground">
                              Problem Solving
                            </h4>
                            <div className="flex items-center">
                              <span className="text-base font-semibold">
                                {
                                  application.interviewState.feedback
                                    .problemSolving
                                }
                                /5
                              </span>
                            </div>
                          </div>
                        )}

                        {application.interviewState.feedback.cultureFit && (
                          <div className="bg-background/30 p-2 rounded-lg">
                            <h4 className="font-medium text-xs mb-1 text-muted-foreground">
                              Culture Fit
                            </h4>
                            <div className="flex items-center">
                              <span className="text-base font-semibold">
                                {application.interviewState.feedback.cultureFit}
                                /5
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Overall Impression */}
                      {application.interviewState.feedback
                        .overallImpression && (
                        <div className="mb-3">
                          <h4 className="font-medium text-xs mb-1 text-muted-foreground">
                            Overall Impression
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {
                              application.interviewState.feedback
                                .overallImpression
                            }
                          </p>
                        </div>
                      )}

                      {/* Strengths */}
                      {application.interviewState.feedback.strengths &&
                        application.interviewState.feedback.strengths.length >
                          0 && (
                          <div className="mb-3">
                            <h4 className="font-medium text-xs mb-1 text-muted-foreground">
                              Strengths
                            </h4>
                            <ul className="list-disc list-inside space-y-1">
                              {application.interviewState.feedback.strengths.map(
                                (strength: string, index: number) => (
                                  <li
                                    key={index}
                                    className="text-xs text-muted-foreground"
                                  >
                                    {strength}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}

                      {/* Areas for Improvement */}
                      {application.interviewState.feedback.areasOfImprovement &&
                        application.interviewState.feedback.areasOfImprovement
                          .length > 0 && (
                          <div>
                            <h4 className="font-medium text-xs mb-1 text-muted-foreground">
                              Areas for Improvement
                            </h4>
                            <ul className="list-disc list-inside space-y-1">
                              {application.interviewState.feedback.areasOfImprovement.map(
                                (area: string, index: number) => (
                                  <li
                                    key={index}
                                    className="text-xs text-muted-foreground"
                                  >
                                    {area}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}
                    </div>
                  ) : hasInterviewState ? (
                    <div className="flex flex-col items-center justify-center py-6">
                      <p className="text-sm text-muted-foreground">
                        Interview in progress
                      </p>
                      <Link
                        href={`/dashboard/applications/${applicationId}/interview`}
                        className="mt-2"
                      >
                        <Button variant="outline" size="sm">
                          Continue Interview
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6">
                      <p className="text-sm text-muted-foreground">
                        Interview not started yet
                      </p>
                      <Link
                        href={`/dashboard/applications/${applicationId}/interview`}
                        className="mt-2"
                      >
                        <Button variant="outline" size="sm">
                          Start Interview
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* No action buttons at the bottom - moved to top */}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading application:", error);
    notFound();
  }
}
