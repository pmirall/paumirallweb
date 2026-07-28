import { describe, expect, it } from 'vitest'
import { isGalleryOpen } from './status'
import { issueGallerySession, readGallerySession } from './session'

const now = new Date('2026-07-01T00:00:00Z')

describe('galería abierta', () => {
  it('activa y sin caducar está abierta', () => {
    expect(isGalleryOpen({ status: 'active', expiresAt: new Date('2026-08-01') }, now)).toBe(true)
  })

  it('activa pero caducada está cerrada', () => {
    expect(isGalleryOpen({ status: 'active', expiresAt: new Date('2026-06-01') }, now)).toBe(false)
  })

  it('revocada o expirada está cerrada aunque la fecha no haya llegado', () => {
    expect(isGalleryOpen({ status: 'revoked', expiresAt: new Date('2026-08-01') }, now)).toBe(false)
    expect(isGalleryOpen({ status: 'expired', expiresAt: new Date('2026-08-01') }, now)).toBe(false)
  })
})

describe('la sesión no vive más que la galería', () => {
  it('acota la caducidad de la sesión a la de la galería si esta llega antes', async () => {
    const soon = new Date(Date.now() + 60 * 1000) // un minuto
    const { expiresAt } = await issueGallerySession('g1', 's1', soon)
    expect(expiresAt.getTime()).toBe(soon.getTime())
  })

  it('mantiene los treinta días si la galería caduca más tarde', async () => {
    const far = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    const { expiresAt } = await issueGallerySession('g1', 's1', far)
    // Debe ser bastante menos que un año: el tope de treinta días manda.
    expect(expiresAt.getTime()).toBeLessThan(far.getTime())
  })

  it('una sesión ya caducada no se lee', async () => {
    const past = new Date(Date.now() - 1000)
    const { cookie } = await issueGallerySession('g1', 's1', past)
    expect(await readGallerySession(cookie)).toBeNull()
  })
})
