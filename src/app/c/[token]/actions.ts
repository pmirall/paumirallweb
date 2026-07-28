'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/db/client'
import {
  createGallerySession,
  getGalleryByToken,
  ipBlocked,
  recordPinAttempt,
  tokenBlockedUntil,
} from '@/db/queries/gallery'
import { verifyPin } from '@/lib/gallery/pin'
import { generateToken } from '@/lib/gallery/token'
import {
  GALLERY_COOKIE,
  galleryCookieOptions,
  issueGallerySession,
} from '@/lib/gallery/session'
import { env } from '@/lib/env'

/** Hash de la IP con sal del servidor, nunca en claro. */
async function hashIp(): Promise<string | null> {
  const h = await headers()
  const raw = h.get('x-forwarded-for')?.split(',')[0]?.trim()
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
  // Token inválido se trata como el resto: no se confirma que no exista.
  if (!gallery || gallery.status !== 'active') {
    return { ok: false, reason: 'blocked' }
  }

  const now = new Date()
  const ipHash = await hashIp()

  if ((await tokenBlockedUntil(database, gallery.id, now)) || (await ipBlocked(database, ipHash, now))) {
    return { ok: false, reason: 'blocked' }
  }

  const pin = String(formData.get('pin') ?? '')
  const valid = await verifyPin(pin, gallery.pinHash)
  await recordPinAttempt(database, gallery.id, ipHash, valid)

  if (!valid) {
    // Este fallo puede haber sido el que bloquea.
    if (await tokenBlockedUntil(database, gallery.id, now)) {
      return { ok: false, reason: 'blocked' }
    }
    return {
      ok: false,
      reason: 'wrong',
      attemptsLeft: await remainingAttempts(database, gallery.id, now),
    }
  }

  const sessionId = generateToken()
  const { cookie, expiresAt } = await issueGallerySession(gallery.id, sessionId)
  const ua = (await headers()).get('user-agent')
  await createGallerySession(database, gallery.id, sessionId, ipHash, ua, expiresAt)
  const store = await cookies()
  store.set(GALLERY_COOKIE, cookie, galleryCookieOptions())
  redirect(`/c/${token}/galeria`)
}

async function remainingAttempts(
  database: Awaited<ReturnType<typeof db>>,
  galleryId: string,
  now: Date,
): Promise<number> {
  const { galleryPinAttempts } = await import('@/db/schema')
  const { and, eq, gte, desc } = await import('drizzle-orm')
  const since = new Date(now.getTime() - 15 * 60 * 1000)
  const rows = await database
    .select({ success: galleryPinAttempts.success })
    .from(galleryPinAttempts)
    .where(and(eq(galleryPinAttempts.galleryId, galleryId), gte(galleryPinAttempts.attemptedAt, since)))
    .orderBy(desc(galleryPinAttempts.attemptedAt))
  let fails = 0
  for (const row of rows) {
    if (row.success) break
    fails += 1
  }
  return Math.max(0, 5 - fails)
}
