import { desc, eq } from 'drizzle-orm'
import type { Database } from '../client'
import type { TestDatabase } from '../testing'
import { clients, jobs, leads } from '../schema'
import { auditLog } from '../schema'

type Db = Database | TestDatabase

export async function listLeads(db: Db, status?: string) {
  const base = db
    .select({
      id: leads.id,
      name: leads.name,
      email: leads.email,
      service: leads.service,
      status: leads.status,
      createdAt: leads.createdAt,
    })
    .from(leads)
    .orderBy(desc(leads.createdAt))
  if (status) {
    return base.where(eq(leads.status, status as never))
  }
  return base
}

export async function getLead(db: Db, id: string) {
  const rows = await db.select().from(leads).where(eq(leads.id, id)).limit(1)
  return rows[0]
}

/** El siguiente código de encargo con el formato AAAA-NNN. */
async function nextJobCode(db: Db, year: number): Promise<string> {
  const rows = await db.select({ code: jobs.code }).from(jobs)
  const prefix = `${year}-`
  const numbers = rows
    .map((r) => r.code)
    .filter((c) => c.startsWith(prefix))
    .map((c) => Number(c.slice(prefix.length)))
    .filter((n) => Number.isFinite(n))
  const next = (numbers.length ? Math.max(...numbers) : 0) + 1
  return `${year}-${String(next).padStart(3, '0')}`
}

/**
 * Convierte un lead en encargo. Crea el cliente si no existe, crea el encargo en
 * borrador, enlaza el lead y lo marca convertido, y deja registro en audit_log.
 * El lead no se borra: su texto original es contexto. Todo en una transacción.
 * Ver docs/modelo-de-datos.md.
 */
export async function convertLeadToJob(
  db: Db,
  leadId: string,
  actor: string,
  year: number,
): Promise<{ jobId: string; code: string } | null> {
  const lead = await getLead(db, leadId)
  if (!lead || lead.status === 'converted') return null

  let clientId = lead.clientId
  if (!clientId) {
    const [client] = await db
      .insert(clients)
      .values({ name: lead.name, email: lead.email, phone: lead.phone })
      .returning()
    clientId = client!.id
  }

  const code = await nextJobCode(db, year)
  const [job] = await db
    .insert(jobs)
    .values({
      code,
      clientId,
      title: lead.service ? `Encargo de ${lead.service}` : 'Encargo nuevo',
      category: 'artist',
      status: 'draft',
    })
    .returning()

  await db
    .update(leads)
    .set({ status: 'converted', clientId, jobId: job!.id })
    .where(eq(leads.id, leadId))

  await db.insert(auditLog).values({
    actor,
    action: 'lead.convert',
    entity: 'job',
    entityId: job!.id,
    diff: { leadId, code },
  })

  return { jobId: job!.id, code }
}
