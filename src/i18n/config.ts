export type Locale = (typeof locales)[number];

export interface LocalsLanguage {
  code: string;
  name: string;
  flag: string;
  language: string;
  active: boolean;
}

export const localsLanguages: LocalsLanguage[] = [
  {
    code: "en",
    name: "English",
    flag: "🇺🇸",
    language: "English",
    active: true,
  },
  {
    code: "hi",
    name: "Hindi",
    flag: "🇮🇳",
    language: "हिंदी",
    active: true,
  },
  {
    code: "es",
    name: "Spanish",
    flag: "🇪🇸",
    language: "Spanish",
    active: false,
  },
];

export const locales = localsLanguages.map((locale) => locale.code);
export const defaultLocale: Locale = "en";
