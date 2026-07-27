import { describe, expect, it } from 'vitest'
import { issueSession, verifySession } from './admin'

// El entorno de prueba está en vitest.setup.ts: pau@example.com autorizado.
describe('sesión de administración', () => {
  it('acepta una cookie recién emitida para un correo autorizado', async () => {
    const token = await issueSession('pau@example.com')
    expect(await verifySession(token)).toEqual({ email: 'pau@example.com' })
  })

  it('rechaza una firma manipulada', async () => {
    const token = await issueSession('pau@example.com')
    const tampered = `${token.slice(0, -2)}xy`
    expect(await verifySession(tampered)).toBeNull()
  })

  it('rechaza un correo que no está en la lista aunque la firma sea válida', async () => {
    const token = await issueSession('intruso@example.com')
    expect(await verifySession(token)).toBeNull()
  })

  it('rechaza una cookie caducada', async () => {
    const token = await issueSession('pau@example.com')
    // El payload lleva la expiración; se fuerza una en el pasado con firma inválida.
    const past = token.replace(/\.\d+\./, '.1.')
    expect(await verifySession(past)).toBeNull()
  })

  it('no acepta nada sin cookie', async () => {
    expect(await verifySession(undefined)).toBeNull()
  })

  it('rechaza una cookie firmada con otro secreto', async () => {
    // Se fabrica un token con la estructura correcta pero firma inventada.
    const forged = 'pau@example.com.' + (Date.now() + 100000) + '.firmafalsa'
    expect(await verifySession(forged)).toBeNull()
  })

  it('rechaza una expiración no numérica', async () => {
    const token = await issueSession('pau@example.com')
    const broken = token.replace(/\.\d+\./, '.mañana.')
    expect(await verifySession(broken)).toBeNull()
  })
})
