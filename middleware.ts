import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/forgotPassword', '/resetPassword'];

// Define protected routes that require authentication
const protectedRoutes = ['/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Check if the current path is a protected route
  const isProtectedRoute = pathname.startsWith('/') && !isPublicRoute;
  
  // Get tokens from cookies or check if they exist in localStorage (we'll handle this client-side)
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  
  // For server-side middleware, we need to check if user is trying to access protected routes
  if (isProtectedRoute && pathname !== '/login') {
    // If no tokens are present in cookies, check for localStorage flag
    if (!accessToken && !refreshToken) {
      // Check if there might be tokens in localStorage by looking for a flag
      const hasLocalTokens = request.cookies.get('hasTokens')?.value;
      
      // Only redirect if we're sure there are no tokens anywhere
      if (!hasLocalTokens) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
    }
  }
  
  // If user is authenticated and trying to access login/signup, redirect to dashboard
  if (isPublicRoute && (accessToken || refreshToken)) {
    const dashboardUrl = new URL('/', request.url);
    return NextResponse.redirect(dashboardUrl);
  }
  
  return NextResponse.next();
}

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|images).*)',
  ],
};