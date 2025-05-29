'use server';

import { cookies } from 'next/headers';

import { defaultLocale, Locale } from './config';

const COOKIE_NAME = 'next_locale._locale';

export async function getUserLocale() {
  return (await cookies()).get(COOKIE_NAME)?.value || defaultLocale;
}

export async function setUserLocale(locale: Locale) {
  (await cookies()).set(COOKIE_NAME, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'strict',
  });
}
