import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "dh_session";

/** Auth gate (cookie present). Subscription entitlement is enforced in server components + actions (DB). */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (
    (pathname.startsWith("/dashboard") || pathname.startsWith("/subscribe") || pathname.startsWith("/admin")) &&
    !hasSession
  ) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/subscribe/:path*", "/admin/:path*"],
};
