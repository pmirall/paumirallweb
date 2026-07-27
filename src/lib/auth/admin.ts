import { env, adminAllowedEmails, isVercelDeploy } from '@/lib/env'

/**
 * Sesión de administración. El acceso real es Google Sign-In restringido a la
 * lista de correos autorizados; hasta que haya credenciales de Google, en local
 * hay un acceso de desarrollo que emite la misma cookie firmada. Así el admin
 * se construye y se prueba entero, y el Sign-In real encaja sin tocar las
 * pantallas. Ver docs/seguridad-y-privacidad.md.
 *
 * La cookie es HttpOnly, Secure y SameSite=Lax, y va firmada con HMAC usando
 * Web Crypto, que funciona igual en el middleware (edge) y en el servidor.
 */
export const ADMIN_COOKIE = 'pm_admin'
const MAX_AGE_SECONDS = 8 * 60 * 60 // ocho horas

export function devBypassAllowed(): boolean {
  return !isVercelDeploy && env.ADMIN_DEV_BYPASS === '1'
}

async function key(): Promise<CryptoKey> {
  // Sin secreto no se firma nada. En desarrollo hay un valor por defecto solo
  // para que el proyecto arranque; en un despliegue, env.ts exige el real, así
  // que este fallback nunca se usa en producción. Aun así, si faltara, es mejor
  // no poder emitir sesiones que emitirlas con un secreto que está en el código.
  const secret = env.SESSION_SECRET ?? (isVercelDeploy ? undefined : 'solo-desarrollo-local')
  if (!secret) {
    throw new Error('Falta SESSION_SECRET. No se pueden firmar sesiones de administración.')
  }
  return crypto.subtle.importKey('raw', utf8(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ])
}

function fromBase64Url(text: string): Uint8Array<ArrayBuffer> {
  const padded = text.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function utf8(text: string): Uint8Array<ArrayBuffer> {
  return new Uint8Array(new TextEncoder().encode(text))
}

function toBase64Url(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function sign(payload: string): Promise<string> {
  const mac = await crypto.subtle.sign('HMAC', await key(), utf8(payload))
  return toBase64Url(mac)
}

/** email.expiración.firma */
export async function issueSession(email: string): Promise<string> {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000
  const payload = `${email}.${expires}`
  return `${payload}.${await sign(payload)}`
}

export async function verifySession(
  token: string | undefined,
): Promise<{ email: string } | null> {
  if (!token) return null
  const lastDot = token.lastIndexOf('.')
  if (lastDot < 0) return null
  const payload = token.slice(0, lastDot)
  const signature = token.slice(lastDot + 1)

  // Verificación en tiempo constante: crypto.subtle.verify no filtra por dónde
  // difiere una firma manipulada, a diferencia de comparar dos cadenas.
  let valid: boolean
  try {
    valid = await crypto.subtle.verify(
      'HMAC',
      await key(),
      fromBase64Url(signature),
      utf8(payload),
    )
  } catch {
    return null
  }
  if (!valid) return null

  // El correo lleva puntos, así que la expiración se separa por la derecha.
  const sep = payload.lastIndexOf('.')
  if (sep < 0) return null
  const email = payload.slice(0, sep)
  const expiresRaw = payload.slice(sep + 1)
  if (!email || !expiresRaw) return null
  const expires = Number(expiresRaw)
  // Una expiración no numérica no debe pasar por "no caducada".
  if (!Number.isFinite(expires) || expires < Date.now()) return null
  // La lista de autorizados manda aunque la firma sea válida.
  if (!adminAllowedEmails.includes(email.toLowerCase())) return null

  return { email }
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  }
}
