import { and, desc, eq, sql } from 'drizzle-orm'
import type { Database } from '../client'
import type { TestDatabase } from '../testing'
import { auditLog, jobs, quoteLines, quotes } from '../schema'
import { computeQuoteTotals } from '@/lib/finance/quote-totals'
import { generateToken } from '@/lib/gallery/token'

type Db = Database | TestDatabase

export interface QuoteLineDraft {
  description: string
  quantity: number
  unitPriceCents: number
  taxRate: number
}

/**
 * Número de presupuesto del año, correlativo: P-2026-001. Se cuenta lo que ya hay
 * ese año y se suma uno. Con un solo admin no hay carrera real; si algún día la
 * hubiera, el número único en la base la delataría al insertar.
 */
async function nextQuoteNumber(db: Db, year: number): Promise<string> {
  const [row] = await db
    .select({ n: sql<number>`count(*)` })
    .from(quotes)
    .where(sql`${quotes.number} like ${'P-' + year + '-%'}`)
  const next = Number(row?.n ?? 0) + 1
  return `P-${year}-${String(next).padStart(3, '0')}`
}

/**
 * Crea un presupuesto en borrador con sus líneas. Calcula los totales a partir de
 * las líneas, nunca los recibe de fuera. Deja un enlace público con token para
 * aceptarlo sin cuenta. Toda escritura de dinero deja rastro en audit_log.
 */
export async function createQuote(
  db: Db,
  input: { jobId: string; clientId: string; year: number; validUntil?: string | null; notes?: string | null; lines: QuoteLineDraft[] },
  actor: string,
): Promise<string> {
  const totals = computeQuoteTotals(input.lines)
  const number = await nextQuoteNumber(db, input.year)
  const [quote] = await db
    .insert(quotes)
    .values({
      number,
      jobId: input.jobId,
      clientId: input.clientId,
      status: 'draft',
      validUntil: input.validUntil ?? null,
      notes: input.notes ?? null,
      publicToken: generateToken(),
      subtotalCents: totals.subtotalCents,
      taxCents: totals.taxCents,
      totalCents: totals.totalCents,
    })
    .returning()
  if (input.lines.length > 0) {
    await db.insert(quoteLines).values(
      input.lines.map((l, i) => ({
        quoteId: quote!.id,
        description: l.description,
        quantity: l.quantity,
        unitPriceCents: l.unitPriceCents,
        taxRate: l.taxRate,
        sortOrder: i,
      })),
    )
  }
  await db.insert(auditLog).values({
    actor,
    action: 'quote.create',
    entity: 'quote',
    entityId: quote!.id,
    diff: { number, totalCents: totals.totalCents },
  })
  return quote!.id
}

export async function listQuotesByJob(db: Db, jobId: string) {
  return db
    .select({
      id: quotes.id,
      number: quotes.number,
      status: quotes.status,
      totalCents: quotes.totalCents,
      validUntil: quotes.validUntil,
      publicToken: quotes.publicToken,
      createdAt: quotes.createdAt,
    })
    .from(quotes)
    .where(eq(quotes.jobId, jobId))
    .orderBy(desc(quotes.createdAt))
}

export async function getQuoteWithLines(db: Db, quoteId: string) {
  const [quote] = await db.select().from(quotes).where(eq(quotes.id, quoteId)).limit(1)
  if (!quote) return null
  const lines = await db
    .select()
    .from(quoteLines)
    .where(eq(quoteLines.quoteId, quoteId))
    .orderBy(quoteLines.sortOrder)
  return { quote, lines }
}

export async function getQuoteByPublicToken(db: Db, token: string) {
  const [quote] = await db.select().from(quotes).where(eq(quotes.publicToken, token)).limit(1)
  if (!quote) return null
  const lines = await db
    .select()
    .from(quoteLines)
    .where(eq(quoteLines.quoteId, quote.id))
    .orderBy(quoteLines.sortOrder)
  return { quote, lines }
}

/** Marca el presupuesto como enviado. El enlace ya existe; esto fija la fecha. */
export async function markQuoteSent(db: Db, quoteId: string, now: Date, actor: string): Promise<void> {
  await db.update(quotes).set({ status: 'sent', sentAt: now }).where(eq(quotes.id, quoteId))
  await db.insert(auditLog).values({ actor, action: 'quote.sent', entity: 'quote', entityId: quoteId })
}

/**
 * Acepta el presupuesto y pasa el encargo a confirmado. Solo desde borrador o
 * enviado: un presupuesto ya resuelto no cambia. El actor suele ser el propio
 * cliente por el enlace público. Devuelve false si ya no se puede aceptar.
 */
export async function acceptQuote(db: Db, quoteId: string, now: Date, actor: string): Promise<boolean> {
  const [quote] = await db.select().from(quotes).where(eq(quotes.id, quoteId)).limit(1)
  if (!quote) return false
  if (quote.status !== 'sent' && quote.status !== 'draft') return false
  await db.update(quotes).set({ status: 'accepted', acceptedAt: now }).where(eq(quotes.id, quoteId))
  await db
    .update(jobs)
    .set({ status: 'confirmed', updatedAt: now })
    .where(and(eq(jobs.id, quote.jobId), eq(jobs.status, 'draft')))
  await db.insert(auditLog).values({
    actor,
    action: 'quote.accepted',
    entity: 'quote',
    entityId: quoteId,
    diff: { jobId: quote.jobId },
  })
  return true
}

export async function rejectQuote(db: Db, quoteId: string, actor: string): Promise<boolean> {
  const [quote] = await db.select().from(quotes).where(eq(quotes.id, quoteId)).limit(1)
  if (!quote) return false
  if (quote.status !== 'sent' && quote.status !== 'draft') return false
  await db.update(quotes).set({ status: 'rejected' }).where(eq(quotes.id, quoteId))
  await db.insert(auditLog).values({ actor, action: 'quote.rejected', entity: 'quote', entityId: quoteId })
  return true
}
