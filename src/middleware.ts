import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("stimi_auth_token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Guard /admin routes: redirect unauthenticated users to /login at server/edge level
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. If authenticated user visits /login, send them straight to /admin
  if (pathname === "/login") {
    if (token) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
