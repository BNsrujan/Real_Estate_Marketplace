import { NextResponse, type NextRequest } from 'next/server';

const AUTH_COOKIE = 'auth_session';
const LOGGED_OUT_COOKIE = 'auth_logged_out';
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV !== 'production' ? 'http://localhost:8000' : '');

interface AuthProfileResponse {
  data?: {
    role?: string;
  };
}

function hasAuthCookie(request: NextRequest): boolean {
  if (request.cookies.get(LOGGED_OUT_COOKIE)?.value) {
    return false;
  }

  const value = request.cookies.get(AUTH_COOKIE)?.value;
  return Boolean(value && value !== 'null' && value !== 'undefined');
}

function redirectHome(request: NextRequest): NextResponse {
  const redirectUrl = new URL('/', request.url);
  const requestedPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (requestedPath !== '/') {
    redirectUrl.searchParams.set('redirect', requestedPath);
  }

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.delete(AUTH_COOKIE);
  return response;
}

async function getSessionRole(request: NextRequest): Promise<string | null> {
  if (!API_URL || !hasAuthCookie(request)) return null;

  try {
    const response = await fetch(`${API_URL}/api/v1/auth/profile`, {
      headers: {
        Cookie: request.headers.get('cookie') ?? '',
      },
      cache: 'no-store',
    });

    if (!response.ok) return null;

    const body = (await response.json().catch(() => null)) as AuthProfileResponse | null;
    return body?.data?.role ?? null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const role = await getSessionRole(request);

  if (!role) {
    return redirectHome(request);
  }

  if (request.nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
    return redirectHome(request);
  }

  return NextResponse.next();
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
