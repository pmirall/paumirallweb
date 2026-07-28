'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { db } from '@/db/client'
import {
  countRecentFails,
  createGallerySession,
  getGalleryByToken,
  ipBlocked,
  markAttemptSuccess,
  recordPinAttempt,
  tokenBlockedUntil,
} from '@/db/queries/gallery'
import { verifyPin } from '@/lib/gallery/pin'
import { generateToken } from '@/lib/gallery/token'
import { GALLERY_COOKIE, galleryCookieOptions, issueGallerySession } from '@/lib/gallery/session'
import { env } from '@/lib/env'

const pinSchema = z.string().regex(/^\d{4}$/)

/**
 * Hash de la IP con sal del servidor, nunca en claro. En Vercel la IP fiable la
 * pone el proxy en x-vercel-forwarded-for o x-real-ip; el primer valor de
 * x-forwarded-for lo controla el cliente y no sirve para limitar por IP.
 */
async function hashIp(): Promise<string | null> {
  const h = await headers()
  const raw =
    h.get('x-vercel-forwarded-for') ??
    h.get('x-real-ip') ??
    h.get('x-forwarded-for')?.split(',').pop()?.trim() ??
    null
  if (!raw) return null
  const salt = env.IP_HASH_SALT ?? 'sal-de-desarrollo'
  const data = new Uint8Array(new TextEncoder().encode(`${salt}:${raw}`))
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest))).slice(0, 32)
}

export type GateResult =
  | { ok: true }
  | { ok: false; reason: 'wrong'; attemptsLeft: number }
  | { ok: false; reason: 'blocked' }

export async function submitPin(token: string, formData: FormData): Promise<GateResult> {
  const database = await db()
  const gallery = await getGalleryByToken(database, token)
  const now = new Date()
  const ipHash = await hashIp()

  // Un token inválido no se distingue de un PIN erróneo: no se confirma que la
  // galería exista. Se responde con la misma forma.
  if (!gallery || gallery.status !== 'active') {
    return { ok: false, reason: 'wrong', attemptsLeft: 5 }
  }

  // Corte rápido si ya está bloqueado, para no acumular filas ni verificar.
  if ((await tokenBlockedUntil(database, gallery.id, now)) || (await ipBlocked(database, ipHash, now))) {
    return { ok: false, reason: 'blocked' }
  }

  const pin = formData.get('pin')
  const parsed = pinSchema.safeParse(typeof pin === 'string' ? pin : '')
  if (!parsed.success) {
    return { ok: false, reason: 'wrong', attemptsLeft: 5 }
  }

  // Se registra el intento ANTES de verificar y se cuenta incluyéndolo: así una
  // ráfaga simultánea no puede pasar toda la comprobación antes de registrarse.
  const attemptId = await recordPinAttempt(database, gallery.id, ipHash, false, now)
  const counts = await countRecentFails(database, gallery.id, ipHash, now)
  if (counts.tokenFails > counts.tokenMax || counts.ipFails > counts.ipMax) {
    return { ok: false, reason: 'blocked' }
  }

  const valid = await verifyPin(parsed.data, gallery.pinHash)
  if (!valid) {
    return { ok: false, reason: 'wrong', attemptsLeft: Math.max(0, counts.tokenMax - counts.tokenFails) }
  }

  // Acierto: el intento se marca correcto, lo que limpia la ventana de fallos.
  await markAttemptSuccess(database, attemptId)
  const sessionId = generateToken()
  const { cookie, expiresAt } = await issueGallerySession(gallery.id, sessionId)
  const ua = (await headers()).get('user-agent')
  await createGallerySession(database, gallery.id, sessionId, ipHash, ua, expiresAt)
  const store = await cookies()
  store.set(GALLERY_COOKIE, cookie, galleryCookieOptions())
  redirect(`/c/${token}/galeria`)
}
