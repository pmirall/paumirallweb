import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createTestDatabase, truncateAll, type TestDatabase } from '../testing'
import { clients, deliverables, jobPublications, jobs, timeEntries } from '../schema'
import {
  getPublishedProjectBySlug,
  getPublishedProjects,
  hasPendingDeliverables,
  listJobs,
  totalMinutes,
} from './jobs'

/**
 * Pruebas contra Postgres de verdad, migrado desde cero. Cubren las consultas y
 * las reglas de integridad del modelo. Ver docs/testing-y-calidad.md.
 */
describe('consultas de encargos', () => {
  let db: TestDatabase
  let clientId: string
  let jobId: string

  beforeAll(async () => {
    ;({ db } = await createTestDatabase())
  })

  beforeEach(async () => {
    await truncateAll(db)

    const [client] = await db.insert(clients).values({ name: 'Júlia Ferrer' }).returning()
    clientId = client!.id

    const [job] = await db
      .insert(jobs)
      .values({
        code: '2025-001',
        clientId,
        title: 'Retrato de prensa',
        category: 'artist',
        status: 'delivered',
        shootDate: '2025-06-14',
        budgetCents: 32000,
        published: true,
      })
      .returning()
    jobId = job!.id

    await db.insert(jobPublications).values({
      jobId,
      slug: 'julia-ferrer',
      publicTitle: 'Júlia Ferrer',
      summary: 'Retrato de prensa para el lanzamiento del disco.',
      year: 2025,
    })
  })

  it('lista los encargos con el nombre del cliente', async () => {
    const rows = await listJobs(db)
    expect(rows).toHaveLength(1)
    expect(rows[0]?.clientName).toBe('Júlia Ferrer')
  })

  it('devuelve los proyectos publicados', async () => {
    const rows = await getPublishedProjects(db)
    expect(rows.map((r) => r.slug)).toEqual(['julia-ferrer'])
  })

  it('no devuelve un proyecto cuyo encargo se ha despublicado', async () => {
    await db.update(jobs).set({ published: false })
    expect(await getPublishedProjects(db)).toHaveLength(0)
    expect(await getPublishedProjectBySlug(db, 'julia-ferrer')).toBeUndefined()
  })

  it('avisa de los entregables pendientes', async () => {
    expect(await hasPendingDeliverables(db, jobId)).toBe(false)
    await db
      .insert(deliverables)
      .values({ jobId, kind: 'photos', description: '40 fotos editadas' })
    expect(await hasPendingDeliverables(db, jobId)).toBe(true)
  })

  it('suma los minutos dedicados', async () => {
    await db.insert(timeEntries).values([
      { jobId, date: '2025-06-14', minutes: 120, kind: 'shoot' },
      { jobId, date: '2025-06-16', minutes: 240, kind: 'edit' },
    ])
    expect(await totalMinutes(db, jobId)).toBe(360)
  })

  it('prohíbe borrar un cliente que tiene encargos', async () => {
    await expect(db.delete(clients)).rejects.toThrow()
  })

  it('no deja dos proyectos con el mismo slug', async () => {
    const [other] = await db
      .insert(jobs)
      .values({ code: '2025-002', clientId, title: 'Otro', category: 'sport' })
      .returning()
    await expect(
      db.insert(jobPublications).values({
        jobId: other!.id,
        slug: 'julia-ferrer',
        publicTitle: 'Repetido',
        year: 2025,
      }),
    ).rejects.toThrow()
  })
})
