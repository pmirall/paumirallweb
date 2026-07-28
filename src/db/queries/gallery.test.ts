import { beforeEach, describe, expect, it } from 'vitest'
import { createTestDatabase, type TestDatabase } from '../testing'
import { clients, galleries, jobs } from '../schema'
import { hashPin } from '@/lib/gallery/pin'
import { generateToken } from '@/lib/gallery/token'
import { ipBlocked, recordPinAttempt, tokenBlockedUntil } from './gallery'

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
        pinHash: await hashPin('1234'),
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
