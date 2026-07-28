import { beforeEach, describe, expect, it } from 'vitest'
import { and, eq } from 'drizzle-orm'
import { createTestDatabase, type TestDatabase } from '../testing'
import { clients, galleries, galleryFavorites, jobQueue, jobs, mediaAssets } from '../schema'
import { generateToken } from '@/lib/gallery/token'
import { listActiveFavoriteIds, submitSelection, toggleFavorite } from './favorites'

// Estas pruebas no verifican el PIN, así que no hace falta el hash real de
// Argon2id, que es caro a propósito. Un valor cualquiera no nulo basta.
const PIN_HASH = 'no-verificado-en-estas-pruebas'

describe('favoritas de la galería', () => {
  let db: TestDatabase
  let galleryId: string
  let jobId: string
  let otherJobId: string
  let assetId: string
  let foreignAssetId: string

  beforeEach(async () => {
    ;({ db } = await createTestDatabase())
    const [c] = await db.insert(clients).values({ name: 'Cliente' }).returning()
    const [j, other] = await db
      .insert(jobs)
      .values([
        { code: '2026-001', clientId: c!.id, title: 'Encargo', category: 'artist' },
        { code: '2026-002', clientId: c!.id, title: 'Otro', category: 'artist' },
      ])
      .returning()
    jobId = j!.id
    otherJobId = other!.id
    const [g] = await db
      .insert(galleries)
      .values({
        jobId,
        token: generateToken(),
        pinHash: PIN_HASH,
        expiresAt: new Date('2026-12-01T00:00:00Z'),
      })
      .returning()
    galleryId = g!.id
    const [a] = await db
      .insert(mediaAssets)
      .values({ jobId, driveFileId: 'f-1', filename: 'a.jpg', mimeType: 'image/jpeg', visibility: 'client' })
      .returning()
    assetId = a!.id
    const [foreign] = await db
      .insert(mediaAssets)
      .values({ jobId: otherJobId, driveFileId: 'f-2', filename: 'b.jpg', mimeType: 'image/jpeg', visibility: 'client' })
      .returning()
    foreignAssetId = foreign!.id
  })

  it('marca y desmarca la misma foto', async () => {
    expect(await toggleFavorite(db, galleryId, jobId, assetId)).toEqual({ marked: true })
    expect(await listActiveFavoriteIds(db, galleryId)).toEqual([assetId])
    expect(await toggleFavorite(db, galleryId, jobId, assetId)).toEqual({ marked: false })
    expect(await listActiveFavoriteIds(db, galleryId)).toEqual([])
  })

  it('no marca una foto de otro encargo', async () => {
    expect(await toggleFavorite(db, galleryId, jobId, foreignAssetId)).toBeNull()
    expect(await listActiveFavoriteIds(db, galleryId)).toEqual([])
  })

  it('al enviar sella lo marcado y deja un aviso en la cola', async () => {
    await toggleFavorite(db, galleryId, jobId, assetId)
    const count = await submitSelection(db, galleryId, 'Estas dos', new Date())
    expect(count).toBe(1)
    // Ya no cuenta como activa: está enviada.
    expect(await listActiveFavoriteIds(db, galleryId)).toEqual([])
    const sealed = await db
      .select()
      .from(galleryFavorites)
      .where(and(eq(galleryFavorites.galleryId, galleryId)))
    expect(sealed[0]?.submittedAt).not.toBeNull()
    expect(sealed[0]?.clientNote).toBe('Estas dos')
    const queued = await db.select().from(jobQueue).where(eq(jobQueue.kind, 'notify_selection'))
    expect(queued).toHaveLength(1)
  })

  it('enviar sin nada marcado no hace nada', async () => {
    expect(await submitSelection(db, galleryId, null, new Date())).toBe(0)
    const queued = await db.select().from(jobQueue)
    expect(queued).toHaveLength(0)
  })

  it('tras enviar, se puede empezar una selección nueva', async () => {
    await toggleFavorite(db, galleryId, jobId, assetId)
    await submitSelection(db, galleryId, null, new Date())
    // Una ronda nueva: marcar otra vez crea una fila activa aparte.
    expect(await toggleFavorite(db, galleryId, jobId, assetId)).toEqual({ marked: true })
    expect(await listActiveFavoriteIds(db, galleryId)).toEqual([assetId])
  })
})
