import { beforeEach, describe, expect, it } from 'vitest'
import { createTestDatabase, type TestDatabase } from '../testing'
import { clients, galleries, jobs, mediaAssets, mediaDerivatives } from '../schema'
import { generateToken } from '@/lib/gallery/token'
import {
  getGalleryDerivative,
  ipBlocked,
  listGalleryAssets,
  recordPinAttempt,
  tokenBlockedUntil,
} from './gallery'

describe('límite de intentos de PIN', () => {
  let db: TestDatabase
  let galleryId: string
  const now = new Date()

  beforeEach(async () => {
    ;({ db } = await createTestDatabase())
    const [c] = await db.insert(clients).values({ name: 'Cliente' }).returning()
    const [j] = await db
      .insert(jobs)
      .values({ code: '2026-001', clientId: c!.id, title: 'X', category: 'artist' })
      .returning()
    const [g] = await db
      .insert(galleries)
      .values({
        jobId: j!.id,
        token: generateToken(),
        // El PIN no se verifica aquí; el hash real de Argon2id es caro a propósito.
        pinHash: 'no-verificado-en-estas-pruebas',
        expiresAt: new Date('2026-08-01T00:00:00Z'),
      })
      .returning()
    galleryId = g!.id
  })

  it('no bloquea antes del quinto fallo', async () => {
    for (let i = 0; i < 4; i += 1) {
      await recordPinAttempt(db, galleryId, 'ip-a', false)
    }
    expect(await tokenBlockedUntil(db, galleryId, now)).toBeNull()
  })

  it('bloquea el token al quinto fallo', async () => {
    for (let i = 0; i < 5; i += 1) {
      await recordPinAttempt(db, galleryId, 'ip-a', false)
    }
    const until = await tokenBlockedUntil(db, galleryId, now)
    expect(until).not.toBeNull()
  })

  it('un acierto dentro de la ventana limpia la cuenta de fallos', async () => {
    for (let i = 0; i < 4; i += 1) {
      await recordPinAttempt(db, galleryId, 'ip-a', false)
    }
    await recordPinAttempt(db, galleryId, 'ip-a', true)
    await recordPinAttempt(db, galleryId, 'ip-a', false)
    expect(await tokenBlockedUntil(db, galleryId, now)).toBeNull()
  })

  it('bloquea una IP con veinte fallos en una hora', async () => {
    for (let i = 0; i < 20; i += 1) {
      await recordPinAttempt(db, galleryId, 'ip-mala', false)
    }
    expect(await ipBlocked(db, 'ip-mala', now)).toBe(true)
    expect(await ipBlocked(db, 'ip-buena', now)).toBe(false)
  })

  it('no cuenta los fallos fuera de la ventana de quince minutos', async () => {
    // Cinco fallos de hace media hora.
    const old = new Date(now.getTime() - 30 * 60 * 1000)
    for (let i = 0; i < 5; i += 1) {
      await recordPinAttempt(db, galleryId, 'ip-a', false, old)
    }
    expect(await tokenBlockedUntil(db, galleryId, now)).toBeNull()
  })
})

describe('derivadas de la galería', () => {
  let db: TestDatabase
  let jobId: string
  let otherJobId: string

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
  })

  let fileCounter = 0
  async function addAsset(job: string, visibility: 'private' | 'client' | 'public') {
    fileCounter += 1
    const [asset] = await db
      .insert(mediaAssets)
      .values({
        jobId: job,
        driveFileId: `f-${fileCounter}`,
        filename: 'foto.jpg',
        mimeType: 'image/jpeg',
        visibility,
      })
      .returning()
    await db.insert(mediaDerivatives).values([
      { mediaAssetId: asset!.id, variant: 'thumb', storageKey: `k/${asset!.id}/thumb.svg` },
      { mediaAssetId: asset!.id, variant: 'thumb-wm', storageKey: `k/${asset!.id}/thumb-wm.svg` },
    ])
    return asset!.id
  }

  it('devuelve la clave de la derivada de una foto visible del encargo', async () => {
    const assetId = await addAsset(jobId, 'client')
    const got = await getGalleryDerivative(db, jobId, assetId, 'thumb')
    expect(got?.storageKey).toBe(`k/${assetId}/thumb.svg`)
  })

  it('no devuelve una variante que no existe', async () => {
    const assetId = await addAsset(jobId, 'client')
    expect(await getGalleryDerivative(db, jobId, assetId, 'web')).toBeUndefined()
  })

  it('no devuelve la foto de otro encargo aunque se acierte el id', async () => {
    const assetId = await addAsset(otherJobId, 'client')
    expect(await getGalleryDerivative(db, jobId, assetId, 'thumb')).toBeUndefined()
  })

  it('no devuelve una foto privada', async () => {
    const assetId = await addAsset(jobId, 'private')
    expect(await getGalleryDerivative(db, jobId, assetId, 'thumb')).toBeUndefined()
  })

  it('lista solo las fotos visibles del encargo', async () => {
    await addAsset(jobId, 'client')
    await addAsset(jobId, 'public')
    await addAsset(jobId, 'private')
    await addAsset(otherJobId, 'client')
    const list = await listGalleryAssets(db, jobId)
    expect(list).toHaveLength(2)
  })
})
