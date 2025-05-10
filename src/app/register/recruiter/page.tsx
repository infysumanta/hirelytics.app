"use client";

import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { motion } from "framer-motion";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { AnimatedAuthCard } from "@/components/ui/auth-card";

export default function RecruiterRegisterPage() {
  // Create footer content with animations
  const footerContent = (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-muted-foreground text-center"
      >
        Already have an account?{" "}
        <Link
          href="/login/recruiter"
          className="text-primary underline underline-offset-4 hover:text-primary/90"
        >
          Login as a recruiter
        </Link>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-muted-foreground text-center"
      >
        Are you a candidate?{" "}
        <Link
          href="/register/candidate"
          className="text-primary underline underline-offset-4 hover:text-primary/90"
        >
          Register as a candidate
        </Link>
      </motion.div>
    </>
  );

  return (
    <AnimatedBackground patternColor="primary" colorScheme="purple">
      <div className="w-full max-w-md px-4">
        <AnimatedAuthCard
          title="Recruiter Registration"
          description="Create a recruiter account to post jobs and find candidates"
          colorScheme="purple"
          footer={footerContent}
        >
          <RegisterForm role="recruiter" />
        </AnimatedAuthCard>
      </div>
    </AnimatedBackground>
  );
}
