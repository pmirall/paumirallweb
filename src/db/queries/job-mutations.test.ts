import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { createTestDatabase, truncateAll, type TestDatabase } from '../testing'
import { auditLog, clients, deliverables, jobs } from '../schema'
import { changeJobStatus, createJob } from './job-mutations'

describe('cambios de estado del encargo', () => {
  let db: TestDatabase
  let clientId: string

  beforeAll(async () => {
    ;({ db } = await createTestDatabase())
  })
  beforeEach(async () => {
    await truncateAll(db)
    const [c] = await db.insert(clients).values({ name: 'Cliente' }).returning()
    clientId = c!.id
  })

  async function makeJob(status: 'draft' | 'editing' = 'editing') {
    const [j] = await db
      .insert(jobs)
      .values({ code: '2026-001', clientId, title: 'X', category: 'artist', status })
      .returning()
    return j!
  }

  it('no deja pasar a entregado con entregables pendientes', async () => {
    const job = await makeJob()
    await db.insert(deliverables).values({ jobId: job.id, kind: 'photos', description: '40 fotos' })

    const result = await changeJobStatus(db, job.id, 'delivered', 'pau@example.com')
    expect(result).toEqual({ ok: false, reason: 'pending_deliverables' })

    const after = await db.select().from(jobs).where(eq(jobs.id, job.id))
    expect(after[0]?.status).toBe('editing')
  })

  it('deja pasar a entregado cuando todo está marcado, y sella la fecha', async () => {
    const job = await makeJob()
    await db
      .insert(deliverables)
      .values({ jobId: job.id, kind: 'photos', description: '40 fotos', delivered: true })

    const result = await changeJobStatus(db, job.id, 'delivered', 'pau@example.com')
    expect(result.ok).toBe(true)

    const after = await db.select().from(jobs).where(eq(jobs.id, job.id))
    expect(after[0]?.status).toBe('delivered')
    expect(after[0]?.deliveredAt).not.toBeNull()
  })

  it('registra cada cambio de estado en audit_log', async () => {
    const job = await makeJob('draft')
    await changeJobStatus(db, job.id, 'confirmed', 'pau@example.com')
    const log = await db.select().from(auditLog)
    expect(log).toHaveLength(1)
    expect(log[0]?.action).toBe('job.status')
    expect(log[0]?.diff).toEqual({ from: 'draft', to: 'confirmed' })
  })

  it('crea un encargo en borrador con código correlativo', async () => {
    const a = await createJob(db, { clientId, title: 'Uno', category: 'sport' }, 'pau@example.com', 2026)
    const b = await createJob(db, { clientId, title: 'Dos', category: 'video' }, 'pau@example.com', 2026)
    expect(a.code).toBe('2026-001')
    expect(b.code).toBe('2026-002')
    const created = await db.select().from(jobs).where(eq(jobs.id, a.id))
    expect(created[0]?.status).toBe('draft')
  })
})
