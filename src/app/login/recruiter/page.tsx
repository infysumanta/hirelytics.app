'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { LoginForm } from '@/components/auth/login-form';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { AnimatedAuthCard } from '@/components/ui/auth-card';

export default function RecruiterLoginPage() {
  const t = useTranslations('Auth');

  // Create footer content with animations
  const footerContent = (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-muted-foreground text-center"
      >
        {t('noAccount')}{' '}
        <Link
          href="/register/recruiter"
          className="text-primary underline underline-offset-4 hover:text-primary/90"
        >
          {t('registerAs.recruiter')}
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
          href="/login/candidate"
          className="text-primary underline underline-offset-4 hover:text-primary/90"
        >
          {t('loginAs.candidate').toLowerCase()}
        </Link>
      </motion.div>
    </>
  );

  return (
    <AnimatedBackground patternColor="primary" colorScheme="purple">
      <div className="w-full max-w-md px-4">
        <AnimatedAuthCard
          title={t('loginAs.recruiter')}
          description={t('recruiterLoginDescription')}
          colorScheme="purple"
          footer={footerContent}
        >
          <LoginForm role="recruiter" />
        </AnimatedAuthCard>
      </div>
    </AnimatedBackground>
  );
}
