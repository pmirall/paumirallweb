import { sql } from 'drizzle-orm'
import type { Database } from '../client'
import type { TestDatabase } from '../testing'
import { expenses, jobs, timeEntries } from '../schema'

type Db = Database | TestDatabase

export interface JobFinancials {
  jobId: string
  code: string
  title: string
  category: string
  status: string
  budgetCents: number | null
  expensesCents: number
  minutes: number
}

/**
 * Los números de dinero de cada encargo: importe, gastos y horas. Se piden por
 * separado y se cruzan en memoria, en vez de con dos joins uno a muchos en la
 * misma consulta, que multiplicarían las filas y falsearían las sumas.
 */
export async function listJobFinancials(db: Db): Promise<JobFinancials[]> {
  const jobRows = await db
    .select({
      jobId: jobs.id,
      code: jobs.code,
      title: jobs.title,
      category: jobs.category,
      status: jobs.status,
      budgetCents: jobs.budgetCents,
    })
    .from(jobs)

  const minuteRows = await db
    .select({
      jobId: timeEntries.jobId,
      minutes: sql<number>`coalesce(sum(${timeEntries.minutes}), 0)`,
    })
    .from(timeEntries)
    .groupBy(timeEntries.jobId)
  const minutesByJob = new Map(minuteRows.map((r) => [r.jobId, Number(r.minutes)]))

  const expenseRows = await db
    .select({
      jobId: expenses.jobId,
      total: sql<number>`coalesce(sum(${expenses.amountCents}), 0)`,
    })
    .from(expenses)
    .groupBy(expenses.jobId)
  const expensesByJob = new Map(expenseRows.map((r) => [r.jobId, Number(r.total)]))

  return jobRows.map((j) => ({
    jobId: j.jobId,
    code: j.code,
    title: j.title,
    category: j.category,
    status: j.status,
    budgetCents: j.budgetCents,
    expensesCents: expensesByJob.get(j.jobId) ?? 0,
    minutes: minutesByJob.get(j.jobId) ?? 0,
  }))
}

/** Cuenta rápida: cuántos encargos tienen importe pero aún sin horas. */
export async function countJobsWithoutHours(db: Db): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)` })
    .from(jobs)
    .where(
      sql`${jobs.budgetCents} is not null and ${jobs.id} not in (select ${timeEntries.jobId} from ${timeEntries} where ${timeEntries.jobId} is not null)`,
    )
  return Number(row?.n ?? 0)
}

/** Suma de gastos generales, los que no van atados a ningún encargo. */
export async function sumUnassignedExpenses(db: Db): Promise<number> {
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${expenses.amountCents}), 0)` })
    .from(expenses)
    .where(sql`${expenses.jobId} is null`)
  return Number(row?.total ?? 0)
}
