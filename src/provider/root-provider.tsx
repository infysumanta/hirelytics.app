import { getMessages } from "next-intl/server";
import { ThemeProvider } from "./_theme-provider";
import { NextIntlClientProvider } from "next-intl";
import ReactQueryProvider from "./_react-query-provider";

import { NuqsAdapter } from "nuqs/adapters/next/app";
interface RootProviderProps {
  children: React.ReactNode;
}

export default async function RootProvider({ children }: RootProviderProps) {
  const messages = await getMessages();
  return (
    <>
      <NextIntlClientProvider messages={messages}>
        <ReactQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <NuqsAdapter>{children}</NuqsAdapter>
          </ThemeProvider>
        </ReactQueryProvider>
      </NextIntlClientProvider>
    </>
  );
}
