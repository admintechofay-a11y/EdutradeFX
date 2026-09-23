import { NextResponse, type NextRequest } from 'next/server';

interface DecodedToken {
  userId?: string;
  role?: string;
  exp?: number;
}

function decodeJwt(token: string): DecodedToken | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPath = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isDashboardPath = pathname.startsWith('/dashboard');
  const isLearnPath = pathname.startsWith('/learn');

  if (!isAdminPath && !isDashboardPath && !isLearnPath) {
    return NextResponse.next();
  }

  // Retrieve token from cookies
  const token =
    request.cookies.get('edutrade_token')?.value ||
    request.cookies.get('accessToken')?.value ||
    request.cookies.get('refreshToken')?.value;

  if (!token) {
    const loginUrl = new URL(isAdminPath ? '/admin/login' : '/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = decodeJwt(token);

  // Check expiration if exp claim is present
  if (!payload || (payload.exp && payload.exp < Date.now() / 1000)) {
    const loginUrl = new URL(isAdminPath ? '/admin/login' : '/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('edutrade_token');
    response.cookies.delete('edutrade_role');
    return response;
  }

  // Admin access control: Strictly require ADMIN role
  if (isAdminPath) {
    if (payload.role !== 'ADMIN') {
      // Non-admin attempted access: redirect to general dashboard
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Role-specific dashboard route enforcement
  if (isDashboardPath) {
    if (pathname.startsWith('/dashboard/broker') && payload.role !== 'BROKER' && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (
      pathname.startsWith('/dashboard/signal-provider') &&
      payload.role !== 'SIGNAL_PROVIDER' &&
      payload.role !== 'ADMIN'
    ) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (pathname.startsWith('/dashboard/tutor') && payload.role !== 'TUTOR' && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/learn/:path*', '/admin/:path*'],
};
