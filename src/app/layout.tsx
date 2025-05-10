import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RootProvider from "@/provider/root-provider";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import { getLocale } from "next-intl/server";
import { FloatingControls } from "@/components/floating-controls";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hirelytics - Role-Based Recruitment Platform",
  description:
    "A role-based recruitment platform for recruiters, candidates, and administrators",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextTopLoader color="hsl(var(--primary))" />
        <Toaster richColors closeButton />
        <RootProvider>
          <div className="relative flex min-h-screen flex-col">
            <FloatingControls position="top-right" />
            <div className="flex-1">{children}</div>
          </div>
        </RootProvider>
      </body>
    </html>
  );
}
