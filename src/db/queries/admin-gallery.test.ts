import { beforeEach, describe, expect, it } from 'vitest'
import { createTestDatabase, type TestDatabase } from '../testing'
import { clients, galleryFavorites, jobs, mediaAssets } from '../schema'
import { generateToken } from '@/lib/gallery/token'
import {
  createGalleryForJob,
  getGalleryForJob,
  listSubmittedFavorites,
  revokeGallery,
  setGalleryPin,
} from './admin-gallery'

describe('galería desde el admin', () => {
  let db: TestDatabase
  let jobId: string

  beforeEach(async () => {
    ;({ db } = await createTestDatabase())
    const [c] = await db.insert(clients).values({ name: 'Cliente' }).returning()
    const [j] = await db
      .insert(jobs)
      .values({ code: '2026-001', clientId: c!.id, title: 'Encargo', category: 'artist' })
      .returning()
    jobId = j!.id
  })

  it('un encargo sin galería devuelve undefined', async () => {
    expect(await getGalleryForJob(db, jobId)).toBeUndefined()
  })

  it('crea la galería y luego la encuentra', async () => {
    const created = await createGalleryForJob(db, {
      jobId,
      token: generateToken(),
      pinHash: 'hash',
      expiresAt: new Date('2026-12-01T00:00:00Z'),
    })
    const found = await getGalleryForJob(db, jobId)
    expect(found?.id).toBe(created.id)
    expect(found?.status).toBe('active')
  })

  it('revocar deja la galería en estado revocado', async () => {
    const g = await createGalleryForJob(db, {
      jobId,
      token: generateToken(),
      pinHash: 'hash',
      expiresAt: new Date('2026-12-01T00:00:00Z'),
    })
    await revokeGallery(db, g.id)
    expect((await getGalleryForJob(db, jobId))?.status).toBe('revoked')
  })

  it('cambiar el PIN sustituye el hash', async () => {
    const g = await createGalleryForJob(db, {
      jobId,
      token: generateToken(),
      pinHash: 'viejo',
      expiresAt: new Date('2026-12-01T00:00:00Z'),
    })
    await setGalleryPin(db, g.id, 'nuevo')
    expect((await getGalleryForJob(db, jobId))?.pinHash).toBe('nuevo')
  })

  it('la selección recibida solo trae las fotos enviadas, con su nombre', async () => {
    const g = await createGalleryForJob(db, {
      jobId,
      token: generateToken(),
      pinHash: 'hash',
      expiresAt: new Date('2026-12-01T00:00:00Z'),
    })
    const [a1, a2] = await db
      .insert(mediaAssets)
      .values([
        { jobId, driveFileId: 'f-1', filename: 'elegida.jpg', mimeType: 'image/jpeg', visibility: 'client' },
        { jobId, driveFileId: 'f-2', filename: 'sin-enviar.jpg', mimeType: 'image/jpeg', visibility: 'client' },
      ])
      .returning()
    await db.insert(galleryFavorites).values([
      { galleryId: g.id, mediaAssetId: a1!.id, submittedAt: new Date('2026-07-10T00:00:00Z'), clientNote: 'Esta' },
      { galleryId: g.id, mediaAssetId: a2!.id }, // sin enviar
    ])
    const received = await listSubmittedFavorites(db, g.id)
    expect(received).toHaveLength(1)
    expect(received[0]?.filename).toBe('elegida.jpg')
    expect(received[0]?.clientNote).toBe('Esta')
  })
})
