import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * West Coast Collectibles - Security & Auth Middleware
 * 
 * Handles:
 * - Admin route protection
 * - Rate limiting headers
 * - Security headers
 * - Authentication redirect logic
 */

// Admin routes that require authentication
const ADMIN_ROUTES = [
  '/admin/dashboard',
  '/admin/purchases', 
  '/admin/login', // Redirect to dashboard if already authenticated
]

// API routes that need admin protection
const ADMIN_API_ROUTES = [
  '/api/admin/',
]

// Get current user session from cookies/headers
async function getCurrentUser(request: NextRequest) {
  try {
    // Check for session token in cookies
    const sessionToken = request.cookies.get('auth-token')?.value
    
    if (!sessionToken) {
      return null
    }
    
    // In Phase 1, we'll validate against JSON files
    // In Phase 2, this will validate against the database
    
    // For now, return null to indicate no session validation
    // This will be implemented when auth system is fully configured
    return null
    
  } catch (error) {
    console.error('Session validation error:', error)
    return null
  }
}

// Check for temporary admin access (client-side bypass)
function hasTempAdminAccess(request: NextRequest): boolean {
  // Since we can't access sessionStorage from middleware, we'll use a cookie approach
  const tempAdminCookie = request.cookies.get('temp-admin-access')?.value
  return tempAdminCookie === 'true'
}

// Check if user is admin based on email
function isAdminUser(user: any): boolean {
  if (!user || !user.email) {
    return false
  }
  
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
  return adminEmails.includes(user.email.toLowerCase().trim())
}

// Add security headers to response
function addSecurityHeaders(response: NextResponse) {
  // Basic security headers (complementing those in next.config.mjs)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Rate limiting headers (placeholder for future Redis implementation)
  response.headers.set('X-RateLimit-Limit', '100')
  response.headers.set('X-RateLimit-Remaining', '99')
  response.headers.set('X-RateLimit-Reset', String(Date.now() + 60000))
  
  return response
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static assets and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/_') ||
    pathname.includes('.') && !pathname.startsWith('/api/')
  ) {
    return NextResponse.next()
  }
  
  // Get current user
  const user = await getCurrentUser(request)
  
  // Handle admin route protection (except bypass routes)
  if (ADMIN_ROUTES.some(route => pathname.startsWith(route)) && 
      !pathname.startsWith('/admin-bypass') && 
      !pathname.startsWith('/quick-admin')) {
    
    // Check for temporary admin access first
    const hasTempAccess = hasTempAdminAccess(request)
    
    if (!user && !hasTempAccess) {
      // Redirect to admin login page instead of API endpoint
      const loginUrl = new URL('/admin-bypass', request.url)
      return NextResponse.redirect(loginUrl)
    }
    
    if (!hasTempAccess && !isAdminUser(user)) {
      // Non-admin users get redirected to home with error
      const homeUrl = new URL('/', request.url)
      homeUrl.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(homeUrl)
    }
    
    // Admin user accessing /admin/login while authenticated -> redirect to dashboard
    if (pathname === '/admin/login' && (user || hasTempAccess)) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }
  
  // Handle admin API route protection
  if (ADMIN_API_ROUTES.some(route => pathname.startsWith(route))) {
    // Check for temporary admin access first
    const hasTempAccess = hasTempAdminAccess(request)
    
    // Debug logging
    console.log('Admin API Route:', pathname, {
      hasTempAccess,
      hasUser: !!user,
      isAdmin: user ? isAdminUser(user) : false,
      tempCookie: request.cookies.get('temp-admin-access')?.value
    })
    
    // For debugging - temporarily allow test routes
    if (pathname.includes('/test') || pathname.includes('/upload-test')) {
      console.log('Allowing test route:', pathname)
      return NextResponse.next()
    }
    
    // Allow access if either temp admin access OR regular admin user
    if (!hasTempAccess && (!user || !isAdminUser(user))) {
      console.log('Admin access denied:', { hasTempAccess, user, isAdmin: user ? isAdminUser(user) : false })
      return NextResponse.json(
        { error: 'Admin access required', debug: { hasTempAccess, hasUser: !!user } },
        { status: 403 }
      )
    }
  }
  
  // Handle Sentry monitoring tunnel (security through obscurity)
  if (pathname === '/monitoring') {
    const sentryUrl = 'https://sentry.io/api/embed/error-page/'
    return NextResponse.rewrite(sentryUrl)
  }
  
  // Add security headers to all responses
  const response = NextResponse.next()
  return addSecurityHeaders(response)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - handled separately above)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/api/:path*',
  ],
}