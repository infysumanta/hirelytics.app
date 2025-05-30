'use client';

import { motion } from 'framer-motion';
import { Building2, GraduationCap } from 'lucide-react';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-4">Product Demonstrations</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience Hirelytics in action. Watch our demos to see how we revolutionize the hiring
            process for both candidates and recruiters.
          </p>
        </motion.div>

        {/* Demo Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Candidate Demo */}
          <motion.div
            className="relative group"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
          >
            <div className="relative rounded-xl overflow-hidden border bg-card shadow-lg">
              <div className="aspect-video w-full relative">
                <iframe
                  src="https://www.youtube.com/embed/OtJV9SCyfuE?modestbranding=1&rel=0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold">Candidate Demo</h2>
                </div>
                <p className="text-muted-foreground">
                  See how candidates can effortlessly navigate through our AI-powered interview
                  process, submit applications, and track their progress.
                </p>
              </div>
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/10 group-hover:ring-primary/20 transition-all duration-300"></div>
            </div>
          </motion.div>

          {/* Recruiter Demo */}
          <motion.div
            className="relative group"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.4 }}
          >
            <div className="relative rounded-xl overflow-hidden border bg-card shadow-lg">
              <div className="aspect-video w-full relative">
                <iframe
                  src="https://www.youtube.com/embed/OtJV9SCyfuE?modestbranding=1&rel=0&start=180"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold">Recruiter Demo</h2>
                </div>
                <p className="text-muted-foreground">
                  Discover how recruiters can streamline their hiring process, manage applications,
                  and leverage AI insights for better decision-making.
                </p>
              </div>
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/10 group-hover:ring-primary/20 transition-all duration-300"></div>
            </div>
          </motion.div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 h-[350px] w-[350px] rounded-full bg-purple-600/10 dark:bg-purple-500/10 blur-[120px] animate-pulse-slow"></div>
          <div
            className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-blue-600/10 dark:bg-blue-500/10 blur-[120px] animate-pulse-slow"
            style={{ animationDelay: '2.5s' }}
          ></div>
          <div className="h-full w-full bg-[url('/patterns/waves.svg')] bg-repeat opacity-5"></div>
        </div>
      </div>
    </div>
  );
}
