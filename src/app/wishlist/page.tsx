"use client";

import { AnimatedBackground } from "@/components/ui/animated-background";
import { AnimatedAuthCard } from "@/components/ui/auth-card";
import { WishlistForm } from "@/components/auth/wishlist-form";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

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
  return (
    <AnimatedBackground patternColor="primary" colorScheme="indigo">
      <div className="w-full max-w-md px-4">
        <AnimatedAuthCard
          title="Join Our Waitlist"
          description="We're currently not accepting registrations. Join our waitlist to be notified when registration reopens and we will remind you to register."
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
