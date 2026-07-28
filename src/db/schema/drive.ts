import { integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { clients } from './clients'
import { jobs } from './jobs'
import { jobCategory } from './enums'

/** Estado de una carpeta en la cola de enriquecimiento. */
export const QUEUE_STATUSES = ['pending', 'enriched', 'ignored', 'container'] as const
export type QueueStatus = (typeof QUEUE_STATUSES)[number]
export const queueStatus = pgEnum('queue_status', QUEUE_STATUSES)

export const DERIVE_STATUSES = ['pending', 'done', 'failed'] as const
export type DeriveStatus = (typeof DERIVE_STATUSES)[number]
export const deriveStatus = pgEnum('derive_status', DERIVE_STATUSES)

export const ASSET_VISIBILITIES = ['private', 'client', 'public'] as const
export const assetVisibility = pgEnum('asset_visibility', ASSET_VISIBILITIES)

export const QUEUE_JOB_STATUSES = ['pending', 'running', 'done', 'failed'] as const
export const queueJobStatus = pgEnum('queue_job_status', QUEUE_JOB_STATUSES)

/**
 * Las carpetas detectadas en Drive. Una carpeta no equivale a un encargo: puede
 * ser una sesión, un contenedor de cliente o algo que se ignora. Las sugerencias
 * salen de cruzar el nombre y la fecha; siempre se confirman. Ver ADR 0012.
 */
export const driveFolders = pgTable('drive_folders', {
  id: uuid('id').primaryKey().defaultRandom(),
  driveFolderId: text('drive_folder_id').notNull().unique(),
  name: text('name').notNull(),
  parentDriveId: text('parent_drive_id'),
  path: text('path'),
  detectedAt: timestamp('detected_at', { withTimezone: true }).notNull().defaultNow(),
  fileCount: integer('file_count').notNull().default(0),
  queueStatus: queueStatus('queue_status').notNull().default('pending'),
  jobId: uuid('job_id').references(() => jobs.id, { onDelete: 'set null' }),
  suggestedClientId: uuid('suggested_client_id').references(() => clients.id, {
    onDelete: 'set null',
  }),
  suggestedClientName: text('suggested_client_name'),
  suggestedDate: text('suggested_date'),
  suggestedCategory: jobCategory('suggested_category'),
  dateAmbiguous: text('date_ambiguous'),
})

export const driveSyncRuns = pgTable('drive_sync_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
  foldersSeen: integer('folders_seen').notNull().default(0),
  foldersNew: integer('folders_new').notNull().default(0),
  filesNew: integer('files_new').notNull().default(0),
  errors: integer('errors').notNull().default(0),
  errorDetail: text('error_detail'),
})

export const mediaAssets = pgTable('media_assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').references(() => jobs.id, { onDelete: 'cascade' }),
  driveFileId: text('drive_file_id').notNull().unique(),
  filename: text('filename').notNull(),
  mimeType: text('mime_type').notNull(),
  kind: text('kind').notNull().default('photo'),
  bytes: integer('bytes').notNull().default(0),
  width: integer('width'),
  height: integer('height'),
  takenAt: timestamp('taken_at', { withTimezone: true }),
  checksum: text('checksum'),
  sortOrder: integer('sort_order').notNull().default(0),
  visibility: assetVisibility('visibility').notNull().default('private'),
  deriveStatus: deriveStatus('derive_status').notNull().default('pending'),
})

export const mediaDerivatives = pgTable('media_derivatives', {
  id: uuid('id').primaryKey().defaultRandom(),
  mediaAssetId: uuid('media_asset_id')
    .notNull()
    .references(() => mediaAssets.id, { onDelete: 'cascade' }),
  variant: text('variant').notNull(),
  storageKey: text('storage_key').notNull(),
  bytes: integer('bytes').notNull().default(0),
  width: integer('width'),
  height: integer('height'),
})

/**
 * Cola de trabajos en Postgres, sin servicio dedicado. Cada trabajo es
 * idempotente y a los tres fallos pasa a failed y sale como aviso. Ver ADR 0008.
 */
export const jobQueue = pgTable('job_queue', {
  id: uuid('id').primaryKey().defaultRandom(),
  kind: text('kind').notNull(),
  payload: jsonb('payload'),
  runAfter: timestamp('run_after', { withTimezone: true }).notNull().defaultNow(),
  attempts: integer('attempts').notNull().default(0),
  status: queueJobStatus('status').notNull().default('pending'),
  lastError: text('last_error'),
  lockedAt: timestamp('locked_at', { withTimezone: true }),
})
