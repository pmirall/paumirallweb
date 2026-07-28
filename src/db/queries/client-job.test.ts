import { beforeEach, describe, expect, it } from 'vitest'
import { createTestDatabase, type TestDatabase } from '../testing'
import { clients, deliverables, jobs } from '../schema'
import { getClientJobView, hasVideoDeliverable, listClientDeliverables } from './client-job'

describe('el encargo visto por el cliente', () => {
  let db: TestDatabase
  let photoJob: string
  let videoJob: string

  beforeEach(async () => {
    ;({ db } = await createTestDatabase())
    const [c] = await db.insert(clients).values({ name: 'Cliente' }).returning()
    const [p, v] = await db
      .insert(jobs)
      .values([
        {
          code: '2026-001',
          clientId: c!.id,
          title: 'Retrato',
          category: 'artist',
          shootDate: '2026-06-01',
          dueDate: '2026-06-15',
          internalNotes: 'secreto interno',
          budgetCents: 50000,
        },
        { code: '2026-002', clientId: c!.id, title: 'Boda', category: 'video' },
      ])
      .returning()
    photoJob = p!.id
    videoJob = v!.id
    await db.insert(deliverables).values([
      { jobId: photoJob, kind: 'photos', description: '40 fotos', quantity: 40, delivered: true },
      { jobId: videoJob, kind: 'video', description: 'Montaje', quantity: 1 },
    ])
  })

  it('solo expone campos seguros, nunca las notas ni el presupuesto', async () => {
    const view = await getClientJobView(db, photoJob)
    expect(view?.title).toBe('Retrato')
    expect(view?.shootDate).toBe('2026-06-01')
    // El tipo del resultado no incluye estos campos; comprobamos que no aparecen.
    expect(Object.keys(view!)).not.toContain('internalNotes')
    expect(Object.keys(view!)).not.toContain('budgetCents')
  })

  it('lista los entregables acordados con su estado', async () => {
    const list = await listClientDeliverables(db, photoJob)
    expect(list).toHaveLength(1)
    expect(list[0]?.description).toBe('40 fotos')
    expect(list[0]?.delivered).toBe(true)
  })

  it('detecta el vídeo solo cuando lo hay', async () => {
    expect(await hasVideoDeliverable(db, videoJob)).toBe(true)
    expect(await hasVideoDeliverable(db, photoJob)).toBe(false)
  })
})
