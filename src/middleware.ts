import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "@/i18n/config";

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // If this locale is matched, pathnames work without a prefix (e.g. `/about`)
  defaultLocale,

  // The default locale will be used if no locale matches
  localePrefix: "as-needed",
});

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)",
  ],
};
