import { desc, eq, sql } from 'drizzle-orm'
import type { Database } from '../client'
import type { TestDatabase } from '../testing'
import { clients, jobs } from '../schema'

type Db = Database | TestDatabase

/** Clientes con el número de encargos, para la lista del admin. */
export async function listClients(db: Db) {
  return db
    .select({
      id: clients.id,
      name: clients.name,
      email: clients.email,
      company: clients.company,
      jobCount: sql<number>`count(${jobs.id})::int`,
    })
    .from(clients)
    .leftJoin(jobs, eq(jobs.clientId, clients.id))
    .groupBy(clients.id)
    .orderBy(clients.name)
}

export async function getClient(db: Db, id: string) {
  const rows = await db.select().from(clients).where(eq(clients.id, id)).limit(1)
  return rows[0]
}

/** Historial de encargos de un cliente y su facturación acordada acumulada. */
export async function getClientJobs(db: Db, clientId: string) {
  return db
    .select({
      id: jobs.id,
      code: jobs.code,
      title: jobs.title,
      status: jobs.status,
      category: jobs.category,
      shootDate: jobs.shootDate,
      budgetCents: jobs.budgetCents,
    })
    .from(jobs)
    .where(eq(jobs.clientId, clientId))
    .orderBy(desc(jobs.shootDate))
}
