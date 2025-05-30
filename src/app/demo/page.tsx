'use client';

import { Building2, GraduationCap, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

export default function DemoPage() {
  const t = useTranslations('Demo');
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background relative">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-blue-600/30 dark:bg-blue-500/30 blur-[120px] animate-pulse-slow"></div>
        <div
          className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-purple-600/30 dark:bg-purple-500/30 blur-[120px] animate-pulse-slow"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute top-1/3 left-1/4 h-[250px] w-[250px] rounded-full bg-cyan-600/30 dark:bg-cyan-500/30 blur-[90px] animate-pulse-slow"
          style={{ animationDelay: '3s' }}
        ></div>
      </div>

      {/* Pattern overlay */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="h-full w-full bg-[url('/patterns/waves.svg')] bg-repeat opacity-20"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">{t('page.title')}</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t('page.description')}</p>
        </div>

        {/* Book a Demo CTA */}
        <div className="text-center mb-10">
          <Link href="/demo/book">
            <Button
              size="lg"
              variant="default"
              className="gap-3 text-lg font-medium px-8 h-14 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 hover:from-gray-800 hover:via-gray-700 hover:to-gray-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 ease-out"
            >
              <Sparkles className="h-6 w-6" />
              {t('page.bookPersonalizedDemo')}
            </Button>
          </Link>
        </div>

        {/* Demo Grid */}
        <div className="grid md:grid-cols-2 gap-12 max-w-7p-xl mx-auto">
          {/* Recruiter Demo */}
          <div className="rounded-xl border bg-card shadow-lg overflow-hidden">
            <div className="aspect-video w-full relative">
              <iframe
                src=""
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">{t('sections.recruiter.title')}</h2>
              </div>
              <p className="text-muted-foreground">{t('sections.recruiter.description')}</p>
            </div>
          </div>
          {/* Candidate Demo */}
          <div className="rounded-xl border bg-card shadow-lg overflow-hidden">
            <div className="aspect-video w-full relative">
              <iframe
                src=""
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">{t('sections.candidate.title')}</h2>
              </div>
              <p className="text-muted-foreground">{t('sections.candidate.description')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
