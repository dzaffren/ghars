import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/today", "/journal", "/week", "/settings"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected) {
    const sessionCookie = request.cookies.get("ghars_session");
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/today/:path*",
    "/grove/:path*",
    "/journal/:path*",
    "/week/:path*",
    "/settings/:path*",
  ],
};
