import { desc, eq, sql } from 'drizzle-orm'
import type { Database } from '../client'
import type { TestDatabase } from '../testing'
import { timeEntries, type TimeEntryKind } from '../schema'

type Db = Database | TestDatabase

export async function listTimeEntries(db: Db, jobId: string) {
  return db
    .select()
    .from(timeEntries)
    .where(eq(timeEntries.jobId, jobId))
    .orderBy(desc(timeEntries.date))
}

/** Minutos totales por encargo. La otra mitad del cálculo de euros por hora. */
export async function totalMinutesByJob(db: Db, jobId: string): Promise<number> {
  const rows = await db
    .select({ total: sql<number>`coalesce(sum(${timeEntries.minutes}), 0)::int` })
    .from(timeEntries)
    .where(eq(timeEntries.jobId, jobId))
  return rows[0]?.total ?? 0
}

export type NewTimeEntry = {
  jobId: string
  date: string
  minutes: number
  kind: TimeEntryKind
  note?: string
}

/** Alta de un registro de horas. El alta tiene que caber en dos toques desde
 *  el móvil, así que la validación es mínima y clara. Ver docs/modelo-de-datos.md. */
export async function addTimeEntry(db: Db, input: NewTimeEntry): Promise<void> {
  await db.insert(timeEntries).values({
    jobId: input.jobId,
    date: input.date,
    minutes: input.minutes,
    kind: input.kind,
    note: input.note || null,
  })
}
