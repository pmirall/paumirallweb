'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/db/client'
import { acceptQuote, getQuoteByPublicToken, rejectQuote } from '@/db/queries/quotes'

export type QuoteDecision = { ok: true; decision: 'accepted' | 'rejected' } | { ok: false }

/**
 * Acepta el presupuesto desde el enlace público. El actor queda como el propio
 * presupuesto, no un admin: quien decide es el cliente. Aceptar pasa el encargo a
 * confirmado.
 */
export async function acceptQuoteAction(token: string): Promise<QuoteDecision> {
  const database = await db()
  const found = await getQuoteByPublicToken(database, token)
  if (!found) return { ok: false }
  const ok = await acceptQuote(database, found.quote.id, new Date(), `quote:${token}`)
  if (!ok) return { ok: false }
  revalidatePath(`/p/${token}`)
  return { ok: true, decision: 'accepted' }
}

export async function rejectQuoteAction(token: string): Promise<QuoteDecision> {
  const database = await db()
  const found = await getQuoteByPublicToken(database, token)
  if (!found) return { ok: false }
  const ok = await rejectQuote(database, found.quote.id, `quote:${token}`)
  if (!ok) return { ok: false }
  revalidatePath(`/p/${token}`)
  return { ok: true, decision: 'rejected' }
}
