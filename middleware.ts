import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup'];
  
  // Allow public routes and API routes (API routes handle their own auth)
  if (publicRoutes.some(route => pathname.startsWith(route)) || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // For protected frontend routes, let client-side handle redirect
  // This allows the page to load and check localStorage for token
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

