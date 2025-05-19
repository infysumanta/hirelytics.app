"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
  Camera,
  FileCheck,
  Award,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define the application interface
interface JobApplication {
  _id: string;
  jobId: string;
  userId: string;
  candidateName?: string;
  fileName: string;
  resumeUrl: string;
  preferredLanguage: string;
  status: "pending" | "reviewed" | "accepted" | "rejected";
  parsedResume?: {
    extractedText: string;
    about?: string;
    skills: string[];
    matchScore?: number;
    aiComments?: string;
    matchedAt?: string;
    experience?: {
      years: number;
      companies: string[];
    };
    education?: {
      degree: string;
      institution: string;
    }[];
    topSkillMatches?: string[];
    missingSkills?: string[];
  };
  interviewState?: {
    currentPhase: string;
    completedAt?: string;
    feedback?: {
      technicalSkills?: number;
      communicationSkills?: number;
      problemSolving?: number;
      cultureFit?: number;
      strengths?: string[];
      areasOfImprovement?: string[];
      overallImpression?: string;
    };
  };
  job: {
    title: string;
    companyName: string;
  };
  interviewChatHistory?: {
    text: string;
    sender: "ai" | "user" | "system";
    timestamp: string;
    questionId?: string;
    questionCategory?: string;
    feedback?: string;
  }[];
  monitoringImages?: {
    s3Key: string;
    timestamp: string;
    signedUrl?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export default function JobApplicationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;
  const [activeTab, setActiveTab] = useState("resume");
  const queryClient = useQueryClient();

  // Fetch application details
  const { data: application, isLoading } = useQuery({
    queryKey: ["job-application", applicationId],
    queryFn: async () => {
      const response = await fetch(`/api/applications/${applicationId}`);
      if (!response.ok) throw new Error("Failed to fetch application details");
      const data = await response.json();
      return data.application as JobApplication;
    },
  });

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const response = await fetch(
        `/api/applications/${applicationId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update status");
      }

      return response.json();
    },
    onSuccess: (data, newStatus) => {
      toast.success(`Application status updated to ${newStatus}`);
      // Invalidate and refetch queries related to this application
      queryClient.invalidateQueries({
        queryKey: ["job-application", applicationId],
      });
    },
    onError: (error) => {
      console.error("Error updating status:", error);
      toast.error(
        `Failed to update status: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    },
  });

  // Function to update application status
  const updateStatus = (newStatus: string) => {
    statusMutation.mutate(newStatus);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Clock className="h-10 w-10 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
          <p className="text-lg font-medium">Application not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/dashboard/job-applications")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Button>
        </div>
      </div>
    );
  }

  // Format dates
  const formattedCreatedDate = format(new Date(application.createdAt), "PPP");
  const matchedAt = application.parsedResume?.matchedAt
    ? format(new Date(application.parsedResume.matchedAt), "PPP")
    : null;

  // Extract interview data
  const hasInterviewData = application.interviewState !== undefined;
  const isInterviewComplete =
    hasInterviewData && application.interviewState?.completedAt !== undefined;
  const interviewFeedback = application.interviewState?.feedback;

  // Organize questions by category
  const questions = application.interviewChatHistory
    ? application.interviewChatHistory
        .filter((msg) => msg.sender === "ai" && msg.questionCategory)
        .reduce((acc, message) => {
          const category = message.questionCategory || "other";
          if (!acc[category]) acc[category] = [];
          acc[category].push(message);
          return acc;
        }, {} as Record<string, (typeof application.interviewChatHistory)[number][]>)
    : {};

  // Get answers that follow questions
  const getAnswerForQuestion = (questionId?: string) => {
    if (!questionId || !application.interviewChatHistory) return null;

    const questionIndex = application.interviewChatHistory.findIndex(
      (msg) => msg.questionId === questionId,
    );

    if (questionIndex === -1) return null;

    // Look for the next user message after this question
    const nextUserMessage = application.interviewChatHistory
      .slice(questionIndex + 1)
      .find((msg) => msg.sender === "user");

    return nextUserMessage?.text || null;
  };

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/job-applications")}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Job Application Details</h1>
          </div>
          <p className="text-muted-foreground">
            Detailed information for application submitted on{" "}
            {formattedCreatedDate}
          </p>
        </div>
      </div>

      {/* Application Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">
                {application?.job?.title}
              </CardTitle>
              <CardDescription className="text-lg">
                {application?.job?.companyName}
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="space-x-2">
                {application?.status === "pending" && (
                  <>
                    <Button
                      variant="default"
                      onClick={() => updateStatus("accepted")}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => updateStatus("rejected")}
                      className="border-destructive text-destructive hover:bg-destructive/10"
                    >
                      Reject
                    </Button>
                  </>
                )}

                {application.status === "accepted" && (
                  <Badge className="bg-green-500/20 text-green-500 text-lg py-2 px-4">
                    Accepted
                  </Badge>
                )}

                {application.status === "rejected" && (
                  <Badge className="bg-red-500/20 text-red-500 text-lg py-2 px-4">
                    Rejected
                  </Badge>
                )}

                {application.status === "reviewed" && (
                  <Badge className="bg-blue-500/20 text-blue-500 text-lg py-2 px-4">
                    Reviewed
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                <span className="text-muted-foreground mr-2">Resume:</span>
                <span className="font-medium">{application.fileName}</span>
              </div>

              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                <span className="text-muted-foreground mr-2">
                  Preferred Language:
                </span>
                <span className="font-medium">
                  {application.preferredLanguage}
                </span>
              </div>

              <div className="flex items-center">
                <FileCheck className="h-4 w-4 mr-2" />
                <span className="text-muted-foreground mr-2">Submitted:</span>
                <span className="font-medium">{formattedCreatedDate}</span>
              </div>
            </div>

            {application.parsedResume?.matchScore !== undefined && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-2" />
                    <span className="text-muted-foreground mr-2">
                      Match Score:
                    </span>
                  </div>
                  <Badge
                    className={`
                    ${
                      application.parsedResume.matchScore >= 70
                        ? "bg-green-500/20 text-green-500"
                        : application.parsedResume.matchScore >= 50
                        ? "bg-yellow-500/20 text-yellow-500"
                        : "bg-red-500/20 text-red-500"
                    }`}
                  >
                    {application.parsedResume.matchScore}%
                  </Badge>
                </div>

                <div
                  className={`h-2 rounded-full overflow-hidden ${
                    application.parsedResume.matchScore >= 70
                      ? "bg-green-100"
                      : application.parsedResume.matchScore >= 50
                      ? "bg-yellow-100"
                      : "bg-red-100"
                  }`}
                >
                  <div
                    className={`h-full ${
                      application.parsedResume.matchScore >= 70
                        ? "bg-green-500"
                        : application.parsedResume.matchScore >= 50
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${application.parsedResume.matchScore}%` }}
                  />
                </div>

                {matchedAt && (
                  <div className="text-xs text-muted-foreground text-right">
                    Analyzed on {matchedAt}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-1">
            {application.parsedResume?.skills?.map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed content tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-3 md:grid-cols-5">
          <TabsTrigger value="resume">Resume Analysis</TabsTrigger>
          <TabsTrigger value="interview" disabled={!hasInterviewData}>
            Interview
          </TabsTrigger>
          <TabsTrigger value="questions" disabled={!hasInterviewData}>
            Questions & Answers
          </TabsTrigger>
          <TabsTrigger
            value="monitoring"
            disabled={!application.monitoringImages?.length}
          >
            Monitoring Images
          </TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        {/* Resume Analysis Tab */}
        <TabsContent value="resume" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resume Match Analysis</CardTitle>
              <CardDescription>
                AI-powered analysis of how the candidate matches job
                requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {application.parsedResume?.aiComments && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Analysis</h3>
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <p className="whitespace-pre-line">
                      {application.parsedResume.aiComments}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Matching skills */}
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Matching Skills
                  </h3>
                  <div className="border rounded-lg p-4">
                    {application.parsedResume?.topSkillMatches?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {application.parsedResume.topSkillMatches.map(
                          (skill, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-green-500/10"
                            >
                              {skill}
                            </Badge>
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No matching skills identified
                      </p>
                    )}
                  </div>
                </div>

                {/* Missing skills */}
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                    Missing Skills
                  </h3>
                  <div className="border rounded-lg p-4">
                    {application.parsedResume?.missingSkills?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {application.parsedResume.missingSkills.map(
                          (skill, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-amber-500/10"
                            >
                              {skill}
                            </Badge>
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No missing skills identified
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Experience */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Experience</h3>
                  <div className="border rounded-lg p-4">
                    {application.parsedResume?.experience ? (
                      <div className="space-y-2">
                        <p>
                          <strong>Years:</strong>{" "}
                          {application.parsedResume.experience.years}
                        </p>
                        <div>
                          <strong>Companies:</strong>
                          <ul className="list-disc list-inside">
                            {application.parsedResume.experience.companies.map(
                              (company, index) => (
                                <li key={index}>{company}</li>
                              ),
                            )}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No experience data available
                      </p>
                    )}
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Education</h3>
                  <div className="border rounded-lg p-4">
                    {application.parsedResume?.education?.length ? (
                      <div className="space-y-2">
                        {application.parsedResume.education.map(
                          (edu, index) => (
                            <div
                              key={index}
                              className="border-b last:border-0 pb-2 last:pb-0"
                            >
                              <p>
                                <strong>{edu.degree}</strong>
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {edu.institution}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No education data available
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* About section */}
              {application.parsedResume?.about && (
                <div>
                  <h3 className="text-lg font-medium mb-2">About</h3>
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <p className="whitespace-pre-line">
                      {application.parsedResume.about}
                    </p>
                  </div>
                </div>
              )}

              {/* Resume Text */}
              <div>
                <h3 className="text-lg font-medium mb-2">Full Resume Text</h3>
                <ScrollArea className="border rounded-lg p-4 h-[300px]">
                  <p className="whitespace-pre-line">
                    {application.parsedResume?.extractedText}
                  </p>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interview Tab */}
        <TabsContent value="interview" className="space-y-4">
          {hasInterviewData ? (
            <Card>
              <CardHeader>
                <CardTitle>Interview Feedback</CardTitle>
                <CardDescription>
                  Results from the AI interview with the candidate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isInterviewComplete ? (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className="bg-green-500/20 text-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Interview Completed
                      </Badge>
                    </div>

                    {interviewFeedback ? (
                      <>
                        {/* Feedback Scores */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                          {interviewFeedback.technicalSkills !== undefined && (
                            <div className="border rounded-lg p-3 space-y-1">
                              <p className="text-sm text-muted-foreground">
                                Technical Skills
                              </p>
                              <div className="flex justify-between items-center">
                                <p className="font-medium">
                                  {interviewFeedback.technicalSkills}/10
                                </p>
                                <Progress
                                  value={interviewFeedback.technicalSkills * 10}
                                  className="h-2 w-16"
                                />
                              </div>
                            </div>
                          )}

                          {interviewFeedback.communicationSkills !==
                            undefined && (
                            <div className="border rounded-lg p-3 space-y-1">
                              <p className="text-sm text-muted-foreground">
                                Communication
                              </p>
                              <div className="flex justify-between items-center">
                                <p className="font-medium">
                                  {interviewFeedback.communicationSkills}/10
                                </p>
                                <Progress
                                  value={
                                    interviewFeedback.communicationSkills * 10
                                  }
                                  className="h-2 w-16"
                                />
                              </div>
                            </div>
                          )}

                          {interviewFeedback.problemSolving !== undefined && (
                            <div className="border rounded-lg p-3 space-y-1">
                              <p className="text-sm text-muted-foreground">
                                Problem Solving
                              </p>
                              <div className="flex justify-between items-center">
                                <p className="font-medium">
                                  {interviewFeedback.problemSolving}/10
                                </p>
                                <Progress
                                  value={interviewFeedback.problemSolving * 10}
                                  className="h-2 w-16"
                                />
                              </div>
                            </div>
                          )}

                          {interviewFeedback.cultureFit !== undefined && (
                            <div className="border rounded-lg p-3 space-y-1">
                              <p className="text-sm text-muted-foreground">
                                Culture Fit
                              </p>
                              <div className="flex justify-between items-center">
                                <p className="font-medium">
                                  {interviewFeedback.cultureFit}/10
                                </p>
                                <Progress
                                  value={interviewFeedback.cultureFit * 10}
                                  className="h-2 w-16"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Detailed Feedback */}
                        <div className="space-y-4">
                          {/* Overall Impression */}
                          {interviewFeedback.overallImpression && (
                            <div>
                              <h3 className="text-lg font-medium mb-2">
                                Overall Impression
                              </h3>
                              <div className="border rounded-lg p-4 bg-muted/30">
                                <p className="whitespace-pre-line">
                                  {interviewFeedback.overallImpression}
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Strengths */}
                            {interviewFeedback.strengths?.length && (
                              <div>
                                <h3 className="text-lg font-medium mb-2">
                                  Strengths
                                </h3>
                                <div className="border rounded-lg p-4">
                                  <ul className="list-disc list-inside space-y-1">
                                    {interviewFeedback.strengths.map(
                                      (strength, index) => (
                                        <li key={index}>{strength}</li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              </div>
                            )}

                            {/* Areas of Improvement */}
                            {interviewFeedback.areasOfImprovement?.length && (
                              <div>
                                <h3 className="text-lg font-medium mb-2">
                                  Areas for Improvement
                                </h3>
                                <div className="border rounded-lg p-4">
                                  <ul className="list-disc list-inside space-y-1">
                                    {interviewFeedback.areasOfImprovement.map(
                                      (area, index) => (
                                        <li key={index}>{area}</li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-muted-foreground">
                        No feedback data available yet.
                      </p>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">
                      Interview In Progress
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      The candidate has not yet completed the interview process.
                    </p>
                    {application?.interviewState?.currentPhase && (
                      <p className="text-muted-foreground">
                        Current phase:{" "}
                        {application.interviewState.currentPhase.replace(
                          /_/g,
                          " ",
                        )}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Interview Data</h3>
                <p className="text-muted-foreground mt-1 max-w-md">
                  This candidate has not started the interview process yet.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Questions & Answers Tab */}
        <TabsContent value="questions" className="space-y-4">
          {application.interviewChatHistory?.length ? (
            <Card>
              <CardHeader>
                <CardTitle>Interview Questions & Answers</CardTitle>
                <CardDescription>
                  Questions asked during the interview and candidate responses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Technical Questions */}
                {questions.technical?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">
                      Technical Questions
                    </h3>
                    <div className="space-y-4">
                      {questions.technical.map((question, index) => {
                        const answer = getAnswerForQuestion(
                          question.questionId,
                        );
                        return (
                          <div
                            key={index}
                            className="border rounded-lg overflow-hidden"
                          >
                            <div className="bg-muted p-3">
                              <p className="font-medium">{question.text}</p>
                            </div>
                            {answer && (
                              <div className="p-3 border-t">
                                <p className="whitespace-pre-line">{answer}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Project Questions */}
                {questions.project?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">
                      Project Questions
                    </h3>
                    <div className="space-y-4">
                      {questions.project.map((question, index) => {
                        const answer = getAnswerForQuestion(
                          question.questionId,
                        );
                        return (
                          <div
                            key={index}
                            className="border rounded-lg overflow-hidden"
                          >
                            <div className="bg-muted p-3">
                              <p className="font-medium">{question.text}</p>
                            </div>
                            {answer && (
                              <div className="p-3 border-t">
                                <p className="whitespace-pre-line">{answer}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Behavioral Questions */}
                {questions.behavioral?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">
                      Behavioral Questions
                    </h3>
                    <div className="space-y-4">
                      {questions.behavioral.map((question, index) => {
                        const answer = getAnswerForQuestion(
                          question.questionId,
                        );
                        return (
                          <div
                            key={index}
                            className="border rounded-lg overflow-hidden"
                          >
                            <div className="bg-muted p-3">
                              <p className="font-medium">{question.text}</p>
                            </div>
                            {answer && (
                              <div className="p-3 border-t">
                                <p className="whitespace-pre-line">{answer}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Other Questions */}
                {questions.other?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">
                      Other Questions
                    </h3>
                    <div className="space-y-4">
                      {questions.other.map((question, index) => {
                        const answer = getAnswerForQuestion(
                          question.questionId,
                        );
                        return (
                          <div
                            key={index}
                            className="border rounded-lg overflow-hidden"
                          >
                            <div className="bg-muted p-3">
                              <p className="font-medium">{question.text}</p>
                            </div>
                            {answer && (
                              <div className="p-3 border-t">
                                <p className="whitespace-pre-line">{answer}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Show if no questions categorized */}
                {Object.keys(questions).length === 0 && (
                  <div className="text-center py-6">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No categorized questions found
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Interview Questions</h3>
                <p className="text-muted-foreground mt-1 max-w-md">
                  This candidate has not been asked any interview questions yet.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Monitoring Images Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          {application.monitoringImages?.length ? (
            <Card>
              <CardHeader>
                <CardTitle>Monitoring Images</CardTitle>
                <CardDescription>
                  Images captured during the interview process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {application.monitoringImages.map((image, index) => (
                    <div
                      key={index}
                      className="border rounded-lg overflow-hidden"
                    >
                      <div className="aspect-video relative">
                        <Image
                          src={
                            image.signedUrl ||
                            `/api/applications/${applicationId}/monitoring-image/${image.s3Key}`
                          }
                          alt={`Monitoring image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-2 text-xs text-center text-muted-foreground">
                        {format(
                          new Date(image.timestamp),
                          "MMM d, yyyy HH:mm:ss",
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Camera className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Monitoring Images</h3>
                <p className="text-muted-foreground mt-1 max-w-md">
                  No images were captured during the interview process.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Actions</CardTitle>
              <CardDescription>
                Manage the status of this job application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <h3 className="font-medium">Update Status</h3>
                <p className="text-muted-foreground">
                  Current status:
                  <Badge
                    className={`ml-2 ${
                      application.status === "accepted"
                        ? "bg-green-500/20 text-green-500"
                        : application.status === "rejected"
                        ? "bg-red-500/20 text-red-500"
                        : application.status === "reviewed"
                        ? "bg-blue-500/20 text-blue-500"
                        : "bg-yellow-500/20 text-yellow-500"
                    }`}
                  >
                    {application.status.charAt(0).toUpperCase() +
                      application.status.slice(1)}
                  </Badge>
                </p>

                <div className="flex flex-wrap gap-2 mt-2">
                  <Button
                    variant="outline"
                    onClick={() => updateStatus("pending")}
                    disabled={application.status === "pending"}
                  >
                    Mark as Pending
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => updateStatus("reviewed")}
                    disabled={application.status === "reviewed"}
                  >
                    Mark as Reviewed
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => updateStatus("accepted")}
                    disabled={application.status === "accepted"}
                  >
                    Accept Application
                  </Button>
                  <Button
                    variant="outline"
                    className="border-destructive text-destructive hover:bg-destructive/10"
                    onClick={() => updateStatus("rejected")}
                    disabled={application.status === "rejected"}
                  >
                    Reject Application
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Download Resume</h3>
                <p className="text-muted-foreground">
                  Download the candidate&apos;s resume
                </p>
                <Button asChild>
                  <a
                    href={application.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Download Resume
                  </a>
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">View Full Interview</h3>
                <p className="text-muted-foreground">
                  View the complete interview transcript
                </p>
                <Button
                  variant="outline"
                  disabled={!application.interviewChatHistory?.length}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  View Interview Transcript
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
