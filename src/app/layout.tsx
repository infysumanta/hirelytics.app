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
  title: "Hirelytics - AI Interview Platform for Modern Hiring",
  description:
    "Our AI-driven platform transforms the recruitment process from job posting to candidate selection. Automate interviews, analyze resumes, and make data-driven hiring decisions.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/images/favicon.svg",
  },
  manifest: "/manifest.json",
  themeColor: "#0C4A6E",
  openGraph: {
    title: "Hirelytics - AI Interview Platform",
    description:
      "Transform your hiring process with AI-powered interviews and candidate analysis",
    images: ["/images/hirelytics-logo.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hirelytics - AI Interview Platform",
    description:
      "Transform your hiring process with AI-powered interviews and candidate analysis",
    images: ["/images/hirelytics-logo.svg"],
  },
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
