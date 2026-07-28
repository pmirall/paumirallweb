import { cookies } from 'next/headers'
import { db } from '@/db/client'
import { findValidSession, getGalleryByToken } from '@/db/queries/gallery'
import { GALLERY_COOKIE, readGallerySession } from './session'
import { isGalleryOpen } from './status'

/**
 * La comprobación que comparten la galería, el visor y las acciones de favoritos:
 * el token localiza una galería abierta (activa y no caducada) y la cookie tiene
 * que ser una sesión válida de esa misma galería. Sin esto, cualquiera con el
 * token pero sin PIN podría llamar a las acciones, y una galería caducada seguiría
 * sirviendo fotos. Devuelve la galería y la base ya abiertas, o null.
 */
export async function requireGallerySession(token: string) {
  const database = await db()
  const now = new Date()
  const gallery = await getGalleryByToken(database, token)
  if (!gallery || !isGalleryOpen(gallery, now)) return null

  const store = await cookies()
  const claim = await readGallerySession(store.get(GALLERY_COOKIE)?.value)
  const session = claim ? await findValidSession(database, claim.sessionId, now) : null
  if (!session || session.galleryId !== gallery.id) return null

  return { database, gallery }
}
