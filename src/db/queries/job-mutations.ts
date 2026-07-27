import { eq } from 'drizzle-orm'
import type { Database } from '../client'
import type { TestDatabase } from '../testing'
import {
  auditLog,
  clients,
  deliverables,
  jobs,
  type JobCategory,
  type JobStatus,
} from '../schema'
import { hasPendingDeliverables } from './jobs'

type Db = Database | TestDatabase

export type StatusChange = { ok: true } | { ok: false; reason: 'pending_deliverables' | 'not_found' }

/**
 * Cambia el estado de un encargo. Un encargo con entregables sin marcar no puede
 * pasar a entregado. Cada cambio deja fila en audit_log. Ver docs/modelo-de-datos.md.
 */
export async function changeJobStatus(
  db: Db,
  jobId: string,
  status: JobStatus,
  actor: string,
): Promise<StatusChange> {
  const current = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1)
  const job = current[0]
  if (!job) return { ok: false, reason: 'not_found' }
  if (job.status === status) return { ok: true }

  if (status === 'delivered' && (await hasPendingDeliverables(db, jobId))) {
    return { ok: false, reason: 'pending_deliverables' }
  }

  const patch: Partial<typeof jobs.$inferInsert> = { status, updatedAt: new Date() }
  if (status === 'delivered') patch.deliveredAt = new Date()

  await db.update(jobs).set(patch).where(eq(jobs.id, jobId))
  await db.insert(auditLog).values({
    actor,
    action: 'job.status',
    entity: 'job',
    entityId: jobId,
    diff: { from: job.status, to: status },
  })
  return { ok: true }
}

export async function updateJobNotes(db: Db, jobId: string, notes: string): Promise<void> {
  await db.update(jobs).set({ internalNotes: notes, updatedAt: new Date() }).where(eq(jobs.id, jobId))
}

export async function setDeliverableDelivered(
  db: Db,
  deliverableId: string,
  delivered: boolean,
): Promise<void> {
  await db.update(deliverables).set({ delivered }).where(eq(deliverables.id, deliverableId))
}

export type NewJobInput = {
  clientId: string
  title: string
  category: JobCategory
  shootDate?: string
  budgetCents?: number
}

/** Alta de encargo en borrador, con código correlativo por año. */
export async function createJob(
  db: Db,
  input: NewJobInput,
  actor: string,
  year: number,
): Promise<{ id: string; code: string }> {
  const rows = await db.select({ code: jobs.code }).from(jobs)
  const prefix = `${year}-`
  const numbers = rows
    .map((r) => r.code)
    .filter((c) => c.startsWith(prefix))
    .map((c) => Number(c.slice(prefix.length)))
    .filter((n) => Number.isFinite(n))
  const code = `${year}-${String((numbers.length ? Math.max(...numbers) : 0) + 1).padStart(3, '0')}`

  const [job] = await db
    .insert(jobs)
    .values({
      code,
      clientId: input.clientId,
      title: input.title,
      category: input.category,
      status: 'draft',
      shootDate: input.shootDate || null,
      budgetCents: input.budgetCents ?? null,
    })
    .returning()

  await db.insert(auditLog).values({
    actor,
    action: 'job.create',
    entity: 'job',
    entityId: job!.id,
    diff: { code },
  })
  return { id: job!.id, code }
}

/** Encargo completo para la ficha: datos, cliente y entregables. */
export async function getJobDetail(db: Db, id: string) {
  const rows = await db
    .select()
    .from(jobs)
    .innerJoin(clients, eq(jobs.clientId, clients.id))
    .where(eq(jobs.id, id))
    .limit(1)
  const row = rows[0]
  if (!row) return undefined
  const items = await db.select().from(deliverables).where(eq(deliverables.jobId, id))
  return { job: row.jobs, client: row.clients, deliverables: items }
}

export async function listClientsForSelect(db: Db) {
  return db.select({ id: clients.id, name: clients.name }).from(clients).orderBy(clients.name)
}
