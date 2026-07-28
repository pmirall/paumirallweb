import { cookies } from 'next/headers'
import { db } from '@/db/client'
import { findValidSession, getGalleryByToken } from '@/db/queries/gallery'
import { GALLERY_COOKIE, readGallerySession } from './session'

/**
 * La comprobación que comparten la galería, el visor y las acciones de favoritos:
 * el token localiza una galería activa y la cookie tiene que ser una sesión válida
 * de esa misma galería. Sin esto, cualquiera con el token pero sin PIN podría
 * llamar a las acciones. Devuelve la galería y la base ya abiertas, o null.
 */
export async function requireGallerySession(token: string) {
  const database = await db()
  const gallery = await getGalleryByToken(database, token)
  if (!gallery || gallery.status !== 'active') return null

  const store = await cookies()
  const claim = await readGallerySession(store.get(GALLERY_COOKIE)?.value)
  const session = claim ? await findValidSession(database, claim.sessionId, new Date()) : null
  if (!session || session.galleryId !== gallery.id) return null

  return { database, gallery }
}
