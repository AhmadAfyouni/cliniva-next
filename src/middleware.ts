import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";
import createIntlMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n/config";

// Create the intl middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export default withAuth(
  async function middleware(request: NextRequestWithAuth) {
    // Skip middleware processing for API routes entirely
    if (request.nextUrl.pathname.startsWith("/api")) {
      return NextResponse.next();
    }

    // First, handle internationalization
    const response = intlMiddleware(request);

    // Extract locale and clean pathname for auth logic
    const { pathname } = request.nextUrl;
    const locale = pathname.split("/")[1];
    const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, "") || "/";

    const token = request.nextauth.token;

    // If user is not authenticated and trying to access protected routes
    if (
      !token &&
      (pathWithoutLocale.startsWith("/dashboard") ||
        pathWithoutLocale.startsWith("/setup") ||
        pathWithoutLocale.startsWith("/onboarding/complete"))
    ) {
      const loginUrl = locales.includes(locale as any)
        ? new URL(`/${locale}/auth/login`, request.url)
        : new URL("/en/auth/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // If user is authenticated
    if (token) {
      const user = token.user as any;
      const localePrefix = locales.includes(locale as any)
        ? `/${locale}`
        : "/en";

      // Redirect authenticated users away from auth pages
      if (
        pathWithoutLocale.startsWith("/auth/") &&
        pathWithoutLocale !== "/auth/error"
      ) {
        return NextResponse.redirect(
          new URL(`${localePrefix}/dashboard`, request.url),
        );
      }

      // Role-based access control
      if (pathWithoutLocale.startsWith("/dashboard/")) {
        const rolePath = pathWithoutLocale.split("/dashboard/")[1];

        // Check if user is accessing their correct role dashboard
        if (rolePath && rolePath !== user?.role && rolePath !== "general") {
          // Redirect to correct role dashboard or unauthorized page
          if (user?.role) {
            // return NextResponse.redirect(
            //   new URL(`${localePrefix}/dashboard/user`, request.url),
            // );
            return NextResponse.redirect(
              new URL(`${localePrefix}/dashboard/${user.role}`, request.url),
            );
          } else {
            return NextResponse.redirect(
              new URL(`${localePrefix}/unauthorized`, request.url),
            );
          }
        }
      }

      // Setup page access - only for owners with incomplete setup
      if (pathWithoutLocale.startsWith("/setup")) {
        if (user?.role !== "owner" || user?.setupComplete) {
          return NextResponse.redirect(
            new URL(`${localePrefix}/dashboard/${user?.role}`, request.url),
          );
        }
      }

      // Onboarding complete page - only for new users
      if (pathWithoutLocale === "/onboarding/complete") {
        if (user?.role !== "owner" && user?.role !== "admin") {
          return NextResponse.redirect(
            new URL(`${localePrefix}/dashboard/${user?.role}`, request.url),
          );
        }
      }

      // Root dashboard redirect based on role
      if (pathWithoutLocale === "/dashboard") {
        if (user?.role === "owner" && !user?.setupComplete) {
          return NextResponse.redirect(
            new URL(`${localePrefix}/setup`, request.url),
          );
        } else if (user?.role) {
          return NextResponse.redirect(
            new URL(`${localePrefix}/dashboard/${user.role}`, request.url),
          );
        }
      }

      // Root redirect for authenticated users
      if (pathWithoutLocale === "/") {
        if (user?.role === "owner" && !user?.setupComplete) {
          return NextResponse.redirect(
            new URL(`${localePrefix}/setup`, request.url),
          );
        } else if (user?.role) {
          return NextResponse.redirect(
            new URL(`${localePrefix}/dashboard/${user.role}`, request.url),
          );
        }
      }
    }

    // Return the intl response
    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Always allow API routes (including NextAuth)
        if (pathname.startsWith("/api")) {
          return true;
        }

        // Allow access to public routes (with or without locale prefix)
        const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, "") || "/";
        if (
          pathWithoutLocale.startsWith("/auth/") ||
          pathWithoutLocale.startsWith("/onboarding") ||
          pathWithoutLocale === "/unauthorized" ||
          pathname.startsWith("/_next") ||
          pathname === "/favicon.ico" ||
          pathname.startsWith("/public") ||
          pathWithoutLocale === "/" ||
          pathname.startsWith("/en") ||
          pathname.startsWith("/ar")
        ) {
          return true;
        }

        // Require token for protected routes
        return !!token;
      },
    },
  },
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public|.*\\..*).*)",
  ],
};
