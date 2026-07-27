import { describe, expect, it } from 'vitest'
import { createTestDatabase } from './testing'
import { seed } from './seed'
import { getPublishedProjects, listJobs } from './queries/jobs'

describe('datos de ejemplo', () => {
  it('deja una base con la que se puede trabajar', async () => {
    const { db } = await createTestDatabase()
    // El seed acepta cualquier base de Drizzle con este esquema.
    await seed(db as unknown as Parameters<typeof seed>[0])

    const all = await listJobs(db)
    expect(all.length).toBeGreaterThanOrEqual(5)

    const published = await getPublishedProjects(db)
    expect(published.map((p) => p.slug)).toContain('julia-ferrer')

    // Cubre todos los estados que las pantallas del admin tienen que enseñar.
    const statuses = new Set(all.map((j) => j.status))
    expect(statuses.has('delivered')).toBe(true)
    expect(statuses.has('editing')).toBe(true)
    expect(statuses.has('draft')).toBe(true)
  })
})
