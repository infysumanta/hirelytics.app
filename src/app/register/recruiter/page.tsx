'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { RegisterForm } from '@/components/auth/register-form';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { AnimatedAuthCard } from '@/components/ui/auth-card';
import { config } from '@/lib/config';

export default function RecruiterRegisterPage() {
  const t = useTranslations('Auth');
  const registrationEnabled = config.registrationEnabled;
  const router = useRouter();

  // If registration is disabled, redirect directly to the wishlist page
  useEffect(() => {
    if (!registrationEnabled) {
      router.push('/wishlist');
    }
  }, [registrationEnabled, router]);

  // If registration is disabled, show loading state while redirecting
  if (!registrationEnabled) {
    return (
      <AnimatedBackground patternColor="primary" colorScheme="indigo">
        <div className="w-full max-w-md px-4">
          <AnimatedAuthCard
            title={t('redirecting')}
            description={t('redirectingToWaitlist')}
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
        {t('hasAccount')}{' '}
        <Link
          href="/login/recruiter"
          className="text-primary underline underline-offset-4 hover:text-primary/90"
        >
          {t('loginAs.recruiter')}
        </Link>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-muted-foreground text-center"
      >
        {t('notRecruiter')}{' '}
        <Link
          href="/register/candidate"
          className="text-primary underline underline-offset-4 hover:text-primary/90"
        >
          {t('registerAs.candidate')}
        </Link>
      </motion.div>
    </>
  );

  return (
    <AnimatedBackground patternColor="primary" colorScheme="purple">
      <div className="w-full max-w-md px-4">
        <AnimatedAuthCard
          title={t('recruiterRegistration.title')}
          description={t('recruiterRegistration.description')}
          colorScheme="purple"
          footer={footerContent}
        >
          <RegisterForm role="recruiter" />
        </AnimatedAuthCard>
      </div>
    </AnimatedBackground>
  );
}
