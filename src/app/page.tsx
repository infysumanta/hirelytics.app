"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { useTranslations } from "next-intl";
import {
  LineChart,
  Zap,
  Search,
  Building2,
  GraduationCap,
  FileText,
  Link as LinkIcon,
  Upload,
  MessageSquareText,
  ClipboardCheck,
  ArrowRight,
  ChevronRight,
  Sparkles,
  User as UserIcon,
  Heart,
  Users,
  Briefcase as BriefcaseIcon,
} from "lucide-react";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const featureCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
  hover: {
    y: -5,
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.3 },
  },
};

export default function Home() {
  const t = useTranslations("HomePage");
  const common = useTranslations("Common");

  return (
    <div className="flex min-h-screen flex-col items-center">
      {/* Hero Section */}
      <AnimatedBackground
        colorScheme="indigo"
        patternOpacity={0.2}
        className="py-5 md:py-5"
      >
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-blue-600/30 dark:bg-blue-500/30 blur-[120px] animate-pulse-slow"></div>
          <div
            className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-purple-600/30 dark:bg-purple-500/30 blur-[120px] animate-pulse-slow"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-1/2 right-1/4 h-[300px] w-[300px] rounded-full bg-indigo-600/30 dark:bg-indigo-500/30 blur-[100px] animate-pulse-slow"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/3 left-1/4 h-[250px] w-[250px] rounded-full bg-cyan-600/30 dark:bg-cyan-500/30 blur-[90px] animate-pulse-slow"
            style={{ animationDelay: "3s" }}
          ></div>
        </div>

        {/* Animated pattern overlay */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="h-full w-full bg-[url('/patterns/grid.svg')] bg-repeat opacity-20"></div>
        </div>

        <div className="absolute right-10 top-20 hidden md:block">
          <motion.div
            className="relative h-[300px] w-[300px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-blue-500/20 to-purple-500/20 animate-float"></div>
            <div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 via-blue-500/10 to-purple-500/10 animate-float"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute inset-0 rounded-full border border-primary/20 animate-float"
              style={{ animationDelay: "2s" }}
            ></div>
          </motion.div>
        </div>

        <motion.div
          className="container relative z-10 mx-auto flex flex-col items-center justify-center px-4 text-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary/80 px-4 py-1.5 text-sm font-medium"
            variants={fadeIn}
          >
            <Sparkles size={16} className="text-primary" />
            {t("hero.aiPoweredRecruitment")}
          </motion.div>

          <motion.h1
            className="mb-6 text-center text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
            variants={fadeIn}
          >
            <span>{t("hero.revolutionizeHiring")} </span>
            <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent animate-gradient">
              {t("title")}
            </span>
          </motion.h1>

          <motion.p
            className="mb-8 max-w-2xl text-center text-lg text-muted-foreground"
            variants={fadeIn}
          >
            {t("hero.description")}
          </motion.p>

          <motion.div
            className="flex flex-wrap justify-center gap-4"
            variants={fadeIn}
          >
            <Link href="/login">
              <Button
                size="lg"
                className="gap-2 group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <Zap size={18} className="relative z-10" />
                <span className="relative z-10">
                  {common("buttons.getStarted")}
                </span>
              </Button>
            </Link>
            <Link href="/jobs">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <BriefcaseIcon size={18} className="relative z-10" />
                <span className="relative z-10">Find Jobs</span>
              </Button>
            </Link>
            <Link href="/learn-more">
              <Button size="lg" variant="outline" className="gap-2 group">
                <Search size={18} />
                <span>{common("buttons.howItWorks")}</span>
                <ChevronRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Button>
            </Link>
          </motion.div>

          {/* User Access Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/login?type=candidate"
                className="group transition-all hover:text-primary"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium backdrop-blur-sm hover:border-primary/30 hover:bg-primary/5">
                  <UserIcon size={14} />
                  Candidate Login
                  <ChevronRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </div>
              </Link>
              <Link
                href="/login?type=recruiter"
                className="group transition-all hover:text-primary"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium backdrop-blur-sm hover:border-primary/30 hover:bg-primary/5">
                  <Building2 size={14} />
                  Recruiter Login
                  <ChevronRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </div>
              </Link>
              <Link
                href="/wishlist"
                className="group transition-all hover:text-primary"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium backdrop-blur-sm hover:border-primary/30 hover:bg-primary/5">
                  <Heart size={14} />
                  Wishlist
                  <ChevronRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </div>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </AnimatedBackground>

      {/* Features Section */}
      <section id="features" className="w-full py-20 relative overflow-hidden">
        {/* Background patterns */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-blue-600/20 dark:bg-blue-500/20 blur-[100px] animate-pulse-slow"></div>
          <div
            className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-purple-600/20 dark:bg-purple-500/20 blur-[100px] animate-pulse-slow"
            style={{ animationDelay: "2s" }}
          ></div>
          <div className="h-full w-full bg-[url('/patterns/dots.svg')] bg-repeat opacity-10"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="mb-16 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
          >
            <div className="mb-4 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <Sparkles size={16} />
                {t("featuresSection.title")}
              </div>
            </div>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              {t("featuresSection.subtitle")}
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              {t("featuresSection.description")}
            </p>
          </motion.div>

          <motion.div
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
          >
            {[
              {
                icon: <FileText className="text-blue-500" />,
                title: t("featuresSection.smartJobPosting.title"),
                description: t("featuresSection.smartJobPosting.description"),
                color: "blue",
              },
              {
                icon: <LinkIcon className="text-indigo-500" />,
                title: t("featuresSection.uniqueApplicationLinks.title"),
                description: t(
                  "featuresSection.uniqueApplicationLinks.description",
                ),
                color: "indigo",
              },
              {
                icon: <Upload className="text-purple-500" />,
                title: t("featuresSection.resumeAnalysis.title"),
                description: t("featuresSection.resumeAnalysis.description"),
                color: "purple",
              },
              {
                icon: <MessageSquareText className="text-pink-500" />,
                title: t("featuresSection.aiPoweredInterviews.title"),
                description: t(
                  "featuresSection.aiPoweredInterviews.description",
                ),
                color: "pink",
              },
              {
                icon: <ClipboardCheck className="text-green-500" />,
                title: t("featuresSection.comprehensiveFeedback.title"),
                description: t(
                  "featuresSection.comprehensiveFeedback.description",
                ),
                color: "green",
              },
              {
                icon: <LineChart className="text-orange-500" />,
                title: t("featuresSection.dataDrivenInsights.title"),
                description: t(
                  "featuresSection.dataDrivenInsights.description",
                ),
                color: "orange",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className={`group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all`}
                variants={featureCardVariants}
                whileHover="hover"
              >
                <div
                  className={`absolute inset-0 bg-${feature.color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity`}
                ></div>
                <div
                  className={`absolute bottom-0 left-0 h-1 w-0 bg-${feature.color}-500 group-hover:w-full transition-all duration-300`}
                ></div>
                <div
                  className={`mb-4 rounded-full bg-${feature.color}-500/10 p-3 w-fit`}
                >
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="w-full bg-gradient-to-b from-background via-secondary/10 to-background py-20 relative overflow-hidden"
      >
        {/* Background patterns */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-0 h-[300px] w-[300px] rounded-full bg-indigo-600/10 dark:bg-indigo-500/10 blur-[100px] animate-pulse-slow"></div>
          <div
            className="absolute bottom-1/4 right-0 h-[250px] w-[250px] rounded-full bg-cyan-600/10 dark:bg-cyan-500/10 blur-[100px] animate-pulse-slow"
            style={{ animationDelay: "3s" }}
          ></div>
          <div className="h-full w-full bg-[url('/patterns/circuit.svg')] bg-repeat opacity-5"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="mb-16 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
          >
            <div className="mb-4 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <Zap size={16} />
                Streamlined Process
              </div>
            </div>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              How Hirelytics Works
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Our AI-powered platform streamlines the entire recruitment journey
              from job posting to final selection.
            </p>
          </motion.div>

          <div className="relative">
            {/* Connection lines for desktop */}
            <div className="absolute left-1/2 top-24 hidden h-[calc(100%-6rem)] w-0.5 -translate-x-1/2 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500 md:block"></div>

            <motion.div
              className="relative space-y-12 md:space-y-24"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
            >
              {/* Step 1: Recruiter creates job posting */}
              <motion.div
                className="flex flex-col md:flex-row md:items-center md:justify-between"
                variants={fadeIn}
              >
                <div className="md:w-5/12">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white">
                      1
                    </div>
                    <h3 className="text-xl font-semibold">
                      Create Job Posting
                    </h3>
                  </div>
                  <p className="text-muted-foreground">
                    Recruiters create detailed job postings with requirements,
                    responsibilities, and qualifications.
                  </p>
                </div>

                <div className="relative mt-6 md:mt-0 md:w-5/12">
                  <div className="absolute -left-4 top-1/2 hidden h-4 w-4 -translate-y-1/2 rounded-full bg-blue-500 md:block"></div>
                  <motion.div
                    className="rounded-xl border bg-card p-6 shadow-md"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-3 flex justify-between">
                      <div className="rounded-md bg-blue-500/10 px-3 py-1 text-sm text-blue-500">
                        Recruiter
                      </div>
                      <Building2 className="text-blue-500" size={20} />
                    </div>
                    <h4 className="mb-2 font-medium">
                      Job Description Creation
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      The platform helps optimize job descriptions to attract
                      the right candidates.
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Step 2: System generates job URL */}
              <motion.div
                className="flex flex-col md:flex-row-reverse md:items-center md:justify-between"
                variants={fadeIn}
              >
                <div className="md:w-5/12">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white">
                      2
                    </div>
                    <h3 className="text-xl font-semibold">
                      Generate Application URL
                    </h3>
                  </div>
                  <p className="text-muted-foreground">
                    The system automatically generates a unique application URL
                    for each job posting.
                  </p>
                </div>

                <div className="relative mt-6 md:mt-0 md:w-5/12">
                  <div className="absolute -right-4 top-1/2 hidden h-4 w-4 -translate-y-1/2 rounded-full bg-indigo-500 md:block"></div>
                  <motion.div
                    className="rounded-xl border bg-card p-6 shadow-md"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-3 flex justify-between">
                      <div className="rounded-md bg-indigo-500/10 px-3 py-1 text-sm text-indigo-500">
                        System
                      </div>
                      <LinkIcon className="text-indigo-500" size={20} />
                    </div>
                    <h4 className="mb-2 font-medium">
                      Unique Application Link
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Each job gets a custom URL that can be shared across
                      platforms and social media.
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Step 3: Candidate applies via URL */}
              <motion.div
                className="flex flex-col md:flex-row md:items-center md:justify-between"
                variants={fadeIn}
              >
                <div className="md:w-5/12">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-white">
                      3
                    </div>
                    <h3 className="text-xl font-semibold">
                      Candidate Application
                    </h3>
                  </div>
                  <p className="text-muted-foreground">
                    Candidates apply through the unique URL, creating a
                    streamlined application experience.
                  </p>
                </div>

                <div className="relative mt-6 md:mt-0 md:w-5/12">
                  <div className="absolute -left-4 top-1/2 hidden h-4 w-4 -translate-y-1/2 rounded-full bg-purple-500 md:block"></div>
                  <motion.div
                    className="rounded-xl border bg-card p-6 shadow-md"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-3 flex justify-between">
                      <div className="rounded-md bg-purple-500/10 px-3 py-1 text-sm text-purple-500">
                        Candidate
                      </div>
                      <GraduationCap className="text-purple-500" size={20} />
                    </div>
                    <h4 className="mb-2 font-medium">
                      Easy Application Process
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Candidates can apply with a simple, user-friendly
                      interface designed for the best experience.
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Step 4: AI analyzes resume */}
              <motion.div
                className="flex flex-col md:flex-row-reverse md:items-center md:justify-between"
                variants={fadeIn}
              >
                <div className="md:w-5/12">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-500 text-white">
                      4
                    </div>
                    <h3 className="text-xl font-semibold">Resume Analysis</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Our AI analyzes the candidate&apos;s resume to extract
                    skills, experience, and qualifications.
                  </p>
                </div>

                <div className="relative mt-6 md:mt-0 md:w-5/12">
                  <div className="absolute -right-4 top-1/2 hidden h-4 w-4 -translate-y-1/2 rounded-full bg-pink-500 md:block"></div>
                  <motion.div
                    className="rounded-xl border bg-card p-6 shadow-md"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-3 flex justify-between">
                      <div className="rounded-md bg-pink-500/10 px-3 py-1 text-sm text-pink-500">
                        AI System
                      </div>
                      <Upload className="text-pink-500" size={20} />
                    </div>
                    <h4 className="mb-2 font-medium">
                      Intelligent Resume Parsing
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Advanced AI extracts and analyzes key information from
                      resumes to match with job requirements.
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Step 5: AI conducts interview */}
              <motion.div
                className="flex flex-col md:flex-row md:items-center md:justify-between"
                variants={fadeIn}
              >
                <div className="md:w-5/12">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                      5
                    </div>
                    <h3 className="text-xl font-semibold">
                      AI-Powered Interview
                    </h3>
                  </div>
                  <p className="text-muted-foreground">
                    The AI conducts an adaptive interview, asking questions
                    based on the candidate&apos;s resume and responses.
                  </p>
                </div>

                <div className="relative mt-6 md:mt-0 md:w-5/12">
                  <div className="absolute -left-4 top-1/2 hidden h-4 w-4 -translate-y-1/2 rounded-full bg-blue-600 md:block"></div>
                  <motion.div
                    className="rounded-xl border bg-card p-6 shadow-md"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-3 flex justify-between">
                      <div className="rounded-md bg-blue-600/10 px-3 py-1 text-sm text-blue-600">
                        Interview
                      </div>
                      <MessageSquareText className="text-blue-600" size={20} />
                    </div>
                    <h4 className="mb-2 font-medium">Dynamic Conversation</h4>
                    <p className="text-sm text-muted-foreground">
                      The AI adapts questions based on previous answers to
                      thoroughly assess candidate skills.
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Step 6: System provides feedback */}
              <motion.div
                className="flex flex-col md:flex-row-reverse md:items-center md:justify-between"
                variants={fadeIn}
              >
                <div className="md:w-5/12">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
                      6
                    </div>
                    <h3 className="text-xl font-semibold">
                      Comprehensive Feedback
                    </h3>
                  </div>
                  <p className="text-muted-foreground">
                    Both recruiters and candidates receive detailed feedback and
                    insights from the interview process.
                  </p>
                </div>

                <div className="relative mt-6 md:mt-0 md:w-5/12">
                  <div className="absolute -right-4 top-1/2 hidden h-4 w-4 -translate-y-1/2 rounded-full bg-green-500 md:block"></div>
                  <motion.div
                    className="rounded-xl border bg-card p-6 shadow-md"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-3 flex justify-between">
                      <div className="rounded-md bg-green-500/10 px-3 py-1 text-sm text-green-500">
                        Results
                      </div>
                      <ClipboardCheck className="text-green-500" size={20} />
                    </div>
                    <h4 className="mb-2 font-medium">Actionable Insights</h4>
                    <p className="text-sm text-muted-foreground">
                      Detailed reports help recruiters make informed decisions
                      and candidates understand their performance.
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            className="mt-16 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/login">
              <Button size="lg" className="gap-2">
                <ArrowRight size={18} />
                Get Started Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-20 bg-gradient-to-b from-background via-primary/5 to-background relative overflow-hidden">
        {/* Background patterns */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 h-[350px] w-[350px] rounded-full bg-purple-600/10 dark:bg-purple-500/10 blur-[120px] animate-pulse-slow"></div>
          <div
            className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-blue-600/10 dark:bg-blue-500/10 blur-[120px] animate-pulse-slow"
            style={{ animationDelay: "2.5s" }}
          ></div>
          <div className="h-full w-full bg-[url('/patterns/waves.svg')] bg-repeat opacity-5"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="mb-16 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
          >
            <div className="mb-4 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <Users size={16} />
                Success Stories
              </div>
            </div>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              What Our Users Say
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Hear from recruiters and candidates who have transformed their
              hiring experience with our AI-powered platform.
            </p>
          </motion.div>

          <motion.div
            className="grid gap-8 md:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
          >
            {[
              {
                quote:
                  "Hirelytics has revolutionized our recruitment process. We&apos;ve reduced our time-to-hire by 40% and found better quality candidates.",
                name: "Sarah Johnson",
                role: "HR Director",
                company: "TechCorp",
                color: "blue",
              },
              {
                quote:
                  "The AI interview process is remarkably effective. It asks relevant questions and provides detailed feedback that helps us make better hiring decisions.",
                name: "David Rodriguez",
                role: "Talent Acquisition Manager",
                company: "InnovateX",
                color: "purple",
              },
              {
                quote:
                  "As a candidate, I love how the platform matched me with jobs that truly aligned with my skills and career goals. The AI interview was surprisingly conversational.",
                name: "Michael Chen",
                role: "Software Engineer",
                company: "Hired via Hirelytics",
                color: "green",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className={`relative overflow-hidden rounded-xl border bg-card p-8 shadow-md`}
                variants={featureCardVariants}
                whileHover="hover"
              >
                <div
                  className={`absolute top-0 left-0 h-1 w-full bg-${testimonial.color}-500`}
                ></div>
                <div
                  className={`absolute top-0 right-0 h-20 w-20 -translate-y-10 translate-x-10 rounded-full bg-${testimonial.color}-500/10 blur-3xl`}
                ></div>

                <div className="mb-6 text-xl italic text-muted-foreground">
                  &ldquo;{testimonial.quote}&rdquo;
                </div>

                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full bg-${testimonial.color}-500/10 text-${testimonial.color}-500`}
                  >
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary/80 via-blue-500/80 to-purple-500/80 py-24 text-white">
        {/* Enhanced background elements */}
        <div className="absolute inset-0 bg-grid-white/10 bg-[length:20px_20px] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-purple-500 opacity-90"></div>

        {/* Light color pattern gradient overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2)_0%,transparent_50%)]"></div>
          <div className="absolute top-0 right-0 h-full w-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15)_0%,transparent_50%)]"></div>
          <div className="absolute bottom-0 left-0 h-full w-full bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 h-full w-full bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05)_0%,transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:20px_20px]"></div>
        </div>

        {/* Animated decorative elements */}
        <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-white/5 blur-3xl animate-pulse-slow"></div>
        <div
          className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-white/5 blur-3xl animate-pulse-slow"
          style={{ animationDelay: "1.5s" }}
        ></div>
        <div
          className="absolute top-1/2 right-10 h-40 w-40 -translate-y-1/2 rounded-full bg-white/5 blur-2xl animate-pulse-slow"
          style={{ animationDelay: "0.7s" }}
        ></div>

        {/* Decorative shapes */}
        <div className="absolute top-10 left-10 h-20 w-20 rounded-full border border-white/20 opacity-50"></div>
        <div className="absolute bottom-10 right-10 h-16 w-16 rounded-full border border-white/20 opacity-50"></div>
        <div className="absolute top-1/2 left-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 opacity-30"></div>

        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          >
            <motion.div
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm font-medium"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Sparkles size={16} className="text-white" />
              AI-Powered Recruitment
            </motion.div>

            <h2 className="mb-6 text-3xl font-bold sm:text-4xl md:text-5xl">
              Ready to Transform Your Hiring Process?
            </h2>
            <p className="mb-10 text-lg text-white/90 max-w-2xl mx-auto">
              Join thousands of companies using Hirelytics to find the perfect
              candidates faster and more efficiently.
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/login">
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2 bg-white text-primary hover:bg-white hover:shadow-lg hover:shadow-white/20 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Zap size={18} className="text-primary" />
                  <span className="font-medium">Get Started</span>
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-white text-white hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Search size={18} />
                  <span>Learn More</span>
                  <ChevronRight
                    size={16}
                    className="ml-1 transition-transform group-hover:translate-x-1"
                  />
                </Button>
              </Link>
            </div>

            <motion.p
              className="mt-8 text-sm text-white/70"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              No credit card required • Free trial available
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-card py-16 relative overflow-hidden">
        {/* Background patterns */}
        <div className="absolute inset-0 z-0 opacity-5">
          <div className="absolute top-0 right-0 h-[300px] w-[300px] rounded-full bg-primary/10 blur-[80px] animate-pulse-slow"></div>
          <div
            className="absolute bottom-0 left-0 h-[250px] w-[250px] rounded-full bg-primary/10 blur-[80px] animate-pulse-slow"
            style={{ animationDelay: "2s" }}
          ></div>
          <div className="h-full w-full bg-[url('/patterns/dots.svg')] bg-repeat opacity-10"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-12 flex flex-col items-center justify-center text-center">
            <div className="mb-6 flex items-center justify-center">
              <div className="mr-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="text-primary" size={20} />
              </div>
              <h2 className="text-2xl font-bold">Hirelytics</h2>
            </div>
            <p className="max-w-md text-center text-muted-foreground">
              AI-powered recruitment platform that transforms hiring through
              intelligent matching, automated interviews, and data-driven
              insights.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-semibold">Platform</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#features"
                    className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                  >
                    <span>Features</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="#how-it-works"
                    className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                  >
                    <span>How It Works</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/learn-more"
                    className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                  >
                    <span>Learn More</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/wishlist"
                    className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                  >
                    <span>Wishlist</span>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold">For Recruiters</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/login?type=recruiter"
                    className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                  >
                    <span>Recruiter Login</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register?type=recruiter"
                    className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                  >
                    <span>Register as Recruiter</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/learn-more"
                    className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                  >
                    <span>Learn More</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                  >
                    <span>Dashboard</span>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold">For Candidates</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/jobs"
                    className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                  >
                    <span>Find Jobs</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login?type=candidate"
                    className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                  >
                    <span>Candidate Login</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register?type=candidate"
                    className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                  >
                    <span>Register as Candidate</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/wishlist"
                    className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                  >
                    <span>My Wishlist</span>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold">Company</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                  >
                    <span>About Us</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                  >
                    <span>Contact</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                  >
                    <span>Privacy Policy</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                  >
                    <span>Terms of Service</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t pt-8 text-center">
            <div className="mb-4 flex justify-center space-x-6">
              <Link
                href="#"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect width="4" height="12" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Hirelytics. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
