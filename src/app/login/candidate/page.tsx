"use client";

import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { motion } from "framer-motion";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { AnimatedAuthCard } from "@/components/ui/auth-card";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export default function CandidateLoginPage() {
  // Create footer content with animations
  const footerContent = (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-muted-foreground text-center"
      >
        Don't have an account?{" "}
        <Link
          href="/register/candidate"
          className="text-primary underline underline-offset-4 hover:text-primary/90"
        >
          Register as a candidate
        </Link>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-muted-foreground text-center"
      >
        Not a candidate? Login as a{" "}
        <Link
          href="/login/recruiter"
          className="text-primary underline underline-offset-4 hover:text-primary/90"
        >
          recruiter
        </Link>
      </motion.div>
    </>
  );

  return (
    <AnimatedBackground patternColor="primary" colorScheme="blue">
      <div className="w-full max-w-md px-4">
        <AnimatedAuthCard
          title="Candidate Login"
          description="Enter your credentials to access your candidate dashboard"
          colorScheme="blue"
          footer={footerContent}
        >
          <LoginForm role="candidate" />
        </AnimatedAuthCard>
      </div>
    </AnimatedBackground>
  );
}
