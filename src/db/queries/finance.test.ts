import { beforeEach, describe, expect, it } from 'vitest'
import { createTestDatabase, type TestDatabase } from '../testing'
import { clients, expenses, jobs, timeEntries } from '../schema'
import {
  countJobsWithoutHours,
  listJobFinancials,
  sumUnassignedExpenses,
} from './finance'

describe('números de dinero por encargo', () => {
  let db: TestDatabase
  let jobA: string
  let jobB: string

  beforeEach(async () => {
    ;({ db } = await createTestDatabase())
    const [c] = await db.insert(clients).values({ name: 'Cliente' }).returning()
    const [a, b] = await db
      .insert(jobs)
      .values([
        { code: '2026-001', clientId: c!.id, title: 'Con horas', category: 'sport', budgetCents: 45000 },
        { code: '2026-002', clientId: c!.id, title: 'Sin horas', category: 'artist', budgetCents: 30000 },
      ])
      .returning()
    jobA = a!.id
    jobB = b!.id
    await db.insert(timeEntries).values([
      { jobId: jobA, date: '2026-01-01', minutes: 300, kind: 'shoot' },
      { jobId: jobA, date: '2026-01-02', minutes: 90, kind: 'travel' },
    ])
    await db.insert(expenses).values([
      { jobId: jobA, amountCents: 5000, description: 'Viaje', category: 'travel', spentOn: '2026-01-01' },
      { jobId: null, amountCents: 12000, description: 'Suscripción', category: 'software', spentOn: '2026-01-05' },
    ])
  })

  it('cruza importe, gastos y horas sin multiplicar filas', async () => {
    const rows = await listJobFinancials(db)
    const a = rows.find((r) => r.jobId === jobA)!
    // Con dos gastos/horas, un join mal hecho multiplicaría; aquí las sumas son limpias.
    expect(a.minutes).toBe(390)
    expect(a.expensesCents).toBe(5000)
    expect(a.budgetCents).toBe(45000)
    const b = rows.find((r) => r.jobId === jobB)!
    expect(b.minutes).toBe(0)
    expect(b.expensesCents).toBe(0)
  })

  it('cuenta los encargos con importe pero sin horas', async () => {
    expect(await countJobsWithoutHours(db)).toBe(1)
  })

  it('suma los gastos generales, sin encargo', async () => {
    expect(await sumUnassignedExpenses(db)).toBe(12000)
  })
})
