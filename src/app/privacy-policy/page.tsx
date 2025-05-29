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

export default function PrivacyPolicyPage() {
  const t = useTranslations('Pages.privacy');
  const common = useTranslations('Common');

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background gradients and patterns */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background"></div>
        <div className="absolute top-0 left-1/4 h-[350px] w-[350px] rounded-full bg-purple-600/10 dark:bg-purple-500/10 blur-[120px] animate-pulse-slow"></div>
        <div
          className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-blue-600/10 dark:bg-blue-500/10 blur-[120px] animate-pulse-slow"
          style={{ animationDelay: '2.5s' }}
        ></div>
        <div className="h-full w-full bg-[url('/patterns/waves.svg')] bg-repeat opacity-5"></div>
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
              <h2 className="text-2xl font-semibold mb-4">{t('sections.introduction.title')}</h2>
              <p className="text-muted-foreground">{t('sections.introduction.content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t('sections.informationWeCollect.title')}
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>{t('sections.informationWeCollect.items.0')}</li>
                <li>{t('sections.informationWeCollect.items.1')}</li>
                <li>{t('sections.informationWeCollect.items.2')}</li>
                <li>{t('sections.informationWeCollect.items.3')}</li>
                <li>{t('sections.informationWeCollect.items.4')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t('sections.howWeUseYourInformation.title')}
              </h2>
              <p className="text-muted-foreground mb-4">
                {t('sections.howWeUseYourInformation.purpose')}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>{t('sections.howWeUseYourInformation.items.0')}</li>
                <li>{t('sections.howWeUseYourInformation.items.1')}</li>
                <li>{t('sections.howWeUseYourInformation.items.2')}</li>
                <li>{t('sections.howWeUseYourInformation.items.3')}</li>
                <li>{t('sections.howWeUseYourInformation.items.4')}</li>
                <li>{t('sections.howWeUseYourInformation.items.5')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('sections.dataSecurity.title')}</h2>
              <p className="text-muted-foreground">{t('sections.dataSecurity.content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('sections.yourRights.title')}</h2>
              <p className="text-muted-foreground mb-4">{t('sections.yourRights.intro')}</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>{t('sections.yourRights.items.0')}</li>
                <li>{t('sections.yourRights.items.1')}</li>
                <li>{t('sections.yourRights.items.2')}</li>
                <li>{t('sections.yourRights.items.3')}</li>
                <li>{t('sections.yourRights.items.4')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {t('sections.changesToThisPolicy.title')}
              </h2>
              <p className="text-muted-foreground">{t('sections.changesToThisPolicy.content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('sections.contactUs.title')}</h2>
              <p className="text-muted-foreground">
                {t('sections.contactUs.content')}{' '}
                <a href="mailto:privacy@hirelytics.ai" className="text-primary hover:underline">
                  privacy@hirelytics.ai
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
