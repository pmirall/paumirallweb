import { and, desc, eq, isNotNull } from 'drizzle-orm'
import type { Database } from '../client'
import type { TestDatabase } from '../testing'
import { galleries, galleryFavorites, mediaAssets } from '../schema'

type Db = Database | TestDatabase

/** La galería de un encargo, si la tiene. Un encargo tiene como mucho una. */
export async function getGalleryForJob(db: Db, jobId: string) {
  const rows = await db.select().from(galleries).where(eq(galleries.jobId, jobId)).limit(1)
  return rows[0]
}

export async function createGalleryForJob(
  db: Db,
  input: { jobId: string; token: string; pinHash: string; expiresAt: Date },
) {
  const [row] = await db.insert(galleries).values(input).returning()
  return row!
}

/**
 * Revocar corta el acceso al instante: el token deja de abrir nada y las sesiones
 * en curso dejan de valer, porque toda comprobación exige estado activo. No se
 * borra la fila, para no perder el rastro. Ver docs/seguridad-y-privacidad.md.
 */
export async function revokeGallery(db: Db, galleryId: string): Promise<void> {
  await db.update(galleries).set({ status: 'revoked' }).where(eq(galleries.id, galleryId))
}

export async function setGalleryPin(db: Db, galleryId: string, pinHash: string): Promise<void> {
  await db.update(galleries).set({ pinHash }).where(eq(galleries.id, galleryId))
}

/**
 * La selección que el cliente ya ha enviado: fotos con `submitted_at`, con su
 * nombre de archivo y la nota si la dejó. Lo que sigue marcado sin enviar no sale
 * aquí, porque el cliente todavía está eligiendo.
 */
export async function listSubmittedFavorites(db: Db, galleryId: string) {
  return db
    .select({
      filename: mediaAssets.filename,
      submittedAt: galleryFavorites.submittedAt,
      clientNote: galleryFavorites.clientNote,
    })
    .from(galleryFavorites)
    .innerJoin(mediaAssets, eq(mediaAssets.id, galleryFavorites.mediaAssetId))
    .where(
      and(eq(galleryFavorites.galleryId, galleryId), isNotNull(galleryFavorites.submittedAt)),
    )
    .orderBy(desc(galleryFavorites.submittedAt), mediaAssets.filename)
}
