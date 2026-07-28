import { env } from '@/lib/env'

/**
 * Cookie de sesión de galería, firmada con HMAC como la del admin, pero atada a
 * una galería concreta: el payload lleva el id de la galería, así que no sirve
 * para otra aunque se conozca su token. HttpOnly, Secure en producción,
 * SameSite=Lax. Ver docs/seguridad-y-privacidad.md.
 */
export const GALLERY_COOKIE = 'pm_gallery'
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60 // treinta días

function utf8(text: string): Uint8Array<ArrayBuffer> {
  return new Uint8Array(new TextEncoder().encode(text))
}

async function key(): Promise<CryptoKey> {
  const secret = (env.GALLERY_SESSION_SECRET ?? env.SESSION_SECRET) ?? 'solo-desarrollo-local'
  return crypto.subtle.importKey('raw', utf8(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ])
}

function b64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function fromB64url(text: string): Uint8Array<ArrayBuffer> {
  const bin = atob(text.replace(/-/g, '+').replace(/_/g, '/'))
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i)
  return out
}

async function sign(payload: string): Promise<string> {
  const mac = await crypto.subtle.sign('HMAC', await key(), utf8(payload))
  return b64url(mac)
}

/**
 * galleryId.sessionId.expiración.firma
 *
 * La sesión no puede vivir más que la galería: se acota a la fecha de caducidad
 * de la galería si esta llega antes de los treinta días. Así una sesión emitida
 * el último día no sigue abriendo fotos un mes después de caducar la entrega.
 */
export async function issueGallerySession(
  galleryId: string,
  sessionId: string,
  galleryExpiresAt?: Date,
): Promise<{ cookie: string; expiresAt: Date }> {
  const maxExpires = Date.now() + MAX_AGE_SECONDS * 1000
  const expires =
    galleryExpiresAt && galleryExpiresAt.getTime() < maxExpires
      ? galleryExpiresAt.getTime()
      : maxExpires
  const payload = `${galleryId}.${sessionId}.${expires}`
  return { cookie: `${payload}.${await sign(payload)}`, expiresAt: new Date(expires) }
}

export async function readGallerySession(
  token: string | undefined,
): Promise<{ galleryId: string; sessionId: string } | null> {
  if (!token) return null
  const lastDot = token.lastIndexOf('.')
  if (lastDot < 0) return null
  const payload = token.slice(0, lastDot)
  const signature = token.slice(lastDot + 1)
  // Comparación en tiempo constante, como la sesión del admin.
  let valid: boolean
  try {
    valid = await crypto.subtle.verify('HMAC', await key(), fromB64url(signature), utf8(payload))
  } catch {
    return null
  }
  if (!valid) return null

  const parts = payload.split('.')
  if (parts.length !== 3) return null
  const [galleryId, sessionId, expiresRaw] = parts
  if (!galleryId || !sessionId || !expiresRaw) return null
  const expires = Number(expiresRaw)
  if (!Number.isFinite(expires) || expires < Date.now()) return null
  return { galleryId, sessionId }
}

export function galleryCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/c',
    maxAge: MAX_AGE_SECONDS,
  }
}
