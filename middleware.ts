import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "ghars_session";

const PROTECTED_PREFIXES = [
  "/today",
  "/grove",
  "/journal",
  "/settings",
  "/week",
  "/onboarding/preferences",
];

const AUTH_PATHS = [
  "/api/auth/",
  "/api/demo/",
  "/onboarding",
  "/privacy",
  "/terms",
  "/api/health",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never redirect API routes, auth paths, static assets, or public pages
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    AUTH_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // Protect app pages
  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const session = request.cookies.get(SESSION_COOKIE);
    if (!session?.value) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|manifest|sw).*)"],
};
