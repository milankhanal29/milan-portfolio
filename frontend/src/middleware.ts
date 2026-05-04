import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const url = request.nextUrl.clone();

  // Handle birthday subdomain
  if (hostname.startsWith("birthday.") || hostname.startsWith("birthday-")) {
    // Rewrite to birthday route group
    if (url.pathname === "/") {
      url.pathname = "/birthday";
      return NextResponse.rewrite(url);
    }
    if (!url.pathname.startsWith("/birthday") && !url.pathname.startsWith("/_next") && !url.pathname.startsWith("/api")) {
      url.pathname = `/birthday${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
