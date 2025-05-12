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
  User,
  Brain,
} from "lucide-react";
import { IJobApplication } from "@/models/job-application";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

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

              <div className="w-full space-y-6 mb-6 max-w-4xl mx-auto px-4">
                {/* Match Score Row */}
                <motion.div variants={itemVariants}>
                  <Card className="p-6 border-none bg-[#1c1c1c] shadow-none hover:bg-[#242424] transition-colors">
                    <div className="w-full">
                      <h3 className="text-base font-medium mb-4">
                        Match Score
                      </h3>
                      <div className="flex items-center gap-8">
                        <div
                          className={`text-5xl font-bold ${
                            (application?.parsedResume?.matchScore ?? 0) >= 70
                              ? "text-green-500"
                              : (application?.parsedResume?.matchScore ?? 0) >=
                                  50
                                ? "text-yellow-500"
                                : "text-red-500"
                          }`}
                        >
                          {application?.parsedResume?.matchScore ?? 0}%
                        </div>
                        <div className="flex-1">
                          <div className="h-3 bg-[#2a2a2a] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${application?.parsedResume?.matchScore ?? 0}%`,
                                backgroundColor:
                                  (application?.parsedResume?.matchScore ??
                                    0) >= 70
                                    ? "rgb(34, 197, 94)"
                                    : (application?.parsedResume?.matchScore ??
                                          0) >= 50
                                      ? "rgb(251, 191, 36)"
                                      : "rgb(239, 68, 68)",
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Last analyzed:{" "}
                            {application?.parsedResume?.analyzedAt
                              ? new Date(
                                  application.parsedResume.analyzedAt,
                                ).toLocaleDateString()
                              : "Not yet analyzed"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* About Row */}
                <motion.div variants={itemVariants}>
                  <Card className="p-6 border-none bg-[#1c1c1c] shadow-none hover:bg-[#242424] transition-colors">
                    <div className="flex items-start gap-4">
                      <User className="h-6 w-6 text-purple-400 flex-shrink-0" />
                      <div className="w-full">
                        <h3 className="text-base font-medium mb-3">
                          About Candidate
                        </h3>
                        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                          {application?.parsedResume?.about ??
                            "No summary information available"}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Skills Row */}
                <motion.div variants={itemVariants}>
                  <Card className="p-6 border-none bg-[#1c1c1c] shadow-none hover:bg-[#242424] transition-colors">
                    <div className="flex items-start gap-4">
                      <Code className="h-6 w-6 text-blue-400 flex-shrink-0" />
                      <div className="w-full">
                        <h3 className="text-base font-medium mb-3">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {(application?.parsedResume?.skills ?? []).map(
                            (skill, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-sm py-1 px-3 bg-[#2a2a2a] border-[#404040] text-[#f1f1f1] font-medium"
                              >
                                {skill}
                              </Badge>
                            ),
                          )}
                          {(!application?.parsedResume?.skills ||
                            application.parsedResume.skills.length === 0) && (
                            <p className="text-sm text-muted-foreground">
                              No specific skills identified
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Experience Row */}
                <motion.div variants={itemVariants}>
                  <Card className="p-6 border-none bg-[#1c1c1c] shadow-none hover:bg-[#242424] transition-colors">
                    <div className="flex items-start gap-4">
                      <Briefcase className="h-6 w-6 text-yellow-400 flex-shrink-0" />
                      <div className="w-full">
                        <h3 className="text-base font-medium mb-3">
                          Experience
                        </h3>
                        {(application?.parsedResume?.experience?.years ?? 0) >
                        0 ? (
                          <div className="space-y-4">
                            <div className="flex items-center">
                              <span className="text-2xl font-bold text-white">
                                {application?.parsedResume?.experience?.years}
                              </span>
                              <span className="ml-2 text-sm text-muted-foreground">
                                years of professional experience
                              </span>
                            </div>
                            {(application?.parsedResume?.experience?.companies
                              ?.length ?? 0) > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {(
                                  application?.parsedResume?.experience
                                    ?.companies ?? []
                                ).map((company, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-sm py-1 px-3 bg-[#2a2a2a] border-[#404040] text-[#f1f1f1] font-medium"
                                  >
                                    {company}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No experience details found
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Education Row */}
                <motion.div variants={itemVariants}>
                  <Card className="p-6 border-none bg-[#1c1c1c] shadow-none hover:bg-[#242424] transition-colors">
                    <div className="flex items-start gap-4">
                      <GraduationCap className="h-6 w-6 text-green-400 flex-shrink-0" />
                      <div className="w-full">
                        <h3 className="text-base font-medium mb-3">
                          Education
                        </h3>
                        {(application?.parsedResume?.education?.length ?? 0) >
                        0 ? (
                          <div className="space-y-4">
                            {(application?.parsedResume?.education ?? []).map(
                              (edu, index) => (
                                <div
                                  key={index}
                                  className="border-l-2 border-[#2a2a2a] pl-4 py-1"
                                >
                                  <p className="text-sm font-medium mb-1">
                                    {edu.degree}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {edu.institution}
                                  </p>
                                </div>
                              ),
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No education information found
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* AI Analysis Row */}
                <motion.div variants={itemVariants}>
                  <Card className="p-6 border-none bg-[#1c1c1c] shadow-none hover:bg-[#242424] transition-colors">
                    <div className="flex items-start gap-4">
                      <Brain className="h-6 w-6 text-indigo-400 flex-shrink-0" />
                      <div className="w-full">
                        <h3 className="text-base font-medium mb-3">
                          AI Analysis
                        </h3>
                        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                          {application?.parsedResume?.aiComments ??
                            "No AI analysis available"}
                        </p>

                        {/* Skills Analysis */}
                        {((application?.parsedResume?.topSkillMatches?.length ??
                          0) > 0 ||
                          (application?.parsedResume?.missingSkills?.length ??
                            0) > 0) && (
                          <div className="mt-6 space-y-4">
                            {(application?.parsedResume?.topSkillMatches
                              ?.length ?? 0) > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2">
                                  Top Matching Skills:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {(
                                    application?.parsedResume
                                      ?.topSkillMatches ?? []
                                  ).map((skill, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-sm py-1 px-3 bg-[#2a2a2a] border-[#404040] text-green-400 font-medium"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {(application?.parsedResume?.missingSkills
                              ?.length ?? 0) > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2">
                                  Missing Skills:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {(
                                    application?.parsedResume?.missingSkills ??
                                    []
                                  ).map((skill, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-sm py-1 px-3 bg-[#2a2a2a] border-[#404040] text-red-400 font-medium"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>

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
