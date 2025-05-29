'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  Briefcase as BriefcaseIcon,
  Building2,
  ChevronRight,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Heart,
  LineChart,
  Link as LinkIcon,
  MessageSquareText,
  Search,
  Sparkles,
  Upload,
  User as UserIcon,
  Users,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { AnimatedBackground } from '@/components/ui/animated-background';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/ui/footer';

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
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    transition: { duration: 0.3 },
  },
};

export default function Home() {
  const t = useTranslations('HomePage');
  const common = useTranslations('Common');

  return (
    <div className="flex min-h-screen flex-col items-center">
      {/* Logo */}

      {/* Hero Section */}
      <AnimatedBackground colorScheme="indigo" patternOpacity={0.2} className="py-5 md:py-5">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-blue-600/30 dark:bg-blue-500/30 blur-[120px] animate-pulse-slow"></div>
          <div
            className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-purple-600/30 dark:bg-purple-500/30 blur-[120px] animate-pulse-slow"
            style={{ animationDelay: '2s' }}
          ></div>
          <div
            className="absolute top-1/2 right-1/4 h-[300px] w-[300px] rounded-full bg-indigo-600/30 dark:bg-indigo-500/30 blur-[100px] animate-pulse-slow"
            style={{ animationDelay: '1s' }}
          ></div>
          <div
            className="absolute top-1/3 left-1/4 h-[250px] w-[250px] rounded-full bg-cyan-600/30 dark:bg-cyan-500/30 blur-[90px] animate-pulse-slow"
            style={{ animationDelay: '3s' }}
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
              style={{ animationDelay: '1s' }}
            ></div>
            <div
              className="absolute inset-0 rounded-full border border-primary/20 animate-float"
              style={{ animationDelay: '2s' }}
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
            {t('hero.aiPoweredRecruitment')}
          </motion.div>
          <motion.div variants={fadeIn} className="mb-8">
            <Image
              width={650}
              height={200}
              src="/images/hirelytics-full-logo.svg"
              alt="Hirelytics"
              className="h-20 md:h-24 w-auto max-w-full dark:invert-[0.15] dark:brightness-110 mb-6"
              priority
            />
          </motion.div>

          <motion.h1
            className="mb-6 text-center text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
            variants={fadeIn}
          >
            <span>{t('hero.revolutionizeHiring')} </span>
            <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent animate-gradient">
              {t('title')}
            </span>
          </motion.h1>

          <motion.p
            className="mb-8 max-w-2xl text-center text-lg text-muted-foreground"
            variants={fadeIn}
          >
            {t('hero.description')}
          </motion.p>

          <motion.div className="flex flex-wrap justify-center gap-4" variants={fadeIn}>
            <Link href="/login">
              <Button size="lg" className="gap-2 group relative overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <Zap size={18} className="relative z-10" />
                <span className="relative z-10">{common('buttons.getStarted')}</span>
              </Button>
            </Link>
            <Link href="/jobs">
              <Button size="lg" variant="outline" className="gap-2 group relative overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <BriefcaseIcon size={18} className="relative z-10" />
                <span className="relative z-10">{t('userAccess.findJobs')}</span>
              </Button>
            </Link>
            <Link href="/learn-more">
              <Button size="lg" variant="outline" className="gap-2 group">
                <Search size={18} />
                <span>{common('buttons.howItWorks')}</span>
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
              <Link href="/login/candidate" className="group transition-all hover:text-primary">
                <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium backdrop-blur-sm hover:border-primary/30 hover:bg-primary/5">
                  <UserIcon size={14} />
                  {t('userAccess.candidateLogin')}
                  <ChevronRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </div>
              </Link>
              <Link href="/login/recruiter" className="group transition-all hover:text-primary">
                <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium backdrop-blur-sm hover:border-primary/30 hover:bg-primary/5">
                  <Building2 size={14} />
                  {t('userAccess.recruiterLogin')}
                  <ChevronRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </div>
              </Link>
              <Link href="/wishlist" className="group transition-all hover:text-primary">
                <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium backdrop-blur-sm hover:border-primary/30 hover:bg-primary/5">
                  <Heart size={14} />
                  {t('userAccess.wishlist')}
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
            style={{ animationDelay: '2s' }}
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
                {t('featuresSection.title')}
              </div>
            </div>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">{t('featuresSection.subtitle')}</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              {t('featuresSection.description')}
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
                title: t('featuresSection.smartJobPosting.title'),
                description: t('featuresSection.smartJobPosting.description'),
                color: 'blue',
              },
              {
                icon: <LinkIcon className="text-indigo-500" />,
                title: t('featuresSection.uniqueApplicationLinks.title'),
                description: t('featuresSection.uniqueApplicationLinks.description'),
                color: 'indigo',
              },
              {
                icon: <Upload className="text-purple-500" />,
                title: t('featuresSection.resumeAnalysis.title'),
                description: t('featuresSection.resumeAnalysis.description'),
                color: 'purple',
              },
              {
                icon: <MessageSquareText className="text-pink-500" />,
                title: t('featuresSection.aiPoweredInterviews.title'),
                description: t('featuresSection.aiPoweredInterviews.description'),
                color: 'pink',
              },
              {
                icon: <ClipboardCheck className="text-green-500" />,
                title: t('featuresSection.comprehensiveFeedback.title'),
                description: t('featuresSection.comprehensiveFeedback.description'),
                color: 'green',
              },
              {
                icon: <LineChart className="text-orange-500" />,
                title: t('featuresSection.dataDrivenInsights.title'),
                description: t('featuresSection.dataDrivenInsights.description'),
                color: 'orange',
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
                <div className={`mb-4 rounded-full bg-${feature.color}-500/10 p-3 w-fit`}>
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
            style={{ animationDelay: '3s' }}
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
                {t('howItWorks.title')}
              </div>
            </div>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">{t('howItWorks.subtitle')}</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">{t('howItWorks.description')}</p>
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
                    <h3 className="text-xl font-semibold">{t('howItWorks.steps.step1.title')}</h3>
                  </div>
                  <p className="text-muted-foreground">{t('howItWorks.steps.step1.description')}</p>
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
                        {t('howItWorks.steps.step1.label')}
                      </div>
                      <Building2 className="text-blue-500" size={20} />
                    </div>
                    <h4 className="mb-2 font-medium">{t('howItWorks.steps.step1.cardTitle')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('howItWorks.steps.step1.cardDescription')}
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
                    <h3 className="text-xl font-semibold">{t('howItWorks.steps.step2.title')}</h3>
                  </div>
                  <p className="text-muted-foreground">{t('howItWorks.steps.step2.description')}</p>
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
                        {t('howItWorks.steps.step2.label')}
                      </div>
                      <LinkIcon className="text-indigo-500" size={20} />
                    </div>
                    <h4 className="mb-2 font-medium">{t('howItWorks.steps.step2.cardTitle')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('howItWorks.steps.step2.cardDescription')}
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
                    <h3 className="text-xl font-semibold">{t('howItWorks.steps.step3.title')}</h3>
                  </div>
                  <p className="text-muted-foreground">{t('howItWorks.steps.step3.description')}</p>
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
                        {t('howItWorks.steps.step3.label')}
                      </div>
                      <GraduationCap className="text-purple-500" size={20} />
                    </div>
                    <h4 className="mb-2 font-medium">{t('howItWorks.steps.step3.cardTitle')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('howItWorks.steps.step3.cardDescription')}
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
                    <h3 className="text-xl font-semibold">{t('howItWorks.steps.step4.title')}</h3>
                  </div>
                  <p className="text-muted-foreground">{t('howItWorks.steps.step4.description')}</p>
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
                        {t('howItWorks.steps.step4.label')}
                      </div>
                      <Upload className="text-pink-500" size={20} />
                    </div>
                    <h4 className="mb-2 font-medium">{t('howItWorks.steps.step4.cardTitle')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('howItWorks.steps.step4.cardDescription')}
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
                    <h3 className="text-xl font-semibold">{t('howItWorks.steps.step5.title')}</h3>
                  </div>
                  <p className="text-muted-foreground">{t('howItWorks.steps.step5.description')}</p>
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
                        {t('howItWorks.steps.step5.label')}
                      </div>
                      <MessageSquareText className="text-blue-600" size={20} />
                    </div>
                    <h4 className="mb-2 font-medium">{t('howItWorks.steps.step5.cardTitle')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('howItWorks.steps.step5.cardDescription')}
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
                    <h3 className="text-xl font-semibold">{t('howItWorks.steps.step6.title')}</h3>
                  </div>
                  <p className="text-muted-foreground">{t('howItWorks.steps.step6.description')}</p>
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
                        {t('howItWorks.steps.step6.label')}
                      </div>
                      <ClipboardCheck className="text-green-500" size={20} />
                    </div>
                    <h4 className="mb-2 font-medium">{t('howItWorks.steps.step6.cardTitle')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('howItWorks.steps.step6.cardDescription')}
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
                {t('howItWorks.getStarted')}
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
            style={{ animationDelay: '2.5s' }}
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
              {' '}
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <Users size={16} />
                {t('testimonials.title')}
              </div>
            </div>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">{t('testimonials.subtitle')}</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              {t('testimonials.description')}
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
                  'Hirelytics has revolutionized our recruitment process. We&apos;ve reduced our time-to-hire by 40% and found better quality candidates.',
                name: 'Sarah Johnson',
                role: 'HR Director',
                company: 'TechCorp',
                color: 'blue',
              },
              {
                quote:
                  'The AI interview process is remarkably effective. It asks relevant questions and provides detailed feedback that helps us make better hiring decisions.',
                name: 'David Rodriguez',
                role: 'Talent Acquisition Manager',
                company: 'InnovateX',
                color: 'purple',
              },
              {
                quote:
                  'As a candidate, I love how the platform matched me with jobs that truly aligned with my skills and career goals. The AI interview was surprisingly conversational.',
                name: 'Michael Chen',
                role: 'Software Engineer',
                company: 'Hired via Hirelytics',
                color: 'green',
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
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 dark:from-slate-800/90 dark:via-slate-900/90 dark:to-slate-800/90 py-24 mb-24 text-white">
        {/* Enhanced background elements */}
        <div className="absolute inset-0 bg-grid-white/5 dark:bg-grid-white/3 bg-[length:20px_20px] opacity-3"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-blue-500/15 to-purple-500/15 dark:from-primary/30 dark:via-blue-500/20 dark:to-purple-500/20 opacity-30"></div>

        {/* Light color pattern gradient overlay */}
        <div className="absolute inset-0 opacity-3">
          <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.03)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.05)_0%,transparent_50%)]"></div>
          <div className="absolute top-0 right-0 h-full w-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.02)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.04)_0%,transparent_50%)]"></div>
          <div className="absolute bottom-0 left-0 h-full w-full bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.02)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.03)_0%,transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 h-full w-full bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.01)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.02)_0%,transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.01)_50%,transparent_75%)] bg-[length:20px_20px]"></div>
        </div>

        {/* Animated decorative elements */}
        <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-white/1 dark:bg-white/2 blur-3xl animate-pulse-slow"></div>
        <div
          className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-white/1 dark:bg-white/2 blur-3xl animate-pulse-slow"
          style={{ animationDelay: '1.5s' }}
        ></div>
        <div
          className="absolute top-1/2 right-10 h-40 w-40 -translate-y-1/2 rounded-full bg-white/1 dark:bg-white/2 blur-2xl animate-pulse-slow"
          style={{ animationDelay: '0.7s' }}
        ></div>

        {/* Decorative shapes */}
        <div className="absolute top-10 left-10 h-20 w-20 rounded-full border border-white/2 dark:border-white/3 opacity-10 dark:opacity-20"></div>
        <div className="absolute bottom-10 right-10 h-16 w-16 rounded-full border border-white/2 dark:border-white/3 opacity-10 dark:opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/1 dark:border-white/2 opacity-5 dark:opacity-10"></div>

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
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          >
            <motion.div
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/5 dark:bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm font-medium"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Sparkles size={16} className="text-white" />
              {t('footer.cta.title')}
            </motion.div>

            <h2 className="mb-6 text-3xl font-bold sm:text-4xl md:text-5xl">
              {t('footer.cta.heading')}
            </h2>
            <p className="mb-10 text-lg text-white/90 max-w-2xl mx-auto">
              {t('footer.cta.description')}
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-primary via-blue-500 to-purple-500 px-8 py-3 text-sm font-medium text-white shadow hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 transform hover:-translate-y-1"
              >
                <Sparkles size={16} className="relative z-10" />
                <span className="relative z-10">{common('buttons.getStarted')}</span>
              </Link>
              <Link href="#how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-white/90 text-white hover:border-white hover:bg-white/10 dark:border-white/80 dark:hover:border-white dark:hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Search size={18} />
                  <span>{t('footer.cta.learnMore')}</span>
                  <ChevronRight
                    size={16}
                    className="ml-1 transition-transform group-hover:translate-x-1"
                  />
                </Button>
              </Link>
            </div>

            <motion.p
              className="mt-8 text-sm text-white/60 dark:text-white/70"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              {t('footer.cta.noCreditCard')}
            </motion.p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
