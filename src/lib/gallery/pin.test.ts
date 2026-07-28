import { describe, expect, it } from 'vitest'
import { hashPin, verifyPin } from './pin'
import { generatePin, generateToken } from './token'

describe('PIN de galería', () => {
  it('acepta el PIN correcto y rechaza el incorrecto', async () => {
    const hash = await hashPin('4271')
    expect(await verifyPin('4271', hash)).toBe(true)
    expect(await verifyPin('4270', hash)).toBe(false)
  })

  it('nunca guarda el PIN en claro', async () => {
    const hash = await hashPin('1234')
    expect(hash).not.toContain('1234')
    expect(hash.startsWith('$argon2id$')).toBe(true)
  })

  it('dos galerías con el mismo PIN tienen hash distinto por la sal', async () => {
    expect(await hashPin('0000')).not.toBe(await hashPin('0000'))
  })
})

describe('token de galería', () => {
  it('genera tokens distintos y sin caracteres ambiguos', () => {
    const a = generateToken()
    const b = generateToken()
    expect(a).not.toBe(b)
    expect(a).toMatch(/^[0-9A-HJKMNP-TV-Z]+$/) // sin I, L, O, U
    expect(a.length).toBeGreaterThanOrEqual(25) // 128 bits en base32
  })

  it('el PIN es de cuatro dígitos', () => {
    expect(generatePin()).toMatch(/^\d{4}$/)
  })

  it('el PIN cubre todo el rango sin sesgo evidente', () => {
    // Muestreo por rechazo: con muchas muestras deben salir PIN de cada decena
    // de millar y no concentrarse en los bajos. No es una prueba estadística
    // formal, pero detectaría un `% 10000` que ya no muestrease uniforme.
    let low = 0
    let high = 0
    for (let i = 0; i < 2000; i += 1) {
      const n = Number(generatePin())
      if (n < 5000) low += 1
      else high += 1
    }
    expect(low).toBeGreaterThan(800)
    expect(high).toBeGreaterThan(800)
  })
})
