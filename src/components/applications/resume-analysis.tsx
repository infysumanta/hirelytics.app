"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle,
  Briefcase,
  GraduationCap,
  Code,
  FileText,
} from "lucide-react";
import { IJobApplication } from "@/models/job-application";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import ResumeMatchResult from "./resume-match-result";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
    },
  },
};

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

        const response = await fetch(
          `/api/applications/${applicationId}/analyze`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              runMatching: true,
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
        router.push(`/dashboard/applications/${applicationId}/interview`);
      });
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Card className="p-4 border-none bg-[#121212]">
          <div className="text-center">
            <motion.h1
              className="text-xl font-bold mb-3"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              Resume Analysis Failed
            </motion.h1>
            <motion.p
              className="text-muted-foreground mb-4"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {error}
            </motion.p>
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button onClick={() => router.back()}>Go Back</Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <Card className="border-none bg-[#121212] shadow-none overflow-hidden">
        <CardHeader className="text-center py-6 px-4">
          <motion.h1
            className="text-2xl font-bold mb-3"
            variants={itemVariants}
          >
            Resume Analysis
          </motion.h1>

          {application?.parsedResume?.matchScore ? (
            <motion.div className="mt-2" variants={itemVariants}>
              <motion.div
                className="inline-flex items-center px-6 py-2 rounded-full text-white font-medium text-sm gap-2"
                style={{
                  backgroundColor:
                    application.parsedResume.matchScore >= 70
                      ? "rgb(34, 197, 94)"
                      : application.parsedResume.matchScore >= 50
                        ? "rgb(251, 191, 36)"
                        : "rgb(239, 68, 68)",
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
                  stroke="currentColor"
                  initial={{ rotate: -180, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <path
                    d="M9 12l2 2 4-4"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
                <span className="flex items-center gap-1">
                  Strong Match: {application.parsedResume.matchScore}%
                </span>
              </motion.div>
            </motion.div>
          ) : (
            <motion.p
              className="text-muted-foreground text-sm"
              variants={itemVariants}
            >
              We&apos;re analyzing your resume to match your skills with the job
              requirements
            </motion.p>
          )}
        </CardHeader>

        <CardContent className="px-0 py-4 flex flex-col items-center">
          {isLoading ? (
            <motion.div
              className="flex flex-col items-center justify-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="h-12 w-12 text-primary mb-4" />
              </motion.div>
              <motion.p
                className="text-lg font-medium"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Processing your resume...
              </motion.p>
              <motion.p
                className="text-muted-foreground mt-2 text-sm"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                This may take a few moments
              </motion.p>
            </motion.div>
          ) : (
            <motion.div className="w-full" variants={containerVariants}>
              <motion.div
                className="flex items-center justify-center mb-6 gap-2"
                variants={itemVariants}
              >
                <CheckCircle className="h-8 w-8 text-green-500" />
                <h2 className="text-xl font-medium">Analysis Complete!</h2>
              </motion.div>

              <motion.div
                className="w-full space-y-6 mb-6 px-6"
                variants={containerVariants}
              >
                <ResumeMatchResult
                  score={application?.parsedResume?.matchScore}
                  comments={application?.parsedResume?.aiComments}
                  matchedAt={application?.parsedResume?.matchedAt?.toString()}
                  topSkillMatches={application?.parsedResume?.topSkillMatches}
                  missingSkills={application?.parsedResume?.missingSkills}
                  onRefreshRequest={async () => {
                    setIsLoading(true);
                    toast.info("Refreshing match analysis...", {
                      id: "refresh-analysis",
                      duration: 3000,
                    });

                    try {
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

                {application?.parsedResume && (
                  <motion.div
                    className="grid grid-cols-3 gap-4"
                    variants={containerVariants}
                  >
                    {/* Skills */}
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 17,
                      }}
                    >
                      <Card className="p-4 border-none bg-[#1c1c1c] shadow-none hover:bg-[#242424] transition-colors">
                        <div className="flex items-start gap-3">
                          <Code className="h-5 w-5 text-blue-400" />
                          <div>
                            <h3 className="font-medium text-sm mb-2">Skills</h3>
                            <div className="flex flex-wrap gap-1.5">
                              {application.parsedResume.skills.map(
                                (skill, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs py-0.5 px-2.5 bg-[#2a2a2a] border-[#404040] text-[#f1f1f1]"
                                  >
                                    {skill}
                                  </Badge>
                                ),
                              )}
                              {application.parsedResume.skills.length === 0 && (
                                <p className="text-xs text-muted-foreground">
                                  No specific skills identified
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>

                    {/* Experience */}
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 17,
                      }}
                    >
                      <Card className="p-4 border-none bg-[#1c1c1c] shadow-none hover:bg-[#242424] transition-colors">
                        <div className="flex items-start gap-3">
                          <Briefcase className="h-5 w-5 text-yellow-400" />
                          <div>
                            <h3 className="font-medium text-sm mb-2">
                              Experience
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              No company info
                            </p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>

                    {/* Education */}
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 17,
                      }}
                    >
                      <Card className="p-4 border-none bg-[#1c1c1c] shadow-none hover:bg-[#242424] transition-colors">
                        <div className="flex items-start gap-3">
                          <GraduationCap className="h-5 w-5 text-purple-400" />
                          <div>
                            <h3 className="font-medium text-sm mb-2">
                              Education
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              No education info
                            </p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  </motion.div>
                )}

                <motion.div variants={itemVariants}>
                  <Card className="p-3 border-none bg-[#1c1c1c] shadow-none">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-500" />
                      <p className="text-xs text-muted-foreground">
                        Resume processed successfully.
                      </p>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>

              <motion.div className="w-full px-6" variants={itemVariants}>
                <Button
                  onClick={handleContinue}
                  className="w-full bg-neutral-200 text-neutral-900 hover:bg-neutral-300 font-medium py-6"
                  size="lg"
                >
                  Continue to Interview
                </Button>
              </motion.div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
