'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
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

export default function AboutPage() {
  const t = useTranslations('Pages.about');
  const common = useTranslations('Common');

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradients and patterns */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 h-[350px] w-[350px] rounded-full bg-purple-600/10 dark:bg-purple-500/10 blur-[120px] animate-pulse-slow"></div>
        <div
          className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-blue-600/10 dark:bg-blue-500/10 blur-[120px] animate-pulse-slow"
          style={{ animationDelay: '2.5s' }}
        ></div>
        <div className="h-full w-full bg-[url('/patterns/waves.svg')] bg-repeat opacity-5"></div>
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-16">
          {/* Back Button */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {common('navigation.back')}
            </Button>
          </motion.div>

          <motion.div
            className="text-center mb-12"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t('subtitle')}</p>
          </motion.div>

          <div className="grid gap-12 md:grid-cols-2 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-semibold mb-4">{t('mission.title')}</h2>
              <p className="text-muted-foreground mb-4">{t('mission.description1')}</p>
              <p className="text-muted-foreground">{t('mission.description2')}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative h-[250px] rounded-lg overflow-hidden shadow-lg"
            >
              <Image
                src="/images/hirelytics-full-logo.svg"
                alt="Hirelytics Mission"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>

          <motion.div
            className="grid gap-8 md:grid-cols-3 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {' '}
            {[
              {
                title: t('values.innovation.title'),
                description: t('values.innovation.description'),
              },
              {
                title: t('values.fairness.title'),
                description: t('values.fairness.description'),
              },
              {
                title: t('values.efficiency.title'),
                description: t('values.efficiency.description'),
              },
            ].map((value, index) => (
              <div
                key={index}
                className="p-6 rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Sparkles size={16} />
              {t('cta.badge')}
            </div>
            <h2 className="text-2xl font-semibold mb-4">{t('cta.title')}</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">{t('cta.description')}</p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-primary via-blue-500 to-purple-500 px-8 py-3 text-sm font-medium text-white shadow hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 transform hover:-translate-y-1"
            >
              <Sparkles size={16} className="relative z-10" />
              <span className="relative z-10">{common('buttons.getStarted')}</span>
            </Link>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
