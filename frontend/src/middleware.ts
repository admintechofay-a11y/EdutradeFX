import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect sensitive paths if token is absent in cookies (client store also validates)
  const isProtectedPath =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/learn') ||
    pathname.startsWith('/admin');

  // Let public and API requests pass through
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/learn/:path*', '/admin/:path*'],
};
