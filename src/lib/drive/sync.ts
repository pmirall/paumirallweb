import { eq } from 'drizzle-orm'
import type { Database } from '@/db/client'
import type { TestDatabase } from '@/db/testing'
import { driveFolders, driveSyncRuns } from '@/db/schema'
import type { DriveAdapter } from './types'
import { parseFolderName } from './parse'

type Db = Database | TestDatabase

/** Tipos de archivo que se ignoran al contar. Ver docs/drive-inventario.md. */
const IGNORED_MIME = new Set(['image/vnd.adobe.photoshop'])

/**
 * Recorre el árbol de Drive desde una carpeta raíz, hasta tres niveles, y deja
 * cada carpeta en la cola con su sugerencia de cliente y fecha. No clasifica:
 * eso lo hace una persona en la cola. Un año como carpeta se pasa como contexto
 * a sus hijas. No vuelve a insertar una carpeta ya vista. Ver ADR 0012.
 */
export async function syncDrive(
  db: Db,
  adapter: DriveAdapter,
  rootId: string,
): Promise<{ foldersSeen: number; foldersNew: number }> {
  const [run] = await db.insert(driveSyncRuns).values({}).returning()
  let seen = 0
  let added = 0

  async function walk(folderId: string, depth: number, yearContext?: number) {
    if (depth > 3) return
    const listing = await adapter.list(folderId)

    for (const folder of listing.folders) {
      seen += 1
      const inner = await adapter.list(folder.driveId)
      const fileCount = inner.files.filter((f) => !IGNORED_MIME.has(f.mimeType)).length
      const isYearFolder = /^\d{4}$/.test(folder.name.trim())
      const hint = isYearFolder
        ? { clientName: null, date: null, dateAmbiguous: false }
        : parseFolderName(folder.name, yearContext)

      const existing = await db
        .select({ id: driveFolders.id })
        .from(driveFolders)
        .where(eq(driveFolders.driveFolderId, folder.driveId))
        .limit(1)

      if (existing.length === 0) {
        await db.insert(driveFolders).values({
          driveFolderId: folder.driveId,
          name: folder.name,
          parentDriveId: folder.parentDriveId,
          fileCount,
          suggestedClientName: hint.clientName,
          suggestedDate: hint.date,
          dateAmbiguous: hint.dateAmbiguous ? 'yes' : null,
        })
        added += 1
      }

      const nextYear = isYearFolder ? Number(folder.name.trim()) : yearContext
      await walk(folder.driveId, depth + 1, nextYear)
    }
  }

  await walk(rootId, 1)

  await db
    .update(driveSyncRuns)
    .set({ finishedAt: new Date(), foldersSeen: seen, foldersNew: added })
    .where(eq(driveSyncRuns.id, run!.id))

  return { foldersSeen: seen, foldersNew: added }
}
