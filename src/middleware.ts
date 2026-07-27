import { NextResponse, type NextRequest } from 'next/server'

/**
 * Ninguna ruta bajo /c/ o /admin se indexa, y la cabecera manda sobre el
 * <meta>. Tampoco se cachean: su contenido depende de la sesión.
 * Ver docs/seguridad-y-privacidad.md.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin') || pathname.startsWith('/c/')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    response.headers.set('Cache-Control', 'private, no-store')
  }

  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  )

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|brand/).*)'],
}
