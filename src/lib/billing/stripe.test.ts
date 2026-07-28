import { describe, expect, it } from 'vitest'
import { verifyStripeSignature } from './stripe'

const secret = 'whsec_prueba'
const payload = '{"type":"payment_intent.succeeded"}'

async function sign(ts: number, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new Uint8Array(new TextEncoder().encode(secret)),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const mac = await crypto.subtle.sign(
    'HMAC',
    key,
    new Uint8Array(new TextEncoder().encode(`${ts}.${body}`)),
  )
  const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('')
  return `t=${ts},v1=${hex}`
}

describe('verificación de la firma de Stripe', () => {
  const nowMs = 1_700_000_000_000
  const ts = Math.floor(nowMs / 1000)

  it('acepta una firma válida y reciente', async () => {
    const header = await sign(ts, payload)
    expect(await verifyStripeSignature({ payload, header, secret, nowMs })).toBe(true)
  })

  it('rechaza una firma con otro secreto', async () => {
    const header = await sign(ts, payload)
    expect(await verifyStripeSignature({ payload, header, secret: 'otro', nowMs })).toBe(false)
  })

  it('rechaza un cuerpo manipulado', async () => {
    const header = await sign(ts, payload)
    expect(
      await verifyStripeSignature({ payload: payload + 'x', header, secret, nowMs }),
    ).toBe(false)
  })

  it('rechaza un sello de tiempo fuera de tolerancia', async () => {
    const header = await sign(ts - 10_000, payload) // muy viejo
    expect(await verifyStripeSignature({ payload, header, secret, nowMs })).toBe(false)
  })

  it('rechaza sin cabecera o mal formada', async () => {
    expect(await verifyStripeSignature({ payload, header: null, secret, nowMs })).toBe(false)
    expect(await verifyStripeSignature({ payload, header: 'basura', secret, nowMs })).toBe(false)
  })
})
