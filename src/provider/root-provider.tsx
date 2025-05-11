import { getMessages } from "next-intl/server";
import { ThemeProvider } from "./_theme-provider";
import { NextIntlClientProvider } from "next-intl";
import ReactQueryProvider from "./_react-query-provider";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { HeaderTitleProvider } from "./_header-title-provider";
interface RootProviderProps {
  children: React.ReactNode;
}

export default async function RootProvider({ children }: RootProviderProps) {
  const messages = await getMessages();

  // Try to get the session, but don't fail if it's not available
  let session;
  try {
    session = await auth();
  } catch (error) {
    console.error("Error getting session:", error);
    session = null;
  }

  return (
    <>
      <NextIntlClientProvider messages={messages}>
        <ReactQueryProvider>
          <SessionProvider session={session}>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <NuqsAdapter>
                <HeaderTitleProvider>{children}</HeaderTitleProvider>
              </NuqsAdapter>
            </ThemeProvider>
          </SessionProvider>
        </ReactQueryProvider>
      </NextIntlClientProvider>
    </>
  );
}
