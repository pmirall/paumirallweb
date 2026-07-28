import { beforeEach, describe, expect, it } from 'vitest'
import { createTestDatabase, type TestDatabase } from '@/db/testing'
import { driveFolders } from '@/db/schema'
import { FakeDriveAdapter, rootFolderId } from './fake'
import { syncDrive } from './sync'

describe('sincronización de Drive', () => {
  let db: TestDatabase

  beforeEach(async () => {
    ;({ db } = await createTestDatabase())
  })

  it('recorre el árbol y deja cada carpeta en la cola con su sugerencia', async () => {
    const result = await syncDrive(db, new FakeDriveAdapter(), rootFolderId)
    // 5 en la raíz, más el año 2026 y sus 2 sesiones dentro de Pepo.
    expect(result.foldersNew).toBe(8)

    const rows = await db.select().from(driveFolders)
    const marlene = rows.find((r) => r.name === 'Marlene.25.07.01')
    expect(marlene?.suggestedClientName).toBe('Marlene')
    expect(marlene?.suggestedDate).toBe('2025-07-01')

    // Mes 13 se queda sin fecha y marcado dudoso.
    const jorge = rows.find((r) => r.name === 'Jorge.24.13.02')
    expect(jorge?.suggestedDate).toBeNull()
    expect(jorge?.dateAmbiguous).toBe('yes')

    // Dentro del año 2026, el patrón es día.mes.año.
    const group = rows.find((r) => r.name === 'Group.21.06.26')
    expect(group?.suggestedDate).toBe('2026-06-21')

    // El .psd no cuenta como archivo del encargo.
    const perales = rows.find((r) => r.name === 'Perales.25.11.07')
    expect(perales?.fileCount).toBe(2)
  })

  it('no vuelve a insertar una carpeta ya vista', async () => {
    const adapter = new FakeDriveAdapter()
    await syncDrive(db, adapter, rootFolderId)
    const second = await syncDrive(db, adapter, rootFolderId)
    expect(second.foldersNew).toBe(0)
    expect(second.foldersSeen).toBe(8)
  })
})
