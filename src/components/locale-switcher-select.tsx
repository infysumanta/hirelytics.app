'use client';
import { useTransition } from 'react';

import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from '@/components/ui/select';
import { Locale, LocalsLanguage } from '@/i18n/config';
import { setUserLocale } from '@/i18n/service';

type Props = {
  defaultValue: string;
  localsLanguages: LocalsLanguage[];
};

export default function LocaleSwitcherSelect({
  defaultValue,
  localsLanguages,
}: Props) {
  const [isPending, startTransition] = useTransition();

  function onChange(value: string) {
    const locale = value as Locale;
    startTransition(() => {
      setUserLocale(locale);
      // Reload the page to apply the language change
      window.location.reload();
    });
  }
  
  return (
    <div>
      {localsLanguages?.filter(lang => lang.active)?.length > 1 && (
        <Select
          disabled={isPending}
          value={defaultValue}
          onValueChange={onChange}
        >
          <SelectTrigger className="w-[140px] bg-primary/10 border-primary/20 text-primary">
            <SelectValue placeholder="Select a lang" />
          </SelectTrigger>
          <SelectContent>
            {localsLanguages
              ?.filter(lang => lang.active)
              ?.map(lang => (
                <SelectItem
                  key={lang.code}
                  value={lang.code}
                  className="cursor-pointer"
                >
                  {lang.flag} {lang.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
