import { and, desc, eq, gte } from 'drizzle-orm'
import type { Database } from '../client'
import type { TestDatabase } from '../testing'
import {
  galleries,
  galleryPinAttempts,
  gallerySessions,
  mediaAssets,
  mediaDerivatives,
} from '../schema'
import { inArray } from 'drizzle-orm'

type Db = Database | TestDatabase

/** Cinco fallos por token bloquean quince minutos. */
const TOKEN_MAX_FAILS = 5
const TOKEN_WINDOW_MS = 15 * 60 * 1000
/** Veinte fallos por IP en una hora bloquean seis horas. */
const IP_MAX_FAILS = 20
const IP_WINDOW_MS = 60 * 60 * 1000

export async function getGalleryByToken(db: Db, token: string) {
  const rows = await db.select().from(galleries).where(eq(galleries.token, token)).limit(1)
  return rows[0]
}

export const TOKEN_MAX_FAILS_EXPORT = TOKEN_MAX_FAILS

export async function recordPinAttempt(
  db: Db,
  galleryId: string,
  ipHash: string | null,
  success: boolean,
  at?: Date,
): Promise<string> {
  const [row] = await db
    .insert(galleryPinAttempts)
    .values({ galleryId, ipHash, success, ...(at ? { attemptedAt: at } : {}) })
    .returning()
  return row!.id
}

export async function markAttemptSuccess(db: Db, id: string): Promise<void> {
  await db.update(galleryPinAttempts).set({ success: true }).where(eq(galleryPinAttempts.id, id))
}

/**
 * Cuenta los fallos recientes de este token y de esta IP. Se llama DESPUÉS de
 * insertar el intento, así que el recuento lo incluye: con esto, aunque lleguen
 * muchas peticiones a la vez, todas ven un recuento alto y se bloquean, en vez
 * de pasar todas la comprobación antes de que ninguna registre su fallo.
 */
export async function countRecentFails(
  db: Db,
  galleryId: string,
  ipHash: string | null,
  now: Date,
): Promise<{ tokenFails: number; ipFails: number; tokenMax: number; ipMax: number }> {
  const tokenSince = new Date(now.getTime() - TOKEN_WINDOW_MS)
  const tokenRows = await db
    .select({ success: galleryPinAttempts.success, attemptedAt: galleryPinAttempts.attemptedAt })
    .from(galleryPinAttempts)
    .where(
      and(eq(galleryPinAttempts.galleryId, galleryId), gte(galleryPinAttempts.attemptedAt, tokenSince)),
    )
    .orderBy(desc(galleryPinAttempts.attemptedAt))
  // Un acierto reciente limpia la cuenta.
  let tokenFails = 0
  for (const r of tokenRows) {
    if (r.success) break
    tokenFails += 1
  }

  let ipFails = 0
  if (ipHash) {
    const ipSince = new Date(now.getTime() - IP_WINDOW_MS)
    const ipRows = await db
      .select({ id: galleryPinAttempts.id })
      .from(galleryPinAttempts)
      .where(
        and(
          eq(galleryPinAttempts.ipHash, ipHash),
          eq(galleryPinAttempts.success, false),
          gte(galleryPinAttempts.attemptedAt, ipSince),
        ),
      )
    ipFails = ipRows.length
  }

  return { tokenFails, ipFails, tokenMax: TOKEN_MAX_FAILS, ipMax: IP_MAX_FAILS }
}

/**
 * ¿Está bloqueado el token? Cuenta los fallos recientes de esta galería. El
 * bloqueo vive en la base, no en memoria: un despliegue no reinicia el contador.
 * Ver docs/seguridad-y-privacidad.md.
 */
