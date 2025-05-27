"use client";

import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { motion } from "framer-motion";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { AnimatedAuthCard } from "@/components/ui/auth-card";
import { config } from "@/lib/config";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function CandidateRegisterPage() {
  const t = useTranslations("Auth");
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
            title={t("redirecting")}
            description={t("redirectingToWaitlist")}
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
        {t("hasAccount")}{" "}
        <Link
          href="/login/candidate"
          className="text-primary underline underline-offset-4 hover:text-primary/90"
        >
          {t("loginAs.candidate")}
        </Link>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-muted-foreground text-center"
      >
        {t("notCandidate")}{" "}
        <Link
          href="/register/recruiter"
          className="text-primary underline underline-offset-4 hover:text-primary/90"
        >
          {t("registerAs.recruiter")}
        </Link>
      </motion.div>
    </>
  );

  return (
    <AnimatedBackground patternColor="primary" colorScheme="blue">
      <div className="w-full max-w-md px-4">
        <AnimatedAuthCard
          title={t("candidateRegistration.title")}
          description={t("candidateRegistration.description")}
          colorScheme="blue"
          footer={footerContent}
        >
          <RegisterForm role="candidate" />
        </AnimatedAuthCard>
      </div>
    </AnimatedBackground>
  );
}
