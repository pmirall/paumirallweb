import { and, asc, desc, eq } from 'drizzle-orm'
import type { Database } from '../client'
import type { TestDatabase } from '../testing'
import { clients, deliverables, jobPublications, jobs, timeEntries } from '../schema'

/**
 * Las consultas viven aquí y se exportan con nombre que describe la intención.
 * Un componente no llama a Drizzle directamente. Ver docs/convenciones.md.
 */
type Db = Database | TestDatabase

export async function listJobs(db: Db, status?: string) {
  const rows = db
    .select({
      id: jobs.id,
      code: jobs.code,
      title: jobs.title,
      status: jobs.status,
      category: jobs.category,
      shootDate: jobs.shootDate,
      budgetCents: jobs.budgetCents,
      clientName: clients.name,
    })
    .from(jobs)
    .innerJoin(clients, eq(jobs.clientId, clients.id))
    .orderBy(desc(jobs.shootDate))
  if (status) {
    return rows.where(eq(jobs.status, status as never))
  }
  return rows
}

export async function getJobWithClient(db: Db, id: string) {
  const rows = await db
    .select()
    .from(jobs)
    .innerJoin(clients, eq(jobs.clientId, clients.id))
    .where(eq(jobs.id, id))
    .limit(1)
  return rows[0]
}

/** Lo que se publica en el portfolio: encargo más su publicación. */
export async function getPublishedProjects(db: Db) {
  return db
    .select({
      slug: jobPublications.slug,
      title: jobPublications.publicTitle,
      summary: jobPublications.summary,
      year: jobPublications.year,
      sortOrder: jobPublications.sortOrder,
      category: jobs.category,
    })
    .from(jobPublications)
    .innerJoin(jobs, eq(jobPublications.jobId, jobs.id))
    .where(eq(jobs.published, true))
    .orderBy(asc(jobPublications.sortOrder), desc(jobPublications.year))
}

export async function getPublishedProjectBySlug(db: Db, slug: string) {
  const rows = await db
    .select({
      slug: jobPublications.slug,
      title: jobPublications.publicTitle,
      summary: jobPublications.summary,
      body: jobPublications.body,
      year: jobPublications.year,
      seoTitle: jobPublications.seoTitle,
      seoDescription: jobPublications.seoDescription,
      category: jobs.category,
      clientName: clients.name,
    })
    .from(jobPublications)
    .innerJoin(jobs, eq(jobPublications.jobId, jobs.id))
    .innerJoin(clients, eq(jobs.clientId, clients.id))
    .where(and(eq(jobPublications.slug, slug), eq(jobs.published, true)))
    .limit(1)
  return rows[0]
}

export async function listDeliverables(db: Db, jobId: string) {
  return db.select().from(deliverables).where(eq(deliverables.jobId, jobId))
}

/** Un encargo no pasa a entregado si le queda algún entregable sin marcar. */
export async function hasPendingDeliverables(db: Db, jobId: string) {
  const rows = await db
    .select({ id: deliverables.id })
    .from(deliverables)
    .where(and(eq(deliverables.jobId, jobId), eq(deliverables.delivered, false)))
    .limit(1)
  return rows.length > 0
}

/** Minutos dedicados a un encargo. Es la mitad del cálculo de euros por hora. */
export async function totalMinutes(db: Db, jobId: string) {
  const rows = await db
    .select({ minutes: timeEntries.minutes })
    .from(timeEntries)
    .where(eq(timeEntries.jobId, jobId))
  return rows.reduce((sum, row) => sum + row.minutes, 0)
}