export async function tokenBlockedUntil(
  db: Db,
  galleryId: string,
  now: Date,
): Promise<Date | null> {
  const since = new Date(now.getTime() - TOKEN_WINDOW_MS)
  const rows = await db
    .select({ attemptedAt: galleryPinAttempts.attemptedAt, success: galleryPinAttempts.success })
    .from(galleryPinAttempts)
    .where(
      and(eq(galleryPinAttempts.galleryId, galleryId), gte(galleryPinAttempts.attemptedAt, since)),
    )
    .orderBy(desc(galleryPinAttempts.attemptedAt))

  // Un acierto dentro de la ventana limpia la cuenta.
  const fails: Date[] = []
  for (const row of rows) {
    if (row.success) break
    fails.push(row.attemptedAt)
  }
  if (fails.length < TOKEN_MAX_FAILS) return null
  const newest = fails[0]!
  return new Date(newest.getTime() + TOKEN_WINDOW_MS)
}

export async function ipBlocked(db: Db, ipHash: string | null, now: Date): Promise<boolean> {
  if (!ipHash) return false
  const since = new Date(now.getTime() - IP_WINDOW_MS)
  const rows = await db
    .select({ id: galleryPinAttempts.id })
    .from(galleryPinAttempts)
    .where(
      and(
        eq(galleryPinAttempts.ipHash, ipHash),
        eq(galleryPinAttempts.success, false),
        gte(galleryPinAttempts.attemptedAt, since),
      ),
    )
  return rows.length >= IP_MAX_FAILS
}

export async function createGallerySession(
  db: Db,
  galleryId: string,
  sessionId: string,
  ipHash: string | null,
  userAgent: string | null,
  expiresAt: Date,
): Promise<void> {
  await db.insert(gallerySessions).values({ galleryId, sessionId, ipHash, userAgent, expiresAt })
}

/** Una sesión válida está atada a su galería, no caducada y no revocada. */
export async function findValidSession(db: Db, sessionId: string, now: Date) {
  const rows = await db
    .select()
    .from(gallerySessions)
    .where(eq(gallerySessions.sessionId, sessionId))
    .limit(1)
  const session = rows[0]
  if (!session) return undefined
  if (session.revokedAt) return undefined
  if (session.expiresAt.getTime() < now.getTime()) return undefined
  return session
}

export async function touchGalleryAccess(db: Db, galleryId: string, now: Date): Promise<void> {
  await db.update(galleries).set({ lastAccessAt: now }).where(eq(galleries.id, galleryId))
}

/** Las fotos que el cliente puede ver: visibilidad cliente o pública. */
export async function listGalleryAssets(db: Db, jobId: string) {
  return db
    .select({
      id: mediaAssets.id,
      filename: mediaAssets.filename,
      width: mediaAssets.width,
      height: mediaAssets.height,
    })
    .from(mediaAssets)
    .where(and(eq(mediaAssets.jobId, jobId), inArray(mediaAssets.visibility, ['client', 'public'])))
    .orderBy(mediaAssets.sortOrder, mediaAssets.filename)
}

/**
 * La derivada que se va a servir, comprobando de paso que la foto es de este
 * encargo y visible para el cliente. Devuelve la clave en el almacén, no bytes.
 * Si el `variant` pedido no existe para esta foto, devuelve undefined y la ruta
 * responde 404, sin filtrar si el problema es el permiso o la foto.
 */
export async function getGalleryDerivative(
  db: Db,
  jobId: string,
  assetId: string,
  variant: string,
): Promise<{ storageKey: string } | undefined> {
  const rows = await db
    .select({ storageKey: mediaDerivatives.storageKey })
    .from(mediaDerivatives)
    .innerJoin(mediaAssets, eq(mediaAssets.id, mediaDerivatives.mediaAssetId))
    .where(
      and(
        eq(mediaDerivatives.mediaAssetId, assetId),
        eq(mediaDerivatives.variant, variant),
        eq(mediaAssets.jobId, jobId),
        inArray(mediaAssets.visibility, ['client', 'public']),
      ),
    )
    .limit(1)
  return rows[0]
}
