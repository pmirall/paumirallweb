import { and, desc, eq, gte, inArray, sql } from 'drizzle-orm'
import type { Database } from '../client'
import type { TestDatabase } from '../testing'
import { clients, deliverables, jobs, leads } from '../schema'

type Db = Database | TestDatabase

/** Los cuatro estados que se consideran "abiertos" para el panel. */
const ACTIVE_STATUSES = ['confirmed', 'shot', 'editing'] as const

export async function countActiveJobs(db: Db): Promise<number> {
  const rows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(jobs)
    .where(inArray(jobs.status, [...ACTIVE_STATUSES]))
  return rows[0]?.n ?? 0
}

export async function countPendingDeliveries(db: Db): Promise<number> {
  const rows = await db
    .select({ n: sql<number>`count(distinct ${jobs.id})::int` })
    .from(jobs)
    .innerJoin(deliverables, eq(deliverables.jobId, jobs.id))
    .where(and(inArray(jobs.status, [...ACTIVE_STATUSES]), eq(deliverables.delivered, false)))
  return rows[0]?.n ?? 0
}

export async function countNewLeads(db: Db): Promise<number> {
  const rows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(leads)
    .where(eq(leads.status, 'new'))
  return rows[0]?.n ?? 0
}

export async function listActiveJobs(db: Db, limit = 8) {
  return db
    .select({
      id: jobs.id,
      code: jobs.code,
      title: jobs.title,
      status: jobs.status,
      category: jobs.category,
      shootDate: jobs.shootDate,
      dueDate: jobs.dueDate,
      clientName: clients.name,
    })
    .from(jobs)
    .innerJoin(clients, eq(jobs.clientId, clients.id))
    .where(inArray(jobs.status, [...ACTIVE_STATUSES]))
    .orderBy(desc(jobs.shootDate))
    .limit(limit)
}

export async function listUpcomingShoots(db: Db, fromIso: string, limit = 6) {
  return db
    .select({
      id: jobs.id,
      code: jobs.code,
      title: jobs.title,
      shootDate: jobs.shootDate,
      clientName: clients.name,
    })
    .from(jobs)
    .innerJoin(clients, eq(jobs.clientId, clients.id))
    .where(and(gte(jobs.shootDate, fromIso), inArray(jobs.status, ['confirmed', 'draft'])))
    .orderBy(jobs.shootDate)
    .limit(limit)
}

export async function countUpcomingShoots(db: Db, fromIso: string): Promise<number> {
  const rows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(jobs)
    .where(and(gte(jobs.shootDate, fromIso), inArray(jobs.status, ['confirmed', 'draft'])))
  return rows[0]?.n ?? 0
}

export async function listRecentLeads(db: Db, limit = 5) {
  return db
    .select({
      id: leads.id,
      name: leads.name,
      service: leads.service,
      status: leads.status,
      createdAt: leads.createdAt,
    })
    .from(leads)
    .orderBy(desc(leads.createdAt))
    .limit(limit)
}
