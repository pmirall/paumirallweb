import { NextResponse, type NextRequest } from 'next/server'
import { ADMIN_COOKIE, verifySession } from '@/lib/auth/admin'

/**
 * Ninguna ruta bajo /c/ o /admin se indexa, y la cabecera manda sobre el
 * <meta>. Tampoco se cachean. Y el middleware corta cualquier petición a
 * /admin sin sesión válida antes de que se ejecute nada, salvo la propia
 * pantalla de acceso. Un correo no autorizado recibe 404, no 403: no hay que
 * confirmarle a nadie que el panel existe. Ver docs/seguridad-y-privacidad.md.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAdmin = pathname.startsWith('/admin')
  const isClient = pathname.startsWith('/c/')
  // El presupuesto público se abre con un token, como la galería: no se indexa.
  const isQuote = pathname.startsWith('/p/')

  if (isAdmin && pathname !== '/admin/login') {
    const session = await verifySession(request.cookies.get(ADMIN_COOKIE)?.value)
    if (!session) {
      return new NextResponse(null, {
        status: 404,
        headers: { 'X-Robots-Tag': 'noindex, nofollow' },
      })
    }
  }

  const response = NextResponse.next()

  if (isAdmin || isClient || isQuote) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    response.headers.set('Cache-Control', 'private, no-store')
  }

  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|brand/).*)'],
}
