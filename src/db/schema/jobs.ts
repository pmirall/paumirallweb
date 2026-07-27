import { relations } from 'drizzle-orm'
import {
  boolean,
  date,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'
import { clients } from './clients'
import { deliverableKind, jobCategory, jobStatus, timeEntryKind } from './enums'

/**
 * El encargo es la unidad central. Un proyecto del portfolio es un encargo con
 * publicación activa, no una entidad aparte. Ver ADR 0004.
 */
export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'restrict' }),
  title: text('title').notNull(),
  category: jobCategory('category').notNull(),
  status: jobStatus('status').notNull().default('draft'),
  shootDate: date('shoot_date'),
  dueDate: date('due_date'),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  internalNotes: text('internal_notes'),
  driveFolderId: text('drive_folder_id'),
  // El dinero se guarda en céntimos, en enteros. Nada de flotantes.
  budgetCents: integer('budget_cents'),
  published: boolean('published').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

/**
 * Uno a uno con jobs. Solo existe si el encargo se publica, y solo guarda lo
 * que es exclusivamente público: el cliente, la categoría y la fecha se leen
 * del encargo, no se duplican.
 */
export const jobPublications = pgTable('job_publications', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id')
    .notNull()
    .unique()
    .references(() => jobs.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull().unique(),
  publicTitle: text('public_title').notNull(),
  summary: text('summary'),
  body: text('body'),
  year: integer('year').notNull(),
  coverMediaId: uuid('cover_media_id'),
  sortOrder: integer('sort_order').notNull().default(0),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  ogImageKey: text('og_image_key'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
})

/** Un slug que cambia deja una redirección permanente detrás. */
export const slugHistory = pgTable(
  'slug_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    jobId: uuid('job_id')
      .notNull()
      .references(() => jobs.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    replacedAt: timestamp('replaced_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('slug_history_slug_key').on(t.slug)],
)

/** Lo comprometido en el encargo. Sin todo marcado, no se puede entregar. */
export const deliverables = pgTable('deliverables', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id')
    .notNull()
    .references(() => jobs.id, { onDelete: 'cascade' }),
  kind: deliverableKind('kind').notNull(),
  description: text('description').notNull(),
  quantity: integer('quantity'),
  delivered: boolean('delivered').notNull().default(false),
})

/** Sin esta tabla no hay euros por hora. Ver docs/vision-y-alcance.md. */
export const timeEntries = pgTable('time_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id')
    .notNull()
    .references(() => jobs.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  minutes: integer('minutes').notNull(),
  kind: timeEntryKind('kind').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  client: one(clients, { fields: [jobs.clientId], references: [clients.id] }),
  publication: one(jobPublications, {
    fields: [jobs.id],
    references: [jobPublications.jobId],
  }),
  deliverables: many(deliverables),
  timeEntries: many(timeEntries),
}))

export const clientsRelations = relations(clients, ({ many }) => ({ jobs: many(jobs) }))
