import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. THE BACK BUTTON FIX:
  // If we are at the root "/", just let it load. 
  // Do NOT force a redirect to /dashboard here. 
  // This allows the "Back" button to land safely on the home page.
  if (path === '/') {
    return NextResponse.next();
  }

  // 2. PROTECTED ROUTES (Client-Side Handled)
  // We let the browser load these pages. 
  // Your existing "useAuth" hook in the components will handle the security.
  // This prevents the "Middleware Block" issue.
  return NextResponse.next();
}

// Only run on these paths
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};