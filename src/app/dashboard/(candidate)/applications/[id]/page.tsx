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
import ResumeMatchResult from "@/components/applications/resume-match-result";

type Props = {
  params: { id: string };
};

export default async function ApplicationDetailsPage({ params }: Props) {
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
          {/* Application Header */}
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

          {/* Resume Analysis */}
          {application.parsedResume && (
            <ResumeMatchResult
              score={application.parsedResume.matchScore}
              comments={application.parsedResume.aiComments}
              matchedAt={application.parsedResume.matchedAt?.toString()}
              topSkillMatches={application.parsedResume.topSkillMatches}
              missingSkills={application.parsedResume.missingSkills}
            />
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link
              href={`/dashboard/applications/${applicationId}/interview`}
              className="flex-1"
            >
              <Button className="w-full gap-2">
                {hasInterviewState ? "Continue Interview" : "Start Interview"}
                <ArrowRightCircle className="h-4 w-4" />
              </Button>
            </Link>

            {application.parsedResume && (
              <Link
                href={`/dashboard/applications/${applicationId}/analysis`}
                className="flex-1"
              >
                <Button variant="outline" className="w-full">
                  View Resume Analysis
                </Button>
              </Link>
            )}

            <Link href="/dashboard/applications" className="flex-1">
              <Button variant="ghost" className="w-full">
                Back to Applications
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading application:", error);
    notFound();
  }
}
