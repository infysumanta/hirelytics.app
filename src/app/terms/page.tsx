'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Footer } from '@/components/ui/footer';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export default function TermsPage() {
  const t = useTranslations('Pages.terms');
  const common = useTranslations('Common');

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background gradients and patterns */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background"></div>
        <div className="absolute top-1/4 left-0 h-[300px] w-[300px] rounded-full bg-indigo-600/10 dark:bg-indigo-500/10 blur-[100px] animate-pulse-slow"></div>
        <div
          className="absolute bottom-1/4 right-0 h-[250px] w-[250px] rounded-full bg-cyan-600/10 dark:bg-cyan-500/10 blur-[100px] animate-pulse-slow"
          style={{ animationDelay: '3s' }}
        ></div>
        <div className="h-full w-full bg-[url('/patterns/circuit.svg')] bg-repeat opacity-5"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Back Button */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {common('navigation.back')}
          </Button>
        </motion.div>

        <motion.div
          className="prose prose-slate dark:prose-invert max-w-4xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <h1 className="text-4xl font-bold mb-8 text-center">{t('title')}</h1>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('sections.agreement.title')}</h2>
              <p className="text-muted-foreground">{t('sections.agreement.content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('sections.useLicense.title')}</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>{t('sections.useLicense.content.0')}</li>
                <li>{t('sections.useLicense.content.1')}</li>
                <li>{t('sections.useLicense.content.2')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t('sections.serviceDescription.title')}
              </h2>
              <p className="text-muted-foreground">{t('sections.serviceDescription.content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('sections.userObligations.title')}</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>{t('sections.userObligations.content.0')}</li>
                <li>{t('sections.userObligations.content.1')}</li>
                <li>{t('sections.userObligations.content.2')}</li>
                <li>{t('sections.userObligations.content.3')}</li>
                <li>{t('sections.userObligations.content.4')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t('sections.intellectualProperty.title')}
              </h2>
              <p className="text-muted-foreground">{t('sections.intellectualProperty.content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t('sections.limitationOfLiability.title')}
              </h2>
              <p className="text-muted-foreground">{t('sections.limitationOfLiability.content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('sections.privacyPolicy.title')}</h2>
              <p className="text-muted-foreground">{t('sections.privacyPolicy.content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('sections.governingLaw.title')}</h2>
              <p className="text-muted-foreground">{t('sections.governingLaw.content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('sections.changesToTerms.title')}</h2>
              <p className="text-muted-foreground">{t('sections.changesToTerms.content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t('sections.contactInformation.title')}
              </h2>
              <p className="text-muted-foreground">
                {t('sections.contactInformation.content')}{' '}
                <a href="mailto:legal@hirelytics.ai" className="text-primary hover:underline">
                  legal@hirelytics.ai
                </a>
                .
              </p>
            </section>

            <div className="text-sm text-muted-foreground text-center pt-8">{t('lastUpdated')}</div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
