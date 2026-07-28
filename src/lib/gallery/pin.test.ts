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
})
