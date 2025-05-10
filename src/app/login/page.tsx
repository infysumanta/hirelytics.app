"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { AnimatedAuthCard } from "@/components/ui/auth-card";

// Animation variants for staggered children
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
      staggerChildren: 0.1,
    },
  },
};

export default function LoginPage() {
  const t = useTranslations("Auth");

  return (
    <AnimatedBackground patternColor="primary" colorScheme="indigo">
      <div className="w-full max-w-md px-4">
        <AnimatedAuthCard
          title={t("login")}
          description={t("chooseRole")}
          colorScheme="indigo"
          contentClassName="flex flex-col space-y-4"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn} className="mb-4">
              <Link href="/login/recruiter" className="w-full">
                <Button variant="default" className="w-full">
                  {t("loginAs.recruiter")}
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={fadeIn} className="mb-4">
              <Link href="/login/candidate" className="w-full">
                <Button variant="outline" className="w-full">
                  {t("loginAs.candidate")}
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={fadeIn} className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {t("noAccount")}
                </span>
              </div>
            </motion.div>

            <motion.div variants={fadeIn} className="mb-4">
              <Link href="/register/recruiter" className="w-full">
                <Button variant="outline" className="w-full">
                  {t("registerAs.recruiter")}
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={fadeIn}>
              <Link href="/register/candidate" className="w-full">
                <Button variant="outline" className="w-full">
                  {t("registerAs.candidate")}
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </AnimatedAuthCard>
      </div>
    </AnimatedBackground>
  );
}
