import { and, eq } from 'drizzle-orm'
import type { Database } from '../client'
import type { TestDatabase } from '../testing'
import { deliverables, jobs } from '../schema'

type Db = Database | TestDatabase

/**
 * Lo que el cliente puede ver de su encargo: título, categoría y fechas. Nunca
 * las notas internas, el presupuesto ni las horas dedicadas. Se selecciona campo
 * a campo a propósito, para que no se escape nada aunque el encargo crezca.
 */
export async function getClientJobView(db: Db, jobId: string) {
  const rows = await db
    .select({
      title: jobs.title,
      category: jobs.category,
      shootDate: jobs.shootDate,
      dueDate: jobs.dueDate,
      deliveredAt: jobs.deliveredAt,
    })
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1)
  return rows[0]
}

/** Los entregables acordados, con si ya están entregados. */
export async function listClientDeliverables(db: Db, jobId: string) {
  return db
    .select({
      id: deliverables.id,
      kind: deliverables.kind,
      description: deliverables.description,
      quantity: deliverables.quantity,
      delivered: deliverables.delivered,
    })
    .from(deliverables)
    .where(eq(deliverables.jobId, jobId))
}

/** ¿El encargo tiene vídeo? Decide si aparece la pantalla de vídeo. */
export async function hasVideoDeliverable(db: Db, jobId: string): Promise<boolean> {
  const rows = await db
    .select({ id: deliverables.id })
    .from(deliverables)
    .where(and(eq(deliverables.jobId, jobId), eq(deliverables.kind, 'video')))
    .limit(1)
  return rows.length > 0
}
