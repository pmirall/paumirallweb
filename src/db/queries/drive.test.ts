import { beforeEach, describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { createTestDatabase, type TestDatabase } from '../testing'
import { clients, driveFolders, jobs } from '../schema'
import { FakeDriveAdapter, rootFolderId } from '@/lib/drive/fake'
import { syncDrive } from '@/lib/drive/sync'
import { enrichAsJob, listQueue, setFolderStatus } from './drive'

describe('cola de enriquecimiento', () => {
  let db: TestDatabase

  beforeEach(async () => {
    ;({ db } = await createTestDatabase())
    await syncDrive(db, new FakeDriveAdapter(), rootFolderId)
  })

  async function folderByName(name: string) {
    const rows = await db.select().from(driveFolders).where(eq(driveFolders.name, name))
    return rows[0]!
  }

  it('enriquecer una carpeta crea el encargo con su cliente y su fecha', async () => {
    const folder = await folderByName('Marlene.25.07.01')
    const result = await enrichAsJob(
      db,
      folder.id,
      { clientName: 'Marlene', category: 'artist', published: true },
      'pau@example.com',
      2026,
    )
    expect(result).not.toBeNull()

    const job = (await db.select().from(jobs).where(eq(jobs.id, result!.jobId)))[0]
    expect(job?.shootDate).toBe('2025-07-01')
    expect(job?.driveFolderId).toBe(folder.driveFolderId)
    expect(job?.published).toBe(true)
    // El código sale del año de la sesión, no del año de respaldo.
    expect(job?.code).toBe('2025-001')

    const cliente = await db.select().from(clients).where(eq(clients.name, 'Marlene'))
    expect(cliente).toHaveLength(1)

    const after = await folderByName('Marlene.25.07.01')
    expect(after.queueStatus).toBe('enriched')
    expect(after.jobId).toBe(result!.jobId)
  })

  it('reutiliza un cliente que ya existe en vez de duplicarlo', async () => {
    await db.insert(clients).values({ name: 'Marlene' })
    const folder = await folderByName('Marlene.25.07.01')
    await enrichAsJob(db, folder.id, { clientName: 'Marlene', category: 'artist', published: false }, 'pau@example.com', 2026)
    expect(await db.select().from(clients).where(eq(clients.name, 'Marlene'))).toHaveLength(1)
  })

  it('no enriquece dos veces la misma carpeta', async () => {
    const folder = await folderByName('Perales.25.11.07')
    await enrichAsJob(db, folder.id, { clientName: 'Perales', category: 'sport', published: false }, 'pau@example.com', 2026)
    const second = await enrichAsJob(db, folder.id, { clientName: 'Perales', category: 'sport', published: false }, 'pau@example.com', 2026)
    expect(second).toBeNull()
  })

  it('ignorar y marcar contenedor cambian el estado sin crear encargo', async () => {
    const pepo = await folderByName('Pepo')
    await setFolderStatus(db, pepo.id, 'container')
    expect((await folderByName('Pepo')).queueStatus).toBe('container')

    const jorge = await folderByName('Jorge.24.13.02')
    await setFolderStatus(db, jorge.id, 'ignored')
    expect((await folderByName('Jorge.24.13.02')).queueStatus).toBe('ignored')

    expect(await db.select().from(jobs)).toHaveLength(0)
  })

  it('el filtro por estado devuelve solo lo pendiente', async () => {
    const jorge = await folderByName('Jorge.24.13.02')
    await setFolderStatus(db, jorge.id, 'ignored')
    const pending = await listQueue(db, 'pending')
    expect(pending.some((f) => f.name === 'Jorge.24.13.02')).toBe(false)
    expect(pending.length).toBeGreaterThan(0)
  })
})
