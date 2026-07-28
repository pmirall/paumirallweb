import { beforeEach, describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { createTestDatabase, type TestDatabase } from '../testing'
import { auditLog, clients, galleries, invoices, jobs } from '../schema'
import { hashPin } from '@/lib/gallery/pin'
import { generateToken } from '@/lib/gallery/token'
import {
  issueInvoiceForJob,
  listInvoicesForJob,
  registerPayment,
  sumPayments,
} from './invoices'

describe('facturas y cobros', () => {
  let db: TestDatabase
  let jobId: string

  async function watermark(): Promise<boolean> {
    const [g] = await db.select().from(galleries).where(eq(galleries.jobId, jobId)).limit(1)
    return g!.watermark
  }

  beforeEach(async () => {
    ;({ db } = await createTestDatabase())
    const [c] = await db.insert(clients).values({ name: 'Cliente', email: 'c@example.com' }).returning()
    const [j] = await db
      .insert(jobs)
      .values({ code: '2026-001', clientId: c!.id, title: 'Encargo', category: 'artist', budgetCents: 50000 })
      .returning()
    jobId = j!.id
    await db.insert(galleries).values({
      jobId,
      token: generateToken(),
      pinHash: await hashPin('1234'),
      expiresAt: new Date('2027-01-01'),
      watermark: false,
    })
  })

  it('emitir crea la factura, activa la marca de agua y deja rastro', async () => {
    const result = await issueInvoiceForJob(db, jobId, 2026, new Date(), 'pau@example.com')
    expect(result.ok).toBe(true)
    const [inv] = await listInvoicesForJob(db, jobId)
    // 50000 base + 21% = 60500 total.
    expect(inv?.totalCents).toBe(60500)
    expect(inv?.status).toBe('issued')
    expect(inv?.pdfUrl).toContain('http')
    expect(await watermark()).toBe(true)
    const audit = await db.select().from(auditLog).where(eq(auditLog.action, 'invoice.issue'))
    expect(audit).toHaveLength(1)
  })

  it('un cobro parcial no salda ni quita la marca', async () => {
    const r = await issueInvoiceForJob(db, jobId, 2026, new Date(), 'pau')
    if (!r.ok) throw new Error('no emitida')
    const pay = await registerPayment(db, { invoiceId: r.invoiceId, method: 'cash', amountCents: 20000 }, new Date(), 'pau')
    expect(pay).toEqual({ ok: true, paid: false })
    expect(await watermark()).toBe(true)
  })

  it('al cubrir el total, la factura queda pagada y se apaga la marca', async () => {
    const r = await issueInvoiceForJob(db, jobId, 2026, new Date(), 'pau')
    if (!r.ok) throw new Error('no emitida')
    await registerPayment(db, { invoiceId: r.invoiceId, method: 'transfer', amountCents: 30000 }, new Date(), 'pau')
    const pay = await registerPayment(db, { invoiceId: r.invoiceId, method: 'cash', amountCents: 30500 }, new Date(), 'pau')
    expect(pay).toEqual({ ok: true, paid: true })
    const [inv] = await db.select().from(invoices).where(eq(invoices.id, r.invoiceId))
    expect(inv?.status).toBe('paid')
    expect(await sumPayments(db, r.invoiceId)).toBe(60500)
    expect(await watermark()).toBe(false)
  })

  it('el mismo pago de proveedor no se registra dos veces', async () => {
    const r = await issueInvoiceForJob(db, jobId, 2026, new Date(), 'pau')
    if (!r.ok) throw new Error('no emitida')
    const first = await registerPayment(
      db,
      { invoiceId: r.invoiceId, method: 'stripe', amountCents: 60500, providerPaymentId: 'pi_123' },
      new Date(),
      'system',
    )
    expect(first).toEqual({ ok: true, paid: true })
    const again = await registerPayment(
      db,
      { invoiceId: r.invoiceId, method: 'stripe', amountCents: 60500, providerPaymentId: 'pi_123' },
      new Date(),
      'system',
    )
    expect(again).toEqual({ ok: false, reason: 'duplicate' })
  })

  it('sin importe ni presupuesto no se puede emitir', async () => {
    const [c] = await db.insert(clients).values({ name: 'Otro' }).returning()
    const [j] = await db
      .insert(jobs)
      .values({ code: '2026-009', clientId: c!.id, title: 'Sin importe', category: 'artist' })
      .returning()
    const r = await issueInvoiceForJob(db, j!.id, 2026, new Date(), 'pau')
    expect(r).toEqual({ ok: false, reason: 'no_amount' })
  })
})
