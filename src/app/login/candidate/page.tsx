'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { LoginForm } from '@/components/auth/login-form';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { AnimatedAuthCard } from '@/components/ui/auth-card';

export default function CandidateLoginPage() {
  const t = useTranslations('Auth');
  // Get redirect parameter from URL if present
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

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
          href="/register/candidate"
          className="text-primary underline underline-offset-4 hover:text-primary/90"
        >
          {t('registerAs.candidate')}
        </Link>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-muted-foreground text-center"
      >
        {t('notCandidate')}{' '}
        <Link
          href="/login/recruiter"
          className="text-primary underline underline-offset-4 hover:text-primary/90"
        >
          {t('loginAs.recruiter')}
        </Link>
      </motion.div>
    </>
  );

  return (
    <AnimatedBackground patternColor="primary" colorScheme="blue">
      <div className="w-full max-w-md px-4">
        <AnimatedAuthCard
          title={t('candidateLogin.title')}
          description={t('candidateLoginDescription')}
          colorScheme="blue"
          footer={footerContent}
        >
          <LoginForm role="candidate" callbackUrl={redirectUrl || undefined} />
        </AnimatedAuthCard>
      </div>
    </AnimatedBackground>
  );
}
