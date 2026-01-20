import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const sessionToken = request.cookies.get('better-auth.session_token') || request.cookies.get('__Secure-better-auth.session_token');
    const url = request.nextUrl;
    const isPublicPage = url.pathname === '/login';

    if (url.pathname.startsWith('/api') || url.pathname.startsWith('/_next') || url.pathname.includes('.')) {
        return NextResponse.next();
    }

    if (!sessionToken && !isPublicPage) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (sessionToken && isPublicPage) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
