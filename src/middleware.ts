import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define paths that don't require authentication
const publicPaths = [
    '/',
    '/login',
    '/register',
];

export function middleware(request: NextRequest) {
    // Get token from local storage - Next.js middleware doesn't have access to localStorage
    // Instead, we'll check cookies or headers
    const token = request.cookies.get('access_token')?.value;
    const { pathname } = request.nextUrl;

    console.log(`[Middleware] Path: ${pathname}, Token: ${token ? 'exists' : 'none'}`);

    // Check if the path starts with any of the public paths
    const isPublicPath = publicPaths.some(path =>
        pathname === path || pathname.startsWith(`${path}/`)
    );

    // For NextJS middleware, we can't access localStorage
    // So we'll skip the auth check in middleware and let the client handle it

    // Instead, just skip middleware for now
    return NextResponse.next();

    // Previous implementation - commented out since we can't access localStorage
    /*
    // Handle authentication check for protected routes
    if (!isPublicPath && !token) {
        // Redirect to login if trying to access protected route without token
        const url = new URL('/login', request.url);
        url.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(url);
    }

    // Redirect logged-in users away from auth pages
    if ((pathname === '/login' || pathname === '/register') && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
    */
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/((?!api|_next/static|favicon.ico).*)'],
};