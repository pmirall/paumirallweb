import { beforeEach, describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { createTestDatabase, type TestDatabase } from '../testing'
import { auditLog, clients, jobs } from '../schema'
import {
  acceptQuote,
  createQuote,
  getQuoteByPublicToken,
  listQuotesByJob,
  markQuoteSent,
  rejectQuote,
} from './quotes'

describe('presupuestos', () => {
  let db: TestDatabase
  let jobId: string
  let clientId: string

  const lines = [
    { description: 'Reportaje', quantity: 1, unitPriceCents: 40000, taxRate: 21 },
    { description: 'Desplazamiento', quantity: 2, unitPriceCents: 5000, taxRate: 21 },
  ]

  beforeEach(async () => {
    ;({ db } = await createTestDatabase())
    const [c] = await db.insert(clients).values({ name: 'Cliente' }).returning()
    clientId = c!.id
    const [j] = await db
      .insert(jobs)
      .values({ code: '2026-001', clientId, title: 'Encargo', category: 'artist', status: 'draft' })
      .returning()
    jobId = j!.id
  })

  it('crea un presupuesto con número, totales y rastro', async () => {
    const id = await createQuote(db, { jobId, clientId, year: 2026, lines }, 'pau@example.com')
    const found = await getQuoteByPublicToken(
      db,
      (await listQuotesByJob(db, jobId))[0]!.publicToken,
    )
    expect(found?.quote.id).toBe(id)
    expect(found?.quote.number).toBe('P-2026-001')
    // 40000 + 2*5000 = 50000 base; 21% = 10500; total 60500.
    expect(found?.quote.subtotalCents).toBe(50000)
    expect(found?.quote.taxCents).toBe(10500)
    expect(found?.quote.totalCents).toBe(60500)
    expect(found?.lines).toHaveLength(2)
    const audit = await db.select().from(auditLog).where(eq(auditLog.action, 'quote.create'))
    expect(audit).toHaveLength(1)
  })

  it('los números del año son correlativos', async () => {
    await createQuote(db, { jobId, clientId, year: 2026, lines }, 'pau')
    await createQuote(db, { jobId, clientId, year: 2026, lines }, 'pau')
    const numbers = (await listQuotesByJob(db, jobId)).map((q) => q.number).sort()
    expect(numbers).toEqual(['P-2026-001', 'P-2026-002'])
  })

  it('aceptar pasa el encargo a confirmado', async () => {
    const id = await createQuote(db, { jobId, clientId, year: 2026, lines }, 'pau')
    await markQuoteSent(db, id, new Date(), 'pau')
    const ok = await acceptQuote(db, id, new Date(), 'quote:tok')
    expect(ok).toBe(true)
    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId))
    expect(job?.status).toBe('confirmed')
    const audit = await db.select().from(auditLog).where(eq(auditLog.action, 'quote.accepted'))
    expect(audit).toHaveLength(1)
  })

  it('un presupuesto ya aceptado no se vuelve a aceptar', async () => {
    const id = await createQuote(db, { jobId, clientId, year: 2026, lines }, 'pau')
    expect(await acceptQuote(db, id, new Date(), 'quote:tok')).toBe(true)
    expect(await acceptQuote(db, id, new Date(), 'quote:tok')).toBe(false)
  })

  it('rechazar deja el presupuesto rechazado y no toca el encargo', async () => {
    const id = await createQuote(db, { jobId, clientId, year: 2026, lines }, 'pau')
    expect(await rejectQuote(db, id, 'quote:tok')).toBe(true)
    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId))
    expect(job?.status).toBe('draft')
    expect(await rejectQuote(db, id, 'quote:tok')).toBe(false)
  })

  it('aceptar no degrada un encargo que ya iba por delante', async () => {
    await db.update(jobs).set({ status: 'delivered' }).where(eq(jobs.id, jobId))
    const id = await createQuote(db, { jobId, clientId, year: 2026, lines }, 'pau')
    await acceptQuote(db, id, new Date(), 'quote:tok')
    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId))
    // Solo pasa a confirmado si estaba en borrador; un entregado no retrocede.
    expect(job?.status).toBe('delivered')
  })
})
