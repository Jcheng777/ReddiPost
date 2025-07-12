import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key-here-change-in-production'
)

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/api/auth/login', '/api/auth/callback', '/']
  
  // Check if the current route is public
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check if it's an API route
  if (pathname.startsWith('/api/')) {
    // API routes handle their own authentication
    return NextResponse.next()
  }

  // For all other routes, check authentication
  const sessionCookie = request.cookies.get('session')

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    await jwtVerify(sessionCookie.value, secret)
    return NextResponse.next()
  } catch {
    // Invalid session, redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}