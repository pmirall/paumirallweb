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
  const raw = new TextEncoder().encode(
    env.SESSION_SECRET ?? 'desarrollo-inseguro-cambiar-en-produccion',
  )
  return crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ])
}

function toBase64Url(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function sign(payload: string): Promise<string> {
  const data = new TextEncoder().encode(payload)
  const mac = await crypto.subtle.sign('HMAC', await key(), data)
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

  if ((await sign(payload)) !== signature) return null

  // El correo lleva puntos, así que la expiración se separa por la derecha.
  const sep = payload.lastIndexOf('.')
  if (sep < 0) return null
  const email = payload.slice(0, sep)
  const expiresRaw = payload.slice(sep + 1)
  if (!email || !expiresRaw) return null
  if (Number(expiresRaw) < Date.now()) return null
  // La lista de autorizados manda aunque la firma sea válida.
  if (!adminAllowedEmails.includes(email.toLowerCase())) return null

  return { email }
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: isVercelDeploy,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  }
}
