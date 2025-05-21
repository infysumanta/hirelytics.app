"use client";

import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { motion } from "framer-motion";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { AnimatedAuthCard } from "@/components/ui/auth-card";
import { config } from "@/lib/config";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CandidateRegisterPage() {
  const registrationEnabled = config.registrationEnabled;
  const router = useRouter();

  // If registration is disabled, redirect directly to the wishlist page
  useEffect(() => {
    if (!registrationEnabled) {
      router.push("/wishlist");
    }
  }, [registrationEnabled, router]);

  // If registration is disabled, show loading state while redirecting
  if (!registrationEnabled) {
    return (
      <AnimatedBackground patternColor="primary" colorScheme="indigo">
        <div className="w-full max-w-md px-4">
          <AnimatedAuthCard
            title="Redirecting..."
            description="Please wait while we redirect you to the waitlist page."
            colorScheme="indigo"
            contentClassName="flex flex-col space-y-4 items-center justify-center"
          >
            <div className="py-4">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          </AnimatedAuthCard>
        </div>
      </AnimatedBackground>
    );
  }
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
          href="/login/candidate"
          className="text-primary underline underline-offset-4 hover:text-primary/90"
        >
          Login as a candidate
        </Link>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-muted-foreground text-center"
      >
        Are you a recruiter?{" "}
        <Link
          href="/register/recruiter"
          className="text-primary underline underline-offset-4 hover:text-primary/90"
        >
          Register as a recruiter
        </Link>
      </motion.div>
    </>
  );

  return (
    <AnimatedBackground patternColor="primary" colorScheme="blue">
      <div className="w-full max-w-md px-4">
        <AnimatedAuthCard
          title="Candidate Registration"
          description="Create a candidate account to find job opportunities"
          colorScheme="blue"
          footer={footerContent}
        >
          <RegisterForm role="candidate" />
        </AnimatedAuthCard>
      </div>
    </AnimatedBackground>
  );
}
