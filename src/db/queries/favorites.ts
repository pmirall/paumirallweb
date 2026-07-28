import { and, eq, inArray, isNull } from 'drizzle-orm'
import type { Database } from '../client'
import type { TestDatabase } from '../testing'
import { galleryFavorites, jobQueue, mediaAssets } from '../schema'

type Db = Database | TestDatabase

/**
 * Los favoritos de una galería que aún no se han enviado. Mientras `submittedAt`
 * sea nulo, el cliente sigue eligiendo; al enviar quedan sellados. Ver el
 * esquema en db/schema/galleries.ts.
 */
export async function listActiveFavoriteIds(db: Db, galleryId: string): Promise<string[]> {
  const rows = await db
    .select({ mediaAssetId: galleryFavorites.mediaAssetId })
    .from(galleryFavorites)
    .where(and(eq(galleryFavorites.galleryId, galleryId), isNull(galleryFavorites.submittedAt)))
  return rows.map((r) => r.mediaAssetId)
}

/**
 * Marca o desmarca una foto. Devuelve el estado nuevo. Comprueba que la foto es
 * del encargo de esta galería antes de tocar nada: un id ajeno no se guarda.
 */
export async function toggleFavorite(
  db: Db,
  galleryId: string,
  jobId: string,
  assetId: string,
): Promise<{ marked: boolean } | null> {
  const belongs = await db
    .select({ id: mediaAssets.id })
    .from(mediaAssets)
    .where(
      and(
        eq(mediaAssets.id, assetId),
        eq(mediaAssets.jobId, jobId),
        inArray(mediaAssets.visibility, ['client', 'public']),
      ),
    )
    .limit(1)
  if (!belongs[0]) return null

  const existing = await db
    .select({ id: galleryFavorites.id })
    .from(galleryFavorites)
    .where(
      and(
        eq(galleryFavorites.galleryId, galleryId),
        eq(galleryFavorites.mediaAssetId, assetId),
        isNull(galleryFavorites.submittedAt),
      ),
    )
    .limit(1)

  if (existing[0]) {
    await db.delete(galleryFavorites).where(eq(galleryFavorites.id, existing[0].id))
    return { marked: false }
  }
  // onConflictDoNothing por si dos peticiones a la vez leen "no marcada" y ambas
  // insertan: el índice parcial deja pasar solo una y la otra no rompe.
  await db.insert(galleryFavorites).values({ galleryId, mediaAssetId: assetId }).onConflictDoNothing()
  return { marked: true }
}

/**
 * Sella la selección actual y deja un aviso en la cola para el admin. Si no hay
 * nada marcado, no hace nada. Devuelve cuántas fotos se enviaron.
 */
export async function submitSelection(
  db: Db,
  galleryId: string,
  note: string | null,
  now: Date,
): Promise<number> {
  const active = await listActiveFavoriteIds(db, galleryId)
  if (active.length === 0) return 0

  await db
    .update(galleryFavorites)
    .set({ submittedAt: now, ...(note ? { clientNote: note } : {}) })
    .where(and(eq(galleryFavorites.galleryId, galleryId), isNull(galleryFavorites.submittedAt)))

  await db.insert(jobQueue).values({
    kind: 'notify_selection',
    payload: { galleryId, count: active.length },
  })

  return active.length
}
