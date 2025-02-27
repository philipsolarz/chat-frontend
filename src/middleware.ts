import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define paths that don't require authentication
const publicPaths = [
    '/',
    '/login',
    '/register',
];

export function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;
    const { pathname } = request.nextUrl;

    // Check if the path starts with any of the public paths
    const isPublicPath = publicPaths.some(path =>
        pathname === path || pathname.startsWith(`${path}/`)
    );

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
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/((?!api|_next/static|favicon.ico).*)'],
};