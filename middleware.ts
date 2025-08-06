import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected path groups and their login redirects
const protectedPaths = [
  {
    paths: [
      '/worker/dashboard',
      '/worker/earnings',
      '/worker/jobs',
      '/worker/messaging',
      '/worker/notifications',
      '/worker/reviews',
      '/worker/schedule',
      '/worker/settings',
      '/worker/training',
    ],
    login: '/worker/login',
  },
  {
    paths: [
      '/household/dashboard',
      '/household/bookings',
      '/household/find-worker',
      '/household/messaging',
      '/household/notifications',
      '/household/payments',
      '/household/post-job',
      '/household/reviews',
      '/household/settings',
    ],
    login: '/household/login',
  },
  {
    paths: [
      '/admin/dashboard',
      '/admin/households',
      '/admin/jobs',
      '/admin/packages',
      '/admin/payments',
      '/admin/reports',
      '/admin/settings',
      '/admin/training',
      '/admin/workers/workermanage',
      '/admin/register',
    ],
    login: '/admin/login',
  },
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('firebase-session-token');
  const hasSession = !!(sessionCookie && sessionCookie.value);

  if (!hasSession) {
    for (const group of protectedPaths) {
      if (group.paths.some(p => pathname.startsWith(p))) {
        return NextResponse.redirect(new URL(group.login, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/worker/:path*', '/household/:path*', '/admin/:path*'],
};
