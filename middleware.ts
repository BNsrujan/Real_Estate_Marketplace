import { NextResponse, type NextRequest } from 'next/server';

const AUTH_COOKIE = 'auth_session';
const LOGGED_OUT_COOKIE = 'auth_logged_out';

function hasAuthCookie(request: NextRequest): boolean {
  if (request.cookies.get(LOGGED_OUT_COOKIE)?.value) {
    return false;
  }

  const value = request.cookies.get(AUTH_COOKIE)?.value;
  return Boolean(value && value !== 'null' && value !== 'undefined');
}

export function middleware(request: NextRequest) {
  if (hasAuthCookie(request)) {
    return NextResponse.next();
  }

  const redirectUrl = new URL('/', request.url);
  const requestedPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (requestedPath !== '/') {
    redirectUrl.searchParams.set('redirect', requestedPath);
  }

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/saved/:path*',
    '/list-property/:path*',
    '/my-properties/:path*',
    '/admin/:path*',
  ],
};
