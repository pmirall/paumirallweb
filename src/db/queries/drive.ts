import { asc, eq } from 'drizzle-orm'
import type { Database } from '../client'
import type { TestDatabase } from '../testing'
import { auditLog, clients, driveFolders, driveSyncRuns, jobs } from '../schema'
import type { JobCategory } from '../schema'

type Db = Database | TestDatabase

export async function listQueue(db: Db, status?: string) {
  const rows = db
    .select({
      id: driveFolders.id,
      driveFolderId: driveFolders.driveFolderId,
      name: driveFolders.name,
      parentDriveId: driveFolders.parentDriveId,
      fileCount: driveFolders.fileCount,
      queueStatus: driveFolders.queueStatus,
      suggestedClientName: driveFolders.suggestedClientName,
      suggestedDate: driveFolders.suggestedDate,
      dateAmbiguous: driveFolders.dateAmbiguous,
      jobId: driveFolders.jobId,
    })
    .from(driveFolders)
    .orderBy(asc(driveFolders.name))
  if (status) return rows.where(eq(driveFolders.queueStatus, status as never))
  return rows
}

export async function lastSyncRun(db: Db) {
  const rows = await db
    .select()
    .from(driveSyncRuns)
    .orderBy(asc(driveSyncRuns.startedAt))
    .limit(50)
  return rows.at(-1)
}

export async function getFolder(db: Db, id: string) {
  const rows = await db.select().from(driveFolders).where(eq(driveFolders.id, id)).limit(1)
  return rows[0]
}

async function nextJobCode(db: Db, year: number): Promise<string> {
  const rows = await db.select({ code: jobs.code }).from(jobs)
  const prefix = `${year}-`
  const numbers = rows
    .map((r) => r.code)
    .filter((c) => c.startsWith(prefix))
    .map((c) => Number(c.slice(prefix.length)))
    .filter((n) => Number.isFinite(n))
  return `${year}-${String((numbers.length ? Math.max(...numbers) : 0) + 1).padStart(3, '0')}`
}

export type EnrichInput = {
  clientName: string
  category: JobCategory
  published: boolean
}

/**
 * Clasifica una carpeta como encargo: crea el cliente si no existe, crea el
 * encargo enlazado, y marca la carpeta enriquecida. El año de la fecha sugerida
 * da el código; si no hay fecha, se usa el año pasado. Ver ADR 0012.
 */
export async function enrichAsJob(
  db: Db,
  folderId: string,
  input: EnrichInput,
  actor: string,
  fallbackYear: number,
): Promise<{ jobId: string } | null> {
  const folder = await getFolder(db, folderId)
  if (!folder || folder.queueStatus === 'enriched') return null

  const name = input.clientName.trim()
  const existing = name
    ? await db.select().from(clients).where(eq(clients.name, name)).limit(1)
    : []
  let clientId = existing[0]?.id
  if (!clientId) {
    const [client] = await db.insert(clients).values({ name: name || 'Sin nombre' }).returning()
    clientId = client!.id
  }

  const year = folder.suggestedDate ? Number(folder.suggestedDate.slice(0, 4)) : fallbackYear
  const code = await nextJobCode(db, year)
  const [job] = await db
    .insert(jobs)
    .values({
      code,
      clientId,
      title: folder.name,
      category: input.category,
      status: 'draft',
      shootDate: folder.suggestedDate || null,
      driveFolderId: folder.driveFolderId,
      published: input.published,
    })
    .returning()

  await db
    .update(driveFolders)
    .set({ queueStatus: 'enriched', jobId: job!.id, suggestedClientId: clientId })
    .where(eq(driveFolders.id, folderId))

  await db.insert(auditLog).values({
    actor,
    action: 'drive.enrich',
    entity: 'job',
    entityId: job!.id,
    diff: { folder: folder.name, code },
  })
  return { jobId: job!.id }
}

export async function setFolderStatus(
  db: Db,
  folderId: string,
  status: 'ignored' | 'container' | 'pending',
): Promise<void> {
  await db.update(driveFolders).set({ queueStatus: status }).where(eq(driveFolders.id, folderId))
}
