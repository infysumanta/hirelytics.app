"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Sparkles,
  Zap,
  Lightbulb,
  BookOpen,
  Rocket,
  Trophy,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
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

export default function LearnMorePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section with Gradient Background */}
      <section className="relative py-20 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-blue-600/30 dark:bg-blue-500/30 blur-[120px] animate-pulse-slow"></div>
          <div
            className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-purple-600/30 dark:bg-purple-500/30 blur-[120px] animate-pulse-slow"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        {/* Back button and content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-12">
            <Link href="/">
              <Button
                variant="ghost"
                className="group mb-8 hover:bg-transparent p-0"
              >
                <ArrowLeft
                  size={18}
                  className="mr-2 group-hover:-translate-x-1 transition-transform"
                />
                Back to Home
              </Button>
            </Link>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="max-w-4xl"
            >
              <motion.div
                variants={fadeIn}
                className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-4 text-sm font-medium text-primary"
              >
                <BookOpen size={16} />
                Discover Hirelytics
              </motion.div>

              <motion.h1
                variants={fadeIn}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              >
                Learn More About{" "}
                <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent animate-gradient">
                  Hirelytics
                </span>
              </motion.h1>

              <motion.p
                variants={fadeIn}
                className="text-xl text-muted-foreground mb-8 max-w-3xl"
              >
                Discover how our AI-powered recruitment platform is transforming
                the hiring process, making it more efficient, fair, and
                effective for both recruiters and candidates.
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-secondary/10 relative">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="h-full w-full bg-[url('/patterns/dots.svg')] bg-repeat opacity-20"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-4 text-sm font-medium text-primary">
                <Lightbulb size={16} />
                Our Mission
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Transforming Recruitment Through AI
              </h2>

              <p className="text-lg mb-6 text-muted-foreground">
                At Hirelytics, we believe that recruiting should be more than
                just scanning resumes. Our mission is to leverage artificial
                intelligence to create meaningful connections between
                exceptional talent and forward-thinking organizations.
              </p>

              <p className="text-lg text-muted-foreground">
                We&apos;re dedicated to removing bias from the hiring process,
                providing data-driven insights for better decision-making, and
                creating a seamless experience for both recruiters and
                candidates.
              </p>
            </motion.div>

            <motion.div
              className="rounded-xl bg-gradient-to-br from-blue-500/20 via-primary/20 to-purple-500/20 p-1"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-card rounded-lg p-8 h-full">
                <h3 className="text-2xl font-bold mb-6 flex items-center">
                  <Sparkles className="text-primary mr-2" size={24} />
                  Key Objectives
                </h3>

                <ul className="space-y-4">
                  {[
                    "Eliminate bias in the recruitment process",
                    "Reduce time-to-hire by 60%",
                    "Match candidates based on skills, not just keywords",
                    "Provide actionable insights for both employers and job seekers",
                    "Create a more engaging application experience",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <Check
                        className="text-primary shrink-0 mr-2 mt-1"
                        size={20}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Platform Benefits Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 right-0 h-[300px] w-[300px] rounded-full bg-blue-600/10 dark:bg-blue-500/10 blur-[100px] animate-pulse-slow"></div>
          <div
            className="absolute bottom-1/4 left-0 h-[250px] w-[250px] rounded-full bg-purple-600/10 dark:bg-purple-500/10 blur-[100px] animate-pulse-slow"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-4 text-sm font-medium text-primary">
              <Rocket size={16} />
              Platform Benefits
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Why Choose Hirelytics?
            </h2>

            <p className="text-lg text-muted-foreground">
              Our platform offers unique advantages for both recruiters and
              candidates, making the entire hiring process more efficient and
              effective.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "For Recruiters",
                icon: <Zap className="text-blue-500" size={24} />,
                benefits: [
                  "Automated preliminary candidate screening",
                  "AI-driven interview questions based on job requirements",
                  "Comprehensive candidate assessment reports",
                  "Bias reduction through objective skill evaluation",
                  "Analytics dashboard for hiring process optimization",
                  "Customizable job posting templates",
                ],
                gradient: "from-blue-500/20 via-blue-400/20 to-blue-300/20",
                iconBg: "bg-blue-500/10",
                border: "border-blue-500/20",
              },
              {
                title: "For Candidates",
                icon: <Trophy className="text-purple-500" size={24} />,
                benefits: [
                  "Flexible, on-demand interview scheduling",
                  "Personalized feedback on interview performance",
                  "Skills-based matching to relevant positions",
                  "Elimination of unconscious bias in screening",
                  "Opportunity to showcase strengths beyond the resume",
                  "Streamlined application process",
                ],
                gradient:
                  "from-purple-500/20 via-purple-400/20 to-purple-300/20",
                iconBg: "bg-purple-500/10",
                border: "border-purple-500/20",
              },
              {
                title: "Platform Features",
                icon: <Sparkles className="text-primary" size={24} />,
                benefits: [
                  "Advanced natural language processing",
                  "Multi-language support for global hiring",
                  "Seamless integration with existing HR systems",
                  "GDPR and privacy compliance built-in",
                  "Continuous learning from feedback loops",
                  "Regular feature updates based on user needs",
                ],
                gradient: "from-primary/20 via-primary/15 to-primary/10",
                iconBg: "bg-primary/10",
                border: "border-primary/20",
              },
            ].map((column, i) => (
              <motion.div
                key={i}
                className={`rounded-xl bg-gradient-to-br ${column.gradient} p-1 h-full`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="bg-card rounded-lg p-8 h-full">
                  <div
                    className={`${column.iconBg} rounded-full w-12 h-12 flex items-center justify-center mb-6`}
                  >
                    {column.icon}
                  </div>

                  <h3 className="text-2xl font-bold mb-6">{column.title}</h3>

                  <ul className="space-y-3">
                    {column.benefits.map((benefit, j) => (
                      <li key={j} className="flex items-start">
                        <Check
                          className="text-primary shrink-0 mr-2 mt-1"
                          size={18}
                        />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 bg-gradient-to-b from-background via-secondary/10 to-background relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="h-full w-full bg-[url('/patterns/circuit.svg')] bg-repeat opacity-5"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-4 text-sm font-medium text-primary">
              <Zap size={16} />
              Technology
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Powered by Advanced AI
            </h2>

            <p className="text-lg text-muted-foreground mb-8">
              Hirelytics leverages cutting-edge artificial intelligence, machine
              learning, and natural language processing technologies to
              transform how organizations approach hiring.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mt-10">
              {[
                {
                  title: "Natural Language Processing",
                  description:
                    "Our AI understands context, nuance, and sentiment in candidate responses, providing deeper insights than keyword matching alone.",
                },
                {
                  title: "Machine Learning Algorithms",
                  description:
                    "Our systems continuously improve through feedback loops, becoming more accurate at predicting candidate-job fit over time.",
                },
                {
                  title: "Computer Vision",
                  description:
                    "Advanced document parsing extracts and structures information from resumes and portfolios with high accuracy.",
                },
                {
                  title: "Conversational AI",
                  description:
                    "Dynamic interview system adjusts questions based on previous answers, creating a more natural and informative conversation.",
                },
              ].map((tech, i) => (
                <motion.div
                  key={i}
                  className="border border-border rounded-xl p-6 bg-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <h3 className="text-xl font-bold mb-3">{tech.title}</h3>
                  <p className="text-muted-foreground">{tech.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 relative overflow-hidden">
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
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-4 text-sm font-medium text-primary">
              <Lightbulb size={16} />
              Common Questions
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Frequently Asked Questions
            </h2>

            <p className="text-lg text-muted-foreground">
              Get answers to common questions about Hirelytics and how it can
              transform your recruitment process.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto grid gap-6">
            {[
              {
                question:
                  "How does Hirelytics ensure fairness in the hiring process?",
                answer:
                  "Hirelytics reduces bias through structured evaluations that focus on skills and competencies rather than demographic factors. Our AI models are regularly audited for fairness and trained on diverse datasets to ensure they don't perpetuate existing biases.",
              },
              {
                question:
                  "Can Hirelytics integrate with our existing HR systems?",
                answer:
                  "Yes, Hirelytics offers API integrations with major HR information systems, applicant tracking systems, and job boards. Our team can provide custom integration solutions for enterprise clients with specific requirements.",
              },
              {
                question: "How secure is candidate data on the platform?",
                answer:
                  "Hirelytics employs bank-level encryption for data both in transit and at rest. We are fully GDPR compliant and follow SOC 2 security practices, with regular penetration testing and security audits.",
              },
              {
                question:
                  "What makes Hirelytics different from traditional ATS systems?",
                answer:
                  "Unlike traditional ATS systems that simply track applications, Hirelytics actively evaluates candidates through AI interviews, provides data-driven insights, and offers a more engaging experience for both recruiters and candidates.",
              },
              {
                question:
                  "How long does it take to set up Hirelytics for my company?",
                answer:
                  "Most companies can get started with Hirelytics in less than a day. Our onboarding team provides comprehensive support, including template creation, system integration, and training for your recruitment team.",
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                className="border border-border rounded-xl p-6 bg-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <h3 className="text-xl font-bold mb-3">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/80 via-blue-500/80 to-purple-500/80 text-white relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-grid-white/10 bg-[length:20px_20px] opacity-10"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2)_0%,transparent_50%)]"></div>
          <div className="absolute top-0 right-0 h-full w-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15)_0%,transparent_50%)]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm font-medium">
              <Sparkles size={16} className="text-white" />
              Ready to Get Started?
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Transform Your Recruitment Process Today
            </h2>

            <p className="text-lg text-white/90 mb-10">
              Join thousands of companies using Hirelytics to find the perfect
              candidates faster, more efficiently, and with better results.
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
              <Link href="/">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-white text-white hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <ArrowLeft size={18} />
                  <span>Back to Home</span>
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
