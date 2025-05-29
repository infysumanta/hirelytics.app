'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Locale, localsLanguages } from '@/i18n/config';
import { setUserLocale } from '@/i18n/service';
export function LanguageSelector() {
  const locale = useLocale();
  const t = useTranslations('Common.language');

  // Function to handle language change
  const handleLanguageChange = async (newLocale: Locale) => {
    // Call the server action to change the language
    await setUserLocale(newLocale);
  };

  // Get the current language details
  const currentLanguage = localsLanguages.find((lang) => lang.code === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={locale}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="text-xl"
            >
              {currentLanguage?.flag}
            </motion.span>
          </AnimatePresence>
          <span className="sr-only">Select language</span>
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="animate-in fade-in-50 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
      >
        {localsLanguages
          .filter((lang) => lang.active)
          .map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code as Locale)}
              className={`flex items-center gap-2 cursor-pointer ${
                locale === lang.code ? 'bg-accent text-accent-foreground font-medium' : ''
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{t(lang.code as 'en' | 'hi')}</span>
              {locale === lang.code && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                />
              )}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
