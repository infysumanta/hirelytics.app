'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Mail, MapPin, Phone, Sparkles } from 'lucide-react';
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

export default function ContactPage() {
  const t = useTranslations('Pages.contact');
  const common = useTranslations('Common');

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background gradients and patterns */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-blue-600/30 dark:bg-blue-500/30 blur-[120px] animate-pulse-slow"></div>
        <div
          className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-purple-600/30 dark:bg-purple-500/30 blur-[120px] animate-pulse-slow"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute top-1/2 right-1/4 h-[300px] w-[300px] rounded-full bg-indigo-600/30 dark:bg-indigo-500/30 blur-[100px] animate-pulse-slow"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute top-1/3 left-1/4 h-[250px] w-[250px] rounded-full bg-cyan-600/30 dark:bg-cyan-500/30 blur-[90px] animate-pulse-slow"
          style={{ animationDelay: '3s' }}
        ></div>
        <div className="h-full w-full bg-[url('/patterns/grid.svg')] bg-repeat opacity-20"></div>
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
          className="text-center mb-12"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t('subtitle')}</p>
        </motion.div>

        <div className="grid gap-12 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl font-semibold mb-4">{t('getInTouch.title')}</h2>
              <p className="text-muted-foreground mb-6">{t('getInTouch.description')}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{t('contactInfo.email.label')}</p>
                  <p className="text-muted-foreground">{t('contactInfo.email.value')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{t('contactInfo.phone.label')}</p>
                  <p className="text-muted-foreground">{t('contactInfo.phone.value')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{t('contactInfo.office.label')}</p>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {t('contactInfo.office.address')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-lg p-6 shadow-sm"
          >
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  {t('form.name')}
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  placeholder={t('form.namePlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  {t('form.email')}
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  placeholder={t('form.emailPlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  {t('form.message')}
                </label>
                <textarea
                  id="message"
                  rows={5}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  placeholder={t('form.messagePlaceholder')}
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {t('form.submit')}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
