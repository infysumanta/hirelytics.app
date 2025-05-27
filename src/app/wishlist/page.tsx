"use client";

import { AnimatedBackground } from "@/components/ui/animated-background";
import { AnimatedAuthCard } from "@/components/ui/auth-card";
import { WishlistForm } from "@/components/auth/wishlist-form";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

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

export default function WishlistPage() {
  const t = useTranslations("Wishlist");

  return (
    <AnimatedBackground patternColor="primary" colorScheme="indigo">
      <div className="w-full max-w-md px-4">
        <AnimatedAuthCard
          title={t("title")}
          description={t("description")}
          colorScheme="indigo"
          contentClassName="flex flex-col space-y-4"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn}>
              <WishlistForm />
            </motion.div>
          </motion.div>
        </AnimatedAuthCard>
      </div>
    </AnimatedBackground>
  );
}
