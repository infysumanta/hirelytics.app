'use client';

import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('HomePage');

  return (
    <footer className="w-full bg-card py-16 relative overflow-hidden">
      {/* Background gradients and patterns */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background/80"></div>
        <div className="absolute top-0 right-0 h-[300px] w-[300px] rounded-full bg-primary/10 blur-[80px] animate-pulse-slow"></div>
        <div
          className="absolute bottom-0 left-0 h-[250px] w-[250px] rounded-full bg-blue-600/10 dark:bg-blue-500/10 blur-[80px] animate-pulse-slow"
          style={{ animationDelay: '2s' }}
        ></div>
        <div className="h-full w-full bg-[url('/patterns/dots.svg')] bg-repeat opacity-10"></div>

        {/* Additional light effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent opacity-30"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--primary-rgb),0.05),transparent_50%)]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-12 flex flex-col items-center justify-center text-center">
          <div className="mb-6 flex items-center justify-center">
            <div className="mr-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="text-primary" size={20} />
            </div>
            <h2 className="text-2xl font-bold">{t('title')}</h2>
          </div>
          <p className="max-w-md text-center text-muted-foreground">{t('footer.description')}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold">{t('footer.platform.title')}</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/#features"
                  className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                >
                  <span>{t('footer.platform.features')}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                >
                  <span>{t('footer.platform.howItWorks')}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/learn-more"
                  className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                >
                  <span>{t('footer.platform.learnMore')}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/wishlist"
                  className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                >
                  <span>{t('footer.platform.wishlist')}</span>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">{t('footer.forRecruiters.title')}</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/login/recruiter"
                  className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                >
                  <span>{t('footer.forRecruiters.login')}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/register/recruiter"
                  className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                >
                  <span>{t('footer.forRecruiters.register')}</span>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">{t('footer.forCandidates.title')}</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                >
                  <span>{t('footer.forCandidates.findJobs')}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/login/candidate"
                  className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                >
                  <span>{t('footer.forCandidates.login')}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/register/candidate"
                  className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                >
                  <span>{t('footer.forCandidates.register')}</span>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">{t('footer.company.title')}</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                >
                  <span>{t('footer.company.aboutUs')}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                >
                  <span>{t('footer.company.contact')}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                >
                  <span>{t('footer.company.privacyPolicy')}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                >
                  <span>{t('footer.company.termsOfService')}</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center">
          <div className="mb-4 flex justify-center space-x-6">
            <Link href="/" className="text-muted-foreground transition-colors hover:text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect width="4" height="12" x="2" y="9"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </Link>
            <Link href="/" className="text-muted-foreground transition-colors hover:text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </Link>
            <Link href="/" className="text-muted-foreground transition-colors hover:text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
              </svg>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
