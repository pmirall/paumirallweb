import { and, desc, eq, sql } from 'drizzle-orm'
import type { Database } from '../client'
import type { TestDatabase } from '../testing'
import { auditLog, clients, galleries, invoices, jobs, payments, quotes } from '../schema'
import type { PaymentMethod } from '../schema'
import { billing } from '@/lib/billing'

type Db = Database | TestDatabase

/**
 * La marca de agua es una regla de aplicación, no un campo que se toca a mano: se
 * activa al emitir la factura y se apaga al cobrarla. Aquí se aplica sobre la
 * galería del encargo, si la tiene. Ver docs/modelo-de-datos.md.
 */
async function setWatermarkForJob(db: Db, jobId: string, on: boolean): Promise<void> {
  await db.update(galleries).set({ watermark: on }).where(eq(galleries.jobId, jobId))
}

async function nextInvoiceNumber(db: Db, year: number): Promise<string> {
  const [row] = await db
    .select({ n: sql<number>`count(*)` })
    .from(invoices)
    .where(sql`${invoices.number} like ${'F-' + year + '-%'}`)
  return `F-${year}-${String(Number(row?.n ?? 0) + 1).padStart(3, '0')}`
}

export type IssueResult =
  | { ok: true; invoiceId: string }
  | { ok: false; reason: 'no_amount' | 'no_job' }

/**
 * Emite la factura del encargo a través del proveedor (falso por ahora) y guarda
 * su reflejo. El importe sale del presupuesto aceptado si lo hay; si no, del
 * presupuesto acordado del encargo con un 21% de IVA. Emitir activa la marca de
 * agua de la galería. Ver ADR 0007.
 */
export async function issueInvoiceForJob(
  db: Db,
  jobId: string,
  year: number,
  now: Date,
  actor: string,
): Promise<IssueResult> {
  const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1)
  if (!job) return { ok: false, reason: 'no_job' }
  const [client] = await db.select().from(clients).where(eq(clients.id, job.clientId)).limit(1)

  // Importes: primero el presupuesto aceptado; si no, el presupuesto del encargo.
  const [accepted] = await db
    .select()
    .from(quotes)
    .where(and(eq(quotes.jobId, jobId), eq(quotes.status, 'accepted')))
    .orderBy(desc(quotes.acceptedAt))
    .limit(1)

  let subtotalCents: number
  let taxCents: number
  let totalCents: number
  if (accepted) {
    subtotalCents = accepted.subtotalCents
    taxCents = accepted.taxCents
    totalCents = accepted.totalCents
  } else if (job.budgetCents != null) {
    subtotalCents = job.budgetCents
    taxCents = Math.round(job.budgetCents * 0.21)
    totalCents = subtotalCents + taxCents
  } else {
    return { ok: false, reason: 'no_amount' }
  }

  const issued = await billing().createInvoice({
    jobCode: job.code,
    clientName: client?.name ?? '',
    clientEmail: client?.email ?? null,
    subtotalCents,
    taxCents,
    totalCents,
    concept: job.title,
  })

  const number = await nextInvoiceNumber(db, year)
  const dueAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const [invoice] = await db
    .insert(invoices)
    .values({
      number,
      jobId,
      clientId: job.clientId,
      provider: 'fake',
      providerInvoiceId: issued.providerInvoiceId,
      status: 'issued',
      subtotalCents,
      taxCents,
      totalCents,
      issuedAt: now,
      dueAt,
      pdfUrl: issued.pdfUrl,
      verificationUrl: issued.verificationUrl,
    })
    .returning()

  await setWatermarkForJob(db, jobId, true)
  await db.insert(auditLog).values({
    actor,
    action: 'invoice.issue',
    entity: 'invoice',
    entityId: invoice!.id,
    diff: { number, totalCents },
  })
  return { ok: true, invoiceId: invoice!.id }
}

export async function listInvoicesForJob(db: Db, jobId: string) {
  return db
    .select()
    .from(invoices)
    .where(eq(invoices.jobId, jobId))
    .orderBy(desc(invoices.createdAt))
}

export async function sumPayments(db: Db, invoiceId: string): Promise<number> {
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${payments.amountCents}), 0)` })
    .from(payments)
    .where(eq(payments.invoiceId, invoiceId))
  return Number(row?.total ?? 0)
}

export type PaymentResult =
  | { ok: true; paid: boolean }
  | { ok: false; reason: 'not_found' | 'duplicate' }

/**
 * Registra un cobro de una factura: efectivo, transferencia, TPV externo o Stripe.
 * Cuando lo cobrado alcanza el total, la factura pasa a pagada y se apaga la marca
 * de agua. `providerPaymentId` da idempotencia al webhook de Stripe: el mismo
 * evento dos veces no crea dos cobros. Toda escritura de dinero deja rastro.
 */
export async function registerPayment(
  db: Db,
  input: {
    invoiceId: string
    method: PaymentMethod
    amountCents: number
    reference?: string | null
    providerPaymentId?: string | null
    paidAt?: Date
  },
  now: Date,
  actor: string,
): Promise<PaymentResult> {
  const [invoice] = await db.select().from(invoices).where(eq(invoices.id, input.invoiceId)).limit(1)
  if (!invoice) return { ok: false, reason: 'not_found' }

  if (input.providerPaymentId) {
    const [existing] = await db
      .select({ id: payments.id })
      .from(payments)
      .where(eq(payments.providerPaymentId, input.providerPaymentId))
      .limit(1)
    if (existing) return { ok: false, reason: 'duplicate' }
  }

  await db.insert(payments).values({
    invoiceId: input.invoiceId,
    method: input.method,
    amountCents: input.amountCents,
    reference: input.reference ?? null,
    providerPaymentId: input.providerPaymentId ?? null,
    paidAt: input.paidAt ?? now,
  })

  const total = await sumPayments(db, input.invoiceId)
  const paid = total >= invoice.totalCents
  if (paid && invoice.status !== 'paid') {
    await db.update(invoices).set({ status: 'paid', paidAt: now }).where(eq(invoices.id, invoice.id))
    await setWatermarkForJob(db, invoice.jobId, false)
  }

  await db.insert(auditLog).values({
    actor,
    action: 'payment.register',
    entity: 'invoice',
    entityId: input.invoiceId,
    diff: { method: input.method, amountCents: input.amountCents, paid },
  })
  return { ok: true, paid }
}

/** Los cobros de una factura, para pintarlos y conciliar. */
export async function listPayments(db: Db, invoiceId: string) {
  return db
    .select()
    .from(payments)
    .where(eq(payments.invoiceId, invoiceId))
    .orderBy(payments.paidAt)
}
