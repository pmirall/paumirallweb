import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createTestDatabase, truncateAll, type TestDatabase } from '../testing'
import { clients, jobs } from '../schema'
import { addTimeEntry, listTimeEntries, totalMinutesByJob } from './time-entries'

describe('registro de horas', () => {
  let db: TestDatabase
  let jobId: string

  beforeAll(async () => {
    ;({ db } = await createTestDatabase())
  })
  beforeEach(async () => {
    await truncateAll(db)
    const [c] = await db.insert(clients).values({ name: 'Cliente' }).returning()
    const [j] = await db
      .insert(jobs)
      .values({ code: '2026-001', clientId: c!.id, title: 'X', category: 'artist' })
      .returning()
    jobId = j!.id
  })

  it('suma los minutos de un encargo', async () => {
    expect(await totalMinutesByJob(db, jobId)).toBe(0)
    await addTimeEntry(db, { jobId, date: '2026-05-01', minutes: 120, kind: 'shoot' })
    await addTimeEntry(db, { jobId, date: '2026-05-02', minutes: 90, kind: 'edit' })
    expect(await totalMinutesByJob(db, jobId)).toBe(210)
  })

  it('lista los registros del más reciente al más antiguo', async () => {
    await addTimeEntry(db, { jobId, date: '2026-05-01', minutes: 60, kind: 'shoot' })
    await addTimeEntry(db, { jobId, date: '2026-05-10', minutes: 30, kind: 'travel' })
    const rows = await listTimeEntries(db, jobId)
    expect(rows.map((r) => r.date)).toEqual(['2026-05-10', '2026-05-01'])
  })
})
