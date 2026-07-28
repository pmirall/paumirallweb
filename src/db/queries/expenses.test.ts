import { beforeEach, describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { createTestDatabase, type TestDatabase } from '../testing'
import { auditLog, clients, jobs } from '../schema'
import { addExpense, listExpensesByJob, sumExpensesByJob } from './expenses'

describe('gastos', () => {
  let db: TestDatabase
  let jobId: string
  let otherJobId: string

  beforeEach(async () => {
    ;({ db } = await createTestDatabase())
    const [c] = await db.insert(clients).values({ name: 'Cliente' }).returning()
    const [j, other] = await db
      .insert(jobs)
      .values([
        { code: '2026-001', clientId: c!.id, title: 'Encargo', category: 'artist' },
        { code: '2026-002', clientId: c!.id, title: 'Otro', category: 'artist' },
      ])
      .returning()
    jobId = j!.id
    otherJobId = other!.id
  })

  it('dar de alta un gasto deja rastro en audit_log', async () => {
    await addExpense(
      db,
      { jobId, amountCents: 4500, description: 'Gasolina', category: 'travel', spentOn: '2026-06-01' },
      'pau@example.com',
    )
    const audit = await db.select().from(auditLog).where(eq(auditLog.action, 'expense.create'))
    expect(audit).toHaveLength(1)
    expect(audit[0]?.actor).toBe('pau@example.com')
    expect(audit[0]?.entity).toBe('expense')
  })

  it('la suma cuenta solo los gastos de ese encargo', async () => {
    await addExpense(db, { jobId, amountCents: 4500, description: 'A', category: 'travel', spentOn: '2026-06-01' }, 'pau')
    await addExpense(db, { jobId, amountCents: 1500, description: 'B', category: 'gear', spentOn: '2026-06-02' }, 'pau')
    await addExpense(db, { jobId: otherJobId, amountCents: 9999, description: 'C', category: 'other', spentOn: '2026-06-03' }, 'pau')
    await addExpense(db, { jobId: null, amountCents: 8888, description: 'General', category: 'software', spentOn: '2026-06-04' }, 'pau')
    expect(await sumExpensesByJob(db, jobId)).toBe(6000)
  })

  it('sin gastos la suma es cero, no null', async () => {
    expect(await sumExpensesByJob(db, jobId)).toBe(0)
  })

  it('lista los gastos del encargo ordenados por día', async () => {
    await addExpense(db, { jobId, amountCents: 2000, description: 'Segundo', category: 'gear', spentOn: '2026-06-10' }, 'pau')
    await addExpense(db, { jobId, amountCents: 1000, description: 'Primero', category: 'travel', spentOn: '2026-06-01' }, 'pau')
    const list = await listExpensesByJob(db, jobId)
    expect(list.map((e) => e.description)).toEqual(['Primero', 'Segundo'])
  })
})
