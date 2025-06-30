import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const token = request.cookies.get('auth-token')?.value

  // Only protect the /trade route
  if (path.startsWith('/trade')) {
    if (!token) {
      // Redirect to login with return URL
      const returnUrl = path
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('returnUrl', returnUrl)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

// Only run middleware on these paths
export const config = {
  matcher: ['/trade/:path*'],
}
