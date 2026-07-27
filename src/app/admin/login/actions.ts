'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_COOKIE, adminCookieOptions, devBypassAllowed, issueSession } from '@/lib/auth/admin'
import { adminAllowedEmails } from '@/lib/env'

/**
 * Acceso de desarrollo, solo fuera de Vercel y con ADMIN_DEV_BYPASS=1. Emite la
 * misma cookie firmada que emitirá Google Sign-In, así que las pantallas del
 * admin no distinguen entre uno y otro. El Sign-In real se conecta en cuanto
 * haya credenciales de Google. Ver docs/seguridad-y-privacidad.md.
 */
export async function devLogin() {
  if (!devBypassAllowed()) {
    throw new Error('El acceso de desarrollo no está disponible.')
  }
  const email = adminAllowedEmails[0]
  if (!email) {
    throw new Error('No hay ningún correo autorizado configurado.')
  }
  const store = await cookies()
  store.set(ADMIN_COOKIE, await issueSession(email), adminCookieOptions())
  redirect('/admin')
}

export async function logout() {
  const store = await cookies()
  store.delete(ADMIN_COOKIE)
  redirect('/admin/login')
}
