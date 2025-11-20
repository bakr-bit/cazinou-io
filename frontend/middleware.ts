import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'
import {verifySession} from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl

  // Normalize pathname by removing trailing slash for comparison
  const normalizedPath = pathname.replace(/\/$/, '') || '/'

  // Allow access to login page and auth API routes
  if (normalizedPath === '/login' || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Check if user has valid session
  const isAuthenticated = await verifySession()

  if (!isAuthenticated) {
    // Redirect to login page with trailing slash (to match trailingSlash: true config)
    const loginUrl = new URL('/login/', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // User is authenticated, allow access
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
