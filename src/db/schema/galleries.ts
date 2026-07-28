import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { jobs } from './jobs'
import { mediaAssets } from './drive'

export const GALLERY_STATUSES = ['active', 'expired', 'revoked'] as const
export type GalleryStatus = (typeof GALLERY_STATUSES)[number]
export const galleryStatus = pgEnum('gallery_status', GALLERY_STATUSES)

/**
 * La entrega privada de un encargo. El token de la URL la localiza y el PIN la
 * abre. El PIN se guarda con Argon2id, nunca en claro. El token lleva 128 bits
 * de aleatoriedad y no es enumerable. Ver ADR 0005 y docs/seguridad-y-privacidad.md.
 */
export const galleries = pgTable('galleries', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id')
    .notNull()
    .references(() => jobs.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  pinHash: text('pin_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  allowHighRes: boolean('allow_high_res').notNull().default(true),
  watermark: boolean('watermark').notNull().default(false),
  status: galleryStatus('status').notNull().default('active'),
  downloadCount: integer('download_count').notNull().default(0),
  lastAccessAt: timestamp('last_access_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

/** Sesión abierta tras acertar el PIN, atada a una galería concreta. */
export const gallerySessions = pgTable('gallery_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  galleryId: uuid('gallery_id')
    .notNull()
    .references(() => galleries.id, { onDelete: 'cascade' }),
  sessionId: text('session_id').notNull().unique(),
  ipHash: text('ip_hash'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
})

/** Base del límite de intentos. Se purga a los 30 días. */
export const galleryPinAttempts = pgTable('gallery_pin_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  galleryId: uuid('gallery_id')
    .notNull()
    .references(() => galleries.id, { onDelete: 'cascade' }),
  ipHash: text('ip_hash'),
  attemptedAt: timestamp('attempted_at', { withTimezone: true }).notNull().defaultNow(),
  success: boolean('success').notNull().default(false),
})

/** Lo que el cliente marca. Mientras submitted_at es nulo, sigue eligiendo. */
export const galleryFavorites = pgTable(
  'gallery_favorites',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    galleryId: uuid('gallery_id')
      .notNull()
      .references(() => galleries.id, { onDelete: 'cascade' }),
    mediaAssetId: uuid('media_asset_id')
      .notNull()
      .references(() => mediaAssets.id, { onDelete: 'cascade' }),
    markedAt: timestamp('marked_at', { withTimezone: true }).notNull().defaultNow(),
    submittedAt: timestamp('submitted_at', { withTimezone: true }),
    clientNote: text('client_note'),
  },
  (table) => [
    // Una foto no puede estar marcada dos veces en la misma ronda sin enviar. El
    // índice es parcial: al enviar (submitted_at deja de ser nulo) la fila sale
    // del índice, así que una ronda nueva puede volver a marcar la misma foto.
    uniqueIndex('gallery_favorites_active_unique')
      .on(table.galleryId, table.mediaAssetId)
      .where(sql`${table.submittedAt} is null`),
  ],
)
