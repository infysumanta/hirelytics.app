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
import Image from "next/image";
import { useTranslations } from "next-intl";
import React from "react";

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

interface FAQ {
  question: string;
  answer: string;
}

interface TechFeature {
  title: string;
  description: string;
}

interface BenefitColumn {
  title: string;
  icon: React.ReactNode;
  benefits: string[];
  gradient: string;
  iconBg: string;
  border: string;
}

export default function LearnMorePage() {
  const t = useTranslations("LearnMore");

  const keyObjectives = t.raw("mission.keyObjectives.items") as string[];
  const faqs = t.raw("faq.questions") as FAQ[];

  const benefitColumns: BenefitColumn[] = [
    {
      title: t("benefits.sections.recruiters.title"),
      icon: <Zap className="text-blue-500" size={24} />,
      benefits: t.raw("benefits.sections.recruiters.items") as string[],
      gradient: "from-blue-500/20 via-blue-400/20 to-blue-300/20",
      iconBg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      title: t("benefits.sections.candidates.title"),
      icon: <Trophy className="text-purple-500" size={24} />,
      benefits: t.raw("benefits.sections.candidates.items") as string[],
      gradient: "from-purple-500/20 via-purple-400/20 to-purple-300/20",
      iconBg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      title: t("benefits.sections.platform.title"),
      icon: <Sparkles className="text-primary" size={24} />,
      benefits: t.raw("benefits.sections.platform.items") as string[],
      gradient: "from-primary/20 via-primary/15 to-primary/10",
      iconBg: "bg-primary/10",
      border: "border-primary/20",
    },
  ];

  const techFeatures: TechFeature[] = [
    {
      title: t("technology.features.nlp.title"),
      description: t("technology.features.nlp.description"),
    },
    {
      title: t("technology.features.ml.title"),
      description: t("technology.features.ml.description"),
    },
    {
      title: t("technology.features.cv.title"),
      description: t("technology.features.cv.description"),
    },
    {
      title: t("technology.features.conversationalAi.title"),
      description: t("technology.features.conversationalAi.description"),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative py-10 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-blue-600/30 dark:bg-blue-500/30 blur-[120px] animate-pulse-slow"></div>
          <div
            className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-purple-600/30 dark:bg-purple-500/30 blur-[120px] animate-pulse-slow"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        {/* Back button and content */}
        <div className="container mx-auto relative z-10">
          {/* Logo */}
          <motion.div variants={fadeIn} className="mb-8">
            <Image
              height={200}
              width={650}
              src="/images/hirelytics-full-logo.svg"
              alt="Hirelytics"
              className="h-20 md:h-24 w-auto max-w-full dark:invert-[0.15] dark:brightness-110 mb-6"
              priority
            />
          </motion.div>
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
                {t("backToHome")}
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
                {t("discoverHirelytics")}
              </motion.div>

              <motion.h1
                variants={fadeIn}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              >
                {t("learnMoreTitle")}{" "}
                <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent animate-gradient">
                  Hirelytics
                </span>
              </motion.h1>

              <motion.p
                variants={fadeIn}
                className="text-xl text-muted-foreground mb-8 max-w-3xl"
              >
                {t("learnMoreDescription")}
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
                {t("mission.title")}
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t("mission.heading")}
              </h2>

              <p className="text-lg mb-6 text-muted-foreground">
                {t("mission.description1")}
              </p>

              <p className="text-lg text-muted-foreground">
                {t("mission.description2")}
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
                  {t("mission.keyObjectives.title")}
                </h3>

                <ul className="space-y-4">
                  {keyObjectives.map((item: string, i: number) => (
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
              {t("benefits.title")}
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t("benefits.heading")}
            </h2>

            <p className="text-lg text-muted-foreground">
              {t("benefits.description")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefitColumns.map((column: BenefitColumn, i: number) => (
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
                    {column.benefits.map((benefit: string, j: number) => (
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
              {t("technology.title")}
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t("technology.heading")}
            </h2>

            <p className="text-lg text-muted-foreground mb-8">
              {t("technology.description")}
            </p>

            <div className="grid md:grid-cols-2 gap-6 mt-10">
              {techFeatures.map((tech: TechFeature, i: number) => (
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
              {t("faq.title")}
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t("faq.heading")}
            </h2>

            <p className="text-lg text-muted-foreground">
              {t("faq.description")}
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto grid gap-6">
            {faqs.map((faq: FAQ, i: number) => (
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
              {t("cta.readyToStart")}
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t("cta.heading")}
            </h2>

            <p className="text-lg text-white/90 mb-10">
              {t("cta.description")}
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/login">
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2 bg-white text-primary hover:bg-white hover:shadow-lg hover:shadow-white/20 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Zap size={18} className="text-primary" />
                  <span className="font-medium">{t("cta.getStarted")}</span>
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
