/**
 * Stripe queda preparado pero inactivo hasta que haya claves. El cobro arranca en
 * efectivo, transferencia y TPV externo, a mano. Cuando Stripe entre, su webhook
 * llega a /api/pagos/stripe y registra el cobro con idempotencia.
 *
 * Aquí solo vive la verificación de la firma, que es la parte delicada y la que se
 * puede probar sin conexión con Stripe. El resto del webhook la usa. La firma de
 * Stripe es HMAC-SHA256 sobre `${timestamp}.${cuerpo}` con el secreto del webhook.
 */
const encoder = new TextEncoder()

function utf8(text: string): Uint8Array<ArrayBuffer> {
  return new Uint8Array(encoder.encode(text))
}

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Comparación en tiempo constante de dos cadenas hex del mismo tamaño esperado. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export interface StripeSignatureCheck {
  payload: string
  header: string | null
  secret: string
  nowMs: number
  toleranceSeconds?: number
}

/**
 * Verifica la cabecera `Stripe-Signature`. Devuelve true solo si la firma cuadra
 * y el sello de tiempo está dentro de la tolerancia, para que un webhook viejo
 * reenviado no cuele. Ver https://stripe.com/docs/webhooks/signatures.
 */
export async function verifyStripeSignature({
  payload,
  header,
  secret,
  nowMs,
  toleranceSeconds = 300,
}: StripeSignatureCheck): Promise<boolean> {
  if (!header) return false
  const parts = Object.fromEntries(
    header.split(',').map((kv) => {
      const [k, v] = kv.split('=')
      return [k?.trim() ?? '', v?.trim() ?? '']
    }),
  )
  const timestamp = parts['t']
  const signature = parts['v1']
  if (!timestamp || !signature) return false

  const ts = Number(timestamp)
  if (!Number.isFinite(ts)) return false
  if (Math.abs(nowMs - ts * 1000) > toleranceSeconds * 1000) return false

  const key = await crypto.subtle.importKey(
    'raw',
    utf8(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const mac = await crypto.subtle.sign('HMAC', key, utf8(`${timestamp}.${payload}`))
  return timingSafeEqual(toHex(mac), signature)
}
