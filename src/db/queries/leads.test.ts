import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createTestDatabase, truncateAll, type TestDatabase } from '../testing'
import { auditLog, clients, jobs, leads } from '../schema'
import { convertLeadToJob, getLead } from './leads'
import { eq } from 'drizzle-orm'

describe('conversión de lead en encargo', () => {
  let db: TestDatabase

  beforeAll(async () => {
    ;({ db } = await createTestDatabase())
  })
  beforeEach(async () => {
    await truncateAll(db)
  })

  async function seedLead() {
    const [lead] = await db
      .insert(leads)
      .values({
        name: 'Marta Vidal',
        email: 'marta@example.com',
        message: 'Fotos para la gira de mayo.',
        service: 'retrato',
      })
      .returning()
    return lead!
  }

  it('crea cliente y encargo en borrador y conserva el lead', async () => {
    const lead = await seedLead()
    const result = await convertLeadToJob(db, lead.id, 'pau@example.com', 2026)
    expect(result?.code).toBe('2026-001')

    const created = await db.select().from(jobs).where(eq(jobs.id, result!.jobId))
    expect(created[0]?.status).toBe('draft')

    const clientRows = await db.select().from(clients)
    expect(clientRows).toHaveLength(1)
    expect(clientRows[0]?.name).toBe('Marta Vidal')

    // El lead sigue existiendo, ahora convertido y enlazado.
    const after = await getLead(db, lead.id)
    expect(after?.status).toBe('converted')
    expect(after?.jobId).toBe(result!.jobId)
    expect(after?.message).toBe('Fotos para la gira de mayo.')
  })

  it('deja registro en audit_log', async () => {
    const lead = await seedLead()
    await convertLeadToJob(db, lead.id, 'pau@example.com', 2026)
    const log = await db.select().from(auditLog)
    expect(log).toHaveLength(1)
    expect(log[0]?.action).toBe('lead.convert')
    expect(log[0]?.actor).toBe('pau@example.com')
  })

  it('no convierte dos veces el mismo lead', async () => {
    const lead = await seedLead()
    await convertLeadToJob(db, lead.id, 'pau@example.com', 2026)
    const second = await convertLeadToJob(db, lead.id, 'pau@example.com', 2026)
    expect(second).toBeNull()
    expect(await db.select().from(jobs)).toHaveLength(1)
  })

  it('numera los códigos de encargo de forma correlativa', async () => {
    const a = await seedLead()
    const r1 = await convertLeadToJob(db, a.id, 'pau@example.com', 2026)
    const [b] = await db
      .insert(leads)
      .values({ name: 'Pep', email: 'pep@example.com', message: 'Hola' })
      .returning()
    const r2 = await convertLeadToJob(db, b!.id, 'pau@example.com', 2026)
    expect(r1?.code).toBe('2026-001')
    expect(r2?.code).toBe('2026-002')
  })
})
