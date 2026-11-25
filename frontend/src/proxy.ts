import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/teacher', '/admin', '/profile', '/marketplace/create'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isGuardianPortal =
    pathname === '/guardian' ||
    (pathname.startsWith('/guardian/') && !pathname.startsWith('/guardian/view'));

  const isProtected =
    isGuardianPortal ||
    PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (!isProtected) {
    return NextResponse.next();
  }

  // Allow through if either access or refresh cookie is present (client interceptor handles silent refresh)
  const hasSessionCookie =
    request.cookies.has('th_access_token') || request.cookies.has('th_refresh_token');

  if (!hasSessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/teacher/:path*',
    '/guardian',
    '/guardian/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/marketplace/create',
  ],
};
