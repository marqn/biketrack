import createIntlMiddleware from "next-intl/middleware";
import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

// Paths that require authentication (after locale prefix is stripped)
const protectedPaths = ["/app", "/onboarding"];
// Paths within /app that are public (don't require auth)
const publicAppPaths = ["/app/discover"];

function isProtectedPath(pathname: string): boolean {
  // Strip locale prefix to check the actual path
  const pathWithoutLocale = pathname.replace(
    /^\/(en|pl|de|es|it)/,
    ""
  );

  // Check if path is in public app paths
  for (const publicPath of publicAppPaths) {
    if (pathWithoutLocale.startsWith(publicPath)) {
      return false;
    }
  }

  // Check if path is protected
  for (const protectedPath of protectedPaths) {
    if (pathWithoutLocale.startsWith(protectedPath)) {
      return true;
    }
  }

  return false;
}

const authMiddleware = withAuth(
  function onSuccess(req) {
    return intlMiddleware(req);
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export default function middleware(req: NextRequest) {
  if (isProtectedPath(req.nextUrl.pathname)) {
    return (authMiddleware as any)(req);
  }
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    // Match all pathnames except:
    // - /api (API routes)
    // - /_next (Next.js internals)
    // - /_vercel (Vercel internals)
    // - static files with extensions
    "/((?!api|_next|_vercel|favicon\\.ico|icon\\.|apple-icon\\.|.*\\..*).*)",
  ],
};
