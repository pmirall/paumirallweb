import { cookies } from 'next/headers'
import { db } from '@/db/client'
import { findValidSession, getGalleryByToken, getGalleryDerivative } from '@/db/queries/gallery'
import { GALLERY_COOKIE, readGallerySession } from '@/lib/gallery/session'
import { storage } from '@/lib/storage'

export const dynamic = 'force-dynamic'

/** Solo tamaños que se muestran en pantalla. La descarga en alta va por otra ruta. */
const DISPLAY_VARIANTS = new Set(['thumb', 'web'])

function notFound(): Response {
  // Mismo 404 para foto ajena, sesión inválida o variante inexistente: la
  // respuesta no dice cuál de los tres ha fallado.
  return new Response(null, { status: 404 })
}

/**
 * Sirve una derivada de la galería. Ninguna URL de Drive llega aquí: la web solo
 * conoce estas derivadas. Cada petición comprueba la sesión, que la foto sea de
 * esta galería y, con marca activa, sirve solo la versión marcada. Ver
 * docs/seguridad-y-privacidad.md.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string; assetId: string }> },
): Promise<Response> {
  const { token, assetId } = await params
  const requested = new URL(request.url).searchParams.get('v') ?? 'thumb'
  if (!DISPLAY_VARIANTS.has(requested)) return notFound()

  const database = await db()
  const gallery = await getGalleryByToken(database, token)
  if (!gallery || gallery.status !== 'active') return notFound()

  const store = await cookies()
  const claim = await readGallerySession(store.get(GALLERY_COOKIE)?.value)
  const session = claim ? await findValidSession(database, claim.sessionId, new Date()) : null
  if (!session || session.galleryId !== gallery.id) return notFound()

  // Con la factura pendiente, solo existe la versión con marca. La limpia no se
  // sirve aunque se pida por su nombre: se bloquea en el servidor.
  const variant = gallery.watermark ? `${requested}-wm` : requested
  const derivative = await getGalleryDerivative(database, gallery.jobId, assetId, variant)
  if (!derivative) return notFound()

  const object = await storage().get(derivative.storageKey)
  if (!object) return notFound()

  return new Response(object.bytes as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': object.contentType,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}
